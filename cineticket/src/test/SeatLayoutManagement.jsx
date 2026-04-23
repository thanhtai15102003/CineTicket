import { useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CreateSeatLayoutModal from './CreateSeatLayoutModal';

/* ================= MOCK DATA ================= */

const generateSeats = (rows, cols, type) => {
    const data = [];
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for (let r = 0; r < rows; r++) {
        for (let c = 1; c <= cols; c++) {
            data.push({
                seat_id: `${letters[r]}${c}`,
                row_label: letters[r],
                seat_number: c,
                seat_type: type
            });
        }
    }

    return data;
};

const initialLayouts = [
    {
        id: 'sl1',
        name: 'Mẫu sơ đồ ghế vừa',
        description: 'Mẫu sơ đồ ghế vừa',
        status: 'published',
        active: true,
        seats: generateSeats(12, 12, 'regular')
    },
    {
        id: 'sl2',
        name: 'Mẫu sơ đồ ghế trung bình',
        description: 'Mẫu sơ đồ ghế trung bình',
        status: 'draft',
        active: false,
        seats: generateSeats(13, 13, 'vip')
    }
];

/* ================= COMPONENT ================= */

const tabs = [
    { key: 'all', label: 'Tất cả' },
    { key: 'published', label: 'Đã xuất bản' },
    { key: 'draft', label: 'Bản nháp' }
];

export default function SeatLayoutManagement() {
    const [layouts, setLayouts] = useState(initialLayouts);
    const [activeTab, setActiveTab] = useState('all');
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    const [showModal, setShowModal] = useState(false);

    const filteredLayouts = layouts.filter((l) => {
        const matchTab = activeTab === 'all' || l.status === activeTab;
        const matchSearch = l.name.toLowerCase().includes(search.toLowerCase());
        return matchTab && matchSearch;
    });

    const handleDelete = (id) => {
        if (window.confirm('Xóa sơ đồ này?')) {
            setLayouts((prev) => prev.filter((l) => l.id !== id));
        }
    };

    const toggleActive = (id) => {
        setLayouts((prev) => prev.map((l) => (l.id === id ? { ...l, active: !l.active } : l)));
    };

    // 👉 Tạo sơ đồ mới
    // const handleCreate = () => {
    //     navigate('/admin/seat-layout/create');
    // };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-semibold">Danh sách sơ đồ ghế</h1>

                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg"
                >
                    <Plus size={16} /> Tạo sơ đồ ghế
                </button>
            </div>

            {/* FILTER */}
            <div className="flex flex-col md:flex-row justify-between gap-3 mb-4">
                <div className="flex gap-2">
                    {tabs.map((t) => (
                        <button
                            key={t.key}
                            onClick={() => setActiveTab(t.key)}
                            className={`px-4 py-2 rounded-lg text-sm ${
                                activeTab === t.key ? 'bg-red-600 text-white' : 'bg-white border'
                            }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                <input
                    placeholder="Tìm kiếm sơ đồ..."
                    className="border px-3 py-2 rounded-lg w-full md:w-64"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100 text-left">
                        <tr>
                            <th className="p-3">Tên mẫu</th>
                            <th className="p-3">Mô tả</th>
                            <th className="p-3">Ma trận</th>
                            <th className="p-3">Trạng thái</th>
                            <th className="p-3">Hoạt động</th>
                            <th className="p-3 text-center">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredLayouts.map((layout) => (
                            <tr key={layout.id} className="border-t">
                                {/* NAME + VIEW */}
                                <td className="p-3">
                                    <div className="font-medium">{layout.name}</div>
                                    <button
                                        onClick={() => navigate(`/admin/seat-layout/${layout.id}`)}
                                        className="text-xs text-blue-500 hover:underline mt-1"
                                    >
                                        Xem sơ đồ ghế
                                    </button>
                                </td>

                                {/* DESC */}
                                <td className="p-3 text-gray-500">{layout.description}</td>

                                {/* MATRIX SIZE */}
                                <td className="p-3 font-semibold text-gray-700">
                                    {getMatrixSize(layout.seats)}
                                </td>

                                {/* STATUS */}
                                <td className="p-3">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs ${
                                            layout.status === 'published'
                                                ? 'bg-green-100 text-green-600'
                                                : 'bg-yellow-100 text-yellow-600'
                                        }`}
                                    >
                                        {layout.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                                    </span>
                                </td>

                                {/* ACTIVE */}
                                <td className="p-3">
                                    <button
                                        onClick={() => toggleActive(layout.id)}
                                        className={`w-10 h-5 flex items-center rounded-full p-1 ${
                                            layout.active ? 'bg-green-500' : 'bg-gray-300'
                                        }`}
                                    >
                                        <div
                                            className={`w-4 h-4 bg-white rounded-full ${
                                                layout.active ? 'translate-x-5' : ''
                                            }`}
                                        />
                                    </button>
                                </td>

                                {/* ACTION */}
                                <td className="p-3 flex justify-center gap-3">
                                    <Pencil
                                        onClick={() =>
                                            navigate(`/admin/seat-layout/${layout.id}/edit`)
                                        }
                                        size={16}
                                        className="cursor-pointer"
                                    />
                                    <Trash2
                                        size={16}
                                        className="cursor-pointer text-red-500"
                                        onClick={() => handleDelete(layout.id)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredLayouts.length === 0 && (
                    <div className="p-6 text-center text-gray-400">Không có dữ liệu</div>
                )}
            </div>
            {/* MODAL */}
            {showModal && (
                <CreateSeatLayoutModal
                    onClose={() => setShowModal(false)}
                    onCreate={(layout) => setLayouts((prev) => [layout, ...prev])}
                />
            )}
        </div>
    );
}

/* ================= HELPER ================= */

// 👉 tính ma trận (12x12)
const getMatrixSize = (seats) => {
    const rows = new Set(seats.map((s) => s.row_label)).size;
    const cols = Math.max(...seats.map((s) => s.seat_number));
    return `${rows} x ${cols}`;
};
