import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BookingProgress from '../../components/BookingProgress';
import Combos from '../../components/Combos';
import { showtimes } from '../../data/showtimes';
import { movies } from '../../data/movie';
import Toast from '../../components/common/Toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ComboPage = () => {
    const { showtimeId } = useParams();
    const navigate = useNavigate();
    const [selectedCombos, setSelectedCombos] = useState([]);

    // STATE XỬ LÝ HOLD GHẾ & UI
    const [isHolding, setIsHolding] = useState(true); // Loading khi đang gọi API giữ ghế


    // 🌟 ĐỌC MỐC THỜI GIAN TỪ LOCALSTORAGE ĐỂ TÍNH SỐ GIÂY CÒN LẠI
    const [timeLeft, setTimeLeft] = useState(() => {
        const endTime = localStorage.getItem('holdEndTime');
        if (!endTime) return 7 * 60; // Fallback an toàn nếu không tìm thấy

        // Tính số giây chênh lệch giữa Lúc hết hạn và Hiện tại
        const remainingSeconds = Math.floor((parseInt(endTime, 10) - Date.now()) / 1000);

        // Nếu số giây < 0 (Khách ở ngoài quá lâu giờ mới F5), trả về 0 để ép nhả ghế
        return remainingSeconds > 0 ? remainingSeconds : 0;
    });

    
    const [toast, setToast] = useState({ show: false, message: '', type: 'error' });

    // Cờ để biết khách bấm "Tiếp tục" hay "Quay lại" để xử lý nhả ghế
    const isProceedingRef = useRef(false);

    // Lấy lại thông tin showtime và movie
    const id = Number(showtimeId);
    let showtime = showtimes.find((s) => s.showtime_id === id);
    let movie = showtime ? movies.find((m) => m.movie_id === showtime.movie_id) : null;

    if (!showtime) {
        try {
            showtime = JSON.parse(localStorage.getItem('bookingShowtime'));
        } catch {}
    }
    if (!movie) {
        try {
            movie = JSON.parse(localStorage.getItem('bookingMovie'));
        } catch {}
    }

    const selectedSeats = JSON.parse(localStorage.getItem('selectedSeats') || '[]');

    // =========================================================
    // EFFECT 1: GỌI API GIỮ GHẾ KHI VỪA VÀO TRANG
    // =========================================================
    useEffect(() => {
        const holdSeats = async () => {
            const token = localStorage.getItem('token');
            if (!token || selectedSeats.length === 0) {
                navigate(`/booking/${showtimeId}`);
                return;
            }

            try {
                const response = await fetch(
                    `https://cinema-api-production-f2bc.up.railway.app/api/v1/showtimes/${showtimeId}/holds`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            // 🌟 FIX QUAN TRỌNG NHẤT: Bắt buộc gửi s.id (Mã thật từ Backend, VD: C6),
                            // Tuyệt đối không gửi s.label (A1) vì DB sẽ không hiểu
                            seat_labels: selectedSeats.map((s) => s.id)
                        })
                    }
                );

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message || 'Ghế đã bị người khác chọn mất!');
                }

                // Giữ ghế thành công -> Backend sẽ tự bắn WebSocket cho các User khác
                setIsHolding(false);
            } catch (error) {
                setToast({ show: true, message: error.message, type: 'error' });
                // Đẩy khách về trang chọn ghế sau 2 giây nếu ghế bị lỗi/trùng
                setTimeout(() => {
                    navigate(`/booking/${showtimeId}`);
                }, 2000);
            }
        };

        holdSeats();

        // CLEANUP: Tự động nhả ghế nếu khách hàng ĐÓNG TRÌNH DUYỆT hoặc BẤM BACK (Quay lại)
        return () => {
            if (!isProceedingRef.current) {
                releaseSeats();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // =========================================================
    // EFFECT 2: ĐỒNG HỒ ĐẾM NGƯỢC 7 PHÚT
    // =========================================================
    useEffect(() => {
        if (isHolding) return; // Chỉ đếm ngược khi đã hold ghế xong

        if (timeLeft <= 0) {
            setToast({
                show: true,
                message: 'Hết thời gian giữ ghế! Vui lòng chọn lại.',
                type: 'error'
            });
            releaseSeats();
            setTimeout(() => navigate(`/booking/${showtimeId}`), 2000);
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, isHolding, navigate, showtimeId]);

    // HÀM NHẢ GHẾ (Hủy Hold)
    const releaseSeats = () => {
        const token = localStorage.getItem('token');
        if (!token || selectedSeats.length === 0) return;

        fetch(
            `https://cinema-api-production-f2bc.up.railway.app/api/v1/showtimes/${showtimeId}/holds`,
            {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    // 🌟 FIX: Tương tự, gửi s.id để nhả đúng ghế
                    seat_labels: selectedSeats.map((s) => s.id)
                }),
                keepalive: true
            }
        ).catch((err) => console.log('Lỗi nhả ghế:', err));
    };

    // =========================================================
    // XỬ LÝ CLICK NÚT QUAY LẠI VÀ TIẾP TỤC
    // =========================================================
    const handleBack = () => {
        releaseSeats(); // Nhả ghế cho người khác mua
        navigate(-1);
    };

    const handleContinue = () => {
        isProceedingRef.current = true; // Đánh dấu là đi tiếp trang Thanh toán, không nhả ghế
        localStorage.setItem('selectedCombos', JSON.stringify(selectedCombos));
        navigate(`/payment/${showtimeId}`);
    };

    // Format thời gian đếm ngược (MM:SS)
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60)
            .toString()
            .padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const totalCombo = selectedCombos.reduce((sum, c) => sum + c.price * c.quantity, 0);
    const totalSeat = selectedSeats.reduce((sum, s) => sum + s.price, 0);
    const total = totalCombo + totalSeat;

    if (isHolding) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white">
                <LoadingSpinner isDark={true} />
                <p className="mt-4 text-zinc-400 animate-pulse">Đang khóa ghế của bạn...</p>
            </div>
        );
    }

    return (
        <div className="bg-zinc-950 min-h-screen text-white relative">
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ show: false, message: '', type: 'error' })}
                />
            )}

            <div className="max-w-6xl mx-auto px-6 pt-[100px] pb-8">
                <BookingProgress />
                <h1 className="text-3xl font-bold mb-2">{movie?.title}</h1>
                <p className="text-zinc-400">
                    {showtime?.cinema || 'Galaxy Nguyễn Du'} • {showtime?.room} •{' '}
                    {showtime?.show_date} • {showtime?.start_time}
                </p>
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-8">
                        <Combos onChange={setSelectedCombos} />
                    </div>

                    <div className="lg:col-span-4">
                        <div className="bg-zinc-900 p-6 rounded-2xl sticky top-24 shadow-xl border border-white/5">
                            {/* KHUNG ĐẾM NGƯỢC THỜI GIAN */}
                            <div className="bg-red-600/10 border border-red-500/50 rounded-xl p-4 mb-6 flex items-center justify-between shadow-[0_0_15px_rgba(220,38,38,0.2)]">
                                <span className="text-red-400 font-medium">Thời gian giữ ghế:</span>
                                <span
                                    className={`text-2xl font-black tabular-nums ${timeLeft <= 60 ? 'text-red-500 animate-pulse' : 'text-white'}`}
                                >
                                    {formatTime(timeLeft)}
                                </span>
                            </div>

                            <h3 className="text-lg font-semibold mb-4">Thông tin đặt vé</h3>
                            <div className="flex items-start gap-4 mb-6">
                                <img
                                    src={movie.poster_url}
                                    alt={movie.title}
                                    className="w-20 h-28 rounded-2xl object-cover shadow-lg"
                                />
                                <div>
                                    <h4 className="text-base font-semibold">{movie.title}</h4>
                                    <p className="text-zinc-400 text-sm mt-2">
                                        {showtime.format || '2D'}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Suất chiếu</span>
                                    <span>{showtime.start_time}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Phòng</span>
                                    <span>{showtime.room}</span>
                                </div>
                            </div>

                            <div className="space-y-3 text-sm mt-6">
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Ghế đã chọn</span>
                                    {/* HIỂN THỊ SỐ ĐẸP CHO KHÁCH (s.label) NHƯNG LÚC GỬI API LÀ S.ID */}
                                    <span className="font-medium text-orange-400">
                                        {selectedSeats.map((s) => s.label || s.id).join(', ')}
                                    </span>
                                </div>
                            </div>

                            {selectedCombos?.length > 0 && (
                                <div className="mt-6 pt-4 border-t border-dashed border-zinc-700">
                                    <p className="text-zinc-400 mb-3">
                                        Combo ({selectedCombos.length})
                                    </p>

                                    <div className="space-y-2">
                                        {selectedCombos.map((c, i) => (
                                            <div key={i} className="flex justify-between text-sm">
                                                <span className="text-zinc-300">
                                                    {c.name}{' '}
                                                    <strong className="text-orange-500">
                                                        x{c.quantity}
                                                    </strong>
                                                </span>
                                                <span>
                                                    {(c.price * c.quantity).toLocaleString()} đ
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="border-t border-zinc-700 my-6"></div>

                            <div className="flex justify-between text-xl font-bold">
                                <span>Tổng cộng</span>
                                <span className="text-orange-500">{total.toLocaleString()} đ</span>
                            </div>

                            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                <button
                                    onClick={handleBack}
                                    className="flex-1 border border-zinc-700 bg-zinc-900 py-4 rounded-xl font-semibold text-lg text-white hover:border-red-500 hover:text-red-400 transition"
                                >
                                    Quay lại
                                </button>
                                <button
                                    className="flex-1 bg-orange-600 py-4 rounded-xl font-semibold text-lg hover:bg-orange-700 transition shadow-[0_0_15px_rgba(234,88,12,0.3)]"
                                    onClick={handleContinue}
                                >
                                    Tiếp tục
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};;

export default ComboPage;
