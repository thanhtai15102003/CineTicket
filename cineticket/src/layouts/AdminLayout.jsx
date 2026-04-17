import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Home, Ticket, Users, BarChart3, Settings, LogOut } from 'lucide-react';

import { hasPermission } from '../utils/permission';

const AdminLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [currentUser, setCurrentUser] = useState(null);

    const getPageTitle = (pathname) => {
        if (pathname === '/admin') return 'Dashboard';
        if (pathname.startsWith('/admin/tickets')) return 'Quản lý vé';
        if (pathname.startsWith('/admin/revenue')) return 'Doanh thu';
        if (pathname.startsWith('/admin/users')) return 'Người dùng';
        if (pathname.startsWith('/admin/settings')) return 'Cài đặt';
        return 'Dashboard';
    };

    useEffect(() => {
        const user = localStorage.getItem('currentUser');
        if (user) setCurrentUser(JSON.parse(user));
        else navigate('/login');
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        navigate('/login');
    };

    if (!currentUser) return null;

    return (
        <div className="h-screen bg-[#f8f9fa] flex text-slate-700 overflow-hidden">
            {/* ===== SIDEBAR ===== */}
            <aside className="w-20 bg-white border-r border-gray-200 flex flex-col items-center py-6 gap-8">
                {/* Logo */}
                <div className="w-11 h-11 bg-red-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow">
                    🎬
                </div>

                {/* Menu */}
                <NavItem
                    to="/dashboard"
                    icon={<Home size={22} />}
                    label="DashBoard"
                    pathname={location.pathname}
                />
                <NavItem
                    to="/admin/tickets"
                    icon={<Ticket size={22} />}
                    label="Suất chiếu"
                    pathname={location.pathname}
                />
                <NavItem
                    to="/admin/revenue"
                    icon={<BarChart3 size={22} />}
                    label="Doanh thu"
                    pathname={location.pathname}
                />
                {hasPermission(currentUser, 'manage_users') && (
                    <NavItem
                        to="/admin/users"
                        icon={<Users size={22} />}
                        label="Tài khoản"
                        pathname={location.pathname}
                    />
                )}
                <NavItem
                    to="/admin/settings"
                    icon={<Settings size={22} />}
                    label="Cài đặt"
                    pathname={location.pathname}
                />
            </aside>

            {/* ===== MAIN ===== */}
            <main className="flex-1 h-screen overflow-y-auto scroll-smooth">
                {/* HEADER */}
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
                    <h1 className="font-semibold text-xl text-slate-800">
                        {getPageTitle(location.pathname)}
                    </h1>

                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="font-medium text-slate-800">{currentUser.full_name}</p>
                            <p className="text-xs text-slate-500">Quản trị viên</p>
                        </div>

                        <div className="w-9 h-9 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">
                            {currentUser.full_name?.charAt(0).toUpperCase()}
                        </div>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-red-600 rounded-full transition text-sm font-medium"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </header>

                {/* CONTENT */}
                <div className="p-8 max-w-7xl mx-auto">{children}</div>
            </main>
        </div>
    );
};

// ===== NAV ITEM (FIX CHUẨN ACTIVE + GẠCH ĐỎ) =====
const NavItem = ({ icon, label, to, pathname }) => {
    const isActive = pathname === to || pathname.startsWith(to + '/');

    return (
        <Link
            to={to}
            className={`relative flex flex-col items-center justify-center w-full py-3 rounded-xl transition-all duration-300 ${
                isActive
                    ? 'text-red-600 bg-red-50'
                    : 'text-slate-400 hover:text-red-500 hover:bg-red-50'
            }`}
        >
            {/* Gạch đỏ bên trái */}
            <span
                className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-red-600 rounded-full transition-all duration-300 ${
                    isActive ? 'opacity-100' : 'opacity-0'
                }`}
            />

            {/* Icon */}
            <div className={`${isActive ? 'scale-110' : ''} transition`}>{icon}</div>

            {/* Label */}
            <span className="text-[10px] mt-1.5 font-medium">{label}</span>
        </Link>
    );
};

export default AdminLayout;
