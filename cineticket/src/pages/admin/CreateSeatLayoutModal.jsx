import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const matrixOptions = [
    { value: '12x12', rows: 12, cols: 12 },
    { value: '13x13', rows: 13, cols: 13 }
];

export default function CreateSeatLayoutModal({ onClose, onCreate }) {
    const [name, setName] = useState('');
    const [matrix, setMatrix] = useState(matrixOptions[0]);
    const [description, setDescription] = useState('');
      const navigate = useNavigate();

    // 👉 user nhập số hàng
    const [regularRows, setRegularRows] = useState(4);
    const [vipRows, setVipRows] = useState(6);
    const [doubleRows, setDoubleRows] = useState(2);

    const totalSeats = matrix.rows * matrix.cols;

    // 👉 validate tổng hàng
    const isValid = regularRows + vipRows + doubleRows === matrix.rows;

    // 👉 generate seats
    const generateSeats = () => {
        const data = [];
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

        for (let r = 0; r < matrix.rows; r++) {
            for (let c = 1; c <= matrix.cols; c++) {
                let type = 'regular';

                if (r < regularRows) {
                    type = 'regular';
                } else if (r < regularRows + vipRows) {
                    type = 'vip';
                } else {
                    type = 'double';
                }

                data.push({
                    seat_id: `${letters[r]}${c}`,
                    row_label: letters[r],
                    seat_number: c,
                    seat_type: type
                });
            }
        }

        return data;
    };

    const handleCreate = () => {
        if (!name) return alert('Nhập tên sơ đồ');
        if (!isValid) return alert('Tổng số hàng không hợp lệ!');

        const newLayout = {
            id: Date.now().toString(),
            name,
            description,
            status: 'draft',
            active: false,
            seats: generateSeats()
        };

        onCreate(newLayout);
        navigate(`/admin/seat-layout/${newLayout.id}/edit`);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-[520px] p-6 rounded-2xl">
                <h2 className="text-lg font-bold mb-4">Tạo sơ đồ ghế</h2>

                {/* NAME */}
                <div className="mb-3">
                    <label className="text-sm text-gray-500">Tên sơ đồ</label>
                    <input
                        className="w-full border p-2 rounded mt-1"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                {/* MATRIX */}
                <div className="mb-3">
                    <label className="text-sm text-gray-500">Ma trận ghế</label>
                    <select
                        className="w-full border p-2 rounded mt-1"
                        value={matrix.value}
                        onChange={(e) =>
                            setMatrix(matrixOptions.find((m) => m.value === e.target.value))
                        }
                    >
                        {matrixOptions.map((m) => (
                            <option key={m.value} value={m.value}>
                                {m.value}
                            </option>
                        ))}
                    </select>

                    <div className="text-sm text-gray-400 mt-1">
                        {matrix.value} = {totalSeats} ghế
                    </div>
                </div>

                {/* ROW CONFIG */}
                <div className="grid grid-cols-3 gap-3 mb-3">
                    <InputNumber label="Thường" value={regularRows} onChange={setRegularRows} />

                    <InputNumber label="VIP" value={vipRows} onChange={setVipRows} />

                    <InputNumber label="Ghế đôi" value={doubleRows} onChange={setDoubleRows} />
                </div>

                {/* VALIDATE */}
                {!isValid && (
                    <div className="text-red-500 text-sm mb-2">Tổng hàng phải = {matrix.rows}</div>
                )}

                {/* DESCRIPTION */}
                <div className="mb-4">
                    <label className="text-sm text-gray-500">Mô tả</label>
                    <textarea
                        className="w-full border p-2 rounded mt-1"
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                {/* ACTION */}
                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 border rounded">
                        Hủy
                    </button>

                    <button
                        disabled={!isValid}
                        onClick={handleCreate}
                        className={`px-4 py-2 rounded text-white ${
                            isValid ? 'bg-red-600' : 'bg-gray-400'
                        }`}
                    >
                        Tạo
                    </button>
                </div>
            </div>
        </div>
    );
}

/* INPUT NUMBER */
const InputNumber = ({ label, value, onChange }) => (
    <div>
        <label className="text-xs text-gray-500">{label}</label>
        <input
            type="number"
            min="0"
            className="w-full border p-2 rounded mt-1"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
        />
    </div>
);
