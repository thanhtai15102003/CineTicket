import { useState } from 'react';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';

const Cinemas = () => {
    const [search, setSearch] = useState('');
    const [openModal, setOpenModal] = useState(false);

    const [form, setForm] = useState({
        cinema_name: '',
        branch: '',
        address: ''
    });

    // 👉 Mock data
    const [cinemas, setCinemas] = useState([
        {
            id: 1,
            cinema_name: 'CGV',
            branch: 'TP HCM',
            address: '123 Nguyễn Huệ Quận 1',
            status: 1
        },
        {
            id: 2,
            cinema_name: 'Lotte',
            branch: 'TP HCM',
            address: '456 Nguyễn Thị Thập Quận 7',
            status: 0
        }
    ]);

    // 👉 Toggle
    const toggleStatus = (id) => {
        setCinemas((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, status: item.status === 1 ? 0 : 1 } : item
            )
        );
    };

    // 👉 Add
    const handleAdd = () => {
        if (!form.cinema_name.trim()) return;

        const newItem = {
            id: Date.now(),
            ...form,
            status: 1
        };

        setCinemas([newItem, ...cinemas]);

        setForm({
            cinema_name: '',
            branch: '',
            address: ''
        });

        setOpenModal(false);
    };

    const filtered = cinemas.filter((c) =>
        (c.cinema_name + c.branch).toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Danh Sách Rạp Chiếu</h2>

                <button
                    onClick={() => setOpenModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg"
                >
                    <Plus size={18} />
                    Tạo rạp
                </button>
            </div>

            {/* SEARCH */}
            <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Tìm rạp..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
                />
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-xl border overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                        <tr>
                            <th className="px-4 py-3 text-left">Rạp</th>
                            <th className="px-4 py-3 text-left">Chi nhánh</th>
                            <th className="px-4 py-3 text-left">Địa chỉ</th>
                            <th className="px-4 py-3 text-center">Hoạt động</th>
                            <th className="px-4 py-3 text-center">Hành động</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filtered.map((item) => (
                            <tr key={item.id} className="border-t hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium">{item.cinema_name}</td>

                                <td className="px-4 py-3">{item.branch}</td>

                                <td className="px-4 py-3">{item.address}</td>

                                {/* TOGGLE */}
                                <td className="px-4 py-3 text-center">
                                    <button
                                        onClick={() => toggleStatus(item.id)}
                                        className={`relative w-11 h-6 rounded-full
                                        ${item.status ? 'bg-green-500' : 'bg-gray-300'}`}
                                    >
                                        <span
                                            className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition
                                            ${item.status ? 'translate-x-5' : ''}`}
                                        />
                                    </button>
                                </td>

                                <td className="px-4 py-3">
                                    <div className="flex justify-center gap-3">
                                        <Pencil
                                            size={16}
                                            className="text-blue-500 cursor-pointer"
                                        />
                                        <Trash2 size={16} className="text-red-500 cursor-pointer" />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL */}
            {openModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
                    <div className="bg-white w-[400px] p-6 rounded-xl space-y-3">
                        <h3 className="font-semibold text-lg">Tạo rạp</h3>

                        <input
                            placeholder="Tên rạp"
                            value={form.cinema_name}
                            onChange={(e) => setForm({ ...form, cinema_name: e.target.value })}
                            className="w-full border p-2 rounded"
                        />

                        <input
                            placeholder="Chi nhánh"
                            value={form.branch}
                            onChange={(e) => setForm({ ...form, branch: e.target.value })}
                            className="w-full border p-2 rounded"
                        />

                        <input
                            placeholder="Địa chỉ"
                            value={form.address}
                            onChange={(e) => setForm({ ...form, address: e.target.value })}
                            className="w-full border p-2 rounded"
                        />

                        <div className="flex justify-end gap-2 pt-2">
                            <button onClick={() => setOpenModal(false)}>Huỷ</button>

                            <button
                                onClick={handleAdd}
                                className="bg-red-600 text-white px-4 py-2 rounded"
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

export default Cinemas;
