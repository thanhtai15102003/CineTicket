import { useState, useEffect } from 'react';
import {
    Search,
    Pencil,
    Image as ImageIcon,
    Calendar,
    Users,
    AlertCircle,
    RefreshCcw
} from 'lucide-react';
import Toast from '../../../components/common/Toast';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import Pagination from '../../../components/common/Pagination';

// URL của Backend Manager
const API_URL = 'https://cinema-api-production-f2bc.up.railway.app/api/v1/manager/combos';

// ==========================================
// CÁC HÀM TIỆN ÍCH (UTILS)
// ==========================================
const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
    };
};

export default function ManagerCombo() {
    const [combos, setCombos] = useState([]);
    const [search, setSearch] = useState('');
    const [tab, setTab] = useState('all');

    // Quản lý Modal Cập nhật
    const [openModal, setOpenModal] = useState(false);
    const [comboToEdit, setComboToEdit] = useState(null);

    // States UI/UX
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // State form (Chỉ cho phép sửa current_price và status)
    const [formData, setFormData] = useState({
        current_price: '',
        status: 'active'
    });

    // Phân trang
    const [page, setPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    const showToast = (message, type = 'success') => setToast({ show: true, message, type });

    // ==========================================
    // 1. API: LẤY DANH SÁCH COMBO
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

    // ==========================================
    // 2. API: CẬP NHẬT TRỰC TIẾP TRẠNG THÁI (TOGGLE)
    // ==========================================
    const toggleQuickStatus = async (combo) => {
        const newStatus = combo.status === 'active' ? 'inactive' : 'active';

        // Tối ưu UI: Cập nhật giao diện trước cho mượt
        setCombos((prev) =>
            prev.map((c) => (c.combo_id === combo.combo_id ? { ...c, status: newStatus } : c))
        );

        try {
            const response = await fetch(`${API_URL}/${combo.combo_id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    price: Number(combo.current_price), // 💡 Thêm dòng này để lừa Backend
                    current_price: Number(combo.current_price), // Giữ nguyên dòng này phòng hờ
                    status: newStatus
                })
            });

            // 💡 CỐ TÌNH ĐỌC KẾT QUẢ ĐỂ XEM BACKEND BÁO LỖI GÌ
            const result = await response.json().catch(() => null);

            if (!response.ok) {
                // In log ra màn hình console (F12) để xem cho rõ
                console.error('Bị Backend chặn lại với lỗi:', result);

                // Trích xuất câu lỗi từ JSON của Backend (nếu có)
                const errorMsg =
                    result?.message ||
                    (result?.errors && Object.values(result.errors).flat().join(', ')) ||
                    `Lỗi Server HTTP ${response.status}`;
                throw new Error(errorMsg);
            }

            if (newStatus === 'inactive') {
                showToast(`Đã khóa báo hết hàng cho: ${combo.combo_name} ⚠️`, 'warning');
            } else {
                showToast(`Đã mở bán lại: ${combo.combo_name} ✅`, 'success');
            }
        } catch (error) {
            // Nếu API bị lỗi, khôi phục lại trạng thái cũ trên giao diện
            setCombos((prev) =>
                prev.map((c) =>
                    c.combo_id === combo.combo_id ? { ...c, status: combo.status } : c
                )
            );

            // 💡 Hiện đúng câu lỗi của Backend ra thay vì câu "Lỗi khi cập nhật..." chung chung
            showToast(`Lỗi: ${error.message} ❌`, 'error');
        }
    };

    // ================== XỬ LÝ MỞ MODAL SỬA GIÁ ==================
    const handleOpenEdit = (combo) => {
        setComboToEdit(combo);
        setFormData({
            current_price: Number(combo.current_price) || 0,
            status: combo.status || 'active'
        });
        setOpenModal(true);
    };

    // Khôi phục giá gốc của Admin
    const handleResetPrice = () => {
        if (comboToEdit) {
            setFormData({ ...formData, current_price: Number(comboToEdit.original_price) });
        }
    };

    // ==========================================
    // 3. API: LƯU CẬP NHẬT (GIÁ VÀ TRẠNG THÁI) TRONG MODAL
    // Cập nhật lên {API_URL}/{comboId} bằng PUT
    // ==========================================
    const handleSaveCombo = async (e) => {
        e.preventDefault();

        const url = `${API_URL}/${comboToEdit.combo_id}`;
        const payload = {
            price: Number(formData.current_price),
            current_price: Number(formData.current_price),
            status: formData.status
        };

        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok) {
                // Cập nhật lại danh sách đang hiển thị
                setCombos((prev) =>
                    prev.map((c) =>
                        c.combo_id === comboToEdit.combo_id
                            ? { ...c, current_price: payload.current_price, status: payload.status }
                            : c
                    )
                );
                showToast('Cập nhật chính sách giá tại rạp thành công ✅');
                setOpenModal(false);
            } else {
                const errorMessage =
                    result.message ||
                    Object.values(result.errors || {})
                        .flat()
                        .join(', ');
                showToast(errorMessage || 'Dữ liệu không hợp lệ! ❌', 'error');
            }
        } catch (error) {
            console.error('Fetch Error:', error);
            showToast('Lỗi mạng hoặc máy chủ không phản hồi!', 'error');
        }
    };

    // ==========================================
    // BỘ LỌC DỮ LIỆU
    // ==========================================
    const filteredCombos = combos.filter((combo) => {
        const matchSearch = combo.combo_name?.toLowerCase().includes(search.toLowerCase());
        const matchTab = tab === 'all' || combo.status === tab;
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
                    <h2 className="text-2xl font-semibold">Quản lý Bắp Nước (Chi Nhánh)</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Điều chỉnh giá bán thực tế và báo cáo hết hàng tại rạp của bạn.
                    </p>
                </div>
            </div>

            {/* CẢNH BÁO QUYỀN HẠN */}
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="text-blue-500 shrink-0 mt-0.5" size={20} />
                <div className="text-sm text-blue-800">
                    <p className="font-bold mb-1">Lưu ý phân quyền hệ thống:</p>
                    <p>
                        Quản lý rạp <strong>không có quyền</strong> tạo mới hay xóa Combo (do Trụ sở
                        quản lý). Bạn chỉ được phép điều chỉnh{' '}
                        <strong>Giá bán tại rạp (Current Price)</strong> và chuyển trạng thái{' '}
                        <strong>Hết hàng (Inactive)</strong> nếu rạp cạn nguyên liệu.
                    </p>
                </div>
            </div>

            {/* BỘ LỌC */}
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1 md:pb-0">
                    {[
                        { label: 'Tất cả', value: 'all' },
                        { label: 'Đang mở bán', value: 'active' },
                        { label: 'Báo hết hàng', value: 'inactive' }
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
                                <th className="p-4 text-center">Gợi ý</th>
                                <th className="p-4 text-center">Lịch áp dụng</th>
                                <th className="p-4 text-right bg-gray-50/50">Giá Niêm yết</th>
                                <th className="p-4 text-right">Giá Tại Rạp</th>
                                <th className="p-4 text-center">Kho (Rạp)</th>
                                <th className="p-4 text-center">Hành động</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="text-center p-10">
                                        <LoadingSpinner />
                                    </td>
                                </tr>
                            ) : pagedCombos.length > 0 ? (
                                pagedCombos.map((combo) => (
                                    <tr
                                        key={combo.combo_id}
                                        className={`transition ${combo.status === 'inactive' ? 'bg-red-50/30' : 'hover:bg-gray-50'}`}
                                    >
                                        {/* Ảnh */}
                                        <td className="p-4">
                                            <div
                                                className={`w-16 h-16 bg-white border rounded-lg p-1.5 flex items-center justify-center shadow-sm ${combo.status === 'inactive' ? 'opacity-50 grayscale' : 'border-gray-100'}`}
                                            >
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

                                        {/* Thông tin */}
                                        <td className="p-4">
                                            <div
                                                className={`font-bold text-base ${combo.status === 'inactive' ? 'text-gray-400 line-through' : 'text-gray-800'}`}
                                            >
                                                {combo.combo_name}
                                            </div>
                                            <div
                                                className="text-sm text-gray-500 max-w-[200px] truncate mt-1"
                                                title={combo.description}
                                            >
                                                {combo.description}
                                            </div>
                                        </td>

                                        {/* Target Audience (Chỉ xem) */}
                                        <td className="p-4 text-center">
                                            <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-bold border border-blue-100">
                                                <Users size={14} />
                                                <span>
                                                    {Number(combo.target_audience) === 4
                                                        ? '4+ người'
                                                        : `${combo.target_audience} người`}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Lịch áp dụng (Chỉ xem) */}
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded-md border border-gray-200">
                                                <Calendar size={14} className="text-gray-500" />
                                                <span>
                                                    {combo.start_date && combo.end_date
                                                        ? `${formatDate(combo.start_date)} - ${formatDate(combo.end_date)}`
                                                        : 'Không có lịch'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Giá Gốc của Admin */}
                                        <td className="p-4 text-right bg-gray-50/50">
                                            <span className="font-semibold text-gray-400 text-sm">
                                                {Number(combo.original_price).toLocaleString(
                                                    'vi-VN'
                                                )}{' '}
                                                ₫
                                            </span>
                                        </td>

                                        {/* Giá Thực Tế đang bán */}
                                        <td className="p-4 text-right">
                                            <div className="flex flex-col items-end">
                                                <span
                                                    className={`font-black text-base ${combo.status === 'inactive' ? 'text-gray-400' : 'text-red-600'}`}
                                                >
                                                    {Number(combo.current_price).toLocaleString(
                                                        'vi-VN'
                                                    )}{' '}
                                                    ₫
                                                </span>
                                                {/* Hiển thị chênh lệch giá */}
                                                {Number(combo.current_price) >
                                                    Number(combo.original_price) && (
                                                    <span className="text-[10px] font-bold text-orange-500 mt-0.5 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100">
                                                        + Cao hơn niêm yết
                                                    </span>
                                                )}
                                                {Number(combo.current_price) <
                                                    Number(combo.original_price) && (
                                                    <span className="text-[10px] font-bold text-green-600 mt-0.5 bg-green-50 px-1.5 py-0.5 rounded border border-green-100">
                                                        - Đang khuyến mãi
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Trạng thái tắt/bật nóng */}
                                        <td className="p-4 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <div
                                                    onClick={() => toggleQuickStatus(combo)}
                                                    className={`w-11 h-6 flex items-center rounded-full cursor-pointer transition-colors duration-300 ${
                                                        combo.status === 'active'
                                                            ? 'bg-green-500'
                                                            : 'bg-gray-300'
                                                    }`}
                                                    title={
                                                        combo.status === 'active'
                                                            ? 'Click để báo hết hàng'
                                                            : 'Click để mở bán lại'
                                                    }
                                                >
                                                    <div
                                                        className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${combo.status === 'active' ? 'translate-x-6' : 'translate-x-1'}`}
                                                    />
                                                </div>
                                                <span
                                                    className={`text-[10px] font-bold uppercase tracking-wider ${combo.status === 'active' ? 'text-green-600' : 'text-gray-400'}`}
                                                >
                                                    {combo.status === 'active'
                                                        ? 'Có hàng'
                                                        : 'Hết hàng'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Hành động (Chỉ có Sửa giá) */}
                                        <td className="p-4">
                                            <div className="flex justify-center">
                                                <button
                                                    onClick={() => handleOpenEdit(combo)}
                                                    className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition font-medium text-sm flex items-center gap-2 border border-blue-200"
                                                >
                                                    <Pencil size={14} /> Sửa
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="p-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-3">
                                            <ImageIcon size={40} className="text-gray-300" />
                                            <p>Không tìm thấy combo nào.</p>
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

            {/* ================== MODAL SỬA GIÁ VÀ TRẠNG THÁI ================== */}
            {openModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
                            <h3 className="text-lg font-bold text-gray-800">
                                Điều chỉnh chính sách rạp
                            </h3>
                            <button
                                onClick={() => setOpenModal(false)}
                                className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-1.5 rounded-md transition"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSaveCombo} className="p-6 space-y-6">
                            {/* Thông tin readonly */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex gap-4 items-center">
                                <div className="w-16 h-16 bg-white border border-gray-200 rounded-lg p-1 shrink-0">
                                    {comboToEdit.image_url ? (
                                        <img
                                            src={comboToEdit.image_url}
                                            alt=""
                                            className="w-full h-full object-contain"
                                        />
                                    ) : (
                                        <ImageIcon className="w-full h-full text-gray-300 p-2" />
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800">
                                        {comboToEdit.combo_name}
                                    </h4>
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                        {comboToEdit.description}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex justify-between">
                                    <span>
                                        Giá bán tại rạp (VNĐ){' '}
                                        <span className="text-red-500">*</span>
                                    </span>
                                    <span className="text-gray-400 font-normal">
                                        Giá niêm yết:{' '}
                                        {Number(comboToEdit.original_price).toLocaleString('vi-VN')}{' '}
                                        ₫
                                    </span>
                                </label>
                                <div className="relative flex gap-2">
                                    <div className="relative flex-1">
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            value={formData.current_price}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    current_price: e.target.value
                                                })
                                            }
                                            className="w-full border border-gray-300 rounded-xl pl-4 pr-10 py-3 text-base font-black text-red-600 focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                                            ₫
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleResetPrice}
                                        title="Khôi phục về giá niêm yết"
                                        className="px-4 bg-gray-100 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition flex items-center justify-center"
                                    >
                                        <RefreshCcw size={18} />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Tình trạng nguyên liệu
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) =>
                                        setFormData({ ...formData, status: e.target.value })
                                    }
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition bg-white font-medium"
                                >
                                    <option value="active">🟢 Đủ nguyên liệu (Mở bán)</option>
                                    <option value="inactive">🔴 Hết ly/bắp (Tạm khóa)</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setOpenModal(false)}
                                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-bold"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-bold shadow-md shadow-blue-600/20 active:scale-95"
                                >
                                    Lưu thay đổi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
