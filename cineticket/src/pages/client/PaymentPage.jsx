import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Ticket, X } from 'lucide-react';
import BookingProgress from '../../components/BookingProgress';
import Toast from '../../components/common/Toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// IMPORT COMPONENT CỘT TRÁI
import Payment from '../../components/Payment';

const PaymentPage = () => {
    const { showtimeId } = useParams();
    const navigate = useNavigate();

    // CỜ HIỆU ĐỂ NGĂN CHẶN NHẢ GHẾ KHI CHUYỂN TRANG/THANH TOÁN
    const isProceedingRef = useRef(false);

    // LẤY DỮ LIỆU TỪ LOCALSTORAGE
    const [movie, setMovie] = useState(null);
    const [showtime, setShowtime] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [selectedCombos, setSelectedCombos] = useState([]);

    // STATE XỬ LÝ HOLD GHẾ & LOADING
    const [isHolding, setIsHolding] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    // STATE CHO MODAL XÁC NHẬN
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAgreed, setIsAgreed] = useState(false);

    // STATE NHẬN TỪ COMPONENT <Payment />
    const [paymentMethod, setPaymentMethod] = useState('momo');
    const [discount, setDiscount] = useState(0);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // ĐỌC MỐC THỜI GIAN ĐỂ TÍNH GIÂY (Đếm ngược)
    const [timeLeft, setTimeLeft] = useState(() => {
        const endTime = localStorage.getItem('holdEndTime');
        if (!endTime) return 10 * 60;
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
            if (!token) {
                navigate('/login');
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
                            // 🌟 KHÔI PHỤC THÀNH SEAT_LABELS
                            seat_labels: parsedSeats.map((seat) => seat.label || seat.id)
                        })
                    }
                );

                const result = await response.json();
                if (!response.ok) throw new Error(result.message || 'Phiên giữ ghế đã hết hạn!');

                setIsHolding(false);
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
            setIsModalOpen(false);
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
                    // 🌟 KHÔI PHỤC THÀNH SEAT_LABELS
                    seat_labels: seatsToRelease.map((s) => s.label || s.id)
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

    // =========================================================
    // BƯỚC 1: MỞ MODAL
    // =========================================================
    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    // =========================================================
    // BƯỚC 2: GỌI API KHI BẤM XÁC NHẬN TRONG MODAL
    // =========================================================
    const handleConfirmPayment = async () => {
        setIsProcessing(true);
        isProceedingRef.current = true; // Ngăn chặn nhả ghế khi đang tạo đơn
        const token = localStorage.getItem('token');

        try {
            setToast({ show: true, message: 'Đang tạo đơn hàng...', type: 'success' });

            // 1. GỌI API TẠO ĐƠN HÀNG (PENDING)
            const createRes = await fetch(
                'https://cinema-api-production-f2bc.up.railway.app/api/v1/bookings',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        showtime_id: showtimeId,
                        // 🌟 KHÔI PHỤC THÀNH SEAT_LABELS
                        seat_labels: selectedSeats.map((s) => s.label || s.id),
                        combos: selectedCombos.map((c) => ({
                            combo_id: c.combo_id || c.id,
                            quantity: c.quantity
                        }))
                    })
                }
            );
            const createData = await createRes.json();
            if (!createRes.ok) throw new Error(createData.message || 'Lỗi khi tạo đơn hàng');
            const bookingId = createData.booking_id || createData.data?.booking_id;

            // Giả lập độ trễ thanh toán (2 giây)
            setToast({ show: true, message: 'Đang xử lý thanh toán...', type: 'success' });
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // 2. GỌI API XÁC NHẬN THANH TOÁN (COMPLETED)
            const confirmRes = await fetch(
                `https://cinema-api-production-f2bc.up.railway.app/api/v1/bookings/${bookingId}/confirm`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        payment_method: 'Tiền mặt / Tại quầy',
                        amount: finalTotal,
                        payment_status: 'completed',
                        payment_time: new Date().toISOString()
                    })
                }
            );

            const confirmData = await confirmRes.json();
            if (!confirmRes.ok)
                throw new Error(confirmData.message || 'Lỗi khi xác nhận thanh toán');

            // 3. THÀNH CÔNG -> DỌN RÁC
            setToast({
                show: true,
                message: 'Thanh toán thành công! Chúc bạn xem phim vui vẻ.',
                type: 'success'
            });

            localStorage.removeItem('bookingMovie');
            localStorage.removeItem('bookingShowtime');
            localStorage.removeItem('selectedSeats');
            localStorage.removeItem('selectedCombos');
            localStorage.removeItem('holdEndTime');

            setTimeout(() => {
                setIsModalOpen(false);
                navigate(`/`);
            }, 1500);
        } catch (error) {
            console.error(error);
            setToast({ show: true, message: error.message, type: 'error' });
            setIsProcessing(false);
            isProceedingRef.current = false; // Mở lại cờ để có thể thao tác tiếp

            // Xử lý đá về chọn ghế nếu lỗi liên quan thời gian
            const errorMsg = error.message.toLowerCase();
            if (
                errorMsg.includes('thời gian') ||
                errorMsg.includes('hết') ||
                errorMsg.includes('giữ ghế')
            ) {
                localStorage.removeItem('selectedSeats');
                localStorage.removeItem('holdEndTime');

                setTimeout(() => {
                    setIsModalOpen(false);
                    navigate(`/booking/${showtimeId}`);
                }, 2000);
            }
        }
    };

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
                    <div className="lg:col-span-8">
                        <Payment
                            paymentMethod={paymentMethod}
                            setPaymentMethod={setPaymentMethod}
                            onDiscountChange={setDiscount}
                            setToast={setToast}
                        />
                    </div>

                    <div className="lg:col-span-4">
                        <div className="bg-zinc-900 p-6 rounded-2xl sticky top-24 border border-zinc-800 shadow-2xl">
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

                            <div className="flex justify-between items-end mb-6">
                                <span className="text-zinc-400 uppercase tracking-wider text-xs font-bold mb-1">
                                    Cần thanh toán
                                </span>
                                <span className="text-orange-500 font-black text-3xl drop-shadow-[0_0_8px_rgba(234,88,12,0.4)]">
                                    {finalTotal.toLocaleString()} ₫
                                </span>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleOpenModal}
                                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 py-4 rounded-xl font-bold text-lg text-white hover:from-orange-500 hover:to-red-500 transition-all shadow-[0_4px_20px_rgba(234,88,12,0.3)] flex items-center justify-center gap-2"
                                >
                                    THANH TOÁN
                                </button>

                                <button
                                    onClick={handleBack}
                                    className="w-full border border-zinc-700 bg-transparent py-3.5 rounded-xl font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all disabled:opacity-50"
                                >
                                    Quay lại bước trước
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ========================================================= */}
            {/* GIAO DIỆN MODAL XÁC NHẬN THANH TOÁN */}
            {/* ========================================================= */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Background mờ */}
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={() => !isProcessing && setIsModalOpen(false)}
                    ></div>

                    {/* Hộp Modal */}
                    <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Header Modal */}
                        <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/50">
                            <h3 className="text-lg font-bold text-white">Xác nhận thông tin vé</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                disabled={isProcessing}
                                className="text-zinc-400 hover:text-white hover:bg-zinc-800 p-1.5 rounded-lg transition-colors disabled:opacity-50"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body Modal (Tóm tắt vé nhỏ gọn) */}
                        <div className="p-6">
                            <div className="bg-zinc-950/50 rounded-xl p-4 border border-white/5 space-y-3 mb-6">
                                <div>
                                    <p className="text-xs text-zinc-500 uppercase font-semibold tracking-wider">
                                        Phim
                                    </p>
                                    <p className="font-bold text-white">{movie?.title}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-zinc-500 uppercase font-semibold tracking-wider">
                                            Thời gian
                                        </p>
                                        <p className="text-sm text-zinc-300">
                                            {showtime?.start_time} - {showtime?.show_date}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-zinc-500 uppercase font-semibold tracking-wider">
                                            Rạp / Phòng
                                        </p>
                                        <p className="text-sm text-zinc-300">
                                            {showtime?.cinema} • {showtime?.room}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-zinc-500 uppercase font-semibold tracking-wider">
                                        Ghế đã chọn
                                    </p>
                                    <p className="text-sm text-orange-400 font-semibold">
                                        {selectedSeats.map((s) => s.label || s.id).join(', ')}
                                    </p>
                                </div>

                                <div className="border-t border-dashed border-zinc-700 my-2 pt-2 flex justify-between items-end">
                                    <span className="text-sm text-zinc-400 font-medium">
                                        Tổng thanh toán:
                                    </span>
                                    <span className="text-2xl font-black text-red-500">
                                        {finalTotal.toLocaleString()} ₫
                                    </span>
                                </div>
                            </div>

                            {/* Checkbox Đồng ý điều khoản */}
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <div className="relative flex items-center justify-center mt-0.5">
                                    <input
                                        type="checkbox"
                                        checked={isAgreed}
                                        onChange={(e) => setIsAgreed(e.target.checked)}
                                        disabled={isProcessing}
                                        className="peer appearance-none w-5 h-5 border-2 border-zinc-600 rounded bg-zinc-900 checked:bg-orange-500 checked:border-orange-500 transition-all cursor-pointer disabled:opacity-50"
                                    />
                                    <svg
                                        className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"
                                        viewBox="0 0 14 14"
                                        fill="none"
                                    >
                                        <path
                                            d="M2 7L5.5 10.5L12 3"
                                            stroke="currentColor"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>
                                <span className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors leading-relaxed">
                                    Tôi đã kiểm tra kỹ thông tin và đồng ý với{' '}
                                    <a href="#" className="text-orange-500 hover:underline">
                                        Điều khoản dịch vụ
                                    </a>{' '}
                                    và{' '}
                                    <a href="#" className="text-orange-500 hover:underline">
                                        Chính sách hoàn tiền
                                    </a>{' '}
                                    của CineTicket.
                                </span>
                            </label>
                        </div>

                        {/* Footer Modal: Nút hành động */}
                        <div className="p-4 border-t border-zinc-800 bg-zinc-950/50 flex gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                disabled={isProcessing}
                                className="flex-1 py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={handleConfirmPayment}
                                disabled={!isAgreed || isProcessing}
                                className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:bg-zinc-700 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Đang xử lý...
                                    </>
                                ) : (
                                    'Xác nhận mua vé'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentPage;
