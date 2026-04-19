import { useState } from 'react';
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CreateRoomModal } from './CreateRoomModal';

const initialRooms = [
    {
        id: 1,
        name: 'Phòng 1',
        cinema: 'CGV Thủ Đức',
        type: '2D',
        capacity: 120,
        status: 'published'
    },
    {
        id: 2,
        name: 'VIP 2',
        cinema: 'CGV Thủ Đức',
        type: 'VIP',
        capacity: 60,
        status: 'draft'
    }
];

export default function Rooms() {
    const [rooms, setRooms] = useState(initialRooms);
    const [search, setSearch] = useState('');
    const [tab, setTab] = useState('all');
    const [openModal, setOpenModal] = useState(false);

    const navigate = useNavigate();

    // Toggle trạng thái
    const toggleStatus = (id) => {
        setRooms((prev) =>
            prev.map((r) =>
                r.id === id
                    ? {
                          ...r,
                          status: r.status === 'published' ? 'draft' : 'published'
                      }
                    : r
            )
        );
    };

    // Filter
    const filteredRooms = rooms.filter((room) => {
        const matchSearch = room.name.toLowerCase().includes(search.toLowerCase());

        const matchTab =
            tab === 'all' ||
            (tab === 'published' && room.status === 'published') ||
            (tab === 'draft' && room.status === 'draft');

        return matchSearch && matchTab;
    });

    return (
        <div className="p-6 bg-gray-100 min-h-screen text-gray-800">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Danh sách phòng chiếu</h2>

                <button
                    onClick={() => setOpenModal(true)}
                    className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg"
                >
                    <Plus size={18} /> Tạo phòng chiếu
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
                {[
                    { label: 'Tất cả', value: 'all' },
                    { label: 'Đã xuất bản', value: 'published' },
                    { label: 'Bản nháp', value: 'draft' }
                ].map((item) => (
                    <button
                        key={item.value}
                        onClick={() => setTab(item.value)}
                        className={`px-4 py-1.5 rounded-lg text-sm border ${
                            tab === item.value
                                ? 'bg-red-600 text-white'
                                : 'bg-white hover:bg-gray-100'
                        }`}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="mb-4">
                <div className="flex items-center bg-white border px-3 py-2 rounded-lg w-80">
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Tìm phòng..."
                        className="ml-2 outline-none w-full"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-sm">
                        <tr>
                            <th className="p-3">Phòng chiếu</th>
                            <th className="p-3">Rạp</th>
                            <th className="p-3">Loại</th>
                            <th className="p-3">Sức chứa</th>
                            <th className="p-3">Trạng thái</th>
                            <th className="p-3">Hành động</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredRooms.map((room) => (
                            <tr key={room.id} className="border-t">
                                <td className="p-3">
                                    <div className="font-medium">{room.name}</div>
                                    <button
                                        onClick={() => navigate(`/admin/seat-layout/${room.id}`)}
                                        className="text-sm text-blue-500 hover:underline"
                                    >
                                        Xem sơ đồ ghế
                                    </button>
                                </td>

                                <td className="p-3">{room.cinema}</td>
                                <td className="p-3">{room.type}</td>
                                <td className="p-3">{room.capacity}</td>

                                {/* Status */}
                                <td className="p-3">
                                    <div className="flex items-center gap-2">
                                        <div
                                            onClick={() => toggleStatus(room.id)}
                                            className={`w-10 h-5 flex items-center rounded-full cursor-pointer ${
                                                room.status === 'published'
                                                    ? 'bg-green-500'
                                                    : 'bg-gray-300'
                                            }`}
                                        >
                                            <div
                                                className={`w-4 h-4 bg-white rounded-full transform ${
                                                    room.status === 'published'
                                                        ? 'translate-x-5'
                                                        : 'translate-x-1'
                                                }`}
                                            />
                                        </div>

                                        <span className="text-sm">
                                            {room.status === 'published' ? 'Hoạt động' : 'Bản nháp'}
                                        </span>
                                    </div>
                                </td>

                                {/* Actions */}
                                <td className="p-3 flex gap-3">
                                    <button className="text-blue-500">
                                        <Pencil size={18} />
                                    </button>
                                    <button className="text-red-500">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {openModal && (
                <CreateRoomModal
                    onClose={() => setOpenModal(false)}
                    onCreate={(room) => setRooms([...rooms, room])}
                />
            )}
        </div>
    );
}
