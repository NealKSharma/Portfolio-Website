export interface Message {
    role: 'user' | 'assistant';
    text: string;
}

export interface AiState {
    messages: Message[];
    error: string | null;
    model: string;
}