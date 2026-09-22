import { Navigate, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';

export default function MainLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        navigate('/');
    };

    const navLinks = [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'AI Chat', path: '/ai' },
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex">
            <aside className="fixed left-0 top-0 h-screen w-[220px] bg-[rgba(255,255,255,0.02)] border-r border-[rgba(183,75,75,0.2)] backdrop-blur-[20px] flex flex-col justify-between p-6 z-50">
                <div>
                    <h1 className="text-2xl font-bold mb-12 bg-gradient-to-r from-[#b74b4b] to-[#e76f6f] bg-clip-text text-transparent">
                        Menu
                    </h1>
                    <nav className="flex flex-col gap-6">
                        {navLinks.map((link) => {
                            const isActive = location.pathname === link.path;
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`w-max text-lg font-semibold transition-all duration-300 relative py-1 ${
                                        isActive ? 'text-[#e76f6f] translate-x-2' : 'text-white/70 hover:text-[#e76f6f] hover:translate-x-2'
                                    }`}
                                >
                                    {link.name}
                                    {isActive && (
                                        <span className="absolute left-0 bottom-0 w-full h-[2px] bg-gradient-to-r from-[#b74b4b] to-[#e76f6f]" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <button
                    onClick={handleLogout}
                    className="bg-transparent border border-red-500/50 text-red-400 py-2.5 px-4 rounded-xl font-bold transition-all duration-300 hover:bg-red-500/10 hover:border-red-500 text-sm text-center cursor-pointer"
                >
                    Log Out
                </button>
            </aside>

            <main className="ml-[220px] flex-grow min-h-screen relative z-10">
                <Outlet />
            </main>
        </div>
    );
}