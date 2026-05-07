import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    Eye,
    CheckCircle2,
    XCircle,
    Ticket,
    CalendarDays,
    Clock,
    MapPin,
    User,
    Loader2 // Import thêm icon xoay xoay cho trạng thái loading
} from 'lucide-react';
import Toast from '../../../components/common/Toast';

const TicketManagement = () => {
    // STATE QUẢN LÝ DỮ LIỆU TỪ API
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // STATE LỌC & TÌM KIẾM
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // STATE POPUP & XỬ LÝ
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // =========================================================
    // 1. GỌI API LẤY DANH SÁCH VÉ KHI MỞ TRANG
    // =========================================================
    useEffect(() => {
        const fetchTickets = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('Vui lòng đăng nhập với quyền Quản lý!');

                const response = await fetch(
                    'https://cinema-api-production-f2bc.up.railway.app/api/v1/manager/bookings',
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message || 'Không thể tải danh sách vé');
                }

                // API có thể trả về mảng trực tiếp hoặc nằm trong result.data
                const data = result.data || result;

                // Đảo ngược mảng để vé mới nhất lên đầu
                setTickets(Array.isArray(data) ? data.reverse() : []);
            } catch (error) {
                console.error('Lỗi fetch tickets:', error);
                setToast({ show: true, message: error.message, type: 'error' });
            } finally {
                setIsLoading(false);
            }
        };

        fetchTickets();
    }, []);

    // =========================================================
    // HÀM LỌC DỮ LIỆU
    // =========================================================
    const filteredTickets = tickets.filter((ticket) => {
        const phone = ticket.customer_phone || '';
        const name = ticket.customer_name || '';
        const id = ticket.id || '';

        const matchesSearch =
            id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            phone.includes(searchTerm) ||
            name.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // =========================================================
    // HÀM RENDER BADGE TRẠNG THÁI
    // =========================================================
    const StatusBadge = ({ status }) => {
        switch (status) {
            case 'upcoming':
                return (
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full text-xs font-bold uppercase flex items-center w-max gap-1.5">
                        <CheckCircle2 size={14} /> Chưa sử dụng
                    </span>
                );
            case 'completed':
                return (
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 border border-gray-200 rounded-full text-xs font-bold uppercase flex items-center w-max gap-1.5">
                        <Ticket size={14} /> Đã soát vé
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded-full text-xs font-bold uppercase flex items-center w-max gap-1.5">
                        <XCircle size={14} /> Đã hủy
                    </span>
                );
            default:
                return null;
        }
    };

    // =========================================================
    // 2. HÀM GỌI API SOÁT VÉ (CHECK-IN)
    // =========================================================
    const handleCheckIn = async (bookingId) => {
        setIsProcessing(true);
        try {
            const token = localStorage.getItem('token');

            // Giả sử API checkin của BE là: /api/v1/manager/bookings/{id}/checkin
            // Nếu BE thiết kế tên endpoint khác, bạn nhớ đổi lại URL chỗ này nhé!
            const response = await fetch(
                `https://cinema-api-production-f2bc.up.railway.app/api/v1/manager/bookings/${bookingId}/checkin`,
                {
                    method: 'POST', // Thường checkin dùng POST hoặc PATCH
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Soát vé thất bại!');
            }

            // Cập nhật lại UI lập tức
            setTickets((prev) =>
                prev.map((t) => (t.booking_id === bookingId ? { ...t, status: 'completed' } : t))
            );

            setSelectedTicket(null);
            setToast({
                show: true,
                message: 'Soát vé thành công! Khách có thể vào rạp.',
                type: 'success'
            });
        } catch (error) {
            console.error(error);
            setToast({ show: true, message: error.message, type: 'error' });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-8 text-gray-900">
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ show: false, message: '', type: 'success' })}
                />
            )}

            {/* HEADER & THỐNG KÊ */}
            <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-900 mb-2 flex items-center gap-3">
                    <Ticket className="text-orange-500" size={32} />
                    Quản Lý Soát Vé
                </h1>
                <p className="text-gray-500">
                    Kiểm tra thông tin đơn hàng và hỗ trợ soát vé cho khách hàng vào rạp.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm">
                    <p className="text-sm font-medium text-gray-500 mb-1">Tổng vé</p>
                    <p className="text-3xl font-black text-gray-900">{tickets.length}</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl shadow-sm">
                    <p className="text-sm font-medium text-emerald-600 mb-1">Cần soát vé</p>
                    <p className="text-3xl font-black text-emerald-600">
                        {tickets.filter((t) => t.status === 'upcoming').length}
                    </p>
                </div>
                <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm">
                    <p className="text-sm font-medium text-gray-500 mb-1">Đã vào rạp</p>
                    <p className="text-3xl font-black text-gray-900">
                        {tickets.filter((t) => t.status === 'completed').length}
                    </p>
                </div>
                <div className="bg-red-50 border border-red-100 p-5 rounded-2xl shadow-sm">
                    <p className="text-sm font-medium text-red-600 mb-1">Vé đã hủy</p>
                    <p className="text-3xl font-black text-red-600">
                        {tickets.filter((t) => t.status === 'cancelled').length}
                    </p>
                </div>
            </div>

            {/* BỘ LỌC TÌM KIẾM */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                <div className="relative flex-1">
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={20}
                    />
                    <input
                        type="text"
                        placeholder="Tìm theo Mã vé (CT...), Tên hoặc Số điện thoại..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl pl-10 pr-4 py-3 focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                    />
                </div>
                <div className="relative w-full md:w-64 flex-shrink-0">
                    <Filter
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={20}
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl pl-10 pr-4 py-3 appearance-none focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 cursor-pointer"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="upcoming">Chưa soát vé</option>
                        <option value="completed">Đã vào rạp</option>
                        <option value="cancelled">Đã hủy</option>
                    </select>
                </div>
            </div>

            {/* BẢNG DANH SÁCH VÉ */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm font-semibold uppercase tracking-wider">
                            <tr>
                                <th className="p-4">Mã Vé</th>
                                <th className="p-4">Khách Hàng</th>
                                <th className="p-4">Suất Chiếu</th>
                                <th className="p-4">Ghế</th>
                                <th className="p-4">Trạng Thái</th>
                                <th className="p-4 text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-400">
                                            <Loader2
                                                className="animate-spin mb-3 text-orange-500"
                                                size={32}
                                            />
                                            <p>Đang tải dữ liệu...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredTickets.length > 0 ? (
                                filteredTickets.map((ticket) => (
                                    <tr
                                        key={ticket.id}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="p-4 font-mono font-bold text-orange-600">
                                            {ticket.id}
                                        </td>
                                        <td className="p-4">
                                            <p className="font-bold text-gray-900 mb-0.5">
                                                {ticket.customer_name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {ticket.customer_phone}
                                            </p>
                                        </td>
                                        <td className="p-4">
                                            <p
                                                className="font-bold text-gray-900 mb-0.5 line-clamp-1 max-w-[200px]"
                                                title={ticket.movie_title}
                                            >
                                                {ticket.movie_title}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {ticket.show_time} - {ticket.show_date}
                                            </p>
                                        </td>
                                        <td className="p-4">
                                            <span className="font-bold text-gray-900">
                                                {ticket.seats}
                                            </span>
                                            <p className="text-xs text-gray-500">{ticket.room}</p>
                                        </td>
                                        <td className="p-4">
                                            <StatusBadge status={ticket.status} />
                                        </td>
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => setSelectedTicket(ticket)}
                                                className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                                title="Xem chi tiết"
                                            >
                                                <Eye size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-500">
                                        Không tìm thấy vé nào phù hợp với điều kiện lọc.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL CHI TIẾT VÀ SOÁT VÉ */}
            {selectedTicket && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-in">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Ticket size={20} className="text-orange-500" />
                                Chi Tiết Mã Vé:{' '}
                                <span className="text-orange-600 font-mono">
                                    {selectedTicket.id}
                                </span>
                            </h3>
                            <button
                                onClick={() => setSelectedTicket(null)}
                                className="text-gray-400 hover:text-gray-700 hover:bg-gray-200 p-1.5 rounded-lg transition-colors"
                            >
                                <XCircle size={22} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6">
                            <div className="flex justify-center mb-2">
                                <StatusBadge status={selectedTicket.status} />
                            </div>

                            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 space-y-4">
                                <div className="flex gap-3 text-sm">
                                    <User className="text-gray-400 flex-shrink-0" size={18} />
                                    <div>
                                        <p className="text-gray-500 mb-0.5">Khách hàng</p>
                                        <p className="font-bold text-gray-900">
                                            {selectedTicket.customer_name} -{' '}
                                            {selectedTicket.customer_phone}
                                        </p>
                                    </div>
                                </div>
                                <div className="w-full h-px bg-gray-200"></div>
                                <div className="flex gap-3 text-sm">
                                    <MapPin className="text-gray-400 flex-shrink-0" size={18} />
                                    <div>
                                        <p className="text-gray-500 mb-0.5">Phim & Phòng</p>
                                        <p className="font-bold text-gray-900 leading-tight">
                                            {selectedTicket.movie_title}
                                        </p>
                                        <p className="text-gray-600 mt-0.5">
                                            {selectedTicket.room}
                                        </p>
                                    </div>
                                </div>
                                <div className="w-full h-px bg-gray-200"></div>
                                <div className="flex gap-3 text-sm">
                                    <CalendarDays
                                        className="text-gray-400 flex-shrink-0"
                                        size={18}
                                    />
                                    <div className="flex-1">
                                        <p className="text-gray-500 mb-0.5">Suất chiếu & Ghế</p>
                                        <div className="flex justify-between items-center">
                                            <p className="font-bold text-gray-900">
                                                <Clock size={14} className="inline mr-1 mb-0.5" />
                                                {selectedTicket.show_time} -{' '}
                                                {selectedTicket.show_date}
                                            </p>
                                            <p className="font-black text-red-600 text-lg">
                                                {selectedTicket.seats}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-end px-2">
                                <p className="text-gray-500 text-xs">
                                    Ngày đặt: {selectedTicket.created_at}
                                </p>
                                <div className="text-right">
                                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1 font-bold">
                                        Tổng thanh toán
                                    </p>
                                    <p className="text-2xl font-black text-gray-900">
                                        {selectedTicket.total_price.toLocaleString('vi-VN')} ₫
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer - Nút Hành Động */}
                        <div className="p-4 border-t border-gray-200 bg-gray-50 flex gap-3">
                            <button
                                onClick={() => setSelectedTicket(null)}
                                className="flex-1 py-3 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-xl font-semibold transition-colors"
                            >
                                Đóng
                            </button>

                            {selectedTicket.status === 'upcoming' && (
                                <button
                                    onClick={() => handleCheckIn(selectedTicket.booking_id)}
                                    disabled={isProcessing}
                                    className="flex-[2] py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-[0_4px_14px_rgba(16,185,129,0.2)]"
                                >
                                    {isProcessing ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <CheckCircle2 size={20} />
                                            XÁC NHẬN SOÁT VÉ
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TicketManagement;
