import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
    Home,
    Ticket,
    Users,
    BarChart3,
    Settings,
    LogOut,
    Layout,
    Film,
    Building2,
    Map,
    ChevronDown,
    Clapperboard,
    Building,
    Clock,
    Popcorn,
    MapPin,
    Image,
    TicketCheck
} from 'lucide-react';

import { hasPermission } from '../utils/permission';

const AdminLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [currentUser, setCurrentUser] = useState(null);

    const getPageTitle = (pathname) => {
        if (pathname === '/admin/dashboard') return 'Dashboard Admin';
        if (pathname === '/manager/dashboard') return 'Dashboard Manager';
        if (pathname.startsWith('/admin/cinemas')) return 'Quản lý rạp chiếu';
        if (pathname.startsWith('/admin/areas')) return 'Quản lý chi nhánh';
        if (pathname.startsWith('/admin/tickets')) return 'Quản lý phim';
        if (pathname.startsWith('/admin/banners')) return 'Quản lý Banner';
        if (pathname.startsWith('/admin/revenue')) return 'Báo cáo doanh thu';
        if (pathname.startsWith('/admin/users')) return 'Quản lý người dùng';
        if (pathname.startsWith('/admin/rooms')) return 'Quản lý phòng chiếu';
        if (pathname.startsWith('/admin/seat-layout')) return 'Sơ đồ ghế ngồi';
        if (pathname.startsWith('/admin/showtimes')) return 'Quản lý suất chiếu';
        if (pathname.startsWith('/admin/combo')) return 'Quản lý Combo';
        if (pathname.startsWith('/manager/combo')) return 'Quản lý Combo';
        if (pathname.startsWith('/manager/cinema-info')) return 'Quản lý thông tin rạp';
        if (pathname.startsWith('/manager/tickets')) return 'Quản lý vé';
        return 'Bảng điều khiển';
    };

    useEffect(() => {
        const fetchCurrentUser = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const res = await fetch(
                    'https://cinema-api-production-f2bc.up.railway.app/api/v1/users/me',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: 'application/json'
                        }
                    }
                );

                if (!res.ok) {
                    navigate('/login');
                    return;
                }

                const json = await res.json();
                setCurrentUser(json);
                localStorage.setItem('currentUser', JSON.stringify(json));
            } catch (err) {
                navigate('/login');
            }
        };

        fetchCurrentUser();
    }, [navigate]);

    const getRequiredPermission = (pathname) => {
        if (pathname === '/admin/dashboard' || pathname === '/manager/dashboard') return null;
        if (pathname.startsWith('/admin/users')) return 'manage_users';
        if (pathname.startsWith('/admin/movies')) return 'manage_movies';
        if (pathname.startsWith('/admin/combo')) return 'admin_combo';
        if (pathname.startsWith('/admin/banners')) return 'admin_banners';
        if (pathname.startsWith('/admin/areas') || pathname.startsWith('/admin/cinemas'))
            return 'manage_cinemas';
        return null;
    };

    useEffect(() => {
        if (currentUser) {
            const requiredPerm = getRequiredPermission(location.pathname);
            if (requiredPerm && !hasPermission(currentUser, requiredPerm)) {
                // Xác định role để đưa về đúng trang
                const isManager = currentUser.role?.role_name?.toLowerCase() === 'manager';
                navigate(isManager ? '/manager/dashboard' : '/admin/dashboard');
            }
        }
    }, [currentUser, location.pathname, navigate]);

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (!currentUser) return null;

    return (
        <div className="h-screen bg-slate-50 flex text-slate-800 overflow-hidden font-sans">
            {/* ===== SIDEBAR (LIGHT THEME) ===== */}
            <aside className="w-24 bg-white border-r border-gray-200 flex flex-col items-center py-8 gap-3 relative z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)] overflow-y-auto custom-scrollbar">
                {/* Logo CT */}
                <div
                    className="mb-8 flex items-center justify-center cursor-pointer group"
                    onClick={() => navigate('/')}
                    title="Về trang khách hàng"
                >
                    <div className="relative w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center -skew-x-6 group-hover:skew-x-0 transition-all duration-500 rounded-xl shadow-[0_4px_15px_rgba(220,38,38,0.25)] group-hover:shadow-[0_6px_20px_rgba(220,38,38,0.4)]">
                        <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border border-red-200"></div>
                        <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border border-red-200"></div>
                        <span className="text-white font-black text-xl italic tracking-tighter drop-shadow-sm">
                            CT
                        </span>
                    </div>
                </div>

                {/* Dòng phân cách */}
                <div className="w-10 h-[1px] bg-gray-100 mb-2 rounded-full"></div>

                {/* Dashboard admin */}
                {hasPermission(currentUser, 'admin_dashboard') && (
                    <NavItem
                        to="/admin/dashboard"
                        icon={<Home size={22} />}
                        label="Tổng quan"
                        pathname={location.pathname}
                    />
                )}
                {/* Dashboard manager */}
                {hasPermission(currentUser, 'manager_dashboard') && (
                    <NavItem
                        to="/manager/dashboard"
                        icon={<Home size={22} />}
                        label="Tổng quan"
                        pathname={location.pathname}
                    />
                )}

                {/* GROUP RẠP */}
                {hasPermission(currentUser, 'manage_cinemas') && (
                    <NavGroup pathname={location.pathname}>
                        {({ open, setOpen }) => (
                            <NavGroupButton
                                icon={<Film size={22} />}
                                label="Rạp phim"
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
                                label="Danh sách"
                                pathname={location.pathname}
                                small
                            />
                        </NavGroupContent>
                    </NavGroup>
                )}

                {hasPermission(currentUser, 'manage_movies') && (
                    <NavItem
                        to="/admin/movies"
                        icon={<Clapperboard size={22} />}
                        label="Phim ảnh"
                        pathname={location.pathname}
                    />
                )}
                {hasPermission(currentUser, 'manage_users') && (
                    <NavItem
                        to="/admin/users"
                        icon={<Users size={22} />}
                        label="Tài khoản"
                        pathname={location.pathname}
                    />
                )}
                {hasPermission(currentUser, 'admin_combo') && (
                    <NavItem
                        to="/admin/combo"
                        icon={<Popcorn size={22} />}
                        label="Combo"
                        pathname={location.pathname}
                    />
                )}
                {hasPermission(currentUser, 'admin_banners') && (
                    <NavItem
                        to="/admin/banners"
                        icon={<Image size={22} />}
                        label="Bannes"
                        pathname={location.pathname}
                    />
                )}
                {hasPermission(currentUser, 'manage_rooms') && (
                    <NavItem
                        to="/admin/rooms"
                        icon={<Building size={22} />}
                        label="Phòng chiếu"
                        pathname={location.pathname}
                    />
                )}
                {hasPermission(currentUser, 'manage_seat_layouts') && (
                    <NavItem
                        to="/admin/seat-layout"
                        icon={<Layout size={22} />}
                        label="Sơ đồ ghế"
                        pathname={location.pathname}
                    />
                )}
                {hasPermission(currentUser, 'manage_showtimes') && (
                    <NavItem
                        to="/admin/showtimes"
                        icon={<Clock size={22} />}
                        label="Suất chiếu"
                        pathname={location.pathname}
                    />
                )}
                {hasPermission(currentUser, 'manage_combo') && (
                    <NavItem
                        to="/manager/combo"
                        icon={<Popcorn size={22} />}
                        label="Combo"
                        pathname={location.pathname}
                    />
                )}
                {hasPermission(currentUser, 'manage_cinema-info') && (
                    <NavItem
                        to="/manager/cinema-info"
                        icon={<MapPin size={22} />}
                        label="Cinema-Info"
                        pathname={location.pathname}
                    />
                )}
                {hasPermission(currentUser, 'manager_tickets') && (
                    <NavItem
                        to="/manager/tickets"
                        icon={<TicketCheck size={22} />}
                        label="Quản lý vé"
                        pathname={location.pathname}
                    />
                )}
            </aside>

            {/* ===== MAIN CONTENT ===== */}
            <main className="flex-1 h-screen overflow-y-auto relative bg-[#f8f9fc]">
                {/* ===== HEADER (WHITE & CLEAN) ===== */}
                <header className="h-[76px] bg-white/90 backdrop-blur-xl border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
                    {/* TRÁI: Page title + Cinema name */}
                    <div className="flex items-center gap-4">
                        <h1 className="font-bold text-xl tracking-tight text-slate-800">
                            {getPageTitle(location.pathname)}
                        </h1>

                        {currentUser.cinema?.cinema_name && (
                            <>
                                <div className="h-6 w-[1px] bg-gray-200"></div>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-semibold border border-red-100">
                                    <Building2 size={16} />
                                    <span>{currentUser.cinema.cinema_name}</span>
                                </div>
                            </>
                        )}
                    </div>

                    {/* PHẢI: User info */}
                    <div className="flex items-center gap-5">
                        <div className="text-right hidden sm:block">
                            <p className="font-bold text-sm text-slate-800">
                                {currentUser.full_name}
                            </p>
                            <p className="text-[11px] font-semibold text-red-500 uppercase tracking-wider mt-0.5">
                                {currentUser.role?.role_name || 'Admin'}
                            </p>
                        </div>

                        {/* Avatar */}
                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md ring-2 ring-white">
                            {currentUser.full_name?.charAt(0).toUpperCase()}
                        </div>

                        <div className="h-6 w-[1px] bg-gray-200"></div>

                        {/* Nút Menu Dropdown (Trang chủ & Đăng xuất) */}
                        <div className="relative group cursor-pointer z-50">
                            {/* Nút Trigger (Vẫn giữ icon LogOut nhưng bỏ sự kiện onClick trực tiếp) */}
                            <div className="p-2.5 text-gray-400 group-hover:text-red-600 group-hover:bg-red-50 rounded-full transition-all duration-300">
                                <LogOut
                                    size={20}
                                    strokeWidth={2.5}
                                    className="group-hover:-translate-x-0.5 transition-transform"
                                />
                            </div>

                            {/* Bảng Dropdown hiển thị khi Hover */}
                            <div className="absolute top-[110%] right-0 w-44 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-out transform origin-top-right group-hover:translate-y-0 translate-y-2">
                                <div className="bg-white border border-gray-200 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] flex flex-col p-1.5 relative">
                                    {/* Mũi tên chỉ lên (Tạo điểm nhấn UI) */}
                                    <div className="absolute -top-2 right-4 w-4 h-4 bg-white border-t border-l border-gray-200 transform rotate-45"></div>

                                    {/* Content (Z-index cao hơn mũi tên để đè lên) */}
                                    <div className="relative z-10 bg-white rounded-lg flex flex-col">
                                        <Link
                                            to="/"
                                            className="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                                        >
                                            <Home size={16} />
                                            Trang chủ
                                        </Link>

                                        <div className="h-[1px] bg-gray-100 my-1 mx-2"></div>

                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full text-left"
                                        >
                                            <LogOut size={16} />
                                            Đăng xuất
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* ===== CONTENT AREA ===== */}
                <div className="p-8 max-w-screen-2xl mx-auto z-0">{children}</div>
            </main>
        </div>
    );
};

