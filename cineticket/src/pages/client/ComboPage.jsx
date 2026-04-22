import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BookingProgress from '../../components/BookingProgress';
import Combos from '../../components/Combos';
import { showtimes } from '../../data/showtimes';
import { movies } from '../../data/movie';

const ComboPage = () => {
    const { showtimeId } = useParams();
    const navigate = useNavigate();
    const [selectedCombos, setSelectedCombos] = useState([]);

    // Lấy lại thông tin showtime và movie
    const id = Number(showtimeId);
    let showtime = showtimes.find((s) => s.showtime_id === id);
    let movie = showtime ? movies.find((m) => m.movie_id === showtime.movie_id) : null;

    // Nếu không tìm thấy, lấy từ localStorage
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

    // Lấy selectedSeats từ localStorage
    const selectedSeats = JSON.parse(localStorage.getItem('selectedSeats') || '[]');

    const totalCombo = selectedCombos.reduce((sum, c) => sum + c.price * c.quantity, 0);
    const totalSeat = selectedSeats.reduce((sum, s) => sum + s.price, 0);
    const total = totalCombo + totalSeat;

    return (
        <div className="bg-zinc-950 min-h-screen text-white">
            <div className="max-w-6xl mx-auto px-6 py-8">
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
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Ghế đã chọn</span>
                                    <span>{selectedSeats.map((s) => s.label).join(', ')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Combo</span>
                                    <span>
                                        {selectedCombos?.length > 0 && (
                                            <div className="mt-6">
                                                <p className="text-zinc-400 mb-3">
                                                    Combo ({selectedCombos.length})
                                                </p>

                                                <div className="space-y-2">
                                                    {selectedCombos.map((c, i) => (
                                                        <div key={i}>
                                                            <div className="flex justify-between text-sm">
                                                                <span>
                                                                    {c.name} x{c.quantity}
                                                                </span>
                                                                <span>
                                                                    {(
                                                                        c.price * c.quantity
                                                                    ).toLocaleString()}
                                                                    đ
                                                                </span>
                                                            </div>

                                                            {/* line */}
                                                            <div className="border-b border-dashed border-zinc-700 mt-1"></div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </span>
                                </div>
                            </div>
                            <div className="border-t border-zinc-700 my-6"></div>
                            <div className="flex justify-between text-xl font-bold">
                                <span>Tổng cộng</span>
                                <span className="text-orange-500">{total.toLocaleString()}đ</span>
                            </div>
                            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                <button
                                    onClick={() => navigate(-1)}
                                    className="flex-1 border border-zinc-700 bg-zinc-900 py-4 rounded-xl font-semibold text-lg text-white hover:border-red-500 hover:text-red-400"
                                >
                                    Quay lại
                                </button>
                                <button
                                    className="flex-1 bg-orange-600 py-4 rounded-xl font-semibold text-lg"
                                    onClick={() => navigate(`/payment/${showtimeId}`)}
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

export default ComboPage;
