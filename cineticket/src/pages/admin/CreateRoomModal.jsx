import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Check, X } from 'lucide-react';
import Toast from '../../components/common/Toast';

export function CreateRoomModal({ onClose, onCreate }) {
    const navigate = useNavigate();

    // 👉 Form State Tạo Phòng
    const [name, setName] = useState('');
    const [typeId, setTypeId] = useState('');
    const [layoutId, setLayoutId] = useState('');

    // State loading khi bấm tạo phòng
    const [isCreating, setIsCreating] = useState(false);

    // 👉 Data States từ API
    const [roomTypes, setRoomTypes] = useState([]);
    const [layouts, setLayouts] = useState([]);

    // 👉 Room Types Management State
    const [showTypeManager, setShowTypeManager] = useState(false);
    const [newTypeName, setNewTypeName] = useState('');
    const [newTypeDesc, setNewTypeDesc] = useState('');
    const [editingType, setEditingType] = useState(null);
    const [isSubmittingType, setIsSubmittingType] = useState(false);

    const [toast, setToast] = useState({ show: false, message: '' });
    const showToast = (message) => setToast({ show: true, message });
    const getToken = () => localStorage.getItem('token');

    // ================== FETCH DATA (TYPES & LAYOUTS) ==================
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const headers = {
                    Authorization: `Bearer ${getToken()}`,
                    Accept: 'application/json'
                };

                const [typesRes, layoutsRes] = await Promise.all([
                    fetch(
                        'https://cinema-api-production-f2bc.up.railway.app/api/v1/manager/room-types',
                        { headers }
                    ),
                    fetch(
                        'https://cinema-api-production-f2bc.up.railway.app/api/v1/manager/seat-layouts?status=active',
                        { headers }
                    )
                ]);

                const typesJson = await typesRes.json();
                const layoutsJson = await layoutsRes.json();

                const typesData = Array.isArray(typesJson?.data)
                    ? typesJson.data
                    : Array.isArray(typesJson)
                      ? typesJson
                      : [];
                setRoomTypes(typesData);
                if (typesData.length > 0) {
                    const firstActive = typesData.find((rt) => rt.status === 'active');
                    if (firstActive) setTypeId(firstActive.room_type_id);
                }

                const layoutsData = Array.isArray(layoutsJson?.data)
                    ? layoutsJson.data
                    : Array.isArray(layoutsJson)
                      ? layoutsJson
                      : [];
                setLayouts(layoutsData);
                if (layoutsData.length > 0) {
                    setLayoutId(layoutsData[0].layout_id || layoutsData[0].id);
                }
            } catch (error) {
                console.error('Lỗi fetch data khởi tạo:', error);
                showToast('Lỗi tải dữ liệu phòng chiếu ❌');
            }
        };

        fetchInitialData();
    }, []);

    const fetchRoomTypes = async () => {
        try {
            const res = await fetch(
                'https://cinema-api-production-f2bc.up.railway.app/api/v1/manager/room-types',
                {
                    headers: {
                        Authorization: `Bearer ${getToken()}`,
                        Accept: 'application/json'
                    }
                }
            );
            const json = await res.json();
            setRoomTypes(Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : []);
        } catch (error) {
            console.error(error);
        }
    };

    // ================== ADD ROOM TYPE ==================
    const handleAddType = async () => {
        if (!newTypeName.trim()) return showToast('Vui lòng nhập tên loại phòng ❗');
        try {
            setIsSubmittingType(true);
            const res = await fetch(
                'https://cinema-api-production-f2bc.up.railway.app/api/v1/manager/room-types',
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${getToken()}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: newTypeName.trim(),
                        description: newTypeDesc.trim(),
                        status: 'active'
                    })
                }
            );

            if (res.ok) {
                showToast('Thêm loại phòng thành công ✅');
                setNewTypeName('');
                setNewTypeDesc('');
                fetchRoomTypes();
            } else {
                showToast('Thêm thất bại ❌');
            }
        } catch (err) {
            showToast('Lỗi kết nối server ❌');
        } finally {
            setIsSubmittingType(false);
        }
    };

    // ================== UPDATE ROOM TYPE ==================
    const handleUpdateType = async () => {
        if (!editingType?.name.trim()) return;
        try {
            setIsSubmittingType(true);
            const res = await fetch(
                `https://cinema-api-production-f2bc.up.railway.app/api/v1/manager/room-types/${editingType.room_type_id}`,
                {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${getToken()}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: editingType.name.trim(),
                        description: editingType.description.trim(),
                        status: editingType.status
                    })
                }
            );

            if (res.ok) {
                showToast('Cập nhật thành công ✅');
                setEditingType(null);
                fetchRoomTypes();
            } else {
                showToast('Cập nhật thất bại ❌');
            }
        } catch (err) {
            showToast('Lỗi kết nối server ❌');
        } finally {
            setIsSubmittingType(false);
        }
    };

    // ================== TOGGLE STATUS TYPE ==================
    const handleToggleTypeStatus = async (rt) => {
        const newStatus = rt.status === 'active' ? 'inactive' : 'active';

        setRoomTypes((prev) =>
            prev.map((t) => (t.room_type_id === rt.room_type_id ? { ...t, status: newStatus } : t))
        );

        try {
            const res = await fetch(
                `https://cinema-api-production-f2bc.up.railway.app/api/v1/manager/room-types/${rt.room_type_id}`,
                {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${getToken()}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: rt.name,
                        description: rt.description,
                        status: newStatus
                    })
                }
            );

            if (!res.ok) throw new Error('Failed');
            showToast(`Đã ${newStatus === 'active' ? 'bật' : 'tắt'} loại phòng ✅`);

            if (newStatus === 'inactive' && typeId == rt.room_type_id) {
                const nextActive = roomTypes.find(
                    (t) => t.room_type_id !== rt.room_type_id && t.status === 'active'
                );
                setTypeId(nextActive ? nextActive.room_type_id : '');
            }
        } catch (err) {
            setRoomTypes((prev) =>
                prev.map((t) =>
                    t.room_type_id === rt.room_type_id ? { ...t, status: rt.status } : t
                )
            );
            showToast('Lỗi cập nhật trạng thái ❌');
        }
    };

    // ================== CREATE ROOM (KẾT NỐI API) ==================
    const handleCreate = async () => {
        if (!name.trim()) return showToast('Vui lòng nhập tên phòng chiếu ❗');
        if (!typeId) return showToast('Vui lòng chọn loại phòng ❗');
        if (!layoutId) return showToast('Vui lòng chọn khung sơ đồ ghế ❗');

        const selectedLayoutObj = layouts.find((l) => (l.layout_id || l.id) == layoutId);
        const capacityEstimate = selectedLayoutObj
            ? selectedLayoutObj.capacity ||
              selectedLayoutObj.row_count * selectedLayoutObj.column_count ||
              0
            : 0;

        setIsCreating(true);

        try {
            const payload = {
                room_name: name.trim(),
                room_type_id: Number(typeId),
                seat_layout_id: Number(layoutId), // Đổi layout_id thành seat_layout_id
                capacity: capacityEstimate,
                status: 'active',
                cinema_id: 2 // Đừng quên truyền ID của rạp nếu API bắt buộc nhé
            };

            const res = await fetch(
                'https://cinema-api-production-f2bc.up.railway.app/api/v1/manager/rooms',
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${getToken()}`,
                        'Content-Type': 'application/json',
                        Accept: 'application/json'
                    },
                    body: JSON.stringify(payload)
                }
            );

            const result = await res.json();

            if (res.ok) {
                setToast({ show: true, message: 'Tạo phòng thành công 🎉' });

                // Gọi onCreate để component cha (Rooms.jsx) fetch lại data
                if (onCreate) onCreate();

                // Lấy ID phòng vừa tạo để chuyển hướng đến trang chỉnh sửa layout của phòng đó
                const newRoomId = result.data?.room_id || result.room_id;

                setTimeout(() => {
                    if (newRoomId) {
                        navigate(`/admin/seat-layout/${layoutId}`);
                    }
                    onClose();
                }, 1000);
            } else {
                showToast(result.message || 'Tạo phòng thất bại ❌');
            }
        } catch (error) {
            console.error('Lỗi khi tạo phòng:', error);
            showToast('Lỗi kết nối server ❌');
        } finally {
            setIsCreating(false);
        }
    };

    const currentSelectedLayout = layouts.find((l) => (l.layout_id || l.id) == layoutId);
    const calculatedCapacity = currentSelectedLayout
        ? currentSelectedLayout.capacity ||
          currentSelectedLayout.row_count * currentSelectedLayout.column_count ||
          0
        : 0;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]">
            {toast.show && (
                <Toast
                    message={toast.message}
                    onClose={() => setToast({ show: false, message: '' })}
                />
            )}

            <div className="bg-white w-[500px] max-h-[90vh] flex flex-col rounded-2xl shadow-2xl animate-fade-in-up">
                {/* Header Modal */}
                <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50 rounded-t-2xl">
                    <h2 className="text-xl font-bold text-gray-800">Tạo phòng chiếu mới</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body Modal */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {/* Tên phòng */}
                    <div className="mb-4">
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                            Tên phòng chiếu <span className="text-red-500">*</span>
                        </label>
                        <input
                            placeholder="VD: Phòng 1 - IMAX"
                            className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    {/* Loại phòng */}
                    <div className="mb-5 bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-gray-700">
                                Loại phòng <span className="text-red-500">*</span>
                            </label>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowTypeManager(!showTypeManager);
                                    setEditingType(null);
                                }}
                                className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 transition"
                            >
                                <Plus size={14} />
                                {showTypeManager ? 'Ẩn quản lý' : 'Quản lý loại phòng'}
                            </button>
                        </div>

                        <select
                            className="w-full border border-gray-300 px-4 py-2.5 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-500/50 transition"
                            value={typeId}
                            onChange={(e) => setTypeId(e.target.value)}
                        >
                            <option value="" disabled>
                                -- Chọn loại phòng --
                            </option>
                            {roomTypes
                                .filter((rt) => rt.status === 'active')
                                .map((rt) => (
                                    <option key={rt.room_type_id} value={rt.room_type_id}>
                                        {rt.name}
                                    </option>
                                ))}
                        </select>

                        {/* ===== BẢNG QUẢN LÝ LOẠI PHÒNG ===== */}
                        {showTypeManager && (
                            <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                                {/* Thêm mới */}
                                <div className="flex flex-col gap-2">
                                    <div className="flex gap-2">
                                        <input
                                            placeholder="Tên loại (VD: IMAX)"
                                            value={newTypeName}
                                            onChange={(e) => setNewTypeName(e.target.value)}
                                            className="flex-1 border p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddType}
                                            disabled={isSubmittingType || !newTypeName.trim()}
                                            className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 disabled:opacity-50 transition"
                                        >
                                            Thêm
                                        </button>
                                    </div>
                                    <input
                                        placeholder="Mô tả (Tùy chọn)"
                                        value={newTypeDesc}
                                        onChange={(e) => setNewTypeDesc(e.target.value)}
                                        className="w-full border p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30"
                                    />
                                </div>

                                {/* Danh sách */}
                                <div className="max-h-40 overflow-y-auto bg-white border rounded-lg p-2 space-y-1">
                                    {roomTypes.length === 0 ? (
                                        <p className="text-center text-xs text-gray-400 py-2">
                                            Chưa có loại phòng nào
                                        </p>
                                    ) : (
                                        roomTypes.map((rt) => (
                                            <div
                                                key={rt.room_type_id}
                                                className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md group"
                                            >
                                                {editingType?.room_type_id === rt.room_type_id ? (
                                                    <div className="flex-1 flex gap-2">
                                                        <input
                                                            value={editingType.name}
                                                            onChange={(e) =>
                                                                setEditingType({
                                                                    ...editingType,
                                                                    name: e.target.value
                                                                })
                                                            }
                                                            className="w-1/2 border-b border-gray-400 px-1 text-sm focus:outline-none focus:border-red-500 bg-transparent"
                                                            autoFocus
                                                        />
                                                        <input
                                                            value={editingType.description || ''}
                                                            onChange={(e) =>
                                                                setEditingType({
                                                                    ...editingType,
                                                                    description: e.target.value
                                                                })
                                                            }
                                                            className="w-1/2 border-b border-gray-400 px-1 text-sm focus:outline-none focus:border-red-500 bg-transparent"
                                                            placeholder="Mô tả"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={handleUpdateType}
                                                            className="text-green-600 hover:bg-green-100 p-1 rounded"
                                                        >
                                                            <Check size={16} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setEditingType(null)}
                                                            className="text-gray-500 hover:bg-gray-200 p-1 rounded"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="flex-1">
                                                            <p className="text-sm font-semibold text-gray-700">
                                                                {rt.name}
                                                            </p>
                                                            {rt.description && (
                                                                <p className="text-xs text-gray-400 truncate w-32">
                                                                    {rt.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div
                                                            onClick={() =>
                                                                handleToggleTypeStatus(rt)
                                                            }
                                                            className={`w-9 h-5 flex items-center rounded-full cursor-pointer transition-colors duration-300 ${
                                                                rt.status === 'active'
                                                                    ? 'bg-green-500'
                                                                    : 'bg-gray-300'
                                                            }`}
                                                        >
                                                            <div
                                                                className={`w-3.5 h-3.5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${rt.status === 'active' ? 'translate-x-4.5 ml-1' : 'translate-x-1'}`}
                                                            />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => setEditingType(rt)}
                                                            className="text-blue-500 hover:bg-blue-100 p-1 rounded opacity-0 group-hover:opacity-100 transition"
                                                        >
                                                            <Pencil size={15} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Khung sơ đồ ghế (Fetch từ API) */}
                    <div className="mb-2">
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                            Khung sơ đồ ghế <span className="text-red-500">*</span>
                        </label>
                        <select
                            className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50 transition bg-white"
                            value={layoutId}
                            onChange={(e) => setLayoutId(e.target.value)}
                        >
                            <option value="" disabled>
                                -- Chọn mẫu sơ đồ --
                            </option>
                            {layouts.map((l) => (
                                <option key={l.layout_id || l.id} value={l.layout_id || l.id}>
                                    {l.name}
                                </option>
                            ))}
                        </select>
                        {layoutId && (
                            <p className="text-sm text-gray-500 mt-2 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
                                Sức chứa ước tính:{' '}
                                <span className="font-bold text-gray-700">
                                    {calculatedCapacity > 0
                                        ? `${calculatedCapacity} ghế`
                                        : 'Chưa xác định'}
                                </span>
                            </p>
                        )}
                    </div>
                </div>

                {/* Footer Modal */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-medium border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
                    >
                        Hủy thao tác
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={isCreating}
                        className="px-6 py-2.5 text-sm font-bold bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 active:scale-95 transition flex items-center gap-2"
                    >
                        {isCreating ? 'Đang tạo phòng...' : 'Khởi tạo phòng chiếu'}
                    </button>
                </div>
            </div>
        </div>
    );
}
