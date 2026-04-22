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
        district: ''
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
                        full_location: item.full_location,
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
    const filtered = areas.filter((a) =>
        a.full_location.toLowerCase().includes(search.toLowerCase())
    );

    // ===== PAGINATION LOGIC =====
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filtered.slice(startIndex, startIndex + itemsPerPage);

    // ================== EDIT ==================
    const handleEdit = (item) => {
        setForm({
            city: item.city,
            district: item.district
        });

        setEditingId(item.cinema_id);
        setIsEdit(true);
        setOpenModal(true);
    };

    // ================== ADD + UPDATE ==================
    const handleSubmit = async () => {
        if (!form.city.trim() || !form.district.trim()) {
            showToast('Nhập đầy đủ thông tin ❗');
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
                body: JSON.stringify(form)
            });

            const result = await res.json();

            if (res.ok) {
                showToast(isEdit ? 'Cập nhật thành công 🎉' : 'Tạo thành công 🎉');

                fetchRegions();
                setForm({ city: '', district: '' });
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
            <div className="flex justify-between">
                <h2 className="text-2xl font-semibold">Danh sách chi nhánh</h2>

                <button
                    onClick={() => {
                        setForm({ city: '', district: '' });
                        setIsEdit(false);
                        setEditingId(null);
                        setOpenModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg"
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
                        setCurrentPage(1); // reset page
                    }}
                    placeholder="Tìm chi nhánh..."
                    className="w-full pl-9 pr-3 py-2 border rounded-lg"
                />
            </div>

            {/* TABLE */}
            {loading ? (
                <LoadingSpinner />
            ) : (
                <>
                    <div className="bg-white rounded-xl shadow border">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left">Khu vực</th>
                                    <th className="text-center">Ngày tạo</th>
                                    <th className="text-center">Cập nhật</th>
                                    <th className="text-center">Hành động</th>
                                </tr>
                            </thead>

                            <tbody>
                                {paginatedData.map((item) => (
                                    <tr key={item.cinema_id} className="border-t">
                                        <td className="px-4 py-3">{item.full_location}</td>
                                        <td className="text-center">
                                            {formatDate(item.created_at)}
                                        </td>
                                        <td className="text-center">
                                            {formatDate(item.updated_at)}
                                        </td>
                                        <td className="text-center">
                                            <div className="flex justify-center gap-3">
                                                <Pencil
                                                    size={16}
                                                    className="text-blue-500 cursor-pointer"
                                                    onClick={() => handleEdit(item)}
                                                />
                                                <Trash2
                                                    size={16}
                                                    className={`cursor-pointer ${
                                                        deletingId === item.cinema_id
                                                            ? 'opacity-30 pointer-events-none'
                                                            : 'text-red-500'
                                                    }`}
                                                    onClick={() =>
                                                        setConfirmDelete({
                                                            show: true,
                                                            id: item.cinema_id
                                                        })
                                                    }
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
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
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
                    <div className="bg-white w-[350px] p-6 rounded-xl space-y-4">
                        <h3 className="font-semibold">{isEdit ? 'Chỉnh sửa' : 'Thêm khu vực'}</h3>

                        <input
                            value={form.city}
                            onChange={(e) => setForm({ ...form, city: e.target.value })}
                            placeholder="Thành phố"
                            className="w-full border p-2 rounded"
                        />

                        <input
                            value={form.district}
                            onChange={(e) => setForm({ ...form, district: e.target.value })}
                            placeholder="Quận"
                            className="w-full border p-2 rounded"
                        />

                        <div className="flex justify-end gap-2">
                            <button onClick={() => setOpenModal(false)}>Huỷ</button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
                            >
                                {submitting ? 'Đang xử lý...' : isEdit ? 'Cập nhật' : 'Thêm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CONFIRM DELETE */}
            {confirmDelete.show && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white w-[350px] rounded-xl p-6 space-y-4">
                        <h3 className="text-lg font-semibold text-red-600">Xác nhận xoá</h3>

                        <p>Bạn có chắc muốn xoá khu vực này?</p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setConfirmDelete({ show: false, id: null })}
                                className="px-4 py-2 border rounded"
                            >
                                Huỷ
                            </button>

                            <button
                                onClick={() => handleDelete(confirmDelete.id)}
                                className="px-4 py-2 bg-red-600 text-white rounded"
                            >
                                {deletingId ? 'Đang xoá...' : 'Xoá'}
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
