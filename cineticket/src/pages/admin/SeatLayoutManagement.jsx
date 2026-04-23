import { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CreateSeatLayoutModal from './CreateSeatLayoutModal';

const tabs = [
    { key: 'all', label: 'Tất cả' },
    { key: 'active', label: 'Đang hoạt động' },
    { key: 'inactive', label: 'Ngừng' }
];

export default function SeatLayoutManagement() {
    const [layouts, setLayouts] = useState([]);
    const [activeTab, setActiveTab] = useState('all');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);

    /* ================= FETCH ================= */
    useEffect(() => {
        fetchLayouts();
    }, []);

    const fetchLayouts = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const res = await fetch(
                'https://cinema-api-production-f2bc.up.railway.app/api/v1/manager/seat-layouts',
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json'
                    }
                }
            );

            const json = await res.json();

            if (!res.ok) {
                console.error(json);
                return;
            }

            setLayouts(Array.isArray(json?.data) ? json.data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    /* ================= FILTER ================= */
    const filteredLayouts = layouts.filter((l) => {
        const matchTab = activeTab === 'all' || l.status === activeTab;
        const matchSearch = l.name.toLowerCase().includes(search.toLowerCase());
        return matchTab && matchSearch;
    });

    /* ================= DELETE ================= */
    const handleDelete = async (id) => {
        if (!window.confirm('Xóa sơ đồ này?')) return;

        try {
            const token = localStorage.getItem('token');

            await fetch(
                `https://cinema-api-production-f2bc.up.railway.app/api/v1/manager/seat-layouts/${id}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setLayouts((prev) => prev.filter((l) => l.layout_id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    /* ================= TOGGLE STATUS (PUT) ================= */
    const toggleStatus = async (layout) => {
        try {
            const token = localStorage.getItem('token');

            const newStatus = layout.status === 'active' ? 'inactive' : 'active';

            const res = await fetch(
                `https://cinema-api-production-f2bc.up.railway.app/api/v1/manager/seat-layouts/${layout.layout_id}`,
                {
                    method: 'PATCH',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: layout.name,
                        description: layout.description || '',
                        status: newStatus
                    })
                }
            );

            const json = await res.json();

            if (!res.ok) {
                console.error(json);
                return;
            }

            // update UI
            setLayouts((prev) =>
                prev.map((l) =>
                    l.layout_id === layout.layout_id ? { ...l, status: newStatus } : l
                )
            );
        } catch (err) {
            console.error('Toggle lỗi:', err);
        }
    };

    /* ================= UI ================= */
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
                            <th className="p-3">Tên</th>
                            <th className="p-3">Mô tả</th>
                            <th className="p-3">Ma trận</th>
                            <th className="p-3">Trạng thái</th>
                            <th className="p-3">Hoạt động</th>
                            <th className="p-3 text-center">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="text-center p-6">
                                    Loading...
                                </td>
                            </tr>
                        ) : (
                            filteredLayouts.map((layout) => (
                                <tr key={layout.layout_id} className="border-t">
                                    {/* NAME */}
                                    <td className="p-3">
                                        <div className="font-medium">{layout.name}</div>
                                        <button
                                            onClick={() =>
                                                navigate(`/admin/seat-layout/${layout.layout_id}`)
                                            }
                                            className="text-xs text-blue-500 hover:underline"
                                        >
                                            Xem sơ đồ ghế
                                        </button>
                                    </td>

                                    {/* DESCRIPTION */}
                                    <td className="p-3 text-gray-500">
                                        {layout.description || '—'}
                                    </td>

                                    {/* MATRIX */}
                                    <td className="p-3 font-semibold">
                                        {layout.row_count} x {layout.column_count}
                                    </td>

                                    {/* STATUS */}
                                    <td className="p-3">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs ${
                                                layout.status === 'active'
                                                    ? 'bg-green-100 text-green-600'
                                                    : 'bg-gray-200'
                                            }`}
                                        >
                                            {layout.status === 'active' ? 'Hoạt động' : 'Ngừng'}
                                        </span>
                                    </td>

                                    {/* TOGGLE */}
                                    <td className="p-3">
                                        <button
                                            onClick={() => toggleStatus(layout)}
                                            className={`w-10 h-5 flex items-center rounded-full p-1 ${
                                                layout.status === 'active'
                                                    ? 'bg-green-500'
                                                    : 'bg-gray-300'
                                            }`}
                                        >
                                            <div
                                                className={`w-4 h-4 bg-white rounded-full transition ${
                                                    layout.status === 'active'
                                                        ? 'translate-x-5'
                                                        : ''
                                                }`}
                                            />
                                        </button>
                                    </td>

                                    {/* ACTION */}
                                    <td className="p-3 flex justify-center gap-3">
                                        <Pencil
                                            size={16}
                                            className="cursor-pointer"
                                            onClick={() =>
                                                navigate(
                                                    `/admin/seat-layout/${layout.layout_id}/edit`
                                                )
                                            }
                                        />

                                        <Trash2
                                            size={16}
                                            className="cursor-pointer text-red-500"
                                            onClick={() => handleDelete(layout.layout_id)}
                                        />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {!loading && filteredLayouts.length === 0 && (
                    <div className="p-6 text-center text-gray-400">Không có dữ liệu</div>
                )}
            </div>

            {/* MODAL */}
            {showModal && (
                <CreateSeatLayoutModal
                    onClose={() => setShowModal(false)}
                    onCreate={() => {
                        setShowModal(false);
                        fetchLayouts();
                    }}
                />
            )}
        </div>
    );
}
