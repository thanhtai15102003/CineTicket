import { useState } from 'react';
import { Clock, Plus, Pencil, Trash2 } from 'lucide-react';
import Toast from '../../components/common/Toast';
import { useNavigate } from 'react-router-dom';

/* ================= MOCK DATA ================= */

const movies = [
    {
        id: 1,
        title: 'HẸN EM NGÀY NHẬT THỰC',
        duration: 180,
        genre: 'Action, Sci-fi',
        poster: 'https://cinestar.com.vn/_next/image/?url=https%3A%2F%2Fapi-website.cinestar.com.vn%2Fmedia%2Fwysiwyg%2FPosters%2F04-2026%2Fhen-em.jpg&w=1920&q=75',
        showtimes: [
            {
                id: 1,
                start: '08:00',
                end: '11:00',
                room: 'Phòng 1',
                seats: 120,
                format: '2D',
                active: true
            },
            {
                id: 2,
                start: '13:00',
                end: '16:00',
                room: 'Phòng 2',
                seats: 100,
                format: '2D',
                active: false
            }
        ]
    },
    {
        id: 2,
        title: 'BẪY TIỀN',
        duration: 150,
        genre: 'Action',
        poster: 'https://cinestar.com.vn/_next/image/?url=https%3A%2F%2Fapi-website.cinestar.com.vn%2Fmedia%2Fwysiwyg%2FPosters%2F04-2026%2Fbay-tien-poster.jpg&w=1920&q=75',
        showtimes: [
            {
                id: 3,
                start: '09:00',
                end: '11:30',
                room: 'Phòng 3',
                seats: 90,
                format: '2D',
                active: true
            }
        ]
    }
];

/* ================= COMPONENT ================= */

export default function ShowtimeManagement() {
    const [expanded, setExpanded] = useState({});
    const [data, setData] = useState(movies);
    const [toast, setToast] = useState({ show: false, message: '' });
    const navigate = useNavigate();


    const showToast = (msg) => setToast({ show: true, message: msg });

    /* ================= TOGGLE EXPAND ================= */

    const toggleExpand = (movieId) => {
        setExpanded((prev) => ({
            ...prev,
            [movieId]: !prev[movieId]
        }));
    };

    /* ================= TOGGLE ACTIVE ================= */

    const toggleActive = (movieId, showtimeId) => {
        setData((prev) =>
            prev.map((m) => {
                if (m.id !== movieId) return m;

                return {
                    ...m,
                    showtimes: m.showtimes.map((s) =>
                        s.id === showtimeId ? { ...s, active: !s.active } : s
                    )
                };
            })
        );

        showToast('Cập nhật trạng thái thành công');
    };

    /* ================= EDIT ================= */

    const handleEdit = (movieId, showtimeId) => {
        console.log('EDIT', movieId, showtimeId);
        showToast('Chuyển sang chỉnh sửa...');
        // 👉 navigate(`/admin/showtime/edit/${showtimeId}`)
    };

    /* ================= DELETE ================= */

    const handleDelete = (movieId, showtimeId) => {
        if (!window.confirm('Xoá suất chiếu này?')) return;

        setData((prev) =>
            prev.map((m) => {
                if (m.id !== movieId) return m;

                return {
                    ...m,
                    showtimes: m.showtimes.filter((s) => s.id !== showtimeId)
                };
            })
        );

        showToast('Đã xoá suất chiếu');
    };

    /* ================= FORMAT BADGE ================= */

    const getFormatStyle = (format) => {
        if (format === 'IMAX') return 'bg-purple-600';
        if (format === '3D') return 'bg-blue-600';
        return 'bg-black';
    };

    /* ================= UI ================= */

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* TOAST */}
            {toast.show && (
                <Toast
                    message={toast.message}
                    onClose={() => setToast({ show: false, message: '' })}
                />
            )}

            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-xl font-semibold">Danh sách suất chiếu</h1>
                    <p className="text-sm text-gray-500">
                        Chi nhánh: TP.HCM - Rạp: CGV - Ngày: 20/04/2026
                    </p>
                </div>

                <button
                    onClick={() => navigate('/admin/showtimes/create')}
                    className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg"
                >
                    <Plus size={16} /> Thêm suất chiếu
                </button>
            </div>

            {/* LIST */}
            <div className="space-y-4">
                {data.map((movie) => (
                    <div key={movie.id} className="bg-white rounded-2xl shadow p-4">
                        {/* MOVIE INFO */}
                        <div className="flex items-center gap-4">
                            {/* TIME ICON */}
                            <button
                                onClick={() => toggleExpand(movie.id)}
                                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                            >
                                <Clock size={18} />
                            </button>

                            {/* POSTER */}
                            <img
                                src={movie.poster}
                                alt=""
                                className="w-16 h-20 object-cover rounded-lg"
                            />

                            {/* INFO */}
                            <div className="flex-1">
                                <h2 className="font-bold">{movie.title}</h2>
                                <p className="text-sm text-gray-500">
                                    {movie.duration} phút • {movie.genre}
                                </p>
                            </div>
                        </div>

                        {/* SHOWTIMES */}
                        {expanded[movie.id] && (
                            <div className="mt-4 border-t pt-4 space-y-3">
                                {movie.showtimes.length === 0 && (
                                    <div className="text-sm text-gray-400">Không có suất chiếu</div>
                                )}

                                {movie.showtimes.map((s) => (
                                    <div
                                        key={s.id}
                                        className="flex items-center justify-between bg-gray-50 p-3 rounded-xl"
                                    >
                                        {/* LEFT */}
                                        <div className="flex items-center gap-6">
                                            <div className="font-semibold">
                                                {s.start} - {s.end}
                                            </div>

                                            <div className="text-sm text-gray-500">{s.room}</div>

                                            <div className="text-sm text-gray-500">
                                                {s.seats} ghế
                                            </div>

                                            <div
                                                className={`px-2 py-1 text-white text-xs rounded ${getFormatStyle(
                                                    s.format
                                                )}`}
                                            >
                                                {s.format}
                                            </div>
                                        </div>

                                        {/* RIGHT ACTION */}
                                        <div className="flex items-center gap-3">
                                            {/* TOGGLE */}
                                            <button
                                                onClick={() => toggleActive(movie.id, s.id)}
                                                className={`w-10 h-5 flex items-center rounded-full p-1 ${
                                                    s.active ? 'bg-green-500' : 'bg-gray-300'
                                                }`}
                                            >
                                                <div
                                                    className={`w-4 h-4 bg-white rounded-full transition ${
                                                        s.active ? 'translate-x-5' : ''
                                                    }`}
                                                />
                                            </button>

                                            {/* EDIT */}
                                            <Pencil
                                                size={16}
                                                className="cursor-pointer text-blue-500 hover:scale-110 transition"
                                                onClick={() => handleEdit(movie.id, s.id)}
                                            />

                                            {/* DELETE */}
                                            <Trash2
                                                size={16}
                                                className="cursor-pointer text-red-500 hover:scale-110 transition"
                                                onClick={() => handleDelete(movie.id, s.id)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
