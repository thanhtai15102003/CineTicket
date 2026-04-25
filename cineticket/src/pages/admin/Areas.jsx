import { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import Toast from '../../components/common/Toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';

const Areas = () => {
    const [search, setSearch] = useState('');
    const [openModal, setOpenModal] = useState(false);

    const [form, setForm] = useState({
        city: '',
        district: '',
        status: 'active' // 👈 Thêm trạng thái mặc định
    });

    const [areas, setAreas] = useState([]);

    const [isEdit, setIsEdit] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const [toast, setToast] = useState({
        show: false,
        message: ''
    });

    const [confirmDelete, setConfirmDelete] = useState({
        show: false,
        id: null
    });

    // ===== PAGINATION =====
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const showToast = (msg) => {
        setToast({ show: true, message: msg });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    // ================== LOAD ==================
    useEffect(() => {
        fetchRegions();
    }, []);

    const fetchRegions = async () => {
        try {
            setLoading(true);

            const token = localStorage.getItem('token');

            const res = await fetch(
                'https://cinema-api-production-f2bc.up.railway.app/api/v1/admin/regions',
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            const result = await res.json();

            if (res.ok) {
                setAreas(
                    result.data.map((item) => ({
                        cinema_id: item.region_id,
                        city: item.city,
                        district: item.district,
                        status: item.status || 'active', // 👈 Map status từ API
                        created_at: item.created_at,
                        updated_at: item.updated_at
                    }))
                );
            } else {
                showToast('Lỗi load dữ liệu ❌');
            }
        } catch {
            showToast('Lỗi server ❌');
        } finally {
            setLoading(false);
        }
    };

    // ================== FILTER ==================
    const filtered = areas.filter((a) => a.city.toLowerCase().includes(search.toLowerCase()));

    // ===== PAGINATION LOGIC =====
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filtered.slice(startIndex, startIndex + itemsPerPage);

    // ================== EDIT ==================
    const handleEdit = (item) => {
        setForm({
            city: item.city,
            district: item.district,
            status: item.status
        });

        setEditingId(item.cinema_id);
        setIsEdit(true);
        setOpenModal(true);
    };

    // ================== TOGGLE STATUS QUICK ACTION ==================
    // 👈 Hàm xử lý bật tắt trạng thái trực tiếp trên bảng
    const handleToggleStatus = async (item) => {
        try {
            const newStatus = item.status === 'active' ? 'inactive' : 'active';
            const token = localStorage.getItem('token');

            // Cập nhật UI ngay lập tức để tạo cảm giác mượt mà (Optimistic UI Update)
            setAreas((prev) =>
                prev.map((a) => (a.cinema_id === item.cinema_id ? { ...a, status: newStatus } : a))
            );

            const res = await fetch(
                `https://cinema-api-production-f2bc.up.railway.app/api/v1/admin/regions/${item.cinema_id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        city: item.city,
                        district: item.district,
                        status: newStatus
                    })
                }
            );

            const result = await res.json();

            if (!res.ok) {
                // Nếu lỗi, rollback lại UI
                setAreas((prev) =>
                    prev.map((a) =>
                        a.cinema_id === item.cinema_id ? { ...a, status: item.status } : a
                    )
                );
                showToast(result.message || 'Cập nhật trạng thái thất bại ❌');
            } else {
                showToast(`Đã ${newStatus === 'active' ? 'bật' : 'tắt'} hoạt động 🎉`);
            }
        } catch {
            fetchRegions(); // Rollback bằng cách fetch lại data
            showToast('Lỗi server ❌');
        }
    };

    // ================== ADD + UPDATE ==================
    const handleSubmit = async () => {
        if (!form.city.trim()) {
            showToast('Nhập thành phố ❗');
            return;
        }

        if (!form.district.trim()) {
            showToast('Nhập quận / huyện ❗');
            return;
        }

        const isDuplicate = areas.some((a) => {
            const sameCity = a.city.toLowerCase().trim() === form.city.toLowerCase().trim();
            const sameDistrict =
                a.district.toLowerCase().trim() === form.district.toLowerCase().trim();

            if (isEdit && a.cinema_id === editingId) return false;

            return sameCity && sameDistrict;
        });

        if (isDuplicate) {
            showToast('Khu vực đã tồn tại ❗');
            return;
        }

        try {
            setSubmitting(true);

            const token = localStorage.getItem('token');

            const url = isEdit
                ? `https://cinema-api-production-f2bc.up.railway.app/api/v1/admin/regions/${editingId}`
                : `https://cinema-api-production-f2bc.up.railway.app/api/v1/admin/regions`;

            const method = isEdit ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    city: form.city,
                    district: form.district,
                    status: form.status // 👈 Gửi thêm trạng thái
                })
            });

            const result = await res.json();

            if (res.ok) {
                showToast(isEdit ? 'Cập nhật thành công 🎉' : 'Tạo thành công 🎉');

                fetchRegions();
                setForm({ city: '', district: '', status: 'active' });
                setOpenModal(false);
                setIsEdit(false);
                setEditingId(null);
            } else {
                showToast(result.message || 'Thất bại ❌');
            }
        } catch {
            showToast('Lỗi server ❌');
        } finally {
            setSubmitting(false);
        }
    };

    // ================== DELETE ==================
    const handleDelete = async (id) => {
        try {
            setDeletingId(id);

            const token = localStorage.getItem('token');

            const res = await fetch(
                `https://cinema-api-production-f2bc.up.railway.app/api/v1/admin/regions/${id}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (res.ok) {
                showToast('Xoá thành công 🗑');
                setAreas((prev) => prev.filter((a) => a.cinema_id !== id));
            } else {
                showToast('Xoá thất bại ❌');
            }
        } catch {
            showToast('Lỗi server ❌');
        } finally {
            setDeletingId(null);
            setConfirmDelete({ show: false, id: null });
        }
    };

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Danh sách chi nhánh</h2>

                <button
                    onClick={() => {
                        setForm({ city: '', district: '', status: 'active' });
                        setIsEdit(false);
                        setEditingId(null);
                        setOpenModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 transition text-white rounded-lg"
                >
                    <Plus size={18} />
                    Tạo chi nhánh
                </button>
            </div>

            {/* SEARCH */}
            <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setCurrentPage(1);
                    }}
                    placeholder="Tìm chi nhánh..."
                    className="w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500"
                />
            </div>

            {/* TABLE */}
            {loading ? (
                <LoadingSpinner />
            ) : (
                <>
                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                                        Khu vực
                                    </th>
                                    <th className="px-4 py-3 text-center font-semibold text-gray-600">
                                        Trạng thái
                                    </th>
                                    <th className="px-4 py-3 text-center font-semibold text-gray-600">
                                        Ngày tạo
                                    </th>
                                    <th className="px-4 py-3 text-center font-semibold text-gray-600">
                                        Cập nhật
                                    </th>
                                    <th className="px-4 py-3 text-center font-semibold text-gray-600">
                                        Hành động
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y">
                                {paginatedData.map((item) => (
                                    <tr
                                        key={item.cinema_id}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-4 py-4 text-gray-700">
                                            {item.city} - {item.district}
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            {/* 👈 Toggle Button */}
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={item.status === 'active'}
                                                    onChange={() => handleToggleStatus(item)}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-red-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                            </label>
                                        </td>
                                        <td className="px-4 py-4 text-center text-gray-500">
                                            {formatDate(item.created_at)}
                                        </td>
                                        <td className="px-4 py-4 text-center text-gray-500">
                                            {formatDate(item.updated_at)}
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <div className="flex justify-center gap-4">
                                                <button
                                                    title="Chỉnh sửa"
                                                    className="text-blue-500 hover:text-blue-700 transition"
                                                    onClick={() => handleEdit(item)}
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    title="Xoá"
                                                    className={`transition ${
                                                        deletingId === item.cinema_id
                                                            ? 'opacity-30 pointer-events-none'
                                                            : 'text-red-500 hover:text-red-700'
                                                    }`}
                                                    onClick={() =>
                                                        setConfirmDelete({
                                                            show: true,
                                                            id: item.cinema_id
                                                        })
                                                    }
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {paginatedData.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text-center py-6 text-gray-500">
                                            Không tìm thấy khu vực nào.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION */}
                    {totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={(page) => setCurrentPage(page)}
                        />
                    )}
                </>
            )}

            {/* MODAL */}
            {openModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white w-[400px] p-6 rounded-2xl shadow-xl space-y-5 animate-fade-in-up">
                        <h3 className="text-xl font-bold text-gray-800 border-b pb-3">
                            {isEdit ? 'Chỉnh sửa khu vực' : 'Thêm khu vực mới'}
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Thành phố
                                </label>
                                <input
                                    value={form.city}
                                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                                    placeholder="Vd: TP Hồ Chí Minh"
                                    className="w-full border p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Quận / Huyện
                                </label>
                                <input
                                    value={form.district}
                                    onChange={(e) => setForm({ ...form, district: e.target.value })}
                                    placeholder="Vd: Quận 1"
                                    className="w-full border p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition"
                                />
                            </div>

                            {/* 👈 Lựa chọn trạng thái trong Modal */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Trạng thái
                                </label>
                                <select
                                    value={form.status}
                                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                                    className="w-full border p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition bg-white"
                                >
                                    <option value="active">Đang hoạt động</option>
                                    <option value="inactive">Tạm ngưng</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                onClick={() => setOpenModal(false)}
                                className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 transition font-medium"
                            >
                                Huỷ
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="bg-red-600 hover:bg-red-700 transition text-white px-5 py-2 rounded-lg font-medium disabled:opacity-60 flex items-center gap-2"
                            >
                                {submitting ? 'Đang xử lý...' : isEdit ? 'Cập nhật' : 'Thêm mới'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CONFIRM DELETE MODAL */}
            {confirmDelete.show && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]">
                    <div className="bg-white w-[350px] rounded-2xl p-6 space-y-4 animate-scale-in">
                        <div className="flex items-center gap-3 text-red-600 mb-2">
                            <Trash2 size={24} />
                            <h3 className="text-xl font-bold">Xác nhận xoá</h3>
                        </div>

                        <p className="text-gray-600">
                            Bạn có chắc chắn muốn xoá khu vực này? Hành động này không thể hoàn tác.
                        </p>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setConfirmDelete({ show: false, id: null })}
                                className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 transition font-medium"
                            >
                                Huỷ
                            </button>

                            <button
                                onClick={() => handleDelete(confirmDelete.id)}
                                className="px-5 py-2 bg-red-600 hover:bg-red-700 transition text-white rounded-lg font-medium flex items-center gap-2"
                            >
                                {deletingId ? 'Đang xoá...' : 'Xoá ngay'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* TOAST */}
            {toast.show && (
                <Toast
                    message={toast.message}
                    onClose={() => setToast({ show: false, message: '' })}
                />
            )}
        </div>
    );
};

export default Areas;
