import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
    Plus,
    Pencil,
    Trash2,
    Search,
    Link as LinkIcon,
    Calendar,
    ArrowUpDown,
    UploadCloud,
    X,
    AlertCircle
} from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────────────

const getStatus = (banner) => {
    if (!banner.active_toggle) return 'inactive';
    const now = new Date();
    const start = banner.start_date ? new Date(banner.start_date) : null;
    const end = banner.end_date ? new Date(banner.end_date) : null;
    if (end && now > end) return 'expired';
    if (start && now < start) return 'scheduled';
    return 'active';
};

const STATUS_CONFIG = {
    active: {
        label: 'Đang chạy',
        dot: 'bg-green-500',
        pill: 'bg-green-50 text-green-800 border-green-200'
    },
    inactive: {
        label: 'Đã ẩn',
        dot: 'bg-slate-400',
        pill: 'bg-slate-100 text-slate-600 border-slate-200'
    },
    scheduled: {
        label: 'Lên lịch',
        dot: 'bg-amber-500',
        pill: 'bg-amber-50 text-amber-800 border-amber-200'
    },
    expired: { label: 'Hết hạn', dot: 'bg-red-400', pill: 'bg-red-50 text-red-700 border-red-200' }
};

const fmtDate = (d) =>
    d
        ? new Date(d).toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
          })
        : '—';

const getNextOrder = (banners) =>
    banners.length ? Math.max(...banners.map((b) => b.display_order)) + 1 : 1;

// ─── StatusBadge ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status];
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.pill}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
};

// ─── Toggle ──────────────────────────────────────────────────────────────────

const Toggle = ({ checked, onChange, title }) => (
    <button
        onClick={() => onChange(!checked)}
        title={title}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
            checked ? 'bg-green-500' : 'bg-slate-300'
        }`}
    >
        <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                checked ? 'translate-x-[18px]' : 'translate-x-[3px]'
            }`}
        />
    </button>
);

// ─── ConfirmModal ────────────────────────────────────────────────────────────

