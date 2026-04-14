import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { showtimes } from '../data/showtimes';
import { movies } from '../data/movie';
import SeatMap from '../components/SeatMap';
import BookingProgress from '../components/BookingProgress'; 

const Booking = () => {
    const { showtimeId } = useParams();
    const navigate = useNavigate();

    const [showtime, setShowtime] = useState(null);
    const [movie, setMovie] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [timeLeft, setTimeLeft] = useState(120);
    const [timerActive, setTimerActive] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const id = Number(showtimeId);
        console.log('Đang tìm showtime_id:', id); // ← Dùng để debug

        const foundShowtime = showtimes.find((s) => s.showtime_id === id);

        if (!foundShowtime) {
            setError(`Không tìm thấy suất chiếu với ID: ${id}`);
            setLoading(false);
            return;
        }

        setShowtime(foundShowtime);

        const foundMovie = movies.find((m) => m.movie_id === foundShowtime.movie_id);
        if (!foundMovie) {
            setError('Không tìm thấy thông tin phim');
            setLoading(false);
            return;
        }

        setMovie(foundMovie);
        setLoading(false);
    }, [showtimeId]);

    // Timer 2 phút
    useEffect(() => {
        const id = showtimeId ? Number(showtimeId) : NaN;
        console.log('🔍 URL showtimeId nhận được:', showtimeId);
        console.log('🔢 Sau khi convert thành số:', id);

        if (!showtimeId || isNaN(id)) {
            setError(`showtimeId không hợp lệ: ${showtimeId}`);
            setLoading(false);
            return;
        }

        const foundShowtime = showtimes.find((s) => s.showtime_id === id);

        if (!foundShowtime) {
            setError(`Không tìm thấy suất chiếu với ID: ${id}`);
            setLoading(false);
            return;
        }

        setShowtime(foundShowtime);

        const foundMovie = movies.find((m) => m.movie_id === foundShowtime.movie_id);
        if (foundMovie) {
            setMovie(foundMovie);
        } else {
            setError('Không tìm thấy thông tin phim tương ứng');
        }

        setLoading(false);
    }, [showtimeId]);

    const handleSeatSelect = (seat) => {
        if (selectedSeats.some((s) => s.id === seat.id)) {
            setSelectedSeats((prev) => prev.filter((s) => s.id !== seat.id));
            return;
        }

        setSelectedSeats((prev) => [...prev, seat]);
        if (!timerActive) {
            setTimerActive(true);
        }
    };

    useEffect(() => {
        if (!timerActive) return;
        if (selectedSeats.length === 0) {
            setTimerActive(false);
            setTimeLeft(120);
            return;
        }

        const intervalId = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(intervalId);
                    setTimerActive(false);
                    setSelectedSeats([]);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(intervalId);
    }, [timerActive, selectedSeats.length]);

    const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

    const formatTime = (sec) => `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, '0')}`;

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
                <div className="text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p>Đang tải thông tin suất chiếu...</p>
                </div>
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
        <div className="bg-zinc-950 min-h-screen text-white">
            {/* Phần progress bar và nội dung chính giống ảnh Galaxy */}
            {/* ... (mình sẽ bổ sung đầy đủ nếu bạn muốn) */}

            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* ==================== PROGRESS STEPS ==================== */}
                <BookingProgress />
                <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
                <p className="text-zinc-400">
                    {showtime.cinema || 'Galaxy Nguyễn Du'} • {showtime.room} • {showtime.show_date}{' '}
                    • {showtime.start_time}
                </p>

                <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-8">
                        <SeatMap
                            selectedSeats={selectedSeats}
                            onSeatSelect={handleSeatSelect}
                            timer={timeLeft}
                        />
                    </div>

                    <div className="lg:col-span-4">
                        {/* Phần thông tin bên phải */}
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

                            {selectedSeats.length > 0 && (
                                <div className="mt-6">
                                    <p className="text-zinc-400 mb-2">
                                        Ghế đã chọn ({selectedSeats.length})
                                    </p>
                                    {selectedSeats.map((s, i) => (
                                        <div key={i} className="flex justify-between text-sm py-1">
                                            <span>{s.label}</span>
                                            <span>{s.price.toLocaleString()}đ</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="border-t border-zinc-700 my-6"></div>

                            <div className="flex justify-between text-xl font-bold">
                                <span>Tổng cộng</span>
                                <span className="text-orange-500">
                                    {totalPrice.toLocaleString()}đ
                                </span>
                            </div>

                            {timerActive && (
                                <p className="text-yellow-400 text-center mt-4">
                                    Thời gian giữ ghế: <b>{formatTime(timeLeft)}</b>
                                </p>
                            )}

                            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                <button
                                    onClick={() => navigate(-1)}
                                    className="flex-1 border border-zinc-700 bg-zinc-900 py-4 rounded-xl font-semibold text-lg text-white hover:border-red-500 hover:text-red-400"
                                >
                                    Quay lại
                                </button>

                                <button
                                    disabled={selectedSeats.length === 0}
                                    className="flex-1 bg-orange-600 py-4 rounded-xl font-semibold text-lg disabled:bg-zinc-700"
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
};

export default Booking;
