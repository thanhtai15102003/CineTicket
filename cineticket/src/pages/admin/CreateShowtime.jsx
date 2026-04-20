import { useState } from 'react';
import Toast from '../../components/common/Toast';

/* ================= MOCK MOVIES ================= */

const movies = [
    {
        id: 1,
        title: 'HẸN EM NGÀY NHẬT THỰC',
        duration: 180,
        releaseDate: '2026-04-20'
    },
    {
        id: 2,
        title: 'BẪY TIỀN',
        duration: 150,
        releaseDate: '2026-04-18'
    }
];

/* ================= MOCK ROOMS ================= */
const rooms = [
    { id: 1, name: 'Phòng 1' },
    { id: 2, name: 'Phòng 2' },
    { id: 3, name: 'Phòng 3' },
    { id: 4, name: 'Phòng 4 (IMAX)' },
    { id: 5, name: 'Phòng 5 (4DX)' }
];

export default function CreateShowtime() {
    const [movieId, setMovieId] = useState('');
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [roomId, setRoomId] = useState(''); // ← Thêm state cho phòng
    const [selectedRoom, setSelectedRoom] = useState(null);

    const [autoGenerate, setAutoGenerate] = useState(false);
    const [openTime, setOpenTime] = useState('08:00');
    const [closeTime, setCloseTime] = useState('23:00');

    const [generated, setGenerated] = useState([]);

    const [toast, setToast] = useState({ show: false, message: '' });

    const showToast = (msg) => setToast({ show: true, message: msg });

    /* ================= SELECT MOVIE ================= */

    const handleSelectMovie = (id) => {
        const movie = movies.find((m) => m.id == id);
        setMovieId(id);
        setSelectedMovie(movie);
    };

    /* ================= SELECT ROOM ================= */

    const handleSelectRoom = (id) => {
        const room = rooms.find((r) => r.id == id);
        setRoomId(id);
        setSelectedRoom(room);
    };

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

    const generateShowtimes = () => {
        if (!selectedMovie) return;

        const result = [];
        let current = openTime;

        while (isBefore(current, closeTime)) {
            const end = addMinutes(current, selectedMovie.duration);

            if (end > closeTime) break;

            result.push({
                start: current,
                end
            });

            current = addMinutes(end, 15); // nghỉ 15p
        }

        setGenerated(result);
    };

    /* ================= SUBMIT ================= */

    const handleSubmit = () => {
        if (!movieId) return alert('Vui lòng chọn phim');
        if (!roomId) return alert('Vui lòng chọn phòng chiếu');

        const payload = {
            cinema: 'TP.HCM',
            branch: 'CGV',
            roomId, // ← Thêm thông tin phòng
            roomName: selectedRoom?.name,
            movieId,
            showtimes: autoGenerate ? generated : []
        };

        console.log('DATA SEND:', payload);

        showToast('Tạo suất chiếu thành công 🎉');
    };

    /* ================= UI ================= */

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {toast.show && (
                <Toast
                    message={toast.message}
                    onClose={() => setToast({ show: false, message: '' })}
                />
            )}

            <h1 className="text-2xl font-bold mb-6">Thêm suất chiếu</h1>

            <div className="bg-white p-6 rounded-2xl shadow max-w-2xl space-y-5">
                {/* CHI NHÁNH */}
                <div>
                    <label className="text-sm text-gray-500">Chi nhánh</label>
                    <input
                        value="TP.HCM"
                        disabled
                        className="w-full border p-2 rounded mt-1 bg-gray-100"
                    />
                </div>

                {/* RẠP */}
                <div>
                    <label className="text-sm text-gray-500">Rạp</label>
                    <input
                        value="CGV"
                        disabled
                        className="w-full border p-2 rounded mt-1 bg-gray-100"
                    />
                </div>

                {/* TÊN PHÒNG - MỚI THÊM */}
                <div>
                    <label className="text-sm text-gray-500">Tên phòng</label>
                    <select
                        className="w-full border p-2 rounded mt-1"
                        value={roomId}
                        onChange={(e) => handleSelectRoom(e.target.value)}
                    >
                        <option value="">-- Chọn phòng chiếu --</option>
                        {rooms.map((room) => (
                            <option key={room.id} value={room.id}>
                                {room.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* CHỌN PHIM */}
                <div>
                    <label className="text-sm text-gray-500">Tên phim</label>
                    <select
                        className="w-full border p-2 rounded mt-1"
                        value={movieId}
                        onChange={(e) => handleSelectMovie(e.target.value)}
                    >
                        <option value="">-- Chọn phim --</option>
                        {movies.map((m) => (
                            <option key={m.id} value={m.id}>
                                {m.title}
                            </option>
                        ))}
                    </select>
                </div>

                {/* NGÀY KHỞI CHIẾU */}
                <div>
                    <label className="text-sm text-gray-500">Ngày khởi chiếu</label>
                    <input
                        value={selectedMovie?.releaseDate || ''}
                        disabled
                        className="w-full border p-2 rounded mt-1 bg-gray-100"
                    />
                </div>

                {/* AUTO GENERATE */}
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={autoGenerate}
                        onChange={() => setAutoGenerate(!autoGenerate)}
                    />
                    <label className="text-sm">Tự động tạo suất chiếu</label>
                </div>

                {/* TIME RANGE */}
                {autoGenerate && (
                    <>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="text-sm text-gray-500">Giờ mở chiếu</label>
                                <input
                                    type="time"
                                    value={openTime}
                                    onChange={(e) => setOpenTime(e.target.value)}
                                    className="w-full border p-2 rounded mt-1"
                                />
                            </div>

                            <div className="flex-1">
                                <label className="text-sm text-gray-500">Giờ đóng chiếu</label>
                                <input
                                    type="time"
                                    value={closeTime}
                                    onChange={(e) => setCloseTime(e.target.value)}
                                    className="w-full border p-2 rounded mt-1"
                                />
                            </div>
                        </div>

                        <button
                            onClick={generateShowtimes}
                            className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition"
                        >
                            Tạo suất chiếu tự động
                        </button>
                    </>
                )}

                {/* RESULT */}
                {generated.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-xl">
                        <p className="font-semibold mb-2">Danh sách suất chiếu:</p>
                        <div className="space-y-1">
                            {generated.map((s, i) => (
                                <div key={i} className="text-sm">
                                    {s.start} - {s.end}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ACTION */}
                <button
                    onClick={handleSubmit}
                    className="w-full bg-red-600 text-white py-3 rounded-xl hover:bg-gray-800 transition"
                >
                    Tạo suất chiếu
                </button>
            </div>
        </div>
    );
}
