import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

import { Ticket, Users, BarChart3 } from 'lucide-react';

const chartData = [
    { name: 'T2', value: 42 },
    { name: 'T3', value: 58 },
    { name: 'T4', value: 45 },
    { name: 'T5', value: 72 },
    { name: 'T6', value: 65 },
    { name: 'T7', value: 88 },
    { name: 'CN', value: 95 }
];

const Dashboard = () => {
    return (
        <div className="max-w-7xl mx-auto">
            {/* Title */}
            <h2 className="text-3xl font-bold text-slate-800 mb-8">Báo cáo hệ thống</h2>

            {/* ===== Stats Cards ===== */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <StatCard
                    icon={<Ticket className="text-white" size={28} />}
                    label="VÉ BÁN HÔM NAY"
                    value="248"
                />
                <StatCard
                    icon={<BarChart3 className="text-white" size={28} />}
                    label="DOANH THU HÔM NAY"
                    value="42.8tr"
                />
                <StatCard
                    icon={<Users className="text-white" size={28} />}
                    label="NGƯỜI DÙNG"
                    value="1,942"
                />
            </div>

            {/* ===== KPI ===== */}
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

            {/* ===== Chart ===== */}
            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-700 mb-6">Doanh thu theo tuần</h3>

                <div className="h-[420px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="redArea" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.35} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
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
    );
};

export default Dashboard;

// ===== COMPONENT CON =====

const StatCard = ({ icon, label, value }) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5 hover:shadow transition">
        <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center shadow">
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
