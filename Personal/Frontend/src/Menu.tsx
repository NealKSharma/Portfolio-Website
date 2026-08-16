import { Navigate, useNavigate } from 'react-router-dom';

export default function Menu() {
    const navigate = useNavigate();
    
    const isAuthenticated = localStorage.getItem('isAuthenticated');

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        navigate('/');
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">Welcome to the Secret Menu</h1>
            <p className="mb-8">You are officially authenticated.</p>
            
            <button 
                onClick={handleLogout}
                className="bg-red-600 text-white p-2 rounded font-bold hover:bg-red-700"
            >
                Log Out
            </button>
        </div>
    );
}