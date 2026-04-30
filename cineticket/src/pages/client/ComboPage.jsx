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
    const [isHolding, setIsHolding] = useState(true);

    // 🌟 STATE CHO MODAL QUY ĐỊNH RẠP
    const [showRulesModal, setShowRulesModal] = useState(false);
    const [isProceeding, setIsProceeding] = useState(false);

    // 🌟 ĐỌC MỐC THỜI GIAN TỪ LOCALSTORAGE ĐỂ TÍNH SỐ GIÂY CÒN LẠI
    const [timeLeft, setTimeLeft] = useState(() => {
        const endTime = localStorage.getItem('holdEndTime');
        if (!endTime) return 7 * 60;

        const remainingSeconds = Math.floor((parseInt(endTime, 10) - Date.now()) / 1000);
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
                            seat_labels: selectedSeats.map((s) => s.id)
                        })
                    }
                );

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message || 'Ghế đã bị người khác chọn mất!');
                }

                setIsHolding(false);
            } catch (error) {
                setToast({ show: true, message: error.message, type: 'error' });
                setTimeout(() => {
                    navigate(`/booking/${showtimeId}`);
                }, 2000);
            }
        };

        holdSeats();

        // CLEANUP: Tự động nhả ghế nếu khách hàng ĐÓNG TRÌNH DUYỆT hoặc BẤM BACK
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
        if (isHolding) return;

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
        releaseSeats();
        navigate(-1);
    };

    // Nút "Tiếp tục" ở màn hình chính giờ chỉ dùng để mở Modal
    const handleContinueClick = () => {
        setShowRulesModal(true);
    };

    // Nút "Tôi đồng ý" ở trong Modal mới thực sự đi tiếp
    const confirmContinue = () => {
        setIsProceeding(true);
        isProceedingRef.current = true; // Đánh dấu là đi tiếp trang Thanh toán, không nhả ghế
        localStorage.setItem('selectedCombos', JSON.stringify(selectedCombos));

        // Cố tình delay 1 chút xíu để UI xoay xoay cho đẹp rồi mới chuyển trang
        setTimeout(() => {
            navigate(`/payment/${showtimeId}`);
        }, 600);
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
        <div className="bg-zinc-950 min-h-screen text-white relative pb-24">
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ show: false, message: '', type: 'error' })}
                />
            )}

            <div className="max-w-6xl mx-auto px-6 pt-[100px] pb-8">
                <BookingProgress currentStep={2} />
                <h1 className="text-3xl font-bold mb-2">{movie?.title}</h1>
                <p className="text-zinc-400">
                    {showtime?.cinema || 'Hệ thống rạp'} • {showtime?.room} • {showtime?.show_date}{' '}
                    • {showtime?.start_time}
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
                                    src={movie?.poster_url}
                                    alt={movie?.title}
                                    className="w-20 h-28 rounded-2xl object-cover shadow-lg"
                                />
                                <div>
                                    <h4 className="text-base font-semibold">{movie?.title}</h4>
                                    <p className="text-zinc-400 text-sm mt-2">
                                        {showtime?.format || '2D'}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Suất chiếu</span>
                                    <span>{showtime?.start_time}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Phòng</span>
                                    <span>{showtime?.room}</span>
                                </div>
                            </div>

                            <div className="space-y-3 text-sm mt-6">
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Ghế đã chọn</span>
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
                                                    {c.combo_name || c.name}{' '}
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
                                    onClick={handleContinueClick}
                                >
                                    Tiếp tục
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ========================================================= */}
            {/* 🌟 MODAL QUY ĐỊNH RẠP (Hiện ra khi bấm Tiếp tục) */}
            {/* ========================================================= */}
            {showRulesModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-[0_0_40px_rgba(0,0,0,0.5)] transform transition-all animate-fade-in-up">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 text-orange-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-white tracking-wide">
                                Quy định rạp
                            </h3>
                        </div>

                        <div className="space-y-5 text-zinc-300 text-[15px] mb-8 leading-relaxed">
                            <div className="flex gap-3 items-start">
                                <span className="text-xl">🔞</span>
                                <p>
                                    Phim dành cho khán giả từ{' '}
                                    <strong className="text-red-400">
                                        {movie?.age_limit || 'đúng độ tuổi quy định'}
                                    </strong>
                                    . Rạp có quyền từ chối việc xem phim nếu khách hàng không mang
                                    giấy tờ tùy thân.
                                </p>
                            </div>
                            <div className="flex gap-3 items-start">
                                <span className="text-xl">🍿</span>
                                <p>
                                    Tuyệt đối không mang đồ ăn, thức uống từ bên ngoài vào rạp chiếu
                                    phim.
                                </p>
                            </div>
                            <div className="flex gap-3 items-start">
                                <span className="text-xl">🎟️</span>
                                <p>
                                    Vé đã mua thành công{' '}
                                    <strong className="text-white">không thể hoàn hoặc hủy</strong>{' '}
                                    dưới mọi hình thức.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowRulesModal(false)}
                                disabled={isProceeding}
                                className="flex-1 py-3 px-4 rounded-xl font-semibold bg-zinc-800 text-white hover:bg-zinc-700 transition disabled:opacity-50"
                            >
                                Quay lại
                            </button>
                            <button
                                onClick={confirmContinue}
                                disabled={isProceeding}
                                className="flex-1 py-3 px-4 rounded-xl font-semibold bg-orange-600 text-white hover:bg-orange-500 transition shadow-[0_0_15px_rgba(234,88,12,0.4)] disabled:opacity-70 flex items-center justify-center gap-2"
                            >
                                {isProceeding ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Đang xử lý...
                                    </>
                                ) : (
                                    'Tôi đồng ý'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComboPage;
