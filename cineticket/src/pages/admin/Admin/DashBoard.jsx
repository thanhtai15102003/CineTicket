import React, { useState, useEffect } from 'react';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

import {
    Ticket,
    Users,
    DollarSign,
    Building2,
    TrendingUp,
    Film,
    Crown,
    Loader2,
    Popcorn
} from 'lucide-react';

const AdminDashboard = () => {
    // STATE QUẢN LÝ DỮ LIỆU
    const [dashboardData, setDashboardData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // =========================================================
    // GỌI API LẤY DỮ LIỆU DASHBOARD
    // =========================================================
    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('Vui lòng đăng nhập với quyền Admin!');

                const response = await fetch(
                    'https://cinema-api-production-f2bc.up.railway.app/api/v1/admin/dashboard',
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error('Lỗi khi tải dữ liệu hệ thống');
                }

                const result = await response.json();

                // Hỗ trợ trường hợp API trả về thẳng Object hoặc bọc trong data
                const data = result.data || result;
                setDashboardData(data);
            } catch (err) {
                console.error('Fetch Admin Dashboard Error:', err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Hiển thị trạng thái Loading
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] text-gray-400">
                <Loader2 className="animate-spin mb-4 text-red-500" size={40} />
                <p className="font-medium tracking-wider animate-pulse">
                    ĐANG TẢI DỮ LIỆU HỆ THỐNG...
                </p>
            </div>
        );
    }

    // Hiển thị lỗi
    if (error) {
        return (
            <div className="flex items-center justify-center h-[70vh]">
                <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 flex flex-col items-center">
                    <p className="font-bold text-lg mb-2">Không thể lấy dữ liệu</p>
                    <p className="text-sm">{error}</p>
                </div>
            </div>
        );
    }

    // Bóc tách dữ liệu từ API để render
    const overview = dashboardData?.overview || {};
    const chartData = dashboardData?.chart_data || {};
    const topMovies = dashboardData?.top_movies || [];
    const kpi = dashboardData?.kpi || {};
    const updatedAt = dashboardData?.updated_at || 'Đang cập nhật...';

    return (
        <div className="max-w-[1400px] mx-auto pb-10">
            {/* Title & Last Updated */}
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                        Bảng điều khiển Tổng
                    </h2>
                    <p className="text-slate-500 mt-1 font-medium">
                        Báo cáo hiệu suất kinh doanh toàn hệ thống CineTicket
                    </p>
                </div>
                <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold text-slate-600 shadow-sm">
                    Cập nhật lần cuối: {updatedAt}
                </div>
            </div>

            {/* ===== Stats Cards (Top 4 Vĩ Mô) ===== */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    icon={<DollarSign className="text-white" size={28} />}
                    label="TỔNG DOANH THU"
                    value={overview.total_revenue || '0 đ'}
                    color="bg-emerald-500"
                    shadow="shadow-emerald-500/20"
                />
                <StatCard
                    icon={<Ticket className="text-white" size={28} />}
                    label="TỔNG VÉ ĐÃ BÁN"
                    value={overview.total_tickets || '0'}
                    color="bg-red-500"
                    shadow="shadow-red-500/20"
                />
                <StatCard
                    icon={<Users className="text-white" size={28} />}
                    label="TỔNG THÀNH VIÊN"
                    value={overview.total_members || '0'}
                    color="bg-blue-500"
                    shadow="shadow-blue-500/20"
                />
                <StatCard
                    icon={<Building2 className="text-white" size={28} />}
                    label="CHI NHÁNH HOẠT ĐỘNG"
                    value={overview.active_cinemas || '0/0'}
                    color="bg-violet-500"
                    shadow="shadow-violet-500/20"
                />
            </div>

            {/* ===== CHARTS SECTION ===== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Biểu đồ Doanh thu (Chiếm 2 phần) */}
                <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">
                                Doanh thu toàn hệ thống (Triệu VNĐ)
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">Dữ liệu 7 ngày gần nhất</p>
                        </div>
                    </div>
                    <div className="h-[350px]">
                        {chartData.system_revenue?.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={chartData.system_revenue}
                                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                >
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop
                                                offset="5%"
                                                stopColor="#10b981"
                                                stopOpacity={0.3}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor="#10b981"
                                                stopOpacity={0}
                                            />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#f1f1f1"
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#64748b"
                                        axisLine={false}
                                        tickLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        stroke="#64748b"
                                        axisLine={false}
                                        tickLine={false}
                                        dx={-10}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: 'none',
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        name="Doanh thu"
                                        stroke="#10b981"
                                        strokeWidth={3}
                                        fill="url(#colorRev)"
                                        activeDot={{
                                            r: 6,
                                            fill: '#10b981',
                                            stroke: '#fff',
                                            strokeWidth: 2
                                        }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400">
                                Chưa có dữ liệu biểu đồ
                            </div>
                        )}
                    </div>
                </div>

                {/* Biểu đồ So sánh Rạp (Chiếm 1 phần) */}
                <div className="lg:col-span-1 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-slate-800">So sánh chi nhánh</h3>
                        <p className="text-xs text-slate-500 mt-1">Doanh thu các rạp (Triệu VNĐ)</p>
                    </div>
                    <div className="flex-1 min-h-[350px]">
                        {chartData.cinema_comparison?.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={chartData.cinema_comparison}
                                    layout="vertical"
                                    margin={{ top: 0, right: 20, left: 20, bottom: 0 }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#f1f1f1"
                                        horizontal={true}
                                        vertical={false}
                                    />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
                                        width={100} // Căn width để chữ không bị che mờ
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: 'none',
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                                        }}
                                    />
                                    <Bar
                                        dataKey="revenue"
                                        name="Doanh thu (Tr)"
                                        fill="#ef4444"
                                        radius={[0, 6, 6, 0]}
                                        barSize={16}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400">
                                Chưa có dữ liệu so sánh
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ===== BOTTOM SECTION: TOP PHIM VÀ KPI KHÁC ===== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Danh sách phim HOT */}
                <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                        <Crown className="text-yellow-500" size={24} />
                        <h3 className="text-lg font-bold text-slate-800">Top Phim Thịnh Hành</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    <th className="pb-3">Hạng</th>
                                    <th className="pb-3">Tên Phim</th>
                                    <th className="pb-3 text-right">Lượt Xem</th>
                                    <th className="pb-3 text-right">Doanh Thu</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {topMovies.length > 0 ? (
                                    topMovies.map((movie, index) => (
                                        <tr
                                            key={movie.id}
                                            className="hover:bg-slate-50 transition-colors"
                                        >
                                            <td className="py-4">
                                                <span
                                                    className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                                                        index === 0
                                                            ? 'bg-yellow-100 text-yellow-600'
                                                            : index === 1
                                                              ? 'bg-slate-200 text-slate-600'
                                                              : index === 2
                                                                ? 'bg-orange-100 text-orange-600'
                                                                : 'text-slate-400'
                                                    }`}
                                                >
                                                    #{index + 1}
                                                </span>
                                            </td>
                                            <td className="py-4 font-bold text-slate-800">
                                                {movie.title}
                                            </td>
                                            <td className="py-4 text-right text-slate-600">
                                                {movie.tickets}
                                            </td>
                                            <td className="py-4 text-right font-black text-red-500">
                                                {movie.revenue}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="py-6 text-center text-slate-400">
                                            Chưa có dữ liệu phim thịnh hành.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* KPI Khác */}
                <div className="lg:col-span-1 space-y-4">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 px-1">
                        Chỉ số vận hành hệ thống
                    </h3>
                    <KPICard
                        icon={<TrendingUp className="text-white" />}
                        label="LỢI NHUẬN RÒNG (EST)"
                        value={kpi.net_profit || '0 đ'}
                        color="bg-emerald-500"
                    />
                    <KPICard
                        icon={<Popcorn className="text-white" />}
                        label="TỔNG DOANH THU COMBO"
                        value={kpi.combo_revenue || '0 đ'}
                        color="bg-orange-500"
                    />
                    <KPICard
                        icon={<Film className="text-white" />}
                        label="TỔNG SỐ SUẤT CHIẾU"
                        value={kpi.total_showtimes || '0'}
                        color="bg-violet-500"
                    />
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

// ===== COMPONENT CON ĐÃ ĐƯỢC NÂNG CẤP =====

const StatCard = ({ icon, label, value, trend, color, shadow }) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-lg transition-all relative overflow-hidden group">
        <div
            className={`absolute -right-6 -top-6 w-24 h-24 ${color} opacity-10 rounded-full group-hover:scale-150 transition-transform duration-500 pointer-events-none`}
        ></div>

        <div className="flex items-center gap-4 relative z-10">
            <div
                className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center shadow-md ${shadow} flex-shrink-0`}
            >
                {icon}
            </div>
            <div>
                <p className="text-[11px] font-bold tracking-widest text-slate-400 uppercase mb-1">
                    {label}
                </p>
                <p className="text-3xl font-black text-slate-800">{value}</p>
            </div>
        </div>
        {/* Chỉ hiện trend nếu API có trả về */}
        {trend && (
            <p className="text-xs font-semibold text-slate-500 mt-5 relative z-10 bg-slate-50 border border-slate-100 inline-flex items-center px-2.5 py-1.5 rounded-lg w-max gap-1.5">
                <TrendingUp size={14} className="text-emerald-500" />
                {trend}
            </p>
        )}
    </div>
);

const KPICard = ({ label, value, icon, color }) => (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 hover:border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
        <div className={`p-3.5 rounded-xl ${color} shadow-md`}>{icon}</div>
        <div>
            <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-0.5">
                {label}
            </p>
            <p className="text-xl font-black text-slate-800">{value}</p>
        </div>
    </div>
);
