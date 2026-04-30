import { useState, useEffect } from 'react';
import { Search, Plus, Pencil, Image as ImageIcon, Calendar, Users, Upload } from 'lucide-react';
import Toast from '../../../components/common/Toast';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import Pagination from '../../../components/common/Pagination';

// URL của Backend
const API_URL = 'https://cinema-api-production-f2bc.up.railway.app/api/v1/admin/combos';

// ==========================================
// CÁC HÀM TIỆN ÍCH (UTILS)
// ==========================================
const getComboStatus = (startDate, endDate) => {
    if (!startDate || !endDate) return 'active';

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    if (now < start) return 'upcoming';
    if (now > end) return 'expired';
    return 'active';
};

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);

    // JS tự động hiểu múi giờ hiện tại của máy tính
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
    };
};

export default function AdminCombo() {
    const [combos, setCombos] = useState([]);
    const [search, setSearch] = useState('');
    const [tab, setTab] = useState('all');

    // Quản lý Modal
    const [openModal, setOpenModal] = useState(false);
    const [comboToEdit, setComboToEdit] = useState(null);

    // States UI/UX
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // Phân trang nội bộ
    const [page, setPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    // State Form
    const [formData, setFormData] = useState({
        combo_name: '',
        price: '',
        description: '',
        image_url: '',
        start_date: '',
        end_date: '',
        target_audience: 1,
        status: 'active'
    });

    const showToast = (message, type = 'success') => setToast({ show: true, message, type });

    // ==========================================
    // 1. LẤY DANH SÁCH COMBO
    // ==========================================
    const fetchCombos = async () => {
        setLoading(true);
        try {
            const response = await fetch(API_URL, {
                headers: getAuthHeaders()
            });

            if (!response.ok) throw new Error('Failed to fetch');

            const data = await response.json();
            setCombos(data.data || data || []);
        } catch (error) {
            console.error('Lỗi fetch combos:', error);
            showToast('Không thể lấy dữ liệu từ máy chủ!', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCombos();
    }, []);

    useEffect(() => setPage(1), [search, tab]);

    const handleOpenCreate = () => {
        setComboToEdit(null);
        setFormData({
            combo_name: '',
            price: '',
            description: '',
            image_url: '',
            start_date: '',
            end_date: '',
            target_audience: 1,
            status: 'active'
        });
        setOpenModal(true);
    };

    const handleOpenEdit = (combo) => {
        setComboToEdit(combo);
        setFormData({
            ...combo,
            start_date: formatDate(combo.start_date),
            end_date: formatDate(combo.end_date),
            price: Number(combo.price) || 0,
            target_audience: Number(combo.target_audience) || 1,
            status: combo.status || 'active'
        });
        setOpenModal(true);
    };

    // ==========================================
    // 2. THÊM / CẬP NHẬT COMBO
    // ==========================================
    const handleSaveCombo = async (e) => {
        e.preventDefault();

        if (formData.start_date && formData.end_date) {
            if (new Date(formData.start_date) > new Date(formData.end_date)) {
                showToast('Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu! ❌', 'error');
                return;
            }
        }

        const isEditing = !!comboToEdit;
        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing ? `${API_URL}/${comboToEdit.combo_id}` : API_URL;

        try {
            // 💡 XỬ LÝ DỮ LIỆU ĐỂ PASS QUA VALIDATION CỦA BACKEND
            let finalImageUrl = formData.image_url;

            // Nếu là link do chọn ảnh từ máy tính (blob:) thì bắt buộc gán null
            if (finalImageUrl && finalImageUrl.startsWith('blob:')) {
                finalImageUrl = null;
            }

            const payload = {
                combo_name: formData.combo_name,
                price: Number(formData.price),
                description: formData.description || null,
                image_url: finalImageUrl,
                target_audience: Number(formData.target_audience),
                status: formData.status || 'active',
                start_date: formData.start_date || null,
                end_date: formData.end_date || null
            };

            const response = await fetch(url, {
                method: method,
                headers: getAuthHeaders(),
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok) {
                const savedCombo = result.data || result;

                if (isEditing) {
                    setCombos((prev) =>
                        prev.map((c) => (c.combo_id === savedCombo.combo_id ? savedCombo : c))
                    );
                    showToast('Cập nhật combo thành công ✅');
                } else {
                    setCombos((prev) => [savedCombo, ...prev]);
                    showToast('Thêm combo mới thành công ✅');
                }
                setOpenModal(false);
            } else {
                // Hiển thị chi tiết lỗi từ Backend
                const errorMessage =
                    result.message ||
                    Object.values(result.errors || {})
                        .flat()
                        .join(', ');
                showToast(errorMessage || 'Dữ liệu không hợp lệ! ❌', 'error');
                console.error('Lỗi Validation:', result);
            }
        } catch (error) {
            console.error('Fetch Error:', error);
            showToast('Lỗi mạng hoặc máy chủ không phản hồi!', 'error');
        }
    };

    // ==========================================
    // RENDER LOGIC
    // ==========================================
    const filteredCombos = combos.filter((combo) => {
        const matchSearch = combo.combo_name?.toLowerCase().includes(search.toLowerCase());
        const status = getComboStatus(combo.start_date, combo.end_date);
        const matchTab =
            tab === 'all' ||
            (tab === 'active' && status === 'active') ||
            (tab === 'upcoming' && status === 'upcoming') ||
            (tab === 'expired' && status === 'expired');
        return matchSearch && matchTab;
    });

    const totalPages = Math.ceil(filteredCombos.length / ITEMS_PER_PAGE);
    useEffect(() => {
        if (page > totalPages && totalPages > 0) setPage(totalPages);
    }, [totalPages, page]);

    const pagedCombos = filteredCombos.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    return (
        <div className="p-6 bg-gray-100 min-h-screen text-gray-800">
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ show: false, message: '', type: 'success' })}
                />
            )}

            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-semibold">Danh sách Bắp Nước (Combo)</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Quản lý bắp nước và cấu hình gợi ý tự động (Auto-Upselling).
                    </p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-lg hover:bg-red-700 transition font-medium shadow-sm"
                >
                    <Plus size={18} /> Thêm Combo mới
                </button>
            </div>

            {/* BỘ LỌC */}
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1 md:pb-0">
                    {[
                        { label: 'Tất cả', value: 'all' },
                        { label: 'Đang bán', value: 'active' },
                        { label: 'Sắp bán', value: 'upcoming' },
                        { label: 'Ngừng bán', value: 'expired' }
                    ].map((item) => (
                        <button
                            key={item.value}
                            onClick={() => setTab(item.value)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition whitespace-nowrap ${tab === item.value ? 'bg-red-600 text-white border-red-600 shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'}`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center bg-white border border-gray-200 px-4 py-2 rounded-lg w-full md:w-80 focus-within:ring-2 focus-within:ring-red-100 focus-within:border-red-400 transition shadow-sm shrink-0">
                    <Search size={18} className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm tên combo..."
                        className="ml-3 outline-none w-full text-sm text-gray-700"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* BẢNG DỮ LIỆU */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-sm font-medium text-gray-500 border-b border-gray-200">
                            <tr>
                                <th className="p-4 w-24">Hình ảnh</th>
                                <th className="p-4">Thông tin Combo</th>
                                <th className="p-4 text-center">Gợi ý tự động</th>
                                <th className="p-4">Lịch áp dụng</th>
                                <th className="p-4 text-right">Giá bán</th>
                                <th className="p-4 text-center">Trạng thái</th>
                                <th className="p-4 text-center">Hành động</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="text-center p-10">
                                        <LoadingSpinner />
                                    </td>
                                </tr>
                            ) : pagedCombos.length > 0 ? (
                                pagedCombos.map((combo) => {
                                    const status = getComboStatus(combo.start_date, combo.end_date);
                                    return (
                                        <tr
                                            key={combo.combo_id}
                                            className="hover:bg-gray-50 transition"
                                        >
                                            <td className="p-4">
                                                <div className="w-16 h-16 bg-white border border-gray-100 rounded-lg p-1.5 flex items-center justify-center shadow-sm">
                                                    {combo.image_url ? (
                                                        <img
                                                            src={combo.image_url}
                                                            alt=""
                                                            className="w-full h-full object-contain"
                                                        />
                                                    ) : (
                                                        <ImageIcon
                                                            size={24}
                                                            className="text-gray-300"
                                                        />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-bold text-gray-800 text-base">
                                                    {combo.combo_name}
                                                </div>
                                                <div
                                                    className="text-sm text-gray-500 max-w-[200px] truncate mt-1"
                                                    title={combo.description}
                                                >
                                                    {combo.description}
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-blue-100">
                                                    <Users size={14} />
                                                    <span>
                                                        {Number(combo.target_audience) === 4
                                                            ? '4+ người'
                                                            : `${combo.target_audience} người`}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2 text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded-md w-fit border border-gray-200">
                                                    <Calendar size={14} className="text-gray-500" />
                                                    <span>
                                                        {combo.start_date && combo.end_date
                                                            ? `${formatDate(combo.start_date)} - ${formatDate(combo.end_date)}`
                                                            : 'Chưa có lịch'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <span className="font-semibold text-gray-900">
                                                    {Number(combo.price).toLocaleString('vi-VN')} ₫
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                {status === 'active' && (
                                                    <span className="px-3 py-1.5 bg-green-100 text-green-600 text-xs rounded-lg font-bold flex items-center justify-center gap-1.5 w-fit mx-auto">
                                                        Đang bán
                                                    </span>
                                                )}
                                                {status === 'upcoming' && (
                                                    <span className="px-3 py-1.5 bg-blue-100 text-blue-600 text-xs rounded-lg font-bold flex items-center justify-center gap-1.5 w-fit mx-auto">
                                                        Sắp bán
                                                    </span>
                                                )}
                                                {status === 'expired' && (
                                                    <span className="px-3 py-1.5 bg-gray-100 text-gray-500 text-xs rounded-lg font-bold border border-gray-200 flex items-center justify-center gap-1.5 w-fit mx-auto">
                                                        Ngừng bán
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex justify-center gap-3">
                                                    <button
                                                        onClick={() => handleOpenEdit(combo)}
                                                        className="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <Pencil size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="7" className="p-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-3">
                                            <ImageIcon size={40} className="text-gray-300" />
                                            <p>Không tìm thấy combo nào phù hợp.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Phân trang */}
                {!loading && filteredCombos.length > 0 && (
                    <div className="py-4 px-6 border-t border-gray-100 bg-white mt-auto">
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={setPage}
                        />
                    </div>
                )}
            </div>

            {/* ================== MODAL FORM THÊM/SỬA COMBO ================== */}
            {openModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
                            <h3 className="text-lg font-bold text-gray-800">
                                {comboToEdit ? 'Chỉnh sửa Combo' : 'Thêm Combo mới'}
                            </h3>
                            <button
                                onClick={() => setOpenModal(false)}
                                className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-1.5 rounded-md transition"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSaveCombo} className="p-6 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Tên Combo <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.combo_name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, combo_name: e.target.value })
                                        }
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition"
                                        placeholder="Ví dụ: Combo Couple Tiết Kiệm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                                        <span className="text-orange-500">✨</span> Gợi ý tự động
                                        (Auto-Upsell) <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        required
                                        value={formData.target_audience}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                target_audience: e.target.value
                                            })
                                        }
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition bg-white font-medium text-gray-700"
                                    >
                                        <option value={1}>
                                            Gợi ý khi khách đặt 1 vé (Khách lẻ)
                                        </option>
                                        <option value={2}>
                                            Gợi ý khi khách đặt 2 vé (Cặp đôi)
                                        </option>
                                        <option value={3}>
                                            Gợi ý khi khách đặt 3 vé (Nhóm bạn)
                                        </option>
                                        <option value={4}>
                                            Gợi ý khi khách đặt 4+ vé (Gia đình)
                                        </option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Giá bán (VNĐ) <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            value={formData.price}
                                            onChange={(e) =>
                                                setFormData({ ...formData, price: e.target.value })
                                            }
                                            className="w-full border border-gray-300 rounded-xl pl-4 pr-10 py-2.5 text-sm font-bold focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition"
                                            placeholder="99000"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">
                                            ₫
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Từ ngày
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.start_date || ''}
                                        onChange={(e) =>
                                            setFormData({ ...formData, start_date: e.target.value })
                                        }
                                        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition text-gray-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Đến ngày
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.end_date || ''}
                                        onChange={(e) =>
                                            setFormData({ ...formData, end_date: e.target.value })
                                        }
                                        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition text-gray-700"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Mô tả thành phần
                                </label>
                                <textarea
                                    rows="2"
                                    value={formData.description || ''}
                                    onChange={(e) =>
                                        setFormData({ ...formData, description: e.target.value })
                                    }
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition resize-none"
                                    placeholder="1 bắp lớn + 2 nước ngọt..."
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Hình ảnh Combo
                                </label>
                                <div className="flex gap-4 items-start">
                                    <div className="relative w-24 h-24 border-2 border-dashed border-gray-300 hover:border-red-400 rounded-xl bg-gray-50 flex flex-col items-center justify-center shrink-0 overflow-hidden group transition cursor-pointer">
                                        {formData.image_url ? (
                                            <>
                                                <img
                                                    src={formData.image_url}
                                                    alt="Preview"
                                                    className="w-full h-full object-contain p-1"
                                                />
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                    <span className="text-white text-xs font-semibold">
                                                        Đổi ảnh
                                                    </span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center p-2 flex flex-col items-center gap-1">
                                                <Upload
                                                    size={20}
                                                    className="text-gray-400 group-hover:text-red-500 transition-colors"
                                                />
                                                <span className="text-[10px] text-gray-500 font-medium group-hover:text-red-500">
                                                    Tải ảnh lên
                                                </span>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            title="Chọn ảnh từ máy tính"
                                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    const previewUrl = URL.createObjectURL(file);
                                                    setFormData({
                                                        ...formData,
                                                        image_url: previewUrl,
                                                        image_file: file
                                                    });
                                                    // Nếu chọn file thì báo nhẹ cho user biết là đang dùng API URL
                                                    showToast(
                                                        'Tạm thời hệ thống chỉ lưu Link URL. Link gốc sẽ bị xóa khi lưu',
                                                        'success'
                                                    );
                                                }
                                            }}
                                        />
                                    </div>
                                    <div className="flex-1 space-y-2 mt-1">
                                        <input
                                            type="url"
                                            value={formData.image_url || ''}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    image_url: e.target.value,
                                                    image_file: null
                                                })
                                            }
                                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition"
                                            placeholder="Hoặc dán link web ảnh (https://...) vào đây"
                                        />
                                        <p className="text-xs text-gray-500 mt-2">
                                            * Để lưu thành công, hãy đảm bảo dán link ảnh hợp lệ bắt
                                            đầu bằng <b>http://</b> hoặc <b>https://</b>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setOpenModal(false)}
                                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-bold"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-bold shadow-md shadow-red-600/20 active:scale-95"
                                >
                                    {comboToEdit ? 'Lưu thay đổi' : 'Thêm Combo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
