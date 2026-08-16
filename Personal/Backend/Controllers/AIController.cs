using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace Backend.Controllers;

[ApiController]
[Route("api")]
public class AiController : ControllerBase
{
    private readonly HttpClient _http;

    public AiController(HttpClient http)
    {
        _http = http;
    }

    [HttpGet("models")]
    public async Task<IActionResult> GetModels()
    {
        var geminiKey = Environment.GetEnvironmentVariable("GEMINI_API_KEY");
        var response = await _http.GetAsync($"https://generativelanguage.googleapis.com/v1beta/models?key={geminiKey}");

        if (!response.IsSuccessStatusCode) {
            var err = await response.Content.ReadAsStringAsync();
            return BadRequest(new { message = $"Failed to fetch models: {err}" });
        }

        var json = await response.Content.ReadFromJsonAsync<JsonElement>();
        var modelList = new List<string>();

        if (json.TryGetProperty("models", out var modelsArray)) {
            foreach (var model in modelsArray.EnumerateArray()) {
                bool supportsGenerateContent = false;
                if (model.TryGetProperty("supportedGenerationMethods", out var methods)) {
                    foreach (var method in methods.EnumerateArray()) {
                        if (method.GetString() == "generateContent") {
                            supportsGenerateContent = true;
                            break;
                        }
                    }
                }

                if (!supportsGenerateContent) continue;

                string? modelId = null;
                if (model.TryGetProperty("baseModelId", out var baseIdProp)) {
                    modelId = baseIdProp.GetString();
                } else if (model.TryGetProperty("name", out var nameProp)) {
                    modelId = nameProp.GetString()?.Replace("models/", "");
                }

                if (!string.IsNullOrEmpty(modelId)) {
                    bool isChatModel = !modelId.Contains("embedding") &&
                                       !modelId.Contains("image") &&
                                       !modelId.Contains("tts") &&
                                       !modelId.Contains("audio") &&
                                       !modelId.Contains("veo") &&
                                       !modelId.Contains("imagen") &&
                                       !modelId.Contains("robotics") &&
                                       !modelId.Contains("research") &&
                                       !modelId.Contains("experimental");

                    if (!isChatModel) continue;

                    var match = Regex.Match(modelId, @"-(\d+)\.(\d+)");
                    if (match.Success) {
                        int major = int.Parse(match.Groups[1].Value);
                        int minor = int.Parse(match.Groups[2].Value);

                        bool isValidVersion = (major > 3) || (major == 3 && minor >= 1);
                        if (isValidVersion && !modelList.Contains(modelId)) {
                            modelList.Add(modelId);
                        }
                    }
                }
            }
        }

        return Ok(modelList);
    }

    [HttpPost("ask-ai")]
    public async Task<IActionResult> AskAi([FromBody] AiRequest req)
    {
        var geminiKey = Environment.GetEnvironmentVariable("GEMINI_API_KEY");
        
        var response = await SendGeminiRequestAsync(req.Model, req.Prompt, req.Thinking, geminiKey);

        if (!response.IsSuccessStatusCode && req.Thinking) {
            var errorBody = await response.Content.ReadAsStringAsync();
            if (errorBody.Contains("Thinking budget is not supported") || errorBody.Contains("INVALID_ARGUMENT")) {
                response = await SendGeminiRequestAsync(req.Model, req.Prompt, false, geminiKey);
            }
        }

        if (!response.IsSuccessStatusCode) {
            var finalError = await response.Content.ReadAsStringAsync();
            return StatusCode((int)response.StatusCode, new { message = finalError });
        }

        var json = await response.Content.ReadFromJsonAsync<JsonElement>();

        try {
            var answer = json.GetProperty("candidates")[0]
                             .GetProperty("content")
                             .GetProperty("parts")[0]
                             .GetProperty("text").GetString();

            return Ok(new { answer = answer });
        } catch {
            return BadRequest(new { message = "Unable to parse candidate text from Gemini response." });
        }
    }

    private async Task<HttpResponseMessage> SendGeminiRequestAsync(string model, string prompt, bool thinking, string? apiKey)
    {
        object payload = thinking ? new {
            contents = new[] { new { parts = new[] { new { text = prompt } } } },
            generationConfig = new { thinkingConfig = new { thinkingBudget = -1 } }
        } : new {
            contents = new[] { new { parts = new[] { new { text = prompt } } } }
        };

        return await _http.PostAsJsonAsync(
            $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}", 
            payload
        );
    }
}

public record AiRequest(string Prompt, string Model, bool Thinking);