const ConfirmModal = ({ isOpen, onConfirm, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 border border-slate-100">
                <h4 className="text-base font-semibold text-slate-800 mb-2">Xác nhận xóa banner</h4>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">
                    Hành động này không thể hoàn tác. Banner sẽ bị xóa vĩnh viễn khỏi hệ thống.
                </p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors"
                    >
                        Xóa banner
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Toast ───────────────────────────────────────────────────────────────────

const Toast = ({ message, onClose }) => {
    useEffect(() => {
        const t = setTimeout(onClose, 2800);
        return () => clearTimeout(t);
    }, [onClose]);

    return (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-sm text-slate-700 animate-fade-up">
            <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
            {message}
        </div>
    );
};

// ─── INITIAL FORM ─────────────────────────────────────────────────────────────

const makeEmptyForm = (nextOrder = 1) => ({
    title: '',
    image_url: '',
    target_url: '',
    display_order: nextOrder,
    start_date: '',
    end_date: ''
});

// ─── BannerFormModal ─────────────────────────────────────────────────────────

const BannerFormModal = ({ isOpen, onClose, onSubmit, initialData, existingOrders, editingId }) => {
    const isEdit = !!initialData;
    const fileInputRef = useRef(null);
    const [form, setForm] = useState(makeEmptyForm());
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        setError('');
        setForm(initialData ? { ...initialData } : makeEmptyForm());
    }, [isOpen, initialData]);

    const orderConflict = useMemo(() => {
        const v = parseInt(form.display_order);
        return existingOrders.includes(v) && v !== parseInt(initialData?.display_order);
    }, [form.display_order, existingOrders, initialData]);

    const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

    // In production: replace this with a real CDN upload API call
    const handleFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const fakeUrl = URL.createObjectURL(file);
        set('image_url', fakeUrl);
    };

    const validate = () => {
        const { title, image_url, target_url, start_date, end_date } = form;
        if (!title.trim()) return 'Vui lòng nhập tên chiến dịch.';
        if (!image_url) return 'Vui lòng tải lên hình ảnh banner.';
        if (!target_url.trim()) return 'Vui lòng nhập link đích.';
        if (target_url.trim() && !target_url.startsWith('/') && !target_url.startsWith('http'))
            return 'Link đích phải bắt đầu bằng / hoặc https://';
        if (start_date && end_date && new Date(end_date) <= new Date(start_date))
            return 'Ngày kết thúc phải sau ngày bắt đầu.';
        return '';
    };

    const handleSubmit = () => {
        const err = validate();
        if (err) {
            setError(err);
            return;
        }
        setSubmitting(true);
        setTimeout(() => {
            onSubmit({ ...form, display_order: parseInt(form.display_order) || 1 });
            setSubmitting(false);
            onClose();
        }, 500);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                    <h3 className="text-base font-semibold text-slate-800">
                        {isEdit ? 'Chỉnh sửa banner' : 'Tạo banner mới'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto space-y-5">
                    {error && (
                        <div className="flex items-start gap-2.5 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                            <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                            {error}
                        </div>
                    )}

                    {/* Title */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                            Tên chiến dịch <span className="text-red-500">*</span>
                        </label>
                        <input
                            value={form.title}
                            onChange={(e) => set('title', e.target.value)}
                            placeholder="VD: Khuyến mãi bắp nước 45K..."
                            className="w-full border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all"
                        />
                    </div>

                    {/* Image + URL */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                                Hình ảnh banner <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFile}
                            />
                            {!form.image_url ? (
                                <div
                                    onClick={() => fileInputRef.current.click()}
                                    className="w-full h-20 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center gap-1.5 text-slate-400 cursor-pointer hover:border-red-400 hover:bg-red-50 hover:text-red-500 transition-all"
                                >
                                    <UploadCloud size={18} />
                                    <span className="text-xs font-medium">Tải ảnh lên</span>
                                </div>
                            ) : (
                                <div
                                    onClick={() => fileInputRef.current.click()}
                                    className="relative w-full h-20 rounded-xl border border-slate-200 overflow-hidden group cursor-pointer"
                                >
                                    <img
                                        src={form.image_url}
                                        alt="preview"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center">
                                        <span className="text-white text-xs font-medium">
                                            Đổi ảnh
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1.5">
                                <LinkIcon size={12} /> Link đích{' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                value={form.target_url}
                                onChange={(e) => set('target_url', e.target.value)}
                                placeholder="/movies/12 hoặc /khuyen-mai"
                                className="w-full border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all"
                            />
                        </div>
                    </div>

                    {/* Order + Dates */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1.5">
                                <ArrowUpDown size={12} /> Thứ tự
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={form.display_order}
                                onChange={(e) => set('display_order', e.target.value)}
                                className={`w-full border p-2.5 rounded-xl text-sm text-center font-semibold outline-none transition-all ${
                                    orderConflict
                                        ? 'border-orange-400 bg-orange-50 focus:ring-2 focus:ring-orange-100'
                                        : 'border-slate-200 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                                }`}
                            />
                            {orderConflict && (
                                <p className="text-xs text-orange-500 mt-1">
                                    Thứ tự này đã tồn tại
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-emerald-600 mb-1.5">
                                Ngày bắt đầu
                            </label>
                            <input
                                type="datetime-local"
                                value={form.start_date}
                                onChange={(e) => set('start_date', e.target.value)}
                                className="w-full border border-slate-200 p-2.5 rounded-xl text-xs outline-none focus:border-emerald-400 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-red-500 mb-1.5">
                                Ngày kết thúc
                            </label>
                            <input
                                type="datetime-local"
                                value={form.end_date}
                                onChange={(e) => set('end_date', e.target.value)}
                                className="w-full border border-slate-200 p-2.5 rounded-xl text-xs outline-none focus:border-red-400 transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm disabled:opacity-60"
                    >
                        {submitting ? 'Đang xử lý...' : isEdit ? 'Lưu thay đổi' : 'Đăng banner'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── BannerTable ──────────────────────────────────────────────────────────────

const BannerTable = ({ data, onEdit, onDelete, onToggle }) => {
    if (!data.length) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-sm text-slate-400 shadow-sm">
                Không tìm thấy banner nào phù hợp.
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                        <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 w-24">
                            Hình ảnh
                        </th>
                        <th className="px-5 py-3.5 text-xs font-semibold text-slate-500">
                            Chiến dịch & link đích
                        </th>
                        <th className="px-5 py-3.5 text-xs font-semibold text-slate-500">
                            Thời gian
                        </th>
                        <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 text-center">
                            Thứ tự
                        </th>
                        <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 text-center">
                            Trạng thái
                        </th>
                        <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 text-center">
                            Hiển thị
                        </th>
                        <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 text-right">
                            Hành động
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {data.map((item) => {
                        const status = getStatus(item);
                        return (
                            <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                                <td className="px-5 py-3.5">
                                    <div className="w-20 h-9 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shadow-sm">
                                        <img
                                            src={item.image_url}
                                            alt="banner"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </td>
                                <td className="px-5 py-3.5">
                                    <p className="font-semibold text-slate-800 text-sm mb-1 leading-snug">
                                        {item.title}
                                    </p>
                                    <a
                                        href={item.target_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 max-w-[200px] truncate"
                                    >
                                        <LinkIcon size={10} className="flex-shrink-0" />
                                        {item.target_url}
                                    </a>
                                </td>
                                <td className="px-5 py-3.5">
                                    <div className="flex flex-col gap-1 text-xs text-slate-500">
                                        <span className="flex items-center gap-1.5">
                                            <Calendar size={11} className="text-emerald-500" />
                                            {fmtDate(item.start_date)}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Calendar size={11} className="text-red-400" />
                                            {fmtDate(item.end_date)}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-5 py-3.5 text-center">
                                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200">
                                        {item.display_order}
                                    </span>
                                </td>
                                <td className="px-5 py-3.5 text-center">
                                    <StatusBadge status={status} />
                                </td>
                                <td className="px-5 py-3.5 text-center">
                                    <Toggle
                                        checked={item.active_toggle}
                                        onChange={(val) => onToggle(item.id, val)}
                                        title={item.active_toggle ? 'Ẩn banner' : 'Hiện banner'}
                                    />
                                </td>
                                <td className="px-5 py-3.5">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => onEdit(item)}
                                            className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100"
                                            title="Chỉnh sửa"
                                        >
                                            <Pencil size={13} />
                                        </button>
                                        <button
                                            onClick={() => onDelete(item.id)}
                                            className="p-1.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
                                            title="Xóa"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

// ─── AdminBanner (Main) ───────────────────────────────────────────────────────

const FILTER_OPTIONS = [
    { key: 'all', label: 'Tất cả' },
    { key: 'active', label: 'Đang chạy' },
    { key: 'scheduled', label: 'Lên lịch' },
    { key: 'inactive', label: 'Đã ẩn' },
    { key: 'expired', label: 'Hết hạn' }
];

const INITIAL_BANNERS = [
    {
        id: 1,
        title: 'Đại tiệc bắp nước 45K',
        image_url: 'https://picsum.photos/id/1025/800/300',
        target_url: '/khuyen-mai',
        display_order: 1,
        active_toggle: true,
        start_date: '2026-04-01T00:00',
        end_date: '2026-07-31T23:59'
    },
    {
        id: 2,
        title: 'Ra mắt Avengers: Kỷ nguyên mới',
        image_url: 'https://picsum.photos/id/1011/800/300',
        target_url: '/movies/12',
        display_order: 2,
        active_toggle: true,
        start_date: '2026-05-01T00:00',
        end_date: '2026-06-15T23:59'
    },
    {
        id: 3,
        title: 'Combo học sinh sinh viên',
        image_url: 'https://picsum.photos/id/1060/800/300',
        target_url: '/combo-hssv',
        display_order: 3,
        active_toggle: false,
        start_date: '2026-06-01T00:00',
        end_date: '2026-08-31T23:59'
    },
    {
        id: 4,
        title: 'Flash sale cuối tuần — giảm 30%',
        image_url: 'https://picsum.photos/id/1074/800/300',
        target_url: '/flash-sale',
        display_order: 4,
        active_toggle: true,
        start_date: '2025-12-01T00:00',
        end_date: '2026-03-31T23:59'
    }
];

const AdminBanner = () => {
    const [banners, setBanners] = useState(INITIAL_BANNERS);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [modal, setModal] = useState({ open: false, data: null });
    const [confirm, setConfirm] = useState({ open: false, id: null });
    const [toast, setToast] = useState(null);

    const showToast = useCallback((msg) => setToast(msg), []);

    const filteredBanners = useMemo(() => {
        return banners
            .filter((b) => b.title.toLowerCase().includes(search.toLowerCase()))
            .filter((b) => filter === 'all' || getStatus(b) === filter)
            .sort((a, b) => a.display_order - b.display_order);
    }, [banners, search, filter]);

    const existingOrders = useMemo(() => banners.map((b) => b.display_order), [banners]);

    const handleToggle = (id, value) => {
        setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, active_toggle: value } : b)));
        showToast(value ? 'Đã bật hiển thị banner' : 'Đã ẩn banner');
    };

    const handleDelete = (id) => setConfirm({ open: true, id });

    const confirmDelete = () => {
        setBanners((prev) => prev.filter((b) => b.id !== confirm.id));
        setConfirm({ open: false, id: null });
        showToast('Đã xóa banner thành công');
    };

    const handleSubmit = (formData) => {
        if (modal.data) {
            setBanners((prev) =>
                prev.map((b) => (b.id === modal.data.id ? { ...b, ...formData } : b))
            );
            showToast('Cập nhật banner thành công');
        } else {
            setBanners((prev) => [...prev, { ...formData, id: Date.now(), active_toggle: true }]);
            showToast('Đăng banner mới thành công');
        }
    };

    const counts = useMemo(() => {
        const c = { all: banners.length, active: 0, scheduled: 0, inactive: 0, expired: 0 };
        banners.forEach((b) => {
            c[getStatus(b)]++;
        });
        return c;
    }, [banners]);

    return (
        <div className="space-y-5">
            {/* Page header */}
            <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                        Quản lý banner trang chủ
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Trạng thái tự động tính từ ngày bắt đầu / kết thúc
                    </p>
                </div>
                <button
                    onClick={() => setModal({ open: true, data: null })}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
                >
                    <Plus size={15} /> Thêm banner
                </button>
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Tìm theo tên chiến dịch..."
                        className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none transition-all w-64"
                    />
                </div>
                <div className="flex items-center gap-1.5">
                    {FILTER_OPTIONS.map((opt) => (
                        <button
                            key={opt.key}
                            onClick={() => setFilter(opt.key)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                                filter === opt.key
                                    ? 'bg-red-50 text-red-600 border-red-200'
                                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            {opt.label}
                            {counts[opt.key] > 0 && (
                                <span
                                    className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                                        filter === opt.key
                                            ? 'bg-red-100 text-red-700'
                                            : 'bg-slate-100 text-slate-500'
                                    }`}
                                >
                                    {counts[opt.key]}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <BannerTable
                data={filteredBanners}
                onEdit={(item) => setModal({ open: true, data: item })}
                onDelete={handleDelete}
                onToggle={handleToggle}
            />

            {/* Form modal */}
            <BannerFormModal
                isOpen={modal.open}
                initialData={modal.data}
                onClose={() => setModal({ open: false, data: null })}
                onSubmit={handleSubmit}
                existingOrders={existingOrders}
                editingId={modal.data?.id}
            />

            {/* Confirm delete modal */}
            <ConfirmModal
                isOpen={confirm.open}
                onConfirm={confirmDelete}
                onClose={() => setConfirm({ open: false, id: null })}
            />

            {/* Toast */}
            {toast && <Toast message={toast} onClose={() => setToast(null)} />}
        </div>
    );
};

export default AdminBanner;
