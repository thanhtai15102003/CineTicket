import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
    Home,
    Ticket,
    Users,
    BarChart3,
    Settings,
    LogOut,
    Film,
    Building2,
    Map,
    ChevronDown,
    Clapperboard
} from 'lucide-react';

import { hasPermission } from '../utils/permission';

const AdminLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [currentUser, setCurrentUser] = useState(null);

    const getPageTitle = (pathname) => {
        if (pathname === '/admin') return 'Dashboard';
        if (pathname.startsWith('/admin/cinemas')) return 'Quản lý rạp chiếu';
        if (pathname.startsWith('/admin/areas')) return 'Quản lý chi nhánh';
        if (pathname.startsWith('/admin/tickets')) return 'Quản lý phim';
        if (pathname.startsWith('/admin/revenue')) return 'Doanh thu';
        if (pathname.startsWith('/admin/users')) return 'Quản Lý Tài Khoản Người Dùng';
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
            <aside className="w-20 bg-white border-r border-gray-200 flex flex-col items-center py-6 gap-6">
                {/* Logo */}
                <div className="w-11 h-11 bg-red-600 rounded-2xl flex items-center justify-center text-white font-bold">
                    🎬
                </div>

                {/* Dashboard */}
                <NavItem
                    to="/dashboard"
                    icon={<Home size={22} />}
                    label="Dashboard"
                    pathname={location.pathname}
                    exact
                />

                {/* ===== GROUP RẠP ===== */}
                {hasPermission(currentUser, 'manage_cinemas') && (
                    <NavGroup pathname={location.pathname}>
                        {({ open, setOpen }) => (
                            <NavGroupButton
                                icon={<Film size={22} />}
                                label="Rạp"
                                open={open}
                                setOpen={setOpen}
                                pathname={location.pathname}
                            />
                        )}

                        <NavGroupContent>
                            <NavItem
                                to="/admin/areas"
                                icon={<Map size={18} />}
                                label="Chi nhánh"
                                pathname={location.pathname}
                                small
                            />
                            <NavItem
                                to="/admin/cinemas"
                                icon={<Building2 size={18} />}
                                label="Rạp chiếu"
                                pathname={location.pathname}
                                small
                            />
                        </NavGroupContent>
                    </NavGroup>
                )}

                {/* quản lí phim */}
                {hasPermission(currentUser, 'manage_movies') && (
                    <NavItem
                        to="/admin/movies"
                        icon={<Clapperboard size={22} />}
                        label="Movie"
                        pathname={location.pathname}
                    />
                )}

                {/* Doanh thu */}
                {/* <NavItem
                    to="/admin/revenue"
                    icon={<BarChart3 size={22} />}
                    label="Doanh thu"
                    pathname={location.pathname}
                /> */}

                {/* Users */}
                {hasPermission(currentUser, 'manage_users') && (
                    <NavItem
                        to="/admin/users"
                        icon={<Users size={22} />}
                        label="User"
                        pathname={location.pathname}
                    />
                )}

                {/* Settings */}
                {/* <NavItem
                    to="/admin/settings"
                    icon={<Settings size={22} />}
                    label="Cài đặt"
                    pathname={location.pathname}
                /> */}
            </aside>

            {/* ===== MAIN ===== */}
            <main className="flex-1 h-screen overflow-y-auto">
                <header className="h-16 bg-white border-b flex items-center justify-between px-8 sticky top-0">
                    <h1 className="font-semibold text-xl">{getPageTitle(location.pathname)}</h1>

                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="font-medium">{currentUser.full_name}</p>
                            <p className="text-xs text-gray-500">{currentUser.role_name}</p>
                        </div>

                        <div className="w-9 h-9 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">
                            {currentUser.full_name?.charAt(0)}
                        </div>

                        <button
                            onClick={handleLogout}
                            className="p-2 hover:bg-red-50 text-red-600 rounded-full"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </header>

                <div className="p-8 max-w-7xl mx-auto">{children}</div>
            </main>
        </div>
    );
};

////////////////////////////////////////////////////////////////////////////////
// NAV ITEM
////////////////////////////////////////////////////////////////////////////////
const NavItem = ({ icon, label, to, pathname, exact = false, small = false }) => {
    const isActive = exact ? pathname === to : pathname === to || pathname.startsWith(to + '/');

    return (
        <Link
            to={to}
            className={`relative flex flex-col items-center justify-center w-full transition
            ${small ? 'py-2 text-[9px]' : 'py-3 text-[10px]'}
            ${
                isActive
                    ? 'text-red-600 bg-red-50'
                    : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
            }`}
        >
            {/* Gạch đỏ */}
            <span
                className={`absolute left-0 top-3 bottom-3 w-1 bg-red-600 rounded-full transition-all duration-300
                ${isActive ? 'opacity-100' : 'opacity-0'}`}
            />

            <div className={`${isActive ? 'scale-110' : ''}`}>{icon}</div>

            <span className="mt-1">{label}</span>
        </Link>
    );
};

////////////////////////////////////////////////////////////////////////////////
// NAV GROUP
////////////////////////////////////////////////////////////////////////////////
const NavGroup = ({ children, pathname }) => {
    const [open, setOpen] = useState(
        pathname.startsWith('/admin/cinemas') || pathname.startsWith('/admin/areas')
    );

    return (
        <div className="w-full flex flex-col items-center">
            {children.map((child, index) =>
                index === 0 ? (
                    <div key={index}>{child({ open, setOpen })}</div>
                ) : (
                    open && <div key={index}>{child}</div>
                )
            )}
        </div>
    );
};

////////////////////////////////////////////////////////////////////////////////
// GROUP BUTTON (CÓ MŨI TÊN)
////////////////////////////////////////////////////////////////////////////////
const NavGroupButton = ({ icon, label, open, setOpen, pathname }) => {
    const isActive = pathname.startsWith('/admin/cinemas') || pathname.startsWith('/admin/areas');

    return (
        <button
            onClick={() => setOpen(!open)}
            className={`flex flex-col items-center justify-center w-full py-3 transition
            ${
                isActive
                    ? 'text-red-500 bg-red-50'
                    : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
            }`}
        >
            <div className={`${isActive ? 'scale-110' : ''}`}>{icon}</div>

            <span className="text-[10px] mt-1">{label}</span>

            {/* Mũi tên */}
            <ChevronDown
                size={14}
                className={`mt-1 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
            />
        </button>
    );
};

////////////////////////////////////////////////////////////////////////////////
// GROUP CONTENT
////////////////////////////////////////////////////////////////////////////////
const NavGroupContent = ({ children }) => {
    return <div className="flex flex-col items-center gap-2 mt-2">{children}</div>;
};

export default AdminLayout;
