import { useActionState, useState, useEffect, useRef } from 'react';
import { api } from '../api/client';
import type { AiState, Message } from '../types/ai';

export default function AiChat() {
    const [models, setModels] = useState<string[]>([]);
    const [loadingModels, setLoadingModels] = useState(true);
    const chatEndRef = useRef<HTMLDivElement>(null);

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

    const [state, submitPrompt, isPending] = useActionState(
        async (prevState: AiState, formData: FormData): Promise<AiState> => {
            const prompt = String(formData.get('prompt') || '').trim();
            const model = String(formData.get('model'));
            const thinking = formData.get('thinking') === 'on';

            if (!prompt) return prevState;

            const updatedMessages: Message[] = [
                ...prevState.messages,
                { role: 'user', text: prompt }
            ];

            try {
                const response = await api.post('/ask-ai', { prompt, model, thinking });
                const answer = response.data.answer;

                return {
                    messages: [...updatedMessages, { role: 'assistant', text: answer }],
                    error: null,
                    model
                };
            } catch (err: unknown) {
                return {
                    messages: updatedMessages,
                    error: typeof err === 'string' ? err : String(err),
                    model
                };
            }
        },
        { messages: [], error: null, model: '' }
    );

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [state.messages, isPending]);

    // 1. Look for 3.7-flash. If not found, fallback to the first model in the list.
    const defaultAvailableModel = models.find(m => m.includes('3.7-flash')) || (models.length > 0 ? models[0] : '');
    // 2. Prioritize user's active selection (state.model) over the default
    const currentModel = state.model || defaultAvailableModel;

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col justify-between p-4 md:p-8">
            <div className="max-w-3xl w-full mx-auto flex flex-col flex-grow pb-24">
                
                <div className="flex justify-between items-center mb-6 border-b border-[rgba(183,75,75,0.2)] pb-4">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-[#b74b4b] to-[#e76f6f] bg-clip-text text-transparent">
                        AI Chat
                    </h1>
                    
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">Model:</span>
                        <select 
                            name="model" 
                            form="chat-form"
                            defaultValue={currentModel}
                            key={currentModel}
                            className="bg-neutral-900 border border-neutral-700 text-xs text-white p-2 rounded-lg focus:outline-none focus:border-[#b74b4b]"
                            disabled={loadingModels}
                        >
                            {loadingModels ? (
                                <option>Loading...</option>
                            ) : (
                                models.map((m) => (
                                    <option key={m} value={m}>{m}</option>
                                ))
                            )}
                        </select>
                    </div>
                </div>

                <div className="flex flex-col gap-4 flex-grow mb-6 overflow-y-auto">
                    {state.messages.length === 0 && !isPending && (
                        <div className="text-center text-gray-500 my-auto py-12">
                            <p className="text-lg">No messages yet.</p>
                            <p className="text-sm">Type a prompt below to start chatting with Gemini.</p>
                        </div>
                    )}

                    {state.messages.map((msg, index) => (
                        <div 
                            key={index} 
                            className={`flex flex-col p-4 rounded-2xl max-w-[85%] ${
                                msg.role === 'user' 
                                    ? 'ml-auto bg-[#b74b4b]/20 border border-[#b74b4b]/40 text-white' 
                                    : 'mr-auto bg-[#141414] border border-[rgba(183,75,75,0.3)] text-gray-200 shadow-xl'
                            }`}
                        >
                            <span className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">
                                {msg.role === 'user' ? 'You' : 'Gemini'}
                            </span>
                            <p className="whitespace-pre-wrap font-['Space_Grotesk'] leading-relaxed text-sm md:text-base">
                                {msg.text}
                            </p>
                        </div>
                    ))}

                    {isPending && (
                        <div className="mr-auto bg-[#141414] border border-[rgba(183,75,75,0.3)] p-4 rounded-2xl text-gray-400 animate-pulse text-sm">
                            Gemini is thinking...
                        </div>
                    )}

                    {state.error && (
                        <div className="bg-red-950/40 border border-red-500/50 p-4 rounded-xl">
                            <p className="text-[#e76f6f] font-bold whitespace-pre-wrap text-sm">{state.error}</p>
                        </div>
                    )}

                    <div ref={chatEndRef} />
                </div>
            </div>

            <div className="fixed bottom-0 left-[220px] right-0 bg-[#0a0a0a]/90 backdrop-blur-md border-t border-[rgba(183,75,75,0.2)] p-4">
                <div className="max-w-3xl mx-auto">
                    <form id="chat-form" action={submitPrompt} className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <textarea 
                                name="prompt" 
                                placeholder="Ask Gemini something... (Press Enter to send)" 
                                rows={1}
                                className="bg-neutral-900 border border-neutral-700 text-white p-3 rounded-xl flex-grow resize-none focus:outline-none focus:border-[#b74b4b] transition-colors text-sm"
                                required
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        e.currentTarget.form?.requestSubmit();
                                    }
                                }}
                            />
                            <button 
                                type="submit" 
                                disabled={isPending || loadingModels}
                                className="bg-gradient-to-r from-[#b74b4b] to-[#e76f6f] text-white px-5 py-3 rounded-xl font-bold transition-all duration-300 hover:opacity-90 hover:shadow-[0_4px_20px_rgba(183,75,75,0.4)] disabled:opacity-50 cursor-pointer h-full"
                            >
                                Send
                            </button>
                        </div>

                        <div className="flex items-center justify-between px-1">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input 
                                    type="checkbox" 
                                    name="thinking" 
                                    defaultChecked
                                    className="w-4 h-4 accent-[#b74b4b] rounded bg-neutral-900 border-neutral-700 cursor-pointer"
                                />
                                <span className="text-xs font-medium text-gray-400">Enable Extended Thinking</span>
                            </label>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
