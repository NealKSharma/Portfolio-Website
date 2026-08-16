import { useActionState, useState, useEffect } from 'react';
import api from '.././api';

interface AiState {
    text: string | null;
    error: string | null;
    model: string;
}

export default function AI() {
    const [models, setModels] = useState<string[]>([]);
    const [loadingModels, setLoadingModels] = useState(true);

    const [result, submitPrompt, isPending] = useActionState(
        async (_previousState: AiState, formData: FormData): Promise<AiState> => {
            const prompt = formData.get('prompt');
            const model = String(formData.get('model'));
            const thinking = formData.get('thinking') === 'on';
            
            try {
                const response = await api.post('/ask-ai', { prompt, model, thinking });
                return { text: response.data.answer, error: null, model };
            } catch (err: unknown) {
                const errorMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || String(err);
                return { text: null, error: errorMsg, model };
            }
        },
        { text: null, error: null, model: '' }
    );

    useEffect(() => {
        api.get('/models')
            .then((res) => {
                setModels(res.data);
                setLoadingModels(false);
            })
            .catch(() => {
                setLoadingModels(false);
            });
    }, []);

    const currentModel = result.model || (models.length > 0 ? models[0] : '');

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">AI Chat</h1>
            
            <form action={submitPrompt} className="flex flex-col gap-4 mb-8">
                <select 
                    name="model" 
                    defaultValue={currentModel}
                    key={currentModel}
                    className="border border-gray-400 p-2 rounded bg-white"
                    disabled={loadingModels}
                >
                    {loadingModels ? (
                        <option>Loading models...</option>
                    ) : (
                        models.map((m) => (
                            <option key={m} value={m}>{m}</option>
                        ))
                    )}
                </select>

                <textarea 
                    name="prompt" 
                    placeholder="Ask Gemini something..." 
                    className="border border-gray-400 p-2 rounded h-32 resize-y"
                    required
                />

                <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input 
                        type="checkbox" 
                        name="thinking" 
                        defaultChecked
                        className="w-4 h-4 accent-blue-600 rounded"
                    />
                    <span className="text-sm font-semibold text-gray-700">Enable Extended Thinking</span>
                </label>

                <button 
                    type="submit" 
                    disabled={isPending || loadingModels}
                    className="bg-blue-600 text-white p-2 rounded font-bold hover:bg-blue-700 disabled:opacity-50"
                >
                    {isPending ? 'Thinking...' : 'Send'}
                </button>
            </form>

            {result.error && <p className="text-red-500 font-bold whitespace-pre-wrap">{result.error}</p>}
            
            {result.text && (
                <div className="p-6 bg-gray-100 rounded border border-gray-300">
                    <p className="whitespace-pre-wrap">{result.text}</p>
                </div>
            )}
        </div>
    );
}