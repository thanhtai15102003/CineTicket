import { useState } from 'react';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';

const Films = () => {
    const [search, setSearch] = useState('');
    const [openModal, setOpenModal] = useState(false);

    const [form, setForm] = useState({
        title: '',
        director: '',
        actors: '',
        duration: '',
        genre: '',
        age_limit: '',
        release_date: '',
        end_date: '',
        description: '',
        poster_url: '',
        trailer_url: ''
    });

    // 👉 Mock data chuẩn
    const [films, setFilms] = useState([
        {
            movie_id: 1,
            title: 'HẸN EM NGÀY NHẬT THỰC',
            duration: 118,
            description: 'Phim tình cảm Việt Nam',
            release_date: '2026-03-30',
            end_date: '2026-06-30',
            age_limit: '16+',
            poster_url:
                'https://cinestar.com.vn/_next/image/?url=https%3A%2F%2Fapi-website.cinestar.com.vn%2Fmedia%2Fwysiwyg%2FPosters%2F04-2026%2Fhen-em.jpg&w=1920&q=75',
            trailer_url: 'https://www.youtube.com/watch?v=snG3te8ByyQ',
            status: 'now_showing',
            genre: ['Tình cảm', 'Tâm lý'],
            actors: ['Đoàn Thiên Ân', 'Khương Lê'],
            director: 'Lê Thiện Viễn'
        }
    ]);

    // 👉 Toggle
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

    // 👉 Add
    const handleAdd = () => {
        if (!form.title.trim()) return;

        const newFilm = {
            movie_id: Date.now(),
            ...form,
            genre: form.genre.split(','),
            actors: form.actors.split(','),
            status: 'now_showing'
        };

        setFilms([newFilm, ...films]);

        setForm({
            title: '',
            director: '',
            actors: '',
            duration: '',
            genre: '',
            age_limit: '',
            release_date: '',
            end_date: '',
            description: '',
            poster_url: '',
            trailer_url: ''
        });

        setOpenModal(false);
    };

    const filtered = films.filter((f) =>
        (f.title + f.director).toLowerCase().includes(search.toLowerCase())
    );

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
                        {filtered.map((item) => (
                            <tr key={item.movie_id} className="border-t">
                                <td className="px-4 py-3">
                                    <img
                                        src={item.poster_url}
                                        className="w-12 h-16 object-cover rounded"
                                    />
                                </td>

                                <td className="px-4 py-3 font-medium">{item.title}</td>

                                <td className="px-4 py-3">{item.director}</td>

                                <td className="px-4 py-3">{item.actors.join(', ')}</td>

                                <td className="px-4 py-3">{item.genre.join(', ')}</td>

                                <td className="px-4 py-3">{item.duration}p</td>

                                <td className="px-4 py-3">{item.age_limit}</td>

                                <td className="px-4 py-3">{item.release_date}</td>

                                <td className="px-4 py-3">{item.end_date}</td>

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

                                <td className="px-4 py-3 flex gap-2">
                                    <Pencil size={16} className="text-blue-500 cursor-pointer" />
                                    <Trash2 size={16} className="text-red-500 cursor-pointer" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL */}
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

                                <input
                                    placeholder="Thể loại (cách nhau ,)"
                                    value={form.genre}
                                    onChange={(e) => setForm({ ...form, genre: e.target.value })}
                                    className="border p-2 rounded"
                                />

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
                                onClick={() => setOpenModal(false)}
                                className="px-4 py-2 border rounded"
                            >
                                Huỷ
                            </button>

                            <button
                                onClick={handleAdd}
                                className="px-4 py-2 bg-red-600 text-white rounded"
                            >
                                Thêm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Films;
