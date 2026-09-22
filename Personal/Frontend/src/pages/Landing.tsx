import { useActionState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function Landing() {
    const navigate = useNavigate();
    
    const [errorMessage, submitAction, isPending] = useActionState(
        async (_previousState: string | null, formData: FormData) => {
            const key = formData.get('key');
            
            try {
                await api.post('/login', { key });
                localStorage.setItem('isAuthenticated', 'true');
                navigate('/dashboard');
                return null;
            } catch (err: unknown) {
                return typeof err === 'string' ? err : String(err);
            }
        },
        null
    );

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4">
            <div className="max-w-sm w-full bg-[#141414] border border-[rgba(183,75,75,0.2)] p-8 rounded-2xl shadow-2xl backdrop-blur-md">
                <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-[#b74b4b] to-[#e76f6f] bg-clip-text text-transparent">
                    Sign In
                </h2>
                <form action={submitAction} className="flex flex-col gap-4">
                    <input 
                        type="password" 
                        name="key"
                        placeholder="Enter access key..." 
                        className="bg-neutral-900 border border-neutral-700 text-white p-3 rounded-xl focus:outline-none focus:border-[#b74b4b] transition-colors"
                        required
                    />
                    <button 
                        type="submit" 
                        disabled={isPending}
                        className="bg-gradient-to-r from-[#b74b4b] to-[#e76f6f] text-white p-3 rounded-xl font-bold transition-all duration-300 hover:opacity-90 hover:shadow-[0_4px_20px_rgba(183,75,75,0.4)] disabled:opacity-50 cursor-pointer"
                    >
                        {isPending ? 'Checking...' : 'Login'}
                    </button>
                </form>
                {errorMessage && <p className="mt-4 text-[#e76f6f] text-sm font-semibold text-center">{errorMessage}</p>}
            </div>
        </div>
    );
}
