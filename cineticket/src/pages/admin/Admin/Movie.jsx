import { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, X, Check } from 'lucide-react';
import Pagination from '../../../components/common/Pagination';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import Toast from '../../../components/common/Toast';

// Danh sách các quốc gia phổ biến sản xuất phim
const COUNTRIES = [
    'Việt Nam',
    'Mỹ',
    'Hàn Quốc',
    'Nhật Bản',
    'Thái Lan',
    'Trung Quốc',
    'Đài Loan',
    'Hồng Kông',
    'Anh',
    'Pháp',
    'Ấn Độ',
    'Đức',
    'Tây Ban Nha',
    'Úc',
    'Canada',
    'Khác'
];

const Films = () => {
    const [search, setSearch] = useState('');
    const [openModal, setOpenModal] = useState(false);

    const [isEdit, setIsEdit] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [genres, setGenres] = useState([]);

    // ===== GENRE QUICK MANAGE =====
    const [showGenreManager, setShowGenreManager] = useState(false);
    const [newGenreName, setNewGenreName] = useState('');
    const [editingGenre, setEditingGenre] = useState(null);
    const [genreSubmitting, setGenreSubmitting] = useState(false);

    const [toast, setToast] = useState({ show: false, message: '' });
    const showToast = (msg) => setToast({ show: true, message: msg });

    // ===== CONFIRM DIALOG =====
    const [confirm, setConfirm] = useState({ show: false, message: '', onConfirm: null });

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Đã đổi country thành mảng countries[] để hỗ trợ chọn nhiều
    const [form, setForm] = useState({
        title: '',
        director: '',
        countries: [], // <-- ĐỔI THÀNH MẢNG
        actors: '',
        duration: '',
        genre_ids: [],
        age_limit: '',
        release_date: '',
        end_date: '',
        description: '',
        poster_url: '',
        backdrop_url: '',
        trailer_url: ''
    });

    const [films, setFilms] = useState([]);

    const toggleGenre = (id) => {
        setForm((prev) => ({
            ...prev,
            genre_ids: prev.genre_ids.includes(id)
                ? prev.genre_ids.filter((g) => g !== id)
                : [...prev.genre_ids, id]
        }));
    };

    // Hàm xử lý chọn nhiều Quốc gia
    const toggleCountry = (country) => {
        setForm((prev) => ({
            ...prev,
            countries: prev.countries.includes(country)
                ? prev.countries.filter((c) => c !== country)
                : [...prev.countries, country]
        }));
    };

    const getToken = () => localStorage.getItem('token');

    // ================== UTILS ==================
    const getStatusLabel = (status) => {
        if (status === 'showing') return 'Đang chiếu';
        if (status === 'upcoming') return 'Sắp chiếu';
        if (status === 'expired') return 'Ngừng chiếu';
        return status || 'Không rõ';
    };

    const getStatusColor = (status) => {
        if (status === 'showing') return 'bg-green-100 text-green-600';
        if (status === 'upcoming') return 'bg-blue-100 text-blue-600';
        if (status === 'expired') return 'bg-gray-200 text-gray-500 opacity-80';
        return 'bg-gray-100 text-gray-600';
    };

    // ================== FETCH MOVIES ==================
    const fetchMovies = async () => {
        try {
            setLoading(true);
            const res = await fetch(
                'https://cinema-api-production-f2bc.up.railway.app/api/v1/admin/movies',
                {
                    headers: {
                        Authorization: `Bearer ${getToken()}`,
                        Accept: 'application/json'
                    }
                }
            );
            const json = await res.json();
            if (!res.ok) {
                setFilms([]);
                return;
            }

            const movies = Array.isArray(json?.data) ? json.data : [];
            setFilms(
                movies.map((m) => ({
                    movie_id: m.movie_id,
                    title: m.title || '',
                    duration: m.duration || 0,
                    description: m.description || '',
                    release_date: m.release_date || '',
                    end_date: m.end_date || '',
                    age_limit: m.age_limit || '',
                    country: m.country || 'N/A',
                    // Tách chuỗi quốc gia thành mảng để lát nữa đổ vào Form Sửa
                    raw_countries:
                        m.country && m.country !== 'N/A'
                            ? m.country.split(',').map((c) => c.trim())
                            : [],
                    poster_url: m.poster_url || 'https://via.placeholder.com/100x150?text=No+Image',
                    trailer_url: m.trailer_url || '#',
                    director: m.director || 'N/A',
                    actors: Array.isArray(m.actors)
                        ? m.actors
                        : typeof m.actors === 'string'
                          ? m.actors.split(',').map((a) => a.trim())
                          : [],
                    genre: Array.isArray(m.genres) ? m.genres : [],
                    status: m.status || 'expired'
                }))
            );
        } catch (err) {
            console.error(err);
            setFilms([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMovies();
    }, []);

    // ================== FETCH GENRES ==================
    const fetchGenres = async () => {
        try {
            const res = await fetch(
                'https://cinema-api-production-f2bc.up.railway.app/api/v1/admin/genres',
                {
                    headers: {
                        Authorization: `Bearer ${getToken()}`,
                        Accept: 'application/json'
                    }
                }
            );
            const json = await res.json();
            setGenres(Array.isArray(json?.data) ? json.data : []);
        } catch (err) {
            console.error(err);
            showToast('Lỗi tải thể loại ❌');
        }
    };

    useEffect(() => {
        fetchGenres();
    }, []);

    // ================== GENRE: ADD ==================
    const handleAddGenre = async () => {
        if (!newGenreName.trim()) return;
        try {
            setGenreSubmitting(true);
            const res = await fetch(
                'https://cinema-api-production-f2bc.up.railway.app/api/v1/admin/genres',
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${getToken()}`,
                        'Content-Type': 'application/json',
                        Accept: 'application/json'
                    },
                    body: JSON.stringify({ genre_name: newGenreName.trim() })
                }
            );
            if (!res.ok) {
                showToast('Thêm thể loại thất bại ❌');
                return;
            }
            showToast('Thêm thể loại thành công ✅');
            setNewGenreName('');
            fetchGenres();
        } catch (err) {
            showToast('Lỗi ❌');
        } finally {
            setGenreSubmitting(false);
        }
    };

    // ================== GENRE: UPDATE ==================
    const handleUpdateGenre = async () => {
        if (!editingGenre?.genre_name.trim()) return;
        try {
            setGenreSubmitting(true);
            const res = await fetch(
                `https://cinema-api-production-f2bc.up.railway.app/api/v1/admin/genres/${editingGenre.genre_id}`,
                {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${getToken()}`,
                        'Content-Type': 'application/json',
                        Accept: 'application/json'
                    },
                    body: JSON.stringify({ genre_name: editingGenre.genre_name.trim() })
                }
            );
            if (!res.ok) {
                showToast('Cập nhật thất bại ❌');
                return;
            }
            showToast('Cập nhật thể loại ✅');
            setEditingGenre(null);
            fetchGenres();
        } catch (err) {
            showToast('Lỗi ❌');
        } finally {
            setGenreSubmitting(false);
        }
    };

    // ================== GENRE: DELETE ==================
    const handleDeleteGenre = (id) => {
        setConfirm({
            show: true,
            message: 'Bạn có chắc muốn xoá thể loại này không?',
            onConfirm: () => confirmDeleteGenre(id)
        });
    };

    const confirmDeleteGenre = async (id) => {
        setConfirm({ show: false, message: '', onConfirm: null });
        try {
            const res = await fetch(
                `https://cinema-api-production-f2bc.up.railway.app/api/v1/admin/genres/${id}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${getToken()}`,
                        Accept: 'application/json'
                    }
                }
            );
            if (!res.ok) {
                showToast('Xoá thất bại ❌');
                return;
            }
            showToast('Đã xoá thể loại ✅');
            setForm((prev) => ({
                ...prev,
                genre_ids: prev.genre_ids.filter((g) => g !== id)
            }));
            fetchGenres();
        } catch (err) {
            showToast('Lỗi ❌');
        }
    };

    // ================== SUBMIT MOVIE ==================
    const handleSubmit = async () => {
        if (!form.title.trim()) {
            showToast('Nhập tên phim ❗');
            return;
        }

        if (form.countries.length === 0) {
            showToast('Vui lòng chọn ít nhất 1 quốc gia ❗');
            return;
        }

        try {
            setSubmitting(true);

            // BÓC TÁCH CHỈ LẤY SỐ CHO age_limit
            const parsedAgeLimit = form.age_limit
                ? Number(String(form.age_limit).replace(/\D/g, ''))
                : 0;

            // Gộp mảng countries thành chuỗi nối nhau bằng dấu phẩy
            const payload = {
                title: form.title,
                director: form.director,
                country: form.countries.join(', '), // Mảng ['Mỹ', 'Anh'] -> Chuỗi "Mỹ, Anh"
                duration: Number(form.duration),
                description: form.description,
                release_date: form.release_date,
                end_date: form.end_date,
                age_limit: parsedAgeLimit,
                poster_url: form.poster_url,
                trailer_url: form.trailer_url,
                actors: form.actors,
                genre_ids: form.genre_ids,
                backdrop_url: form.backdrop_url
            };

            const url = isEdit
                ? `https://cinema-api-production-f2bc.up.railway.app/api/v1/admin/movies/${editingId}`
                : `https://cinema-api-production-f2bc.up.railway.app/api/v1/admin/movies`;

            const res = await fetch(url, {
                method: isEdit ? 'PUT' : 'POST',
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const json = await res.json();
            if (!res.ok) {
                showToast(json.message || 'Thất bại ❌');
                return;
            }

            showToast(isEdit ? 'Cập nhật phim thành công ✅' : 'Thêm phim thành công 🎉');
            setOpenModal(false);
            setIsEdit(false);
            setEditingId(null);
            fetchMovies();
        } catch (err) {
            console.error(err);
            showToast('Lỗi ❌');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (item) => {
        if (item.status === 'expired') {
            showToast('Không thể chỉnh sửa phim đã ngừng chiếu!');
            return;
        }

        const matchedGenreIds = (item.genre || [])
            .map((genreName) => {
                const found = genres.find((g) => g.genre_name === genreName);
                return found ? found.genre_id : null;
            })
            .filter(Boolean);

        // Lấy mảng raw_countries đã xử lý lúc fetch
        setForm({
            title: item.title,
            director: item.director,
            countries: item.raw_countries || [], // Đổ lại mảng vào form
            actors: item.actors?.join(', '),
            duration: item.duration,
            genre_ids: matchedGenreIds,
            age_limit: item.age_limit,
            release_date: item.release_date,
            end_date: item.end_date,
            description: item.description,
            poster_url: item.poster_url,
            backdrop_url: item.backdrop_url || '',
            trailer_url: item.trailer_url
        });
        setEditingId(item.movie_id);
        setIsEdit(true);
        setOpenModal(true);
        setShowGenreManager(false);
    };

    const resetModal = () => {
        setOpenModal(false);
        setIsEdit(false);
        setEditingId(null);
        setShowGenreManager(false);
        setEditingGenre(null);
        setNewGenreName('');
        // Xóa sạch form
        setForm({
            title: '',
            director: '',
            countries: [], // Reset mảng
            actors: '',
            duration: '',
            genre_ids: [],
            age_limit: '',
            release_date: '',
            end_date: '',
            description: '',
            poster_url: '',
            backdrop_url: '',
            trailer_url: ''
        });
    };

    const filtered = films.filter((f) =>
        (f.title + (f.director || '')).toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filtered.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="space-y-6 relative ">
            {/* TOAST NOTIFICATION */}
            {toast.show && (
                <div className="fixed top-20 right-8 z-[200]">
                    <Toast
                        message={toast.message}
                        onClose={() => setToast({ show: false, message: '' })}
                    />
                </div>
            )}

            {/* HEADER */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Quản lý phim</h2>
                <button
                    onClick={() => {
                        resetModal();
                        setOpenModal(true);
                    }}
                    className="flex gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                    <Plus size={18} /> Thêm phim
                </button>
            </div>

            {/* SEARCH */}
            <div className="relative w-72">
                <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                />
                <input
                    value={search}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm phim..."
                    className="w-full pl-9 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-400"
                />
            </div>

            {/* TABLE */}
            {loading ? (
                <LoadingSpinner />
            ) : (
                <div className="bg-white rounded-xl border overflow-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left w-16">Poster</th>
                                <th className="px-4 py-3 text-left w-48">Tên phim</th>
                                <th className="px-4 py-3 text-left">Đạo diễn</th>
                                <th className="px-4 py-3 text-center">Quốc gia</th>
                                <th className="px-4 py-3 text-left">Thể loại</th>
                                <th className="px-4 py-3 text-center">Thời lượng</th>
                                <th className="px-4 py-3 text-center">Độ tuổi</th>
                                <th className="px-4 py-3 text-center">Ngày chiếu</th>
                                <th className="px-4 py-3 text-center">Kết thúc</th>
                                <th className="px-4 py-3 text-center">Trạng thái</th>
                                <th className="px-4 py-3 text-center">Trailer</th>
                                <th className="px-4 py-3 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.map((item) => (
                                <tr key={item.movie_id} className="border-t hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <img
                                            src={item.poster_url}
                                            className="w-12 h-16 object-cover rounded shadow-sm"
                                            alt={item.title}
                                        />
                                    </td>
                                    <td className="px-4 py-3 font-medium text-gray-800 line-clamp-2">
                                        {item.title}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">{item.director}</td>
                                    <td className="px-4 py-3 text-center text-gray-600">
                                        {item.country}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">
                                        {item.genre?.join(', ')}
                                    </td>
                                    <td className="px-4 py-3 text-center text-gray-600">
                                        {item.duration}p
                                    </td>
                                    <td className="px-4 py-3 text-center text-gray-600">
                                        {item.age_limit}
                                    </td>
                                    <td className="px-4 py-3 text-center text-gray-600">
                                        {item.release_date}
                                    </td>
                                    <td className="px-4 py-3 text-center text-gray-600">
                                        {item.end_date}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor(item.status)}`}
                                        >
                                            {getStatusLabel(item.status)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <a
                                            href={item.trailer_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-red-500 hover:text-red-700 hover:underline inline-flex items-center gap-1"
                                        >
                                            Xem
                                        </a>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex justify-center gap-3">
                                            <button
                                                title={
                                                    item.status === 'expired'
                                                        ? 'Không thể sửa phim đã ngừng chiếu'
                                                        : 'Sửa phim'
                                                }
                                                disabled={item.status === 'expired'}
                                                className={`transition ${
                                                    item.status === 'expired'
                                                        ? 'text-gray-300 cursor-not-allowed'
                                                        : 'text-blue-500 hover:text-blue-700'
                                                }`}
                                                onClick={() => handleEdit(item)}
                                            >
                                                <Pencil size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {paginatedData.length === 0 && (
                                <tr>
                                    <td colSpan="12" className="text-center py-6 text-gray-500">
                                        Không tìm thấy phim nào.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    {!loading && totalPages > 1 && (
                        <div className="px-4 py-3 border-t">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={(page) => setCurrentPage(page)}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* ==================== MODAL FORM ==================== */}
            {openModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]">
                    <div className="bg-white w-[750px] max-h-[92vh] rounded-2xl flex flex-col shadow-2xl animate-fade-in-up">
                        {/* MODAL HEADER */}
                        <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50 rounded-t-2xl">
                            <h3 className="text-xl font-bold text-gray-800">
                                {isEdit ? 'Chỉnh sửa phim' : 'Thêm phim mới'}
                            </h3>
                            <button
                                onClick={resetModal}
                                className="text-gray-400 hover:text-gray-700 transition"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* MODAL BODY */}
                        <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar">
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tên phim *
                                    </label>
                                    <input
                                        value={form.title}
                                        onChange={(e) =>
                                            setForm({ ...form, title: e.target.value })
                                        }
                                        className="w-full border p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Đạo diễn
                                    </label>
                                    <input
                                        value={form.director}
                                        onChange={(e) =>
                                            setForm({ ...form, director: e.target.value })
                                        }
                                        className="w-full border p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Độ tuổi
                                    </label>
                                    <input
                                        placeholder="Ví dụ: C18, 16+, 13..."
                                        value={form.age_limit}
                                        onChange={(e) =>
                                            setForm({ ...form, age_limit: e.target.value })
                                        }
                                        className="w-full border p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Thời lượng (Phút)
                                    </label>
                                    <input
                                        type="number"
                                        value={form.duration}
                                        onChange={(e) =>
                                            setForm({ ...form, duration: e.target.value })
                                        }
                                        className="w-full border p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500"
                                    />
                                </div>

                                {/* ===== QUỐC GIA SẢN XUẤT (Dạng Tags chọn nhiều) ===== */}
                                <div className="col-span-2 p-4 bg-gray-50 rounded-xl border">
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Quốc gia sản xuất *
                                        </label>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {COUNTRIES.map((c) => (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => toggleCountry(c)}
                                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                                                    form.countries.includes(c)
                                                        ? 'bg-red-600 text-white shadow-md'
                                                        : 'bg-white text-gray-600 border hover:border-red-300 hover:bg-red-50'
                                                }`}
                                            >
                                                {c}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Diễn viên (cách nhau bằng dấu phẩy)
                                    </label>
                                    <input
                                        value={form.actors}
                                        onChange={(e) =>
                                            setForm({ ...form, actors: e.target.value })
                                        }
                                        className="w-full border p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500"
                                    />
                                </div>

                                {/* ===== THỂ LOẠI PHIM ===== */}
                                <div className="col-span-2 p-4 bg-gray-50 rounded-xl border">
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Thể loại phim
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowGenreManager(!showGenreManager);
                                                setEditingGenre(null);
                                                setNewGenreName('');
                                            }}
                                            className="text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-1"
                                        >
                                            <Plus size={16} />
                                            {showGenreManager ? 'Ẩn quản lý' : 'Quản lý thể loại'}
                                        </button>
                                    </div>

                                    {/* Genre tags chọn */}
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {genres.map((g) => (
                                            <button
                                                key={g.genre_id}
                                                type="button"
                                                onClick={() => toggleGenre(g.genre_id)}
                                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                                                    form.genre_ids.includes(g.genre_id)
                                                        ? 'bg-red-600 text-white shadow-md'
                                                        : 'bg-white text-gray-600 border hover:border-red-300 hover:bg-red-50'
                                                }`}
                                            >
                                                {g.genre_name}
                                            </button>
                                        ))}
                                        {genres.length === 0 && (
                                            <p className="text-sm text-gray-400">
                                                Chưa có dữ liệu thể loại.
                                            </p>
                                        )}
                                    </div>

                                    {/* ===== GENRE MANAGER PANEL ===== */}
                                    {showGenreManager && (
                                        <div className="mt-4 pt-4 border-t border-dashed space-y-3">
                                            <div className="flex gap-2">
                                                <input
                                                    placeholder="Nhập tên thể loại mới..."
                                                    value={newGenreName}
                                                    onChange={(e) =>
                                                        setNewGenreName(e.target.value)
                                                    }
                                                    onKeyDown={(e) =>
                                                        e.key === 'Enter' && handleAddGenre()
                                                    }
                                                    className="flex-1 border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleAddGenre}
                                                    disabled={
                                                        genreSubmitting || !newGenreName.trim()
                                                    }
                                                    className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 transition font-medium"
                                                >
                                                    Thêm
                                                </button>
                                            </div>

                                            <div className="max-h-32 overflow-y-auto space-y-1 bg-white p-2 rounded-lg border">
                                                {genres.map((g) => (
                                                    <div
                                                        key={g.genre_id}
                                                        className="flex items-center gap-2 group p-1 hover:bg-gray-50 rounded"
                                                    >
                                                        {editingGenre?.genre_id === g.genre_id ? (
                                                            <>
                                                                <input
                                                                    value={editingGenre.genre_name}
                                                                    onChange={(e) =>
                                                                        setEditingGenre({
                                                                            ...editingGenre,
                                                                            genre_name:
                                                                                e.target.value
                                                                        })
                                                                    }
                                                                    onKeyDown={(e) =>
                                                                        e.key === 'Enter' &&
                                                                        handleUpdateGenre()
                                                                    }
                                                                    className="flex-1 border-b border-gray-400 px-1 focus:outline-none focus:border-red-500 bg-transparent"
                                                                    autoFocus
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={handleUpdateGenre}
                                                                    className="text-green-600 hover:bg-green-100 p-1 rounded"
                                                                >
                                                                    <Check size={16} />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setEditingGenre(null)
                                                                    }
                                                                    className="text-gray-500 hover:bg-gray-200 p-1 rounded"
                                                                >
                                                                    <X size={16} />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span className="flex-1 text-sm text-gray-700 pl-1">
                                                                    {g.genre_name}
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setEditingGenre({
                                                                            genre_id: g.genre_id,
                                                                            genre_name: g.genre_name
                                                                        })
                                                                    }
                                                                    className="text-blue-500 hover:bg-blue-50 p-1 rounded opacity-0 group-hover:opacity-100 transition"
                                                                >
                                                                    <Pencil size={14} />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleDeleteGenre(
                                                                            g.genre_id
                                                                        )
                                                                    }
                                                                    className="text-red-500 hover:bg-red-50 p-1 rounded opacity-0 group-hover:opacity-100 transition"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {/* ===== END GENRE BLOCK ===== */}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Ngày chiếu
                                    </label>
                                    <input
                                        type="date"
                                        value={form.release_date}
                                        onChange={(e) =>
                                            setForm({ ...form, release_date: e.target.value })
                                        }
                                        className="w-full border p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Ngày kết thúc
                                    </label>
                                    <input
                                        type="date"
                                        value={form.end_date}
                                        onChange={(e) =>
                                            setForm({ ...form, end_date: e.target.value })
                                        }
                                        className="w-full border p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 bg-white"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Link Poster
                                    </label>
                                    <input
                                        value={form.poster_url}
                                        onChange={(e) =>
                                            setForm({ ...form, poster_url: e.target.value })
                                        }
                                        className="w-full border p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Link Backdrop
                                    </label>
                                    <input
                                        value={form.backdrop_url}
                                        onChange={(e) =>
                                            setForm({ ...form, backdrop_url: e.target.value })
                                        }
                                        className="w-full border p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Link YouTube Trailer
                                    </label>
                                    <input
                                        value={form.trailer_url}
                                        onChange={(e) =>
                                            setForm({ ...form, trailer_url: e.target.value })
                                        }
                                        className="w-full border p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Mô tả phim
                                    </label>
                                    <textarea
                                        value={form.description}
                                        onChange={(e) =>
                                            setForm({ ...form, description: e.target.value })
                                        }
                                        className="w-full border p-2.5 rounded-lg h-28 resize-none focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* MODAL FOOTER */}
                        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
                            <button
                                onClick={resetModal}
                                className="px-5 py-2.5 border rounded-lg hover:bg-gray-100 transition font-medium text-gray-700"
                            >
                                Huỷ
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60 transition font-medium flex items-center gap-2"
                            >
                                {submitting
                                    ? 'Đang xử lý...'
                                    : isEdit
                                      ? 'Lưu thay đổi'
                                      : 'Tạo phim'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ==================== CONFIRM DIALOG ==================== */}
            {confirm.show && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[110]">
                    <div className="bg-white rounded-2xl shadow-2xl w-[380px] overflow-hidden animate-scale-in">
                        <div className="flex flex-col items-center pt-8 pb-5 px-6">
                            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-5">
                                <Trash2 size={28} className="text-red-600" />
                            </div>
                            <h4 className="text-lg font-bold text-gray-900 mb-2">Xác nhận xoá</h4>
                            <p className="text-gray-600 text-center leading-relaxed">
                                {confirm.message}
                            </p>
                        </div>
                        <div className="flex border-t">
                            <button
                                onClick={() =>
                                    setConfirm({ show: false, message: '', onConfirm: null })
                                }
                                className="flex-1 py-3.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition border-r"
                            >
                                Huỷ thao tác
                            </button>
                            <button
                                onClick={confirm.onConfirm}
                                className="flex-1 py-3.5 text-sm font-bold text-red-600 hover:bg-red-50 transition"
                            >
                                Xoá ngay
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Films;
