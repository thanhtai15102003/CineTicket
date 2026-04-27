import { useState, useEffect } from 'react';
import {
    Calendar,
    Clock,
    Film,
    MonitorPlay,
    Trash2,
    Settings,
    CheckCircle2,
    Ticket
} from 'lucide-react';
import Toast from '../../components/common/Toast';
import { useNavigate } from 'react-router-dom';

export default function CreateShowtime() {
    const navigate = useNavigate();

    // Mặc định lấy ngày hôm nay để gán cho Date Picker
    const today = new Date().toISOString().split('T')[0];

    /* --- DATA STATES TỪ API --- */
    const [movies, setMovies] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    /* --- FORM STATES --- */
    const [showDate, setShowDate] = useState(today);
    const [movieId, setMovieId] = useState('');
    const [roomId, setRoomId] = useState('');
    const [priceStandard, setPriceStandard] = useState(75000);
    const [priceVip, setPriceVip] = useState(90000);
    const [priceDouble, setPriceDouble] = useState(150000);

    const [openTime, setOpenTime] = useState('08:00');
    const [closeTime, setCloseTime] = useState('23:00');
    const [cleaningTime, setCleaningTime] = useState(15); // Phút dọn rạp

    const [generated, setGenerated] = useState([]);

    // State quản lý UI/UX
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const showToast = (msg, type = 'success') => setToast({ show: true, message: msg, type });

    /* ================= FETCH INITIAL DATA ================= */
    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoadingData(true);
            try {
                const token = localStorage.getItem('token');

                // 1. Lấy danh sách Phòng chiếu
                const resRooms = await fetch(
                    'https://cinema-api-production-f2bc.up.railway.app/api/v1/manager/rooms',
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
                const jsonRooms = await resRooms.json();
                if (resRooms.ok) {
                    const roomData = Array.isArray(jsonRooms.data)
                        ? jsonRooms.data
                        : Array.isArray(jsonRooms)
                          ? jsonRooms
                          : [];
                    setRooms(roomData);
                }

                // 2. Lấy danh sách Phim (Gộp cả đang chiếu và sắp chiếu)
                const resMovies = await fetch(
                    'https://cinema-api-production-f2bc.up.railway.app/api/v1/movies'
                );
                const jsonMovies = await resMovies.json();
                if (resMovies.ok) {
                    const allMovies = [
                        ...(jsonMovies.now_showing || [])
                    ];
                    setMovies(allMovies);
                }
            } catch (error) {
                console.error('Lỗi lấy dữ liệu:', error);
                showToast('Không thể tải dữ liệu Phim và Phòng chiếu!', 'error');
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchInitialData();
    }, []);

    /* ================= TIME HELPER ================= */
    const addMinutes = (time, mins) => {
        const [h, m] = time.split(':').map(Number);
        const date = new Date();
        date.setHours(h);
        date.setMinutes(m + mins);
        return date.toTimeString().slice(0, 5);
    };

    const isBefore = (t1, t2) => {
        return t1 < t2;
    };

    /* ================= AUTO GENERATE ================= */
    const handleGenerate = () => {
        if (!showDate) return showToast('Vui lòng chọn ngày chiếu!', 'error');
        if (!movieId) return showToast('Vui lòng chọn phim!', 'error');
        if (!roomId) return showToast('Vui lòng chọn phòng chiếu!', 'error');
        // if (!ticketPrice || ticketPrice < 0) return showToast('Giá vé không hợp lệ!', 'error');

        const selectedMovie = movies.find((m) => m.movie_id == movieId);
        const movieDuration = selectedMovie?.duration || 120; // Nếu API thiếu thời lượng thì mặc định 120p

        const result = [];
        let current = openTime;

        while (isBefore(current, closeTime)) {
            const end = addMinutes(current, movieDuration);

            // Nếu giờ kết thúc vượt quá giờ đóng cửa rạp thì dừng lại
            if (end > closeTime && result.length > 0) break;

            result.push({
                id: Math.random().toString(36).substr(2, 9),
                start: current,
                end: end
            });

            // Cộng thêm thời gian dọn rạp
            current = addMinutes(end, cleaningTime);
        }

        if (result.length === 0) {
            showToast('Khung giờ quá ngắn, không đủ xếp suất nào!', 'error');
        } else {
            setGenerated(result);
            showToast('Đã tạo danh sách xem trước, bạn có thể tinh chỉnh bên phải.', 'success');
        }
    };

    /* ================= REMOVE SINGLE GENERATED SLOT ================= */
    const handleRemoveGeneratedSlot = (idToRemove) => {
        setGenerated((prev) => prev.filter((slot) => slot.id !== idToRemove));
    };

    /* ================= SUBMIT TO BACKEND (BULK CREATE) ================= */
    const handleSubmit = async () => {
        if (generated.length === 0) {
            return showToast('Không có suất chiếu nào để lưu!', 'error');
        }

        const payload = {
            movie_id: Number(movieId),
            room_id: Number(roomId),
            show_date: showDate,
            // Gửi lên 3 mức giá cấu hình cứng cho suất chiếu này
            price_standard: Number(priceStandard),
            price_vip: Number(priceVip),
            price_double: Number(priceDouble),
            showtimes: generated.map((g) => ({
                start_time: g.start,
                end_time: g.end
            }))
        };

        console.log('📦 DATA SEND TO BACKEND:', payload);
        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                'https://cinema-api-production-f2bc.up.railway.app/api/v1/manager/showtimes/bulk',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                }
            );

            const resData = await response.json();

            if (response.ok) {
                showToast('🎉 Tạo suất chiếu hàng loạt thành công!', 'success');
                setTimeout(() => navigate('/admin/showtimes'), 1500);
            } else {
                console.error('Lỗi từ BE:', resData);
                showToast(resData.message || 'Có lỗi xảy ra khi lưu!', 'error');
            }
        } catch (error) {
            console.error('Lỗi Submit:', error);
            showToast('Lỗi kết nối server!', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    /* ================= UI ================= */
    return (
        <div className="p-6 bg-gray-50 min-h-screen text-gray-800">
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ show: false, message: '' })}
                />
            )}

            <div className="flex items-center gap-3 mb-8">
                <div className="w-1.5 h-6 bg-red-600 rounded-full"></div>
                <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">
                    Tạo Suất Chiếu Tự Động
                </h1>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 items-start">
                {/* CỘT TRÁI: FORM CẤU HÌNH */}
                <div className="w-full lg:w-[45%] bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6 relative">
                    {isLoadingData && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                        </div>
                    )}

                    <div className="flex items-center gap-2 border-b pb-3 mb-4">
                        <Settings size={18} className="text-gray-500" />
                        <h2 className="font-semibold text-gray-700">Thông số đầu vào</h2>
                    </div>

                    {/* Dòng 1: Ngày chiếu & Giá vé */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Dòng 1: Ngày chiếu */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                Ngày chiếu
                            </label>
                            <div className="relative">
                                <Calendar
                                    size={16}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />
                                <input
                                    type="date"
                                    value={showDate}
                                    onChange={(e) => setShowDate(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl py-2.5 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Dòng 2: Bảng Giá Vé Linh Hoạt */}
                    <div className="space-y-3 mt-2">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
                            <Ticket size={18} className="text-red-500" /> Cấu hình giá vé
                        </label>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Ghế Thường */}
                            <div className="border border-gray-200 rounded-xl p-3 shadow-sm bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all cursor-text">
                                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Ghế Thường</label>
                                <div className="flex items-baseline gap-1">
                                    <input
                                        type="number"
                                        value={priceStandard}
                                        onChange={(e) => setPriceStandard(e.target.value)}
                                        className="w-full text-lg font-bold text-gray-800 bg-transparent focus:outline-none p-0 border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                    <span className="text-sm font-semibold text-gray-400">VNĐ</span>
                                </div>
                            </div>

                            {/* Ghế VIP */}
                            <div className="border border-orange-200 rounded-xl p-3 shadow-sm bg-orange-50/50 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100 transition-all cursor-text">
                                <label className="block text-[11px] font-bold text-orange-500 uppercase tracking-wider mb-1">Ghế VIP</label>
                                <div className="flex items-baseline gap-1">
                                    <input
                                        type="number"
                                        value={priceVip}
                                        onChange={(e) => setPriceVip(e.target.value)}
                                        className="w-full text-lg font-bold text-gray-800 bg-transparent focus:outline-none p-0 border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                    <span className="text-sm font-semibold text-orange-500">VNĐ</span>
                                </div>
                            </div>

                            {/* Ghế Đôi */}
                            <div className="border border-pink-200 rounded-xl p-3 shadow-sm bg-pink-50/50 focus-within:border-pink-500 focus-within:ring-2 focus-within:ring-pink-100 transition-all cursor-text">
                                <label className="block text-[11px] font-bold text-pink-500 uppercase tracking-wider mb-1">Ghế Đôi</label>
                                <div className="flex items-baseline gap-1">
                                    <input
                                        type="number"
                                        value={priceDouble}
                                        onChange={(e) => setPriceDouble(e.target.value)}
                                        className="w-full text-lg font-bold text-gray-800 bg-transparent focus:outline-none p-0 border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                    <span className="text-sm font-semibold text-pink-500">VNĐ</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dòng 2: Phim & Phòng */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                Chọn Phim
                            </label>
                            <div className="relative">
                                <Film
                                    size={16}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />
                                <select
                                    value={movieId}
                                    onChange={(e) => setMovieId(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl py-2.5 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                                >
                                    <option value="">-- Click để chọn phim --</option>
                                    {movies.map((m) => (
                                        <option key={m.movie_id} value={m.movie_id}>
                                            {m.title} {m.duration ? `(${m.duration} phút)` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                Phòng chiếu
                            </label>
                            <div className="relative">
                                <MonitorPlay
                                    size={16}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />
                                <select
                                    value={roomId}
                                    onChange={(e) => setRoomId(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl py-2.5 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                                >
                                    <option value="">-- Chọn phòng --</option>
                                    {rooms.map((r) => (
                                        <option
                                            key={r.room_id}
                                            value={r.room_id}
                                            disabled={r.status !== 'active'}
                                            className={
                                                r.status !== 'active'
                                                    ? 'text-gray-400 bg-gray-50'
                                                    : ''
                                            }
                                        >
                                            {r.room_name}{' '}
                                            {r.status !== 'active' ? '(Ngừng hoạt động)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Dòng 3: Cấu hình thời gian */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4 mt-4">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Khung giờ hoạt động
                        </label>
                        <div className="flex items-center gap-3">
                            <div className="flex-1 relative">
                                <Clock
                                    size={16}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />
                                <input
                                    type="time"
                                    value={openTime}
                                    onChange={(e) => setOpenTime(e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg py-2 pl-9 pr-2 text-sm focus:outline-none focus:border-red-500"
                                />
                            </div>
                            <span className="text-gray-400 text-sm">đến</span>
                            <div className="flex-1 relative">
                                <Clock
                                    size={16}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />
                                <input
                                    type="time"
                                    value={closeTime}
                                    onChange={(e) => setCloseTime(e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg py-2 pl-9 pr-2 text-sm focus:outline-none focus:border-red-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                Thời gian dọn rạp (phút)
                            </label>
                            <input
                                type="number"
                                value={cleaningTime}
                                onChange={(e) => setCleaningTime(Number(e.target.value))}
                                className="w-full border border-gray-200 rounded-lg py-2 px-3 focus:outline-none focus:border-red-500"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={isLoadingData}
                        className="w-full bg-zinc-800 text-white font-semibold py-3 rounded-xl hover:bg-black transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Tạo danh sách xem trước
                    </button>
                </div>

                {/* CỘT PHẢI: PREVIEW & LƯU */}
                <div className="w-full lg:w-[55%] bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full min-h-[500px]">
                    <div className="flex justify-between items-center border-b pb-3 mb-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 size={18} className="text-emerald-500" />
                            <h2 className="font-semibold text-gray-700">Xem trước & Tinh chỉnh</h2>
                        </div>
                        <span className="text-sm font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">
                            {generated.length} suất chiếu
                        </span>
                    </div>

                    {generated.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-20">
                            <MonitorPlay size={48} className="mb-4 opacity-20" />
                            <p>Chưa có dữ liệu.</p>
                            <p className="text-sm">Hãy cấu hình bên trái và bấm tạo xem trước.</p>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto max-h-[450px] pr-2 space-y-3 mb-6 custom-scrollbar">
                            {generated.map((slot, i) => (
                                <div
                                    key={slot.id}
                                    className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-800 text-lg">
                                                {slot.start}{' '}
                                                <span className="text-gray-400 text-sm font-normal mx-1">
                                                    đến
                                                </span>{' '}
                                                {slot.end}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveGeneratedSlot(slot.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        title="Xóa suất chiếu này"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {generated.length > 0 && (
                        <div className="mt-auto pt-4 border-t border-gray-100">
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className={`w-full font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-red-500/30 ${
                                    isSubmitting
                                        ? 'bg-red-400 text-white cursor-wait'
                                        : 'bg-red-600 text-white hover:bg-red-700 hover:-translate-y-0.5'
                                }`}
                            >
                                {isSubmitting ? 'ĐANG LƯU DỮ LIỆU...' : 'LƯU TẤT CẢ SUẤT CHIẾU'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
