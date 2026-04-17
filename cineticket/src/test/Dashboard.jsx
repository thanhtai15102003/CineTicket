import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Ticket, Users, BarChart3, Settings, LogOut, User } from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

const chartData = [
    { name: 'T2', value: 42 },
    { name: 'T3', value: 58 },
    { name: 'T4', value: 45 },
    { name: 'T5', value: 72 },
    { name: 'T6', value: 65 },
    { name: 'T7', value: 88 },
    { name: 'CN', value: 95 }
];

// ... (các phần import và chartData giữ nguyên)

const Dashboard = () => {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const user = localStorage.getItem('currentUser');
        if (user) {
            setCurrentUser(JSON.parse(user));
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        navigate('/login');
    };

    if (!currentUser) {
        return (
            <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
                Đang tải...
            </div>
        );
    }

    return (
        <div className="h-screen bg-[#f8f9fa] flex font-sans text-slate-700 overflow-hidden">
            {/* Sidebar - Cố định bên trái */}
            <aside className="w-20 bg-white border-r border-gray-200 flex flex-col items-center py-6 gap-8 z-20">
                <div className="w-10 h-10 bg-red-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-4">
                    🎬
                </div>

                <NavItem icon={<Home size={22} />} label="Trang chủ" active />
                <NavItem icon={<Ticket size={22} />} label="Vé" />
                <NavItem icon={<BarChart3 size={22} />} label="Doanh thu" />
                <NavItem icon={<Users size={22} />} label="Người dùng" />
                <NavItem icon={<Settings size={22} />} label="Cài đặt" />
            </aside>

            {/* Main Content - Thêm overflow-y-auto để cuộn nội dung */}
            <main className="flex-1 h-screen overflow-y-auto scroll-smooth">
                {/* Header - Thêm sticky top-0 và z-10 */}
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
                    <div className="font-semibold text-xl text-slate-800">Tổng quan hệ thống</div>

                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="font-medium text-slate-800">{currentUser.full_name}</p>
                            <p className="text-xs text-slate-500">Quản trị viên</p>
                        </div>

                        <div
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-5 py-2.5 hover:bg-red-50 text-red-600 rounded-full cursor-pointer transition"
                        >
                            <LogOut size={18} />
                            <span className="text-sm font-medium">Đăng xuất</span>
                        </div>

                        <div className="w-9 h-9 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {currentUser.full_name?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                <div className="p-8 max-w-7xl mx-auto">
                    <h2 className="text-3xl font-bold text-slate-800 mb-8">Báo cáo hệ thống</h2>

                    {/* Stats Cards... (giữ nguyên các phần dưới) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        <StatCardMain
                            icon={<Ticket className="text-white" size={28} />}
                            label="VÉ BÁN HÔM NAY"
                            value="248"
                            color="bg-red-600"
                        />
                        <StatCardMain
                            icon={<BarChart3 className="text-white" size={28} />}
                            label="DOANH THU HÔM NAY"
                            value="42.8tr"
                            color="bg-red-600"
                        />
                        <StatCardMain
                            icon={<Users className="text-white" size={28} />}
                            label="NGƯỜI DÙNG"
                            value="1,942"
                            color="bg-red-600"
                        />
                    </div>

                    {/* KPI Section... */}
                    <div className="mb-10">
                        <h3 className="text-lg font-semibold text-slate-700 mb-5">
                            Chỉ số hiệu suất chính
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <KPICard label="DOANH THU" value="4.800.000đ" />
                            <KPICard label="LỢI NHUẬN" value="3.250.000đ" />
                            <KPICard label="VÉ CHƯA XỬ LÝ" value="124" />
                            <KPICard label="PHIM ĐANG CHIẾU" value="12" />
                            <KPICard label="TỶ LỆ LẤP ĐẦY" value="84%" />
                        </div>
                    </div>

                    {/* Biểu đồ... */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm mb-10">
                        <h3 className="text-lg font-semibold text-slate-700 mb-6">
                            Doanh thu theo tuần
                        </h3>
                        <div className="h-[420px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="redArea" x1="0" y1="0" x2="0" y2="1">
                                            <stop
                                                offset="5%"
                                                stopColor="#ef4444"
                                                stopOpacity={0.35}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor="#ef4444"
                                                stopOpacity={0}
                                            />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
                                    <XAxis dataKey="name" stroke="#64748b" />
                                    <YAxis stroke="#64748b" />
                                    <Tooltip />
                                    <Area
                                        type="natural"
                                        dataKey="value"
                                        stroke="#ef4444"
                                        strokeWidth={3}
                                        fill="url(#redArea)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

// ... (Các component con NavItem, StatCardMain, KPICard giữ nguyên)

// ==================== COMPONENT CON ====================

const NavItem = ({ icon, label, active = false }) => (
    <div
        className={`flex flex-col items-center justify-center w-full py-3 cursor-pointer transition-all rounded-xl ${
            active
                ? 'bg-red-50 text-red-600 border-l-4 border-red-600'
                : 'text-slate-400 hover:text-red-500 hover:bg-red-50'
        }`}
    >
        {icon}
        <span className="text-[10px] mt-1.5 font-medium">{label}</span>
    </div>
);

const StatCardMain = ({ icon, label, value, color }) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5 hover:shadow transition">
        <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center shadow`}>
            {icon}
        </div>
        <div>
            <p className="text-xs font-bold tracking-widest text-gray-400">{label}</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
        </div>
    </div>
);

const KPICard = ({ label, value }) => (
    <div className="bg-white p-5 rounded-2xl border border-gray-100">
        <p className="text-xs font-bold text-gray-400 tracking-widest">{label}</p>
        <p className="text-2xl font-bold text-slate-800 mt-2">{value}</p>
    </div>
);

export default Dashboard;
