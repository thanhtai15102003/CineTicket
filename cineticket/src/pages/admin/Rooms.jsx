import { useState, useEffect } from 'react';
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CreateRoomModal } from './CreateRoomModal';
import Toast from '../../components/common/Toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';

export default function Rooms() {
    const navigate = useNavigate();

    const [rooms, setRooms] = useState([]);
    const [search, setSearch] = useState('');
    const [tab, setTab] = useState('all');

    // Quản lý Modal
    const [openModal, setOpenModal] = useState(false);
    const [roomToEdit, setRoomToEdit] = useState(null); // Biến chứa dữ liệu phòng cần sửa

    // States cho UI/UX
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ show: false, message: '' });
    const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });

    // State phân trang
    const [page, setPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    const showToast = (message) => setToast({ show: true, message });
    const getToken = () => localStorage.getItem('token');

    // ================== FETCH ROOMS ==================
    const fetchRooms = async () => {
        try {
            setLoading(true);
            const res = await fetch(
                'https://cinema-api-production-f2bc.up.railway.app/api/v1/manager/rooms',
                {
                    headers: {
                        Authorization: `Bearer ${getToken()}`,
                        Accept: 'application/json'
                    }
                }
            );
            const json = await res.json();

            if (res.ok) {
                const dataArray = Array.isArray(json?.data)
                    ? json.data
                    : Array.isArray(json)
                      ? json
                      : [];
                setRooms(dataArray);
            } else {
                showToast('Không thể tải danh sách phòng chiếu ❌');
            }
        } catch (error) {
            console.error('Fetch rooms error:', error);
            showToast('Lỗi kết nối server ❌');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    // Reset về trang 1 khi thay đổi tìm kiếm hoặc chuyển tab
    useEffect(() => {
        setPage(1);
    }, [search, tab]);

    // ================== TOGGLE STATUS ==================
    const toggleStatus = async (room) => {
        const newStatus = room.status === 'active' ? 'inactive' : 'active';

        // Cập nhật UI ngay lập tức (Optimistic Update)
        setRooms((prev) =>
            prev.map((r) => (r.room_id === room.room_id ? { ...r, status: newStatus } : r))
        );

        try {
            const res = await fetch(
                `https://cinema-api-production-f2bc.up.railway.app/api/v1/manager/rooms/${room.room_id}`,
                {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${getToken()}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        room_name: room.room_name,
                        capacity: room.capacity,
                        room_type: room.room_type,
                        status: newStatus
                    })
                }
            );

            if (!res.ok) {
                throw new Error('Update failed');
            }
            showToast(`Đã ${newStatus === 'active' ? 'mở' : 'đóng'} phòng chiếu ✅`);
        } catch (error) {
            setRooms((prev) =>
                prev.map((r) => (r.room_id === room.room_id ? { ...r, status: room.status } : r))
            );
            showToast('Lỗi khi cập nhật trạng thái ❌');
        }
    };

    // ================== DELETE ROOM ==================
    const handleDelete = async (id) => {
        setConfirmDelete({ show: false, id: null });
        try {
            const res = await fetch(
                `https://cinema-api-production-f2bc.up.railway.app/api/v1/manager/rooms/${id}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${getToken()}`,
                        Accept: 'application/json'
                    }
                }
            );

            if (res.ok) {
                showToast('Đã xóa phòng chiếu thành công 🗑️');
                setRooms((prev) => prev.filter((r) => r.room_id !== id));
            } else {
                showToast('Xóa phòng chiếu thất bại ❌');
            }
        } catch (error) {
            showToast('Lỗi kết nối server ❌');
        }
    };

    // ================== ACTIONS MỞ MODAL ==================
    const handleOpenCreate = () => {
        setRoomToEdit(null); // Reset rỗng để form tạo mới
        setOpenModal(true);
    };

    const handleOpenEdit = (room) => {
        setRoomToEdit(room); // Truyền dữ liệu cũ vào để form biết đang Sửa
        setOpenModal(true);
    };

    // ================== FILTERING & PAGINATION ==================
    const filteredRooms = rooms.filter((room) => {
        const matchSearch = room.room_name?.toLowerCase().includes(search.toLowerCase());
        const matchTab =
            tab === 'all' ||
            (tab === 'active' && room.status === 'active') ||
            (tab === 'inactive' && room.status !== 'active');

        return matchSearch && matchTab;
    });

    const totalPages = Math.ceil(filteredRooms.length / ITEMS_PER_PAGE);

    useEffect(() => {
        if (page > totalPages && totalPages > 0) {
            setPage(totalPages);
        }
    }, [totalPages, page]);

    const pagedRooms = filteredRooms.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    return (
        <div className="p-6 bg-gray-100 min-h-screen text-gray-800">
            {toast.show && (
                <Toast
                    message={toast.message}
                    onClose={() => setToast({ show: false, message: '' })}
                />
            )}

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Danh sách phòng chiếu</h2>

                <button
                    onClick={handleOpenCreate}
                    className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                >
                    <Plus size={18} /> Tạo phòng chiếu
                </button>
            </div>

            {/* Tabs & Search Row */}
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                <div className="flex gap-2">
                    {[
                        { label: 'Tất cả', value: 'all' },
                        { label: 'Hoạt động', value: 'active' },
                        { label: 'Tạm ngưng', value: 'inactive' }
                    ].map((item) => (
                        <button
                            key={item.value}
                            onClick={() => setTab(item.value)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                                tab === item.value
                                    ? 'bg-red-600 text-white border-red-600'
                                    : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center bg-white border px-4 py-2 rounded-lg w-full md:w-80 focus-within:ring-2 focus-within:ring-red-100 transition">
                    <Search size={18} className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm tên phòng..."
                        className="ml-3 outline-none w-full text-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-sm font-medium text-gray-500 border-b">
                            <tr>
                                <th className="p-4">Phòng chiếu</th>
                                <th className="p-4">Rạp</th>
                                <th className="p-4 text-center">Loại</th>
                                <th className="p-4 text-center">Sức chứa</th>
                                <th className="p-4 text-center">Trạng thái</th>
                                <th className="p-4 text-center">Hành động</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center p-8">
                                        <LoadingSpinner />
                                    </td>
                                </tr>
                            ) : pagedRooms.length > 0 ? (
                                pagedRooms.map((room) => (
                                    <tr key={room.room_id} className="hover:bg-gray-50 transition">
                                        <td className="p-4">
                                            <div className="font-semibold text-gray-800">
                                                {room.room_name}
                                            </div>
                                            <button
                                                onClick={() => {
                                                    if (room.seat_layout_id) {
                                                        navigate(
                                                            `/admin/seat-layout/${room.seat_layout_id}`
                                                        );
                                                    } else {
                                                        alert(
                                                            'Phòng này chưa được gán sơ đồ ghế (hoặc đang bị lỗi null từ server)!'
                                                        );
                                                    }
                                                }}
                                                className="text-xs text-blue-500 hover:text-blue-700 hover:underline mt-1"
                                            >
                                                Cấu hình sơ đồ ghế
                                            </button>
                                        </td>

                                        <td className="p-4 text-sm text-gray-600">
                                            {room.cinema || 'Đang cập nhật'}
                                        </td>

                                        <td className="p-4 text-center">
                                            <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-md font-medium border">
                                                {room.room_type}
                                            </span>
                                        </td>

                                        <td className="p-4 text-center text-sm font-medium text-gray-600">
                                            <span className="text-blue-600 font-bold">
                                                {room.valid_seat_count}
                                            </span>
                                            <span className="text-gray-400 mx-1">/</span>
                                            <span>{room.total_seat_count || room.capacity}</span>
                                        </td>

                                        <td className="p-4 text-center">
                                            <div className="flex justify-center items-center gap-2">
                                                <div
                                                    onClick={() => toggleStatus(room)}
                                                    className={`w-11 h-6 flex items-center rounded-full cursor-pointer transition-colors duration-300 ${
                                                        room.status === 'active'
                                                            ? 'bg-green-500'
                                                            : 'bg-gray-300'
                                                    }`}
                                                >
                                                    <div
                                                        className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                                                            room.status === 'active'
                                                                ? 'translate-x-6'
                                                                : 'translate-x-1'
                                                        }`}
                                                    />
                                                </div>
                                            </div>
                                        </td>

                                        <td className="p-4">
                                            <div className="flex justify-center gap-3">
                                                <button
                                                    onClick={() => handleOpenEdit(room)}
                                                    className="text-blue-500 hover:text-blue-700 transition"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    className="text-red-500 hover:text-red-700 transition"
                                                    title="Xóa"
                                                    onClick={() =>
                                                        setConfirmDelete({
                                                            show: true,
                                                            id: room.room_id
                                                        })
                                                    }
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-500">
                                        Không tìm thấy phòng chiếu nào.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ===== PAGINATION ===== */}
                {!loading && filteredRooms.length > 0 && (
                    <div className="py-4 px-6 border-t border-gray-100 bg-white mt-auto">
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={setPage}
                        />
                    </div>
                )}
            </div>

            {/* Modal Tạo/Sửa Phòng */}
            {openModal && (
                <CreateRoomModal
                    roomData={roomToEdit} // Dữ liệu phòng (nếu là Sửa) hoặc null (nếu là Tạo mới)
                    onClose={() => {
                        setOpenModal(false);
                        setRoomToEdit(null);
                    }}
                    onCreate={() => {
                        fetchRooms(); // Tải lại danh sách
                        setOpenModal(false); // Đóng modal
                        setRoomToEdit(null);
                    }}
                />
            )}

            {/* Confirm Delete Dialog */}
            {confirmDelete.show && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60]">
                    <div className="bg-white rounded-xl shadow-2xl w-[350px] p-6 text-center animate-fade-in-up">
                        <div className="w-14 h-14 rounded-full bg-red-50 mx-auto flex items-center justify-center mb-4">
                            <Trash2 size={24} className="text-red-500" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Xác nhận xóa</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Bạn có chắc chắn muốn xóa phòng chiếu này? Hành động này không thể hoàn
                            tác.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmDelete({ show: false, id: null })}
                                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={() => handleDelete(confirmDelete.id)}
                                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                            >
                                Xóa ngay
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
