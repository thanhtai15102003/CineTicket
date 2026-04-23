import { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Toast from '../../components/common/Toast';

const Films = () => {
    const [search, setSearch] = useState('');
    const [openModal, setOpenModal] = useState(false);

    //sửa
    const [isEdit, setIsEdit] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [genres, setGenres] = useState([]);
    const [selectedGenres, setSelectedGenres] = useState([]);

    const [toast, setToast] = useState({ show: false, message: '' });
    const showToast = (msg) => {
        setToast({ show: true, message: msg });
    };

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; // số dòng mỗi trang

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        title: '',
        director: '',
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
                ? prev.genre_ids.filter((g) => g !== id) // nếu đã có thì bỏ
                : [...prev.genre_ids, id] // nếu chưa có thì thêm
        }));
    };
    // ================== FETCH MOVIES (FIX TOKEN) ==================
    useEffect(() => {
        const fetchMovies = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');

                const res = await fetch(
                    'https://cinema-api-production-f2bc.up.railway.app/api/v1/admin/movies',
                    {
                        method: 'GET',
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: 'application/json'
                        }
                    }
                );

                const json = await res.json();

                if (!res.ok) {
                    console.error('API error:', json);
                    setFilms([]);
                    return;
                }

                // ✅ FIX: always safe array
                const movies = Array.isArray(json?.data) ? json.data : [];

                const formatted = movies.map((m) => ({
                    movie_id: m.movie_id,
                    title: m.title || '',
                    duration: m.duration || 0,
                    description: m.description || '',
                    release_date: m.release_date || '',
                    end_date: m.end_date || '',
                    age_limit: m.age_limit || '',
                    poster_url: m.poster_url || 'https://via.placeholder.com/100x150?text=No+Image',
                    trailer_url: m.trailer_url || '#',

                    director: m.director || 'N/A',

                    // ✅ FIX NULL SAFE
                    actors: Array.isArray(m.actors)
                        ? m.actors
                        : typeof m.actors === 'string'
                          ? m.actors.split(',')
                          : [],

                    genre: Array.isArray(m.genres) ? m.genres : [],

                    status: m.status === 'active' ? 'now_showing' : 'inactive'
                }));

                setFilms(formatted);
            } catch (err) {
                console.error('Lỗi fetch movies:', err);
                setFilms([]);
            } finally {
                setLoading(false);
            }
        };

        fetchMovies();
    }, []);

    // ================== FETCH GENRES (FIX TOKEN) ==================
    useEffect(() => {
        fetchGenres();
    }, []);

    const fetchGenres = async () => {
        try {
            const token = localStorage.getItem('token');

            const res = await fetch(
                'https://cinema-api-production-f2bc.up.railway.app/api/v1/admin/genres',
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json'
                    }
                }
            );

            const json = await res.json();

            const data = Array.isArray(json?.data) ? json.data : [];

            setGenres(data);
        } catch (err) {
            console.error('Lỗi genres:', err);
            showToast('Lỗi tải thể loại ❌');
        }
    };

    // ================== TOGGLE STATUS (FRONTEND ONLY) ==================
    const toggleStatus = (id) => {
        setFilms((prev) =>
            prev.map((item) =>
                item.movie_id === id
                    ? {
                          ...item,
                          status: item.status === 'now_showing' ? 'inactive' : 'now_showing'
                      }
                    : item
            )
        );
    };

    // ================== ADD MOVIE (API POST) ==================
    const handleSubmit = async () => {
        if (!form.title.trim()) {
            showToast('Nhập tên phim ❗');
            return;
        }

        try {
            setSubmitting(true);

            const token = localStorage.getItem('token');

            const payload = {
                title: form.title,
                director: form.director,
                duration: Number(form.duration),
                description: form.description,
                release_date: form.release_date,
                end_date: form.end_date,
                age_limit: form.age_limit,
                poster_url: form.poster_url,
                trailer_url: form.trailer_url,
                actors: form.actors,
                genre_ids: form.genre_ids,
                backdrop_url: form.backdrop_url
            };

            const url = isEdit
                ? `https://cinema-api-production-f2bc.up.railway.app/api/v1/admin/movies/${editingId}`
                : `https://cinema-api-production-f2bc.up.railway.app/api/v1/admin/movies`;

            const method = isEdit ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const json = await res.json();

            if (!res.ok) {
                showToast(json.message || 'Thêm phim thất bại ❌');
                return;
            }

            showToast('Thêm phim thành công 🎉');

            // reload list
            window.location.reload();

            setOpenModal(false);
            setIsEdit(false);
            setEditingId(null);
        } catch (err) {
            console.error('Lỗi fetch movies:', err);
            setFilms([]);
            showToast('Lỗi tải phim ❌');
        } finally {
            setSubmitting(false);
        }
    };

    //hadle edit
    const handleEdit = (item) => {
        setForm({
            title: item.title,
            director: item.director,
            actors: item.actors?.join(', '),
            duration: item.duration,
            genre_ids: [], // nếu cần map lại genre_id thì làm thêm
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
    };

    const filtered = films.filter((f) =>
        (f.title + (f.director || '')).toLowerCase().includes(search.toLowerCase())
    );

    // ===== PAGINATION =====
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filtered.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Quản lý phim</h2>

                <button
                    onClick={() => setOpenModal(true)}
                    className="flex gap-2 px-4 py-2 bg-red-600 text-white rounded-lg"
                >
                    <Plus size={18} /> Thêm phim
                </button>
            </div>

            {/* SEARCH */}
            <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm phim..."
                    className="w-full pl-9 py-2 border rounded"
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
                                <th className="px-4 py-3">Poster</th>
                                <th className="px-4 py-3 text-left">Tên</th>
                                <th className="px-4 py-3">Đạo diễn</th>
                                <th className="px-4 py-3">Diễn viên</th>
                                <th className="px-4 py-3">Thể loại</th>
                                <th className="px-4 py-3">Thời lượng</th>
                                <th className="px-4 py-3">Độ tuổi</th>
                                <th className="px-4 py-3">Ngày chiếu</th>
                                <th className="px-4 py-3">Kết thúc</th>
                                <th className="px-4 py-3">Hoạt động</th>
                                <th className="px-4 py-3">Trailer</th>
                                <th className="px-4 py-3">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {paginatedData.map((item) => (
                                <tr key={item.movie_id} className="border-t">
                                    <td className="px-4 py-3">
                                        <img
                                            src={item.poster_url}
                                            className="w-12 h-16 object-cover rounded"
                                        />
                                    </td>

                                    <td className="px-4 py-3 font-medium">{item.title}</td>

                                    <td className="px-4 py-3">{item.director}</td>

                                    <td className="px-4 py-3">{item.actors?.join(', ')}</td>

                                    <td className="px-4 py-3">{item.genre?.join(', ')}</td>

                                    <td className="px-4 py-3">{item.duration}p</td>

                                    <td className="px-4 py-3">{item.age_limit}</td>

                                    <td className="px-4 py-3">{item.release_date}</td>

                                    <td className="px-4 py-3">{item.end_date}</td>

                                    {/* STATUS */}
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => toggleStatus(item.movie_id)}
                                            className={`px-2 py-1 rounded text-xs ${
                                                item.status === 'now_showing'
                                                    ? 'bg-green-100 text-green-600'
                                                    : 'bg-gray-200'
                                            }`}
                                        >
                                            {item.status === 'now_showing' ? 'Đang chiếu' : 'Ngừng'}
                                        </button>
                                    </td>

                                    <td className="px-4 py-3">
                                        <a
                                            href={item.trailer_url}
                                            target="_blank"
                                            className="text-red-500"
                                        >
                                            Xem
                                        </a>
                                    </td>

                                    <td className="px-4 py-3 text-center">
                                        <div className="flex justify-center gap-2">
                                            <Pencil
                                                size={16}
                                                className="text-blue-500 cursor-pointer"
                                                onClick={() => handleEdit(item)}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {!loading && totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={(page) => setCurrentPage(page)}
                        />
                    )}
                </div>
            )}

            {/* MODAL giữ nguyên */}
            {openModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    {/* CONTAINER */}
                    <div className="bg-white w-[700px] max-h-[90vh] rounded-xl flex flex-col">
                        {/* HEADER */}
                        <div className="flex justify-between items-center px-6 py-4 border-b">
                            <h3 className="text-lg font-semibold">Thêm phim</h3>
                            <button onClick={() => setOpenModal(false)}>✕</button>
                        </div>

                        {/* BODY (SCROLL) */}
                        <div className="p-6 overflow-y-auto space-y-4">
                            {/* GRID 2 CỘT */}
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    placeholder="Tên phim"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    className="border p-2 rounded"
                                />

                                <input
                                    placeholder="Đạo diễn"
                                    value={form.director}
                                    onChange={(e) => setForm({ ...form, director: e.target.value })}
                                    className="border p-2 rounded"
                                />

                                <input
                                    placeholder="Diễn viên (cách nhau ,)"
                                    value={form.actors}
                                    onChange={(e) => setForm({ ...form, actors: e.target.value })}
                                    className="border p-2 rounded col-span-2"
                                />

                                <div>
                                    <p className="font-medium mb-2">Thể loại</p>

                                    <div className="flex flex-wrap gap-2">
                                        {genres.map((g) => (
                                            <button
                                                key={g.genre_id}
                                                type="button"
                                                onClick={() => toggleGenre(g.genre_id)}
                                                className={`px-3 py-1 rounded border ${
                                                    form.genre_ids.includes(g.genre_id)
                                                        ? 'bg-red-600 text-white'
                                                        : ''
                                                }`}
                                            >
                                                {g.genre_name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <input
                                    placeholder="Độ tuổi (C13, 16+)"
                                    value={form.age_limit}
                                    onChange={(e) =>
                                        setForm({ ...form, age_limit: e.target.value })
                                    }
                                    className="border p-2 rounded"
                                />

                                <input
                                    type="number"
                                    placeholder="Thời lượng"
                                    value={form.duration}
                                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                                    className="border p-2 rounded"
                                />

                                <input
                                    type="date"
                                    value={form.release_date}
                                    onChange={(e) =>
                                        setForm({ ...form, release_date: e.target.value })
                                    }
                                    className="border p-2 rounded"
                                />

                                <input
                                    type="date"
                                    value={form.end_date}
                                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                                    className="border p-2 rounded"
                                />

                                <input
                                    placeholder="Poster URL"
                                    value={form.poster_url}
                                    onChange={(e) =>
                                        setForm({ ...form, poster_url: e.target.value })
                                    }
                                    className="border p-2 rounded col-span-2"
                                />
                                <input
                                    placeholder="Backdrop URL"
                                    value={form.backdrop_url}
                                    onChange={(e) =>
                                        setForm({ ...form, backdrop_url: e.target.value })
                                    }
                                    className="border p-2 rounded col-span-2"
                                />

                                <input
                                    placeholder="Youtube URL"
                                    value={form.trailer_url}
                                    onChange={(e) =>
                                        setForm({ ...form, trailer_url: e.target.value })
                                    }
                                    className="border p-2 rounded col-span-2"
                                />
                            </div>

                            {/* DESCRIPTION */}
                            <textarea
                                placeholder="Mô tả phim..."
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                className="w-full border p-2 rounded h-24"
                            />
                        </div>

                        {/* FOOTER */}
                        <div className="flex justify-end gap-2 px-6 py-4 border-t">
                            <button
                                onClick={() => {
                                    setOpenModal(false);
                                    setIsEdit(false);
                                    setEditingId(null);
                                }}
                                className="px-4 py-2 border rounded"
                            >
                                Huỷ
                            </button>

                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50"
                            >
                                {submitting ? 'Đang xử lý...' : isEdit ? 'Cập nhật' : 'Thêm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Films;