////////////////////////////////////////////////////////////////////////////////
// NAV ITEM (LIGHT THEME)
////////////////////////////////////////////////////////////////////////////////
const NavItem = ({ icon, label, to, pathname, exact = false, small = false }) => {
    const isActive = exact ? pathname === to : pathname === to || pathname.startsWith(to + '/');

    return (
        <Link
            to={to}
            className={`relative flex flex-col items-center justify-center w-[76px] mx-auto rounded-2xl transition-all duration-300 group
            ${small ? 'py-2.5 mt-1' : 'py-3.5 mt-1'}
            ${
                isActive
                    ? 'text-red-600 bg-red-50 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
        >
            {/* Thanh kẻ sọc Active */}
            {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-red-600 rounded-r-full shadow-[0_0_8px_rgba(220,38,38,0.4)]" />
            )}

            {/* Icon với hiệu ứng Scale */}
            <div
                className={`transition-all duration-300 ${isActive ? 'scale-110 drop-shadow-sm' : 'group-hover:scale-110 group-hover:-translate-y-0.5'}`}
            >
                {icon}
            </div>

            {/* Label */}
            <span
                className={`mt-1.5 font-medium transition-colors ${small ? 'text-[9px]' : 'text-[10px]'} ${isActive ? 'font-bold' : ''}`}
            >
                {label}
            </span>
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
                    <div key={index} className="w-full">
                        {child({ open, setOpen })}
                    </div>
                ) : (
                    <div
                        key={index}
                        className={`w-full overflow-hidden transition-all duration-500 ease-in-out ${open ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
                    >
                        {child}
                    </div>
                )
            )}
        </div>
    );
};

