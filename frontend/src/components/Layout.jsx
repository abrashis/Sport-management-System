import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Trophy, ClipboardList, Bell, User, LogOut, LayoutDashboard, Settings } from 'lucide-react';

export const PublicLayout = () => {
    const { user, loading } = useAuth();
    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white shadow-sm py-4 px-6 fixed w-full z-10">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-2">
                        <Trophy className="text-primary w-8 h-8" />
                        <span className="text-2xl font-bold text-secondary">Sports<span className="text-primary">Master</span></span>
                    </Link>
                </div>
            </header>
            <main className="flex-grow pt-24 pb-12">
                <Outlet />
            </main>
        </div>
    );
};

export const AppLayout = () => {
    const { user, loading, logout } = useAuth();
    const location = useLocation();

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!user) return <Navigate to="/" replace />;

    const isAdmin = user.role === 'admin';

    const navItems = isAdmin ? [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
        { label: 'Sports Management', icon: Trophy, path: '/admin/sports' },
        { label: 'Registrations', icon: ClipboardList, path: '/admin/registrations' },
        { label: 'Tie Sheets / Draw', icon: Settings, path: '/admin/draw' },
    ] : [
        { label: 'Dashboard', icon: Home, path: '/dashboard' },
        { label: 'Register for Sport', icon: ClipboardList, path: '/register' },
        { label: 'Tie Sheets', icon: Trophy, path: '/tiesheet' },
        { label: 'Notifications', icon: Bell, path: '/notifications' },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-secondary text-white hidden md:flex flex-col fixed h-full">
                <div className="p-6 text-2xl font-bold border-b border-white/10 flex items-center gap-2">
                    <Trophy className="text-primary w-8 h-8" />
                    <span>SMS</span>
                </div>
                <nav className="flex-grow p-4 space-y-2 mt-4">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === item.path ? 'bg-primary text-white' : 'hover:bg-white/5'}`}
                        >
                            <item.icon size={20} />
                            {item.label}
                        </Link>
                    ))}
                </nav>
                <div className="p-4 border-t border-white/10">
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/20 w-full transition-colors text-red-200"
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-grow md:ml-64 flex flex-col">
                <header className="bg-white shadow-sm py-4 px-6 flex justify-between items-center">
                    <h1 className="text-xl font-semibold text-secondary">
                        {navItems.find(i => i.path === location.pathname)?.label || 'Overview'}
                    </h1>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-600 font-medium">Hello, {user.full_name}</span>
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-secondary font-bold">
                            {user.full_name[0]}
                        </div>
                    </div>
                </header>
                <main className="p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
