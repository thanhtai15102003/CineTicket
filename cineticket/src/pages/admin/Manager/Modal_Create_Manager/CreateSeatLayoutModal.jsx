import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreateSeatLayoutModal({ onClose }) {
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    // 👉 Mặc định 8x13 nhưng cho phép nhập tay
    const [rows, setRows] = useState(8);
    const [cols, setCols] = useState(13);

    const totalSeats = rows * cols;

    const handleNextStep = () => {
        // 1. Kiểm tra tính hợp lệ (Validation) theo tiêu chuẩn API
        if (!name.trim()) {
            alert('Vui lòng nhập tên sơ đồ ghế');
            return;
        }

        if (rows <= 0 || rows > 26) {
            alert('Số hàng phải từ 1 đến 26 (A-Z)');
            return;
        }

        if (cols <= 0 || cols > 50) {
            alert('Số cột không nên quá lớn (tối đa 50) để hiển thị tốt nhất');
            return;
        }

        // 2. Chuyển sang Editor và mang theo "Gói dữ liệu" chuẩn
        // Gói này sau này sẽ được bốc ra để gửi lên API POST
        navigate('/admin/seat-layout/create', {
            state: {
                name: name.trim(),
                description: description.trim(),
                rows: Number(rows),
                cols: Number(cols)
            }
        });

        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white w-[450px] p-6 rounded-3xl shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Thông tin sơ đồ</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-black">
                        ✕
                    </button>
                </div>

                <div className="space-y-4">
                    {/* TÊN SƠ ĐỒ */}
                    <div>
                        <label className="text-xs font-semibold text-gray-400 uppercase ml-1">
                            Tên sơ đồ ghế
                        </label>
                        <input
                            placeholder="Ví dụ: Rạp 01 - IMAX"
                            className="w-full border-2 border-gray-100 p-3 rounded-xl mt-1 focus:border-red-500 outline-none transition-all"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    {/* DÒNG & CỘT */}
                    <div className="grid grid-cols-2 gap-4">
                        <InputNumber
                            label="Số hàng (Dọc)"
                            value={rows}
                            onChange={setRows}
                            max={26}
                        />
                        <InputNumber
                            label="Số cột (Ngang)"
                            value={cols}
                            onChange={setCols}
                            max={50}
                        />
                    </div>

                    {/* MÔ TẢ */}
                    <div>
                        <label className="text-xs font-semibold text-gray-400 uppercase ml-1">
                            Mô tả ngắn
                        </label>
                        <textarea
                            placeholder="Mô tả về phòng chiếu hoặc loại sơ đồ này..."
                            className="w-full border-2 border-gray-100 p-3 rounded-xl mt-1 focus:border-red-500 outline-none transition-all"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                </div>

                {/* THÔNG TIN TỔNG QUAN */}
                <div className="mt-6 p-4 bg-gray-50 rounded-2xl flex justify-between items-center">
                    <span className="text-sm text-gray-500">Quy mô dự kiến:</span>
                    <span className="font-bold text-red-600">
                        {rows} hàng x {cols} cột = {totalSeats} ghế
                    </span>
                </div>

                {/* NÚT TIẾP TỤC */}
                <div className="mt-8 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleNextStep}
                        className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-200 transition-all"
                    >
                        Tiếp theo
                    </button>
                </div>
            </div>
        </div>
    );
}

const InputNumber = ({ label, value, onChange, max }) => (
    <div>
        <label className="text-xs font-semibold text-gray-400 uppercase ml-1">{label}</label>
        <input
            type="number"
            min="1"
            max={max}
            className="w-full border-2 border-gray-100 p-3 rounded-xl mt-1 outline-none focus:border-red-500"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    </div>
);
