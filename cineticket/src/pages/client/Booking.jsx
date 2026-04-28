import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import SeatMap from '../../components/SeatMap';
import BookingProgress from '../../components/BookingProgress';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Booking = () => {
    const { showtimeId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // State cho dữ liệu từ API
    const [showtime, setShowtime] = useState(null);
    const [movie, setMovie] = useState(null);
    const [seatLayout, setSeatLayout] = useState(null);
    const [soldSeats, setSoldSeats] = useState([]);

    // State cho lựa chọn của người dùng
    const [selectedSeats, setSelectedSeats] = useState([]);

    // State cho UI
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showRulesModal, setShowRulesModal] = useState(false); // STATE QUẢN LÝ MODAL QUY ĐỊNH

    useEffect(() => {
        // KIỂM TRA ĐĂNG NHẬP (Auth Guard)
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('currentUser');
        if (!token || !user) {
            navigate('/login', { state: { from: location.pathname } });
            return;
        }

        const fetchShowtimeDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(
                    `https://cinema-api-production-f2bc.up.railway.app/api/v1/showtimes/${showtimeId}`
                );
                const json = await res.json();

                if (!res.ok) {
                    throw new Error(
                        json.message || `Không tìm thấy suất chiếu với ID: ${showtimeId}`
                    );
                }

                const data = json.data || json;

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
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (showtimeId) fetchShowtimeDetails();
    }, [showtimeId, navigate, location.pathname]);

    const handleSeatSelect = (seat) => {
        if (selectedSeats.some((s) => s.id === seat.id)) {
            setSelectedSeats((prev) => prev.filter((s) => s.id !== seat.id));
        } else {
            setSelectedSeats((prev) => [...prev, seat]);
        }
    };

    // MỞ MODAL QUY ĐỊNH THAY VÌ CHUYỂN TRANG LUÔN
    const handleContinueClick = () => {
        setShowRulesModal(true);
    };

    // KHI KHÁCH ĐỒNG Ý QUY ĐỊNH -> LƯU DATA VÀ CHUYỂN TRANG
    const confirmContinue = () => {
        localStorage.setItem('selectedSeats', JSON.stringify(selectedSeats));
        localStorage.setItem('bookingMovie', JSON.stringify(movie));
        localStorage.setItem('bookingShowtime', JSON.stringify(showtime));
        navigate(`/combo/${showtimeId}`);
    };

    const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

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
                        className="bg-red-600 px-6 py-3 rounded-xl"
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
            <div className="max-w-6xl mx-auto px-6 pt-[100px] pb-8">
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
                            soldSeats={[]}
                            selectedSeats={selectedSeats}
                            onSeatSelect={handleSeatSelect}
                            prices={showtime.prices}
                        />
                    </div>

                    <div className="lg:col-span-4">
                        <div className="bg-zinc-900 p-6 rounded-2xl sticky top-6">
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

                            {/* GHẾ */}
                            {selectedSeats.length > 0 && (
                                <div className="mt-6">
                                    <p className="text-zinc-400 mb-3">
                                        Ghế đã chọn ({selectedSeats.length})
                                    </p>

                                    <div className="space-y-2">
                                        {selectedSeats.map((s, i) => (
                                            <div key={i}>
                                                <div className="flex justify-between text-sm">
                                                    <span>Ghế {s.label}</span>
                                                    <span>{s.price.toLocaleString()}đ</span>
                                                </div>

                                                {/* line */}
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
                                    onClick={() => navigate(-1)}
                                    className="flex-1 border border-zinc-700 bg-zinc-900 py-4 rounded-xl font-semibold text-lg text-white hover:border-red-500 hover:text-red-400 transition"
                                >
                                    Quay lại
                                </button>

                                <button
                                    disabled={selectedSeats.length === 0}
                                    className="flex-1 bg-orange-600 py-4 rounded-xl font-semibold text-lg disabled:bg-zinc-700 hover:bg-orange-700 transition shadow-[0_0_15px_rgba(234,88,12,0.3)] disabled:shadow-none"
                                    onClick={handleContinueClick} // Đã đổi hàm gọi ở đây
                                >
                                    Tiếp tục
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ================= MODAL QUY ĐỊNH RẠP ================= */}
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
                                        strokeLinelinejoin="round"
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
                                className="flex-1 py-3 px-4 rounded-xl font-semibold bg-zinc-800 text-white hover:bg-zinc-700 transition"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={confirmContinue}
                                className="flex-1 py-3 px-4 rounded-xl font-semibold bg-orange-600 text-white hover:bg-orange-500 transition shadow-[0_0_15px_rgba(234,88,12,0.4)]"
                            >
                                Tôi đồng ý
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Booking;
