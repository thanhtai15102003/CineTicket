import { useState, useEffect } from 'react';
import { Clock, Plus, Pencil, Trash2, Calendar, Ticket } from 'lucide-react';
import Toast from '../../components/common/Toast';
import { useNavigate } from 'react-router-dom';

export default function ShowtimeManagement() {
    // Mặc định lấy ngày hôm nay (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];

    const [selectedDate, setSelectedDate] = useState(today);
    const [expanded, setExpanded] = useState({});
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const navigate = useNavigate();

    const showToast = (msg, type = 'success') => setToast({ show: true, message: msg, type });
    const getToken = () => localStorage.getItem('token');

    /* ================= FORMAT CURRENCY ================= */
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
            amount
        );
    };

    /* ================= TÍNH THỜI LƯỢNG PHIM ================= */
    // Hàm tính số phút giữa Giờ bắt đầu và Giờ kết thúc
    const calculateDuration = (startTime, endTime) => {
        if (!startTime || !endTime) return 120; // Fallback an toàn

        const [h1, m1] = startTime.split(':').map(Number);
        const [h2, m2] = endTime.split(':').map(Number);

        const startMins = h1 * 60 + m1;
        let endMins = h2 * 60 + m2;

        // Xử lý trường hợp suất chiếu vắt qua rạng sáng ngày hôm sau (vd: 23:00 đến 01:00)
        if (endMins < startMins) {
            endMins += 24 * 60;
        }

        return endMins - startMins;
    };

    /* ================= FETCH SHOWTIMES & GROUPING ================= */
    const fetchShowtimes = async () => {
        setLoading(true);
        try {
            const res = await fetch(
                `https://cinema-api-production-f2bc.up.railway.app/api/v1/manager/showtimes?date=${selectedDate}`,
                {
                    headers: {
                        Authorization: `Bearer ${getToken()}`,
                        Accept: 'application/json'
                    }
                }
            );
            const json = await res.json();

            if (!res.ok) throw new Error(json.message || 'Lỗi lấy dữ liệu');

            const rawData = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];

            const groupedMovies = {};

            rawData.forEach((item) => {
                if (item.show_date !== selectedDate) return;

                const movieIdStr = String(item.movie_id);

                if (!groupedMovies[movieIdStr]) {
                    const genresString = Array.isArray(item.movie_genres)
                        ? item.movie_genres.join(', ')
                        : 'Đang cập nhật';

                    // TÍNH THỜI LƯỢNG TỰ ĐỘNG Ở ĐÂY
                    const computedDuration =
                        item.duration || calculateDuration(item.start_time, item.end_time);

                    groupedMovies[movieIdStr] = {
                        id: movieIdStr,
                        title: item.movie_title,
                        duration: computedDuration, // Sử dụng thời lượng vừa tính được
                        genre: genresString,
                        poster:
                            item.movie_poster ||
                            'https://via.placeholder.com/150x220?text=No+Poster',
                        showtimes: []
                    };
                }

                groupedMovies[movieIdStr].showtimes.push({
                    id: item.showtime_id,
                    start: item.start_time?.substring(0, 5) || '00:00',
                    end: item.end_time?.substring(0, 5) || '00:00',
                    room: item.room_name,
                    seats: item.valid_seat_count || item.seats || 0,
                    tickets_sold: item.tickets_sold || 0,
                    format: item.room_type_name || '2D',
                    ticket_price: parseFloat(item.ticket_price) || 0,
                    active: item.status === 'active'
                });
            });

            // Mặc định đóng tất cả accordion khi load dữ liệu
            setExpanded({});
            setData(Object.values(groupedMovies));
        } catch (error) {
            console.error('Fetch error:', error);
            showToast('Lỗi tải danh sách suất chiếu!', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShowtimes();
    }, [selectedDate]);

    /* ================= TOGGLE EXPAND ================= */
    const toggleExpand = (movieId) => {
        setExpanded((prev) => ({
            ...prev,
            [movieId]: !prev[movieId]
        }));
    };

    /* ================= TOGGLE ACTIVE (API) ================= */
    const toggleActive = async (movieId, showtimeId, ticketsSold, currentStatus) => {
        if (ticketsSold > 0 && currentStatus === true) {
            const confirmCancel = window.confirm(
                'Suất chiếu này đã có khách mua vé. Việc ĐÓNG suất chiếu đồng nghĩa với việc HỦY SUẤT. Bạn có chắc chắn muốn thực hiện?'
            );
            if (!confirmCancel) return;
        }

        const newStatus = currentStatus ? 'inactive' : 'active';

        setData((prev) =>
            prev.map((m) => {
                if (m.id !== movieId) return m;
                return {
                    ...m,
                    showtimes: m.showtimes.map((s) =>
                        s.id === showtimeId ? { ...s, active: !currentStatus } : s
                    )
                };
            })
        );

        try {
            const res = await fetch(
                `https://cinema-api-production-f2bc.up.railway.app/api/v1/manager/showtimes/${showtimeId}/status`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${getToken()}`
                    },
                    body: JSON.stringify({ status: newStatus })
                }
            );

            if (!res.ok) throw new Error('Update failed');
            showToast('Đã cập nhật trạng thái suất chiếu');
        } catch (error) {
            setData((prev) =>
                prev.map((m) => {
                    if (m.id !== movieId) return m;
                    return {
                        ...m,
                        showtimes: m.showtimes.map((s) =>
                            s.id === showtimeId ? { ...s, active: currentStatus } : s
                        )
                    };
                })
            );
            showToast('Lỗi cập nhật trạng thái!', 'error');
        }
    };

    /* ================= EDIT ================= */
    const handleEdit = (movieId, showtimeId, ticketsSold) => {
        if (ticketsSold > 0) {
            showToast('Không thể sửa suất chiếu đã có vé bán ra!', 'error');
            return;
        }
        navigate(`/admin/showtime/edit/${showtimeId}`);
    };

    /* ================= DELETE (API) ================= */
    const handleDelete = async (movieId, showtimeId, ticketsSold) => {
        if (ticketsSold > 0) {
            showToast('Không thể xóa suất chiếu đã có vé bán ra!', 'error');
            return;
        }
        if (!window.confirm('Xoá suất chiếu này? Hành động này không thể hoàn tác.')) return;

        try {
            const res = await fetch(
                `https://cinema-api-production-f2bc.up.railway.app/api/v1/manager/showtimes/${showtimeId}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${getToken()}`
                    }
                }
            );

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Lỗi khi xóa');
            }

            setData((prev) =>
                prev
                    .map((m) => {
                        if (m.id !== movieId) return m;
                        return {
                            ...m,
                            showtimes: m.showtimes.filter((s) => s.id !== showtimeId)
                        };
                    })
                    .filter((m) => m.showtimes.length > 0)
            );
            showToast('Đã xoá suất chiếu thành công');
        } catch (error) {
            showToast(error.message, 'error');
        }
    };

    /* ================= FORMAT BADGE ================= */
    const getFormatStyle = (format) => {
        if (format === 'IMAX') return 'bg-purple-600';
        if (format === '3D') return 'bg-blue-600';
        if (format === '4DX') return 'bg-orange-600';
        return 'bg-zinc-800';
    };

    /* ================= UI ================= */
    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ show: false, message: '' })}
                />
            )}

            {/* HEADER & DATE PICKER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">Quản lý suất chiếu</h1>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                            <Calendar size={18} />
                        </div>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 cursor-pointer"
                        />
                    </div>

                    <button
                        onClick={() => navigate('/admin/showtimes/create')}
                        className="flex items-center gap-2 bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition font-medium text-sm shadow-sm shadow-red-600/20"
                    >
                        <Plus size={18} /> Tạo lịch tự động
                    </button>
                </div>
            </div>

            <div className="mb-4">
                <p className="text-sm font-medium text-gray-600 border-l-4 border-red-500 pl-3">
                    Đang hiển thị lịch chiếu ngày:{' '}
                    <span className="text-red-600 font-bold">
                        {selectedDate.split('-').reverse().join('/')}
                    </span>
                </p>
            </div>

            {/* LIST */}
            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                </div>
            ) : data.length === 0 ? (
                <div className="bg-white p-10 rounded-2xl shadow-sm text-center border border-gray-100">
                    <p className="text-gray-500">Không có suất chiếu nào trong ngày này.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {data.map((movie) => (
                        <div
                            key={movie.id}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 transition hover:shadow-md"
                        >
                            {/* MOVIE INFO */}
                            <div className="flex items-center gap-5">
                                {/* TIME ICON */}
                                <button
                                    onClick={() => toggleExpand(movie.id)}
                                    className={`p-2.5 rounded-xl transition-colors ${expanded[movie.id] ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                                    title={
                                        expanded[movie.id] ? 'Thu gọn suất chiếu' : 'Xem suất chiếu'
                                    }
                                >
                                    <Clock size={20} />
                                </button>

                                {/* POSTER */}
                                <img
                                    src={movie.poster}
                                    alt={movie.title}
                                    className="w-14 h-20 object-cover rounded-lg shadow-sm cursor-pointer"
                                    onClick={() => toggleExpand(movie.id)}
                                    onError={(e) => {
                                        e.target.src =
                                            'https://via.placeholder.com/150x220?text=No+Poster';
                                    }}
                                />

                                {/* INFO */}
                                <div
                                    className="flex-1 cursor-pointer"
                                    onClick={() => toggleExpand(movie.id)}
                                >
                                    <h2 className="font-bold text-gray-800 text-lg leading-tight">
                                        {movie.title}
                                    </h2>
                                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                                        <span className="px-2 py-0.5 bg-gray-100 rounded font-medium">
                                            {movie.duration} phút
                                        </span>
                                        <span>•</span>
                                        <span>{movie.genre}</span>
                                    </div>
                                </div>

                                <div
                                    className="hidden sm:block text-right cursor-pointer"
                                    onClick={() => toggleExpand(movie.id)}
                                >
                                    <p className="text-xs text-gray-400 font-medium">
                                        Tổng suất chiếu
                                    </p>
                                    <p className="text-xl font-bold text-gray-700">
                                        {movie.showtimes.length}
                                    </p>
                                </div>
                            </div>

                            {/* SHOWTIMES COLLAPSIBLE */}
                            {expanded[movie.id] && (
                                <div className="mt-5 border-t border-dashed border-gray-200 pt-4 space-y-3 animate-fade-in">
                                    {movie.showtimes.length === 0 && (
                                        <div className="text-sm text-gray-400 text-center py-4 bg-gray-50 rounded-xl border border-gray-100">
                                            Phim này chưa có lịch chiếu trong ngày.
                                        </div>
                                    )}

                                    {movie.showtimes.map((s) => (
                                        <div
                                            key={s.id}
                                            className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl gap-4 border transition-colors ${
                                                s.active
                                                    ? 'bg-gray-50/50 border-gray-100 hover:border-gray-300'
                                                    : 'bg-gray-100 border-gray-200 opacity-60'
                                            }`}
                                        >
                                            {/* LEFT - THÔNG TIN SUẤT CHIẾU */}
                                            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                                                <div className="font-bold text-lg text-gray-800 w-[140px] tracking-wide">
                                                    {s.start}{' '}
                                                    <span className="text-gray-400 font-medium mx-1">
                                                        -
                                                    </span>{' '}
                                                    {s.end}
                                                </div>

                                                <div className="flex items-center gap-2 text-sm text-gray-600 font-medium w-24">
                                                    {s.room}
                                                </div>

                                                <div className="flex items-center gap-1.5 text-sm text-gray-500 w-24">
                                                    <span>{s.seats}</span> ghế
                                                </div>

                                                <div
                                                    className={`px-2.5 py-1 text-white text-xs font-bold tracking-wide rounded ${getFormatStyle(s.format)}`}
                                                >
                                                    {s.format}
                                                </div>

                                                {/* HIỂN THỊ GIÁ VÉ Ở ĐÂY */}
                                                <div className="flex items-center gap-1 text-sm font-bold text-red-600">
                                                    <Ticket size={16} />
                                                    {formatCurrency(s.ticket_price)}
                                                </div>
                                            </div>

                                            {/* RIGHT - ACTION BUTTONS */}
                                            <div className="flex items-center gap-5 border-t sm:border-t-0 pt-3 sm:pt-0">
                                                <div className="text-xs font-medium text-gray-500 w-32 text-right">
                                                    Đã bán:{' '}
                                                    <span
                                                        className={`text-sm ml-1 ${s.tickets_sold > 0 ? 'text-red-600 font-bold' : 'text-gray-700'}`}
                                                    >
                                                        {s.tickets_sold}/{s.seats}
                                                    </span>
                                                </div>

                                                <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

                                                {/* TOGGLE */}
                                                <button
                                                    onClick={() =>
                                                        toggleActive(
                                                            movie.id,
                                                            s.id,
                                                            s.tickets_sold,
                                                            s.active
                                                        )
                                                    }
                                                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
                                                        s.active ? 'bg-emerald-500' : 'bg-gray-300'
                                                    }`}
                                                    title={s.active ? 'Đang mở bán' : 'Đã đóng'}
                                                >
                                                    <div
                                                        className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${
                                                            s.active ? 'translate-x-5' : ''
                                                        }`}
                                                    />
                                                </button>

                                                {/* EDIT */}
                                                <button
                                                    onClick={() =>
                                                        handleEdit(movie.id, s.id, s.tickets_sold)
                                                    }
                                                    disabled={s.tickets_sold > 0}
                                                    className={`p-1.5 rounded-lg transition-all ${
                                                        s.tickets_sold > 0
                                                            ? 'text-gray-300 cursor-not-allowed'
                                                            : 'text-blue-500 hover:bg-blue-50 cursor-pointer'
                                                    }`}
                                                    title={
                                                        s.tickets_sold > 0
                                                            ? 'Không thể sửa suất chiếu đã có khách mua vé'
                                                            : 'Chỉnh sửa'
                                                    }
                                                >
                                                    <Pencil size={18} />
                                                </button>

                                                {/* DELETE */}
                                                <button
                                                    onClick={() =>
                                                        handleDelete(movie.id, s.id, s.tickets_sold)
                                                    }
                                                    disabled={s.tickets_sold > 0}
                                                    className={`p-1.5 rounded-lg transition-all ${
                                                        s.tickets_sold > 0
                                                            ? 'text-gray-300 cursor-not-allowed'
                                                            : 'text-red-500 hover:bg-red-50 cursor-pointer'
                                                    }`}
                                                    title={
                                                        s.tickets_sold > 0
                                                            ? 'Không thể xóa suất chiếu đã có khách mua vé'
                                                            : 'Xóa suất chiếu'
                                                    }
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
