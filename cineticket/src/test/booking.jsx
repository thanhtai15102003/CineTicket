import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import SeatMap from '../../components/SeatMap';
import BookingProgress from '../../components/BookingProgress';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Toast from '../../components/common/Toast';
import echo from '../../utils/echo';

const Booking = () => {
    const { showtimeId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // 🌟 CỜ HIỆU ĐỂ DỌN RÁC NẾU THOÁT NGANG
    const isProceedingRef = useRef(false);

    // State cho dữ liệu từ API
    const [showtime, setShowtime] = useState(null);
    const [movie, setMovie] = useState(null);
    const [seatLayout, setSeatLayout] = useState(null);

    // STATE QUẢN LÝ TRẠNG THÁI GHẾ
    const [soldSeats, setSoldSeats] = useState([]);
    const [heldSeats, setHeldSeats] = useState([]);
    const [isHolding, setIsHolding] = useState(false);

    // Lấy lại ghế từ localStorage an toàn
    const [selectedSeats, setSelectedSeats] = useState(() => {
        try {
            const saved = localStorage.getItem('selectedSeats');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    // State cho UI
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showRulesModal, setShowRulesModal] = useState(false);

    const [toast, setToast] = useState({ show: false, message: '', type: 'error' });
    const showToast = (message, type = 'error') => {
        setToast({ show: true, message, type });
    };

    // ==========================================================
    // EFFECT 0: DỌN DẸP LOCALSTORAGE NẾU THOÁT TRANG
    // ==========================================================
    useEffect(() => {
        return () => {
            if (!isProceedingRef.current) {
                localStorage.removeItem('selectedSeats');
            }
        };
    }, []);

    // ==========================================================
    // EFFECT 1: GỌI API LẤY THÔNG TIN SUẤT CHIẾU & GHẾ ĐANG GIỮ
    // ==========================================================
    useEffect(() => {
        let token = localStorage.getItem('token');
        if (token) token = token.replace(/^"|"$/g, '');
        const user = localStorage.getItem('currentUser');
        if (!token || !user) {
            navigate('/login', { state: { from: location.pathname } });
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [showtimeRes, holdsRes] = await Promise.all([
                    fetch(
                        `https://cinema-api-production-f2bc.up.railway.app/api/v1/showtimes/${showtimeId}`,
                        {
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`
                            }
                        }
                    ),
                    fetch(
                        `https://cinema-api-production-f2bc.up.railway.app/api/v1/showtimes/${showtimeId}/holds`,
                        {
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`
                            }
                        }
                    )
                ]);

                const showtimeJson = await showtimeRes.json();
                const holdsJson = await holdsRes.json();
                if (!showtimeRes.ok)
                    throw new Error(showtimeJson.message || `Không tìm thấy suất chiếu.`);

                const data = showtimeJson.data || showtimeJson;
                setShowtime({
                    showtime_id: data.showtime_id,
                    start_time: data.start_time?.substring(0, 5),
                    show_date: data.show_date,
                    room: data.room?.room_name,
                    format: data.room?.room_type?.name,
                    cinema: data.room?.cinema?.cinema_name,
                    prices: {
                        single: data.price_standard,
                        vip: data.price_vip,
                        double: data.price_double
                    }
                });
                setMovie(data.movie);
                setSeatLayout(data.room?.seat_layout?.layout_data || []);
                setSoldSeats(data.sold_seats || []);

                const holdsData = Array.isArray(holdsJson) ? holdsJson : holdsJson.data || [];

                const activeHeldSeatIds = holdsData
                    .filter((h) => {
                        const statusStr = String(h.status).trim().toLowerCase();
                        return ['active', 'held', 'hold', 'holding'].includes(statusStr);
                    })
                    .map((h) => String(h.seat_label || h.seat_id).trim());

                setHeldSeats(activeHeldSeatIds);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (showtimeId) fetchData();
    }, [showtimeId, navigate, location.pathname]);

    // ==========================================================
    // EFFECT 2: LẮNG NGHE WEBSOCKET REAL-TIME TỪ REVERB
    // ==========================================================
    useEffect(() => {
        if (!showtimeId) return;

        const channel = echo.channel(`showtime.${showtimeId}`);

        channel.listen('.SeatStatusChanged', (data) => {
            console.log('Cập nhật ghế Real-time:', data);

            const wsSeatId = String(data.seat_label || data.seat_id).trim();
            const statusStr = String(data.status).trim().toLowerCase();

            if (['held', 'active', 'hold', 'holding'].includes(statusStr)) {
                setHeldSeats((prev) => [...new Set([...prev, wsSeatId])]);

                setSoldSeats((prev) =>
                    prev.filter((s) => String(s.seat_label || s.id || s).trim() !== wsSeatId)
                );

                setSelectedSeats((prev) => {
                    const isMySeatHacked = prev.some(
                        (s) =>
                            String(s.id).trim() === wsSeatId || String(s.label).trim() === wsSeatId
                    );
                    if (isMySeatHacked) {
                        showToast('Ghế bạn chọn vừa có người nhanh tay hơn giữ mất rồi!', 'error');
                        return prev.filter(
                            (s) =>
                                String(s.id).trim() !== wsSeatId &&
                                String(s.label).trim() !== wsSeatId
                        );
                    }
                    return prev;
                });
            } else if (['released', 'available', 'free'].includes(statusStr)) {
                setHeldSeats((prev) => prev.filter((id) => id !== wsSeatId));
            } else if (statusStr === 'sold') {
                setHeldSeats((prev) => prev.filter((id) => id !== wsSeatId));
                setSoldSeats((prev) => [...new Set([...prev, wsSeatId])]);
            }
        });

        return () => {
            echo.leave(`showtime.${showtimeId}`);
        };
    }, [showtimeId]);

    // ==========================================================
    // CÁC HÀM XỬ LÝ CLICK
    // ==========================================================
    const handleSeatSelect = (seat) => {
        const isAlreadySelected = selectedSeats.some((s) => s.id === seat.id);

        if (isAlreadySelected) {
            setSelectedSeats((prev) => prev.filter((s) => s.id !== seat.id));
        } else {
            if (selectedSeats.length >= 8) {
                showToast(
                    'Quy định rạp: Bạn chỉ được mua tối đa 8 vé trong một giao dịch!',
                    'error'
                );
                return;
            }
            setSelectedSeats((prev) => [...prev, seat]);
        }
    };

    const hasOrphanSeats = () => {
        try {
            const rowMap = {};
            selectedSeats.forEach((s) => {
                const seatName = String(s.label || s.id || '');
                if (!seatName) return;

                const row = seatName.replace(/[0-9]/g, '');
                const num = parseInt(seatName.replace(/[^0-9]/g, ''), 10);

                if (isNaN(num)) return;

                if (!rowMap[row]) rowMap[row] = [];
                rowMap[row].push(num);
            });

            for (const row in rowMap) {
                const nums = rowMap[row].sort((a, b) => a - b);

                for (let i = 0; i < nums.length - 1; i++) {
                    if (nums[i + 1] - nums[i] === 2) {
                        const gapSeatLabel = `${row}${nums[i] + 1}`;

                        const isSoldOrHeld =
                            soldSeats.some(
                                (s) =>
                                    s === gapSeatLabel ||
                                    s.label === gapSeatLabel ||
                                    s.seat_label === gapSeatLabel
                            ) || heldSeats.some((id) => id === gapSeatLabel);

                        if (!isSoldOrHeld) return true;
                    }
                }
            }
            return false;
        } catch (err) {
            console.error('Lỗi thuật toán ghế mồ côi:', err);
            return false;
        }
    };

    const handleContinueClick = () => {
        if (hasOrphanSeats()) {
            showToast('Quy định rạp: Không được để trống 1 ghế ở giữa 2 ghế khác!', 'error');
            return;
        }
        setShowRulesModal(true);
    };

    // 🌟 ĐÃ FIX API POST CHUẨN XÁC
    const confirmContinue = async () => {
        let token = localStorage.getItem('token');
        if (token) token = token.replace(/^"|"$/g, '');
        if (!token) return;

        setIsHolding(true);
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
            if (!response.ok) throw new Error(result.message || 'Ghế đã bị giữ!');

            localStorage.setItem('selectedSeats', JSON.stringify(selectedSeats));
            localStorage.setItem('bookingMovie', JSON.stringify(movie));
            localStorage.setItem('bookingShowtime', JSON.stringify(showtime));

            // Lưu mốc thời gian hết hạn 7 phút
            localStorage.setItem('holdEndTime', Date.now() + 7 * 60 * 1000);

            setShowRulesModal(false);
            isProceedingRef.current = true; // Báo hiệu đi tiếp trang sau
            navigate(`/combo/${showtimeId}`);
        } catch (error) {
            showToast(error.message, 'error');
            setShowRulesModal(false);
        } finally {
            setIsHolding(false);
        }
    };

    const totalPrice = selectedSeats.reduce((sum, seat) => sum + (seat.price || 0), 0);

    // ==========================================================
    // RENDER UI
    // ==========================================================
    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
                <LoadingSpinner isDark={true} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
                <div className="text-center">
                    <p className="text-red-500 text-xl mb-4">❌ {error}</p>
                    <button
                        onClick={() => navigate('/movies')}
                        className="bg-red-600 px-6 py-3 rounded-xl hover:bg-red-700 transition"
                    >
                        Quay về danh sách phim
                    </button>
                </div>
            </div>
        );
    }

    if (!showtime || !movie)
        return <div className="text-white text-center py-20">Không có dữ liệu</div>;

    return (
        <div className="bg-zinc-950 min-h-screen text-white relative">
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ show: false, message: '', type: 'error' })}
                />
            )}

            {/* Giảm pt xuống pt-24 nếu bạn dùng Header tối giản fixed top */}
            <div className="max-w-6xl mx-auto px-6 pt-24 pb-8">
                <BookingProgress />

                <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
                <p className="text-zinc-400">
                    {showtime.cinema || 'Galaxy Nguyễn Du'} • {showtime.room} • {showtime.show_date}{' '}
                    • {showtime.start_time}
                </p>

                <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-8">
                        <SeatMap
                            seatLayout={seatLayout}
                            soldSeats={soldSeats}
                            heldSeats={heldSeats}
                            selectedSeats={selectedSeats}
                            onSeatSelect={handleSeatSelect}
                            prices={showtime.prices}
                        />
                    </div>

                    <div className="lg:col-span-4">
                        <div className="bg-zinc-900 p-6 rounded-2xl sticky top-24">
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

                            {selectedSeats.length > 0 && (
                                <div className="mt-6">
                                    <p className="text-zinc-400 mb-3">
                                        Ghế đã chọn ({selectedSeats.length})
                                    </p>
                                    <div className="space-y-2">
                                        {selectedSeats.map((s, i) => (
                                            <div key={i}>
                                                <div className="flex justify-between text-sm">
                                                    <span>Ghế {s.label || s.id}</span>
                                                    <span>{(s.price || 0).toLocaleString()}đ</span>
                                                </div>
                                                <div className="border-b border-dashed border-zinc-700 mt-1"></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="border-t border-zinc-700 my-6"></div>

                            <div className="flex justify-between text-xl font-bold">
                                <span>Tổng cộng</span>
                                <span className="text-orange-500">
                                    {totalPrice.toLocaleString()}đ
                                </span>
                            </div>

                            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                <button
                                    onClick={() => {
                                        localStorage.removeItem('selectedSeats');
                                        navigate(-1);
                                    }}
                                    className="flex-1 border border-zinc-700 bg-zinc-900 py-4 rounded-xl font-semibold text-lg text-white hover:border-red-500 hover:text-red-400 transition"
                                >
                                    Quay lại
                                </button>
                                <button
                                    disabled={selectedSeats.length === 0}
                                    className="flex-1 bg-orange-600 py-4 rounded-xl font-semibold text-lg disabled:bg-zinc-700 hover:bg-orange-700 transition shadow-[0_0_15px_rgba(234,88,12,0.3)] disabled:shadow-none"
                                    onClick={handleContinueClick}
                                >
                                    Tiếp tục
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL QUY ĐỊNH RẠP */}
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
                                disabled={isHolding}
                                className="flex-1 py-3 px-4 rounded-xl font-semibold bg-zinc-800 text-white hover:bg-zinc-700 transition disabled:opacity-50"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={confirmContinue}
                                disabled={isHolding}
                                className="flex-1 py-3 px-4 rounded-xl font-semibold bg-orange-600 text-white hover:bg-orange-500 transition shadow-[0_0_15px_rgba(234,88,12,0.4)] disabled:opacity-70 flex items-center justify-center gap-2"
                            >
                                {isHolding ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Đang khóa ghế...
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

export default Booking;
