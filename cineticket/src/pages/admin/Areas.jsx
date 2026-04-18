import { useState } from 'react';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';

const Areas = () => {
    const [search, setSearch] = useState('');
    const [openModal, setOpenModal] = useState(false);
    const [cinemaName, setCinemaName] = useState('');

    // 👉 Mock data
    const [areas, setAreas] = useState([
        {
            cinema_id: 1,
            cinema_name: 'CGV Quận 1',
            address: '123 Nguyễn Huệ',
            city: 'TP.HCM',
            district: 'Quận 1',
            phone: '0909123456',
            status: 1,
            created_at: '2024-01-01',
            updated_at: '2024-02-01'
        },
        {
            cinema_id: 2,
            cinema_name: 'CGV Quận 7',
            address: '456 Nguyễn Thị Thập',
            city: 'TP.HCM',
            district: 'Quận 7',
            phone: '0909777888',
            status: 0,
            created_at: '2024-01-10',
            updated_at: '2024-02-05'
        }
    ]);

    // 👉 Toggle status
    const toggleStatus = (id) => {
        setAreas((prev) =>
            prev.map((item) =>
                item.cinema_id === id ? { ...item, status: item.status === 1 ? 0 : 1 } : item
            )
        );
    };

    const filtered = areas.filter((a) =>
        a.cinema_name.toLowerCase().includes(search.toLowerCase())
    );

    const handleAdd = () => {
        if (!cinemaName.trim()) return;

        const newItem = {
            cinema_id: Date.now(),
            cinema_name: cinemaName,
            address: '',
            city: '',
            district: '',
            phone: '',
            status: 1,
            created_at: new Date().toISOString().split('T')[0],
            updated_at: new Date().toISOString().split('T')[0]
        };

        setAreas([newItem, ...areas]);
        setCinemaName('');
        setOpenModal(false);
    };

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold">Danh sách chi nhánh</h2>
                </div>

                <button
                    onClick={() => setOpenModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg"
                >
                    <Plus size={18} />
                    Tạo chi nhánh
                </button>
            </div>

            {/* SEARCH */}
            <div className="relative w-72">
                <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                    type="text"
                    placeholder="Tìm chi nhánh..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-500"
                />
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-xl shadow-sm border overflow-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                        <tr>
                            <th className="px-4 py-3 text-left">Chi nhánh</th>
                            <th className="px-4 py-3 text-center">Hoạt động</th>
                            <th className="px-4 py-3 text-center">Ngày tạo</th>
                            <th className="px-4 py-3 text-center">Cập nhật</th>
                            <th className="px-4 py-3 text-center">Hành động</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filtered.map((item) => (
                            <tr key={item.cinema_id} className="border-t hover:bg-gray-50">
                                {/* TÊN CHI NHÁNH */}
                                <td className="px-4 py-3 font-medium">{item.city}</td>

                                {/* TOGGLE */}
                                <td className="px-4 py-3 text-center">
                                    <button
                                        onClick={() => toggleStatus(item.cinema_id)}
                                        className={`relative w-11 h-6 rounded-full transition
                    ${item.status ? 'bg-green-500' : 'bg-gray-300'}`}
                                    >
                                        <span
                                            className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition
                        ${item.status ? 'translate-x-5' : ''}`}
                                        />
                                    </button>
                                </td>

                                {/* NGÀY TẠO */}
                                <td className="px-4 py-3 text-center">{item.created_at}</td>

                                {/* CẬP NHẬT */}
                                <td className="px-4 py-3 text-center">{item.updated_at}</td>

                                {/* ACTION */}
                                <td className="px-4 py-3">
                                    <div className="flex justify-center gap-3">
                                        <button className="text-blue-500">
                                            <Pencil size={16} />
                                        </button>
                                        <button className="text-red-500">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* ===== ADD CINEMA MODAL ===== */}
            {openModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white w-[350px] rounded-xl p-6 space-y-4">
                        {/* Header */}
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Tạo chi nhánh</h3>
                            <button onClick={() => setOpenModal(false)}>✕</button>
                        </div>

                        {/* Input */}
                        <input
                            type="text"
                            placeholder="Nhập tên chi nhánh..."
                            value={cinemaName}
                            onChange={(e) => setCinemaName(e.target.value)}
                            className="w-full border p-2 rounded focus:ring-2 focus:ring-red-500"
                        />

                        {/* Actions */}
                        <div className="flex justify-end gap-2">
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

export default Areas;
