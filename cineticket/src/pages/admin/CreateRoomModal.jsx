import { useState } from 'react';

const layoutOptions = [
    { value: 'small', label: 'Nhỏ', capacity: 80 },
    { value: 'medium', label: 'Trung bình', capacity: 120 },
    { value: 'large', label: 'Lớn', capacity: 180 }
];

export function CreateRoomModal({ onClose, onCreate }) {
    const [name, setName] = useState('');
    const [type, setType] = useState('2D');
    const [layout, setLayout] = useState(layoutOptions[0]);

    const handleCreate = () => {
        if (!name) return alert('Nhập tên phòng');

        onCreate({
            id: Date.now(),
            name,
            cinema: 'Chi nhánh hiện tại',
            type,
            capacity: layout.capacity,
            status: true,
            layout: layout.value
        });

        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white w-[450px] p-6 rounded-xl">
                <h2 className="text-lg font-semibold mb-4">Tạo phòng chiếu</h2>

                {/* Tên phòng */}
                <div className="mb-3">
                    <label className="text-sm text-gray-500">Tên phòng</label>
                    <input
                        placeholder="VD: Phòng 1"
                        className="w-full border p-2 rounded mt-1"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                {/* Loại phòng */}
                <div className="mb-3">
                    <label className="text-sm text-gray-500">Loại phòng</label>
                    <select
                        className="w-full border p-2 rounded mt-1"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    >
                        <option>2D</option>
                        <option>3D</option>
                        <option>IMAX</option>
                        <option>VIP</option>
                    </select>
                </div>

                {/* Mẫu sơ đồ ghế */}
                <div className="mb-4">
                    <label className="text-sm text-gray-500">Mẫu sơ đồ ghế</label>
                    <select
                        className="w-full border p-2 rounded mt-1"
                        value={layout.value}
                        onChange={(e) =>
                            setLayout(layoutOptions.find((l) => l.value === e.target.value))
                        }
                    >
                        {layoutOptions.map((l) => (
                            <option key={l.value} value={l.value}>
                                {l.label}
                            </option>
                        ))}
                    </select>

                    {/* Hiển thị sức chứa */}
                    <div className="text-sm text-gray-400 mt-1">
                        Sức chứa: {layout.capacity} ghế
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 border rounded">
                        Hủy
                    </button>
                    <button
                        onClick={handleCreate}
                        className="px-4 py-2 bg-red-600 text-white rounded"
                    >
                        Tạo
                    </button>
                </div>
            </div>
        </div>
    );
}
