import { useNavigate, Link } from 'react-router-dom';

export default function Menu() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        navigate('/');
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">Menu</h1>

            <div className="flex gap-4 mb-8">
                <Link 
                    to="/ai" 
                    className="bg-blue-600 text-white p-2 rounded font-bold hover:bg-blue-700 text-center"
                >
                    AI
                </Link>

                <Link 
                    to="/dashboard" 
                    className="bg-green-600 text-white p-2 rounded font-bold hover:bg-green-700 text-center"
                >
                    Dashboard
                </Link>
            </div>
            
            <button 
                onClick={handleLogout}
                className="bg-red-600 text-white p-2 rounded font-bold hover:bg-red-700"
            >
                Log Out
            </button>
        </div>
    );
}