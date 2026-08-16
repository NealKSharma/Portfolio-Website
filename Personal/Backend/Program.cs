using DotNetEnv;
using System.IO;

var envPath = Path.Combine(Directory.GetCurrentDirectory(), "../.env");
Env.Load(envPath);

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactDevClient", policy => policy.WithOrigins("http://localhost:5173").AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();

app.UseCors("AllowReactDevClient");

app.MapPost("/api/login", (LoginRequest req) => {    
    var expectedKey = Environment.GetEnvironmentVariable("ADMIN_KEY");
    if (req.Key == expectedKey) {
        return Results.Ok(new { message = "Success" });
    }
    
    return Results.BadRequest(new { message = "Wrong key." }); 
});

app.Run();

record LoginRequest(string Key);