import { useState, useEffect } from 'react';
import { Plus, Pencil, Search } from 'lucide-react';
import axios from 'axios';

import Toast from '../../../components/common/Toast';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import Pagination from '../../../components/common/Pagination';

const BASE_URL = 'https://cinema-api-production-f2bc.up.railway.app/api/v1';

const Cinemas = () => {
    const [search, setSearch] = useState('');
    const [openModal, setOpenModal] = useState(false);

    const [form, setForm] = useState({
        cinema_name: '',
        branch: '',
        address: '',
        phone: '',
        map_url: '' // <-- THÊM MỚI
    });

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const [cinemas, setCinemas] = useState([]);
    const [regions, setRegions] = useState([]);

    const [isEdit, setIsEdit] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [toast, setToast] = useState({
        show: false,
        message: ''
    });

    const showToast = (msg) => {
        setToast({ show: true, message: msg });
    };

    useEffect(() => {
        fetchCinemas();
        fetchRegions();
    }, []);

    // ================== GET CINEMAS ==================
    const fetchCinemas = async () => {
        try {
            setLoading(true);

            const token = localStorage.getItem('token');

            const res = await axios.get(`${BASE_URL}/admin/cinemas`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const mapped = res.data.data.map((item) => ({
                id: item.cinema_id,
                cinema_name: item.cinema_name,
                branch: item.region?.city || '---',
                region_id: item.region?.region_id || '',
                address: item.address,
                phone: item.phone || '',
                map_url: item.map_url || '', // <-- THÊM MỚI
                status: item.status
            }));

            setCinemas(mapped);
        } catch {
            showToast('Lỗi load dữ liệu ❌');
        } finally {
            setLoading(false);
        }
    };

    // ================== GET REGIONS ==================
    const fetchRegions = async () => {
        try {
            const token = localStorage.getItem('token');

            const res = await axios.get(`${BASE_URL}/admin/regions`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setRegions(res.data.data);
        } catch {
            showToast('Lỗi load khu vực ❌');
        }
    };

    // ================== TOGGLE STATUS ==================
    const toggleStatus = async (id, currentStatus) => {
        try {
            const token = localStorage.getItem('token');

            const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

            await axios.patch(
                `${BASE_URL}/admin/cinemas/${id}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setCinemas((prev) =>
                prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
            );

            showToast('Cập nhật trạng thái 🎉');
        } catch {
            showToast('Lỗi cập nhật ❌');
        }
    };

    // ================== ADD / UPDATE ==================
    const handleSubmit = async () => {
        if (!form.cinema_name.trim()) {
            showToast('Nhập tên rạp ❗');
            return;
        }
        if (!form.branch) {
            showToast('Chọn khu vực ❗');
            return;
        }

        // ✅ check trùng
        const isDuplicate = cinemas.some(
            (c) =>
                c.cinema_name.trim().toLowerCase() === form.cinema_name.trim().toLowerCase() &&
                c.region_id === form.branch &&
                c.id !== editingId
        );

        if (isDuplicate) {
            showToast('Rạp đã tồn tại trong khu vực này ❌');
            return;
        }

        try {
            setSubmitting(true);

            const token = localStorage.getItem('token');

            // Payload chung cho cả PUT và POST
            const payload = {
                cinema_name: form.cinema_name,
                address: form.address,
                phone: form.phone,
                region_id: form.branch,
                map_url: form.map_url // <-- THÊM MỚI
            };

            if (isEdit) {
                await axios.put(`${BASE_URL}/admin/cinemas/${editingId}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                showToast('Cập nhật thành công 🎉');
            } else {
                await axios.post(`${BASE_URL}/admin/cinemas`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                showToast('Tạo thành công 🎉');
            }

            fetchCinemas();
            setOpenModal(false);
            resetForm();
        } catch {
            showToast('Lỗi xử lý hệ thống ❌');
        } finally {
            setSubmitting(false);
        }
    };

    // ================== EDIT ==================
    const handleEdit = (item) => {
        setForm({
            cinema_name: item.cinema_name,
            branch: item.region_id,
            address: item.address,
            phone: item.phone,
            map_url: item.map_url // <-- THÊM MỚI
        });

        setEditingId(item.id);
        setIsEdit(true);
        setOpenModal(true);
    };

    const resetForm = () => {
        setForm({
            cinema_name: '',
            branch: '',
            address: '',
            phone: '',
            map_url: '' // <-- THÊM MỚI
        });
        setIsEdit(false);
        setEditingId(null);
    };

    const filtered = cinemas.filter((c) =>
        (c.cinema_name + c.branch).toLowerCase().includes(search.toLowerCase())
    );
    // ===== PAGINATION =====
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filtered.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex justify-between">
                <h2 className="text-2xl font-semibold">Danh Sách Rạp</h2>

                <button
                    onClick={() => {
                        resetForm();
                        setOpenModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg"
                >
                    <Plus size={18} /> Tạo rạp
                </button>
            </div>

            {/* SEARCH */}
            <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm rạp..."
                    className="w-full pl-9 pr-3 py-2 border rounded-lg"
                />
            </div>

            {/* TABLE */}
            {loading ? (
                <LoadingSpinner />
            ) : (
                <div className="bg-white rounded-xl border overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left">Rạp</th>
                                <th className="px-4 py-3 text-left">Chi nhánh</th>
                                <th className="px-4 py-3 text-left">Địa chỉ</th>
                                <th className="px-4 py-3 text-left">SĐT</th>
                                <th className="px-4 py-3 text-center">Trạng thái</th>
                                <th className="px-4 py-3 text-center">Hành động</th>
                            </tr>
                        </thead>

                        <tbody>
                            {paginatedData.map((item) => (
                                <tr key={item.id} className="border-t hover:bg-gray-50">
                                    <td className="px-4 py-3">{item.cinema_name}</td>
                                    <td className="px-4 py-3">{item.branch}</td>
                                    <td className="px-4 py-3">{item.address}</td>
                                    <td className="px-4 py-3">{item.phone}</td>

                                    {/* STATUS */}
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() => toggleStatus(item.id, item.status)}
                                            className={`w-11 h-6 rounded-full ${
                                                item.status === 'active'
                                                    ? 'bg-green-500'
                                                    : 'bg-gray-300'
                                            }`}
                                        >
                                            <span
                                                className={`block w-4 h-4 bg-white rounded-full transition ${
                                                    item.status === 'active' ? 'translate-x-5' : ''
                                                }`}
                                            />
                                        </button>
                                    </td>

                                    {/* ACTION */}
                                    <td className="px-4 py-3">
                                        <div className="flex justify-center">
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

            {/* MODAL */}
            {openModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl space-y-4 w-[400px]">
                        <h3 className="font-semibold">{isEdit ? 'Chỉnh sửa rạp' : 'Tạo rạp'}</h3>

                        <input
                            value={form.cinema_name}
                            onChange={(e) => setForm({ ...form, cinema_name: e.target.value })}
                            placeholder="Tên rạp"
                            className="w-full border p-2 rounded focus:outline-none focus:border-red-500"
                        />

                        <select
                            value={form.branch}
                            onChange={(e) => setForm({ ...form, branch: e.target.value })}
                            className="w-full border p-2 rounded focus:outline-none focus:border-red-500"
                        >
                            <option value="">Chọn khu vực</option>
                            {regions.map((r) => (
                                <option key={r.region_id} value={r.region_id}>
                                    {r.city} - {r.district}
                                </option>
                            ))}
                        </select>

                        <input
                            value={form.address}
                            onChange={(e) => setForm({ ...form, address: e.target.value })}
                            placeholder="Địa chỉ"
                            className="w-full border p-2 rounded focus:outline-none focus:border-red-500"
                        />

                        <input
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            placeholder="SĐT"
                            className="w-full border p-2 rounded focus:outline-none focus:border-red-500"
                        />

                        {/* THÊM MỚI: Input nhập Map URL */}
                        <input
                            value={form.map_url}
                            onChange={(e) => setForm({ ...form, map_url: e.target.value })}
                            placeholder="Link Google Maps / iframe nhúng"
                            className="w-full border p-2 rounded focus:outline-none focus:border-red-500"
                        />

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                onClick={() => setOpenModal(false)}
                                className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition"
                            >
                                Huỷ
                            </button>

                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition disabled:opacity-70"
                            >
                                {submitting ? 'Đang xử lý...' : isEdit ? 'Cập nhật' : 'Thêm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* TOAST */}
            {toast.show && (
                <div className="fixed top-20 right-8 z-[200]">
                    <Toast
                        message={toast.message}
                        onClose={() => setToast({ show: false, message: '' })}
                    />
                </div>
            )}
        </div>
    );
};

export default Cinemas;
