import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Ticket } from 'lucide-react';
import BookingProgress from '../../components/BookingProgress';
import Toast from '../../components/common/Toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// IMPORT COMPONENT CỘT TRÁI VỪA TẠO
import Payment from '../../components/Payment';

const PaymentPage = () => {
    const { showtimeId } = useParams();
    const navigate = useNavigate();

    // 🌟 CỜ HIỆU ĐỂ DỌN RÁC
    const isProceedingRef = useRef(false);

    // LẤY DỮ LIỆU TỪ LOCALSTORAGE
    const [movie, setMovie] = useState(null);
    const [showtime, setShowtime] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [selectedCombos, setSelectedCombos] = useState([]);

    // 🌟 STATE XỬ LÝ HOLD GHẾ
    const [isHolding, setIsHolding] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    // STATE NHẬN TỪ COMPONENT <Payment /> (Cột Trái)
    const [paymentMethod, setPaymentMethod] = useState('momo');
    const [discount, setDiscount] = useState(0);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // ĐỌC MỐC THỜI GIAN ĐỂ TÍNH GIÂY
    const [timeLeft, setTimeLeft] = useState(() => {
        const endTime = localStorage.getItem('holdEndTime');
        if (!endTime) return 7 * 60;
        const remainingSeconds = Math.floor((parseInt(endTime, 10) - Date.now()) / 1000);
        return remainingSeconds > 0 ? remainingSeconds : 0;
    });

    // =========================================================
    // EFFECT 1: KIỂM TRA DỮ LIỆU & TIẾP TỤC GIỮ GHẾ
    // =========================================================
    useEffect(() => {
        const m = localStorage.getItem('bookingMovie');
        const s = localStorage.getItem('bookingShowtime');
        const seats = localStorage.getItem('selectedSeats');
        const combos = localStorage.getItem('selectedCombos');

        if (!m || !s || !seats || JSON.parse(seats).length === 0) {
            navigate(`/booking/${showtimeId}`);
            return;
        }

        const parsedSeats = JSON.parse(seats);
        setMovie(JSON.parse(m));
        setShowtime(JSON.parse(s));
        setSelectedSeats(parsedSeats);
        if (combos) setSelectedCombos(JSON.parse(combos));

        const holdSeats = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                // Xác nhận lại việc giữ ghế với Backend để đảm bảo an toàn lúc thanh toán
                const response = await fetch(
                    `https://cinema-api-production-f2bc.up.railway.app/api/v1/showtimes/${showtimeId}/holds`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            seat_labels: parsedSeats.map((seat) => seat.id)
                        })
                    }
                );

                const result = await response.json();
                if (!response.ok) throw new Error(result.message || 'Phiên giữ ghế đã hết hạn!');

                setIsHolding(false); // Xong thì tắt LoadingSpinner
            } catch (error) {
                setToast({ show: true, message: error.message, type: 'error' });
                setTimeout(() => navigate(`/booking/${showtimeId}`), 2000);
            }
        };

        holdSeats();

        return () => {
            if (!isProceedingRef.current) releaseSeats(parsedSeats);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showtimeId, navigate]);

    // =========================================================
    // EFFECT 2: XỬ LÝ ĐẾM NGƯỢC
    // =========================================================
    useEffect(() => {
        if (isHolding) return;

        if (timeLeft <= 0) {
            setToast({ show: true, message: 'Hết thời gian giữ ghế!', type: 'error' });
            releaseSeats(selectedSeats);
            setTimeout(() => navigate(`/booking/${showtimeId}`), 2000);
            return;
        }
        const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft, isHolding, navigate, showtimeId, selectedSeats]);

    // =========================================================
    // HÀM NHẢ GHẾ VÀ QUAY LẠI
    // =========================================================
    const releaseSeats = (seatsToRelease) => {
        const token = localStorage.getItem('token');
        if (!token || !seatsToRelease || seatsToRelease.length === 0) return;

        fetch(
            `https://cinema-api-production-f2bc.up.railway.app/api/v1/showtimes/${showtimeId}/holds`,
            {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    seat_labels: seatsToRelease.map((s) => s.id)
                }),
                keepalive: true
            }
        ).catch((err) => console.log('Lỗi nhả ghế:', err));
    };

    const handleBack = () => {
        isProceedingRef.current = true;
        navigate(-1);
    };

    // =========================================================
    // HÀM XỬ LÝ CLICK NÚT THANH TOÁN
    // =========================================================
    const handlePayment = () => {
        if (!paymentMethod) {
            setToast({
                show: true,
                message: 'Vui lòng chọn phương thức thanh toán!',
                type: 'error'
            });
            return;
        }

        setIsProcessing(true);
        isProceedingRef.current = true; // Ngăn chặn nhả ghế khi redirect

        setTimeout(() => {
            setIsProcessing(false);
            setToast({
                show: true,
                message: 'Chuyển hướng đến cổng thanh toán...',
                type: 'success'
            });
            // navigate(`/success`); // Sau này gắn API thật thì mở comment chỗ này
        }, 2000);
    };

    // =========================================================
    // TÍNH TOÁN TIỀN
    // =========================================================
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60)
            .toString()
            .padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const seatTotal = selectedSeats.reduce((sum, s) => sum + (s.price || 0), 0);
    const comboTotal = selectedCombos.reduce((sum, c) => sum + c.price * c.quantity, 0);
    const subTotal = seatTotal + comboTotal;
    const finalTotal = Math.max(subTotal - discount, 0);

    if (isHolding || !movie || !showtime) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white">
                <LoadingSpinner isDark={true} />
                <p className="mt-4 text-zinc-400 animate-pulse">
                    Đang chuẩn bị hóa đơn thanh toán...
                </p>
            </div>
        );
    }

    return (
        <div className="bg-zinc-950 min-h-screen text-white relative pb-24">
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ show: false, message: '', type: 'success' })}
                />
            )}

            <div className="max-w-6xl mx-auto px-6 pt-[100px] pb-8">
                <BookingProgress currentStep={3} />

                <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* ========================================================== */}
                    {/* CỘT TRÁI: IMPORT COMPONENT PAYMENT UI VÀO ĐÂY */}
                    {/* ========================================================== */}
                    <div className="lg:col-span-8">
                        <Payment
                            paymentMethod={paymentMethod}
                            setPaymentMethod={setPaymentMethod}
                            onDiscountChange={setDiscount}
                            setToast={setToast}
                        />
                    </div>

                    {/* ========================================================== */}
                    {/* CỘT PHẢI: BILL TỔNG KẾT & NÚT THANH TOÁN CHỐT ĐƠN */}
                    {/* ========================================================== */}
                    <div className="lg:col-span-4">
                        <div className="bg-zinc-900 p-6 rounded-2xl sticky top-24 border border-zinc-800 shadow-2xl">
                            {/* KHUNG ĐẾM NGƯỢC THỜI GIAN */}
                            <div className="bg-red-600/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-center justify-between">
                                <span className="text-red-400 font-medium">Thời gian giữ ghế:</span>
                                <span
                                    className={`text-2xl font-black tabular-nums ${timeLeft <= 60 ? 'text-red-500 animate-pulse' : 'text-white'}`}
                                >
                                    {formatTime(timeLeft)}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold mb-4 uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                                <Ticket size={20} className="text-orange-500" /> Tóm tắt đơn hàng
                            </h3>

                            {/* Thông tin phim */}
                            <div className="flex items-start gap-4 mb-6 bg-black/20 p-3 rounded-xl border border-white/5">
                                <img
                                    src={movie.poster_url}
                                    alt={movie.title}
                                    className="w-16 h-24 rounded-lg object-cover shadow-lg"
                                />
                                <div>
                                    <h4 className="text-base font-bold leading-tight">
                                        {movie.title}
                                    </h4>
                                    <p className="text-zinc-400 text-xs mt-1">
                                        {showtime.cinema || 'Hệ thống rạp'} • {showtime.room}
                                    </p>
                                    <p className="text-zinc-400 text-xs mt-0.5">
                                        {showtime.show_date} • {showtime.start_time}
                                    </p>
                                </div>
                            </div>

                            <div className="border-t border-dashed border-zinc-700 my-4"></div>

                            {/* Chi tiết Hóa đơn */}
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-400 font-medium">
                                        Ghế ({selectedSeats.length})
                                    </span>
                                    <span className="font-semibold">
                                        {seatTotal.toLocaleString()} đ
                                    </span>
                                </div>
                                <p className="text-xs font-semibold text-white pl-4 border-l-2 border-orange-500">
                                    {selectedSeats.map((s) => s.label || s.id).join(', ')}
                                </p>

                                {selectedCombos.length > 0 && (
                                    <>
                                        <div className="flex justify-between text-sm pt-2">
                                            <span className="text-zinc-400 font-medium">
                                                Bắp nước
                                            </span>
                                            <span className="font-semibold">
                                                {comboTotal.toLocaleString()} đ
                                            </span>
                                        </div>
                                        <ul className="text-xs text-zinc-300 pl-4 border-l-2 border-orange-500 space-y-1">
                                            {selectedCombos.map((c, i) => (
                                                <li key={i}>
                                                    {c.quantity}x {c.combo_name || c.name}
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                )}

                                {discount > 0 && (
                                    <div className="flex justify-between text-sm pt-2">
                                        <span className="text-green-500 font-medium">
                                            Giảm giá voucher
                                        </span>
                                        <span className="font-bold text-green-500">
                                            - {discount.toLocaleString()} đ
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-zinc-700 my-5"></div>

                            {/* Tổng tiền */}
                            <div className="flex justify-between items-end mb-6">
                                <span className="text-zinc-400 uppercase tracking-wider text-xs font-bold mb-1">
                                    Cần thanh toán
                                </span>
                                <span className="text-orange-500 font-black text-3xl drop-shadow-[0_0_8px_rgba(234,88,12,0.4)]">
                                    {finalTotal.toLocaleString()} ₫
                                </span>
                            </div>

                            {/* Nút điều hướng */}
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handlePayment}
                                    disabled={isProcessing}
                                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 py-4 rounded-xl font-bold text-lg text-white hover:from-orange-500 hover:to-red-500 transition-all shadow-[0_4px_20px_rgba(234,88,12,0.3)] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isProcessing ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        'THANH TOÁN'
                                    )}
                                </button>

                                <button
                                    onClick={handleBack}
                                    disabled={isProcessing}
                                    className="w-full border border-zinc-700 bg-transparent py-3.5 rounded-xl font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all disabled:opacity-50"
                                >
                                    Quay lại bước trước
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
