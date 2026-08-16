import { useActionState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';

export default function Landing() {
    const navigate = useNavigate();
    const [errorMessage, submitAction, isPending] = useActionState(
        async (_previousState: string | null, formData: FormData) => {
            const key = formData.get('key');
            
            try {
            await api.post('/login', { key });
            localStorage.setItem('isAuthenticated', 'true');
            navigate('/menu');
            return null;
        } catch (err) {
            return String(err);
        }
        },
        null
    );

    return (
        <div className="p-8 max-w-sm mx-auto">
            <h2 className="text-2xl font-bold mb-4">Sign In</h2>
            <form action={submitAction} className="flex flex-col gap-4">
                <input 
                    type="password" 
                    name="key"
                    placeholder="Key" 
                    className="border border-gray-400 p-2 rounded"
                    required
                />
                <button 
                    type="submit" 
                    disabled={isPending}
                    className="bg-blue-600 text-white p-2 rounded font-bold hover:bg-blue-700 disabled:opacity-50"
                >
                    {isPending ? 'Checking...' : 'Login'}
                </button>
            </form>
            {errorMessage && <p className="mt-4 text-red-500 font-bold">{errorMessage}</p>}
        </div>
    );
}