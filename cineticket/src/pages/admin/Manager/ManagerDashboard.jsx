import React, { useState, useEffect } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

import { Ticket, BarChart3, Popcorn, MonitorPlay, Loader2 } from 'lucide-react';

const ManagerDashboard = () => {
    // STATE QUẢN LÝ DỮ LIỆU
    const [dashboardData, setDashboardData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // GỌI API
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('Vui lòng đăng nhập!');

                const response = await fetch(
                    'https://cinema-api-production-f2bc.up.railway.app/api/v1/manager/dashboard',
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error('Lỗi khi tải dữ liệu Dashboard');
                }

                const result = await response.json();

                // Hỗ trợ trường hợp API trả về thẳng Object hoặc bọc trong thuộc tính data
                const data = result.data || result;
                setDashboardData(data);
            } catch (err) {
                console.error('Fetch Dashboard Error:', err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Hiển thị màn hình Loading
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] text-gray-400">
                <Loader2 className="animate-spin mb-4 text-red-500" size={40} />
                <p className="font-medium tracking-wider animate-pulse">
                    ĐANG TẢI DỮ LIỆU BÁO CÁO...
                </p>
            </div>
        );
    }

    // Hiển thị lỗi nếu gọi API thất bại
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

    // Bóc tách dữ liệu từ API để dễ gọi
    const overview = dashboardData?.overview || {};
    const kpi = dashboardData?.kpi || {};
    const chartData = dashboardData?.chart_data || [];

    return (
        <div className="max-w-7xl mx-auto pb-10">
            {/* Title */}
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-800">Bảng điều khiển chi nhánh</h2>
                <p className="text-slate-500 mt-1">
                    Tổng quan hoạt động kinh doanh tại rạp hôm nay
                </p>
            </div>

            {/* ===== Stats Cards (Top 3 quan trọng nhất của Rạp) ===== */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <StatCard
                    icon={<Ticket className="text-white" size={28} />}
                    label="VÉ BÁN HÔM NAY"
                    value={overview.tickets_sold?.value || 0}
                    trend={overview.tickets_sold?.trend || 'Hôm nay'}
                />
                <StatCard
                    icon={<BarChart3 className="text-white" size={28} />}
                    label="DOANH THU TRONG NGÀY"
                    value={overview.revenue?.value || '0đ'}
                    trend={overview.revenue?.trend || 'Hôm nay'}
                />
                <StatCard
                    icon={<MonitorPlay className="text-white" size={28} />}
                    label="SUẤT CHIẾU HÔM NAY"
                    value={overview.showtimes?.value || 0}
                    trend={overview.showtimes?.trend || 'Chưa có dữ liệu'}
                />
            </div>

            {/* ===== KPI (Chỉ số hoạt động chi nhánh) ===== */}
            <div className="mb-10">
                <h3 className="text-lg font-semibold text-slate-700 mb-5">
                    Chỉ số vận hành tại rạp
                </h3>

                {/* Chỉnh lại grid thành 3 cột vì API chỉ trả về 3 chỉ số */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <KPICard
                        icon={<Popcorn size={20} className="text-orange-500" />}
                        label="DOANH THU COMBO"
                        value={kpi.combo_revenue || '0đ'}
                    />
                    <KPICard
                        icon={<Ticket size={20} className="text-rose-500" />}
                        label="VÉ ĐÃ HỦY"
                        value={kpi.cancelled_tickets || 0}
                    />
                    <KPICard
                        icon={<MonitorPlay size={20} className="text-purple-500" />}
                        label="PHÒNG ĐANG CHIẾU"
                        value={kpi.active_rooms || '0/0'}
                    />
                </div>
            </div>

            {/* ===== Chart ===== */}
            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-slate-700">
                        Doanh thu chi nhánh theo tuần (Triệu VNĐ)
                    </h3>
                </div>

                <div className="h-[420px]">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="redArea" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.35} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
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
                                    tick={{ fill: '#64748b', fontSize: 13 }}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="#64748b"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 13 }}
                                    dx={-10}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                                    }}
                                    cursor={{
                                        stroke: '#ef4444',
                                        strokeWidth: 1,
                                        strokeDasharray: '4 4'
                                    }}
                                />

                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#ef4444"
                                    strokeWidth={3}
                                    fill="url(#redArea)"
                                    activeDot={{
                                        r: 6,
                                        fill: '#ef4444',
                                        stroke: '#white',
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
        </div>
    );
};

export default ManagerDashboard;

// ===== COMPONENT CON =====

const StatCard = ({ icon, label, value, trend }) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
        {/* Nền mờ trang trí góc phải */}
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-red-50 rounded-full opacity-50 pointer-events-none"></div>

        <div className="flex items-center gap-5 relative z-10">
            <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center shadow-md shadow-red-600/20 flex-shrink-0">
                {icon}
            </div>
            <div>
                <p className="text-[11px] font-bold tracking-widest text-slate-400 uppercase mb-1">
                    {label}
                </p>
                <p className="text-3xl font-black text-slate-800">{value}</p>
            </div>
        </div>
        {trend && (
            <p className="text-xs font-medium text-slate-500 mt-4 relative z-10 bg-slate-50 inline-block w-max px-2 py-1 rounded-md">
                {trend}
            </p>
        )}
    </div>
);

const KPICard = ({ label, value, icon }) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-red-100 hover:shadow-sm transition-all flex flex-col">
        <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-slate-50 rounded-xl">{icon}</div>
        </div>
        <div>
            <p className="text-3xl font-black text-slate-800 mb-1">{value}</p>
            <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">{label}</p>
        </div>
    </div>
);