////////////////////////////////////////////////////////////////////////////////
// GROUP BUTTON (LIGHT THEME)
////////////////////////////////////////////////////////////////////////////////
const NavGroupButton = ({ icon, label, open, setOpen, pathname }) => {
    const isActive = pathname.startsWith('/admin/cinemas') || pathname.startsWith('/admin/areas');

    return (
        <button
            onClick={() => setOpen(!open)}
            // 👇 THÊM outline-none và focus:outline-none để tắt viền đen mặc định của trình duyệt
            className={`relative flex flex-col items-center justify-center w-[76px] mx-auto py-3 mt-1 rounded-2xl transition-all duration-300 group outline-none focus:outline-none
            ${
                isActive
                    ? 'text-red-600 bg-red-50 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
        >
            {isActive && !open && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-red-600 rounded-r-full shadow-[0_0_8px_rgba(220,38,38,0.4)]" />
            )}

            <div
                className={`transition-all duration-300 ${isActive ? 'scale-110 drop-shadow-sm' : 'group-hover:scale-110 group-hover:-translate-y-0.5'}`}
            >
                {icon}
            </div>

            {/* 👇 GOM CHỮ VÀ MŨI TÊN VÀO CÙNG 1 HÀNG CHO CÂN ĐỐI */}
            <div className="flex items-center justify-center gap-0.5 mt-1.5">
                <span className={`text-[10px] font-medium ${isActive ? 'font-bold' : ''}`}>
                    {label}
                </span>
                <ChevronDown
                    size={12}
                    className={`transition-transform duration-300 ${open ? 'rotate-180 text-slate-800' : 'text-slate-400'}`}
                />
            </div>
        </button>
    );
};

////////////////////////////////////////////////////////////////////////////////
// GROUP CONTENT (LIGHT THEME)
////////////////////////////////////////////////////////////////////////////////
const NavGroupContent = ({ children }) => {
    return (
        <div className="flex flex-col items-center gap-1 mt-1 bg-slate-50 mx-2 py-2 rounded-xl border border-slate-100">
            {children}
        </div>
    );
};

export default AdminLayout;
