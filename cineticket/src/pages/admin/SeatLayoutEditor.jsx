import React, { useState } from 'react';
import { Save, ChevronLeft, MoveHorizontal } from 'lucide-react'; // 👈 Thêm MoveHorizontal
import { IconArmchair, IconArmchair2, IconSofa, IconEraser } from '@tabler/icons-react'; // Xoá IconSpacingWidth
import { useNavigate, useLocation } from 'react-router-dom';
import Toast from '../../components/common/Toast';

/* ================= GENERATE GRID ================= */
const generateGrid = (rows, cols) => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return Array.from({ length: rows }, (_, r) => ({
        label: letters[r],
        seats: Array.from({ length: cols }, (_, c) => ({
            id: `${letters[r]}${c + 1}`,
            type: null,
            pair: null
        }))
    }));
};

const SeatLayoutEditor = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const { name, description, rows, cols } = location.state || {
        name: 'Sơ đồ mặc định',
        description: '',
        rows: 8,
        cols: 13
    };

    const [grid, setGrid] = useState(generateGrid(Number(rows), Number(cols)));
    const [selectedType, setSelectedType] = useState('regular');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '' });

    const showToast = (msg) => setToast({ show: true, message: msg });

    /* ================= LOGIC CLICK ================= */
    const handleSeatClick = (rIndex, sIndex) => {
        setGrid((prev) => {
            const newGrid = [...prev];
            const row = newGrid[rIndex];
            if (selectedType === 'double') {
                if (sIndex === row.seats.length - 1) return prev;
                const nextSeat = row.seats[sIndex + 1];
                if (row.seats[sIndex].type || nextSeat.type) return prev;
                row.seats[sIndex] = { ...row.seats[sIndex], type: 'double', pair: sIndex + 1 };
                row.seats[sIndex + 1] = { ...nextSeat, type: 'double', pair: sIndex };
                return [...newGrid];
            }
            if (selectedType === 'null') {
                handleSeatClear(newGrid, rIndex, sIndex);
                return [...newGrid];
            }
            // Nếu đổi từ ghế đôi sang loại khác (kể cả lối đi), cần clear ghế đôi cũ
            if (row.seats[sIndex].type === 'double') handleSeatClear(newGrid, rIndex, sIndex);

            row.seats[sIndex] = { ...row.seats[sIndex], type: selectedType, pair: null };
            return [...newGrid];
        });
    };

    const handleSeatClear = (newGrid, rIndex, sIndex) => {
        const seat = newGrid[rIndex].seats[sIndex];
        if (seat.type === 'double' && seat.pair !== null) {
            const pairIndex = seat.pair;
            newGrid[rIndex].seats[sIndex] = { ...seat, type: null, pair: null };
            newGrid[rIndex].seats[pairIndex] = {
                ...newGrid[rIndex].seats[pairIndex],
                type: null,
                pair: null
            };
        } else {
            newGrid[rIndex].seats[sIndex] = { ...seat, type: null, pair: null };
        }
    };

    const applyRow = (rIndex) => {
        setGrid((prev) => {
            const newGrid = [...prev];
            const row = newGrid[rIndex];
            if (selectedType === 'double') {
                for (let i = 0; i < row.seats.length - 1; i += 2) {
                    row.seats[i] = { ...row.seats[i], type: 'double', pair: i + 1 };
                    row.seats[i + 1] = { ...row.seats[i + 1], type: 'double', pair: i };
                }
            } else {
                row.seats = row.seats.map((s) => ({
                    ...s,
                    type: selectedType === 'null' ? null : selectedType,
                    pair: null
                }));
            }
            return [...newGrid];
        });
    };

    const clearRow = (rIndex) => {
        setGrid((prev) => {
            const newGrid = [...prev];
            newGrid[rIndex].seats = newGrid[rIndex].seats.map((s) => ({
                ...s,
                type: null,
                pair: null
            }));
            return [...newGrid];
        });
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return showToast('Chưa đăng nhập ❌');

            // Cập nhật điều kiện check: ít nhất 1 ghế thường/vip/đôi mới được lưu (bỏ qua null và aisle)
            const hasSeat = grid.some((r) => r.seats.some((s) => s.type && s.type !== 'aisle'));
            if (!hasSeat) return showToast('Bạn chưa thiết kế ghế nào ❌');

            setLoading(true);
            const payload = {
                name,
                description,
                row_count: grid.length,
                column_count: grid[0].seats.length,
                layout_data: grid
            };
            const res = await fetch(
                'https://cinema-api-production-f2bc.up.railway.app/api/v1/manager/seat-layouts',
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                }
            );
            if (res.ok) {
                showToast('Lưu sơ đồ thành công 🎉');
                setTimeout(() => navigate('/admin/seat-layout'), 1500);
            } else {
                showToast('Lỗi khi lưu sơ đồ ❌');
            }
        } catch (_) {
            showToast('Lỗi server ❌');
        } finally {
            setLoading(false);
        }
    };

    const renderIcon = (seat, index) => {
        if (!seat.type) return <div className="text-gray-200 text-[10px]">+</div>;
        if (seat.type === 'aisle') return null; // Lối đi không render icon ghế
        if (seat.type === 'double') {
            if (seat.pair < index) return null;
            return <IconSofa size={24} className="text-pink-500" />;
        }
        if (seat.type === 'vip') return <IconArmchair2 size={22} className="text-amber-500" />;
        return <IconArmchair size={22} className="text-blue-500" />;
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {toast.show && (
                <Toast
                    message={toast.message}
                    onClose={() => setToast({ show: false, message: '' })}
                />
            )}

            {/* HEADER */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 bg-white rounded-full shadow-sm border"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">{name}</h1>
                </div>
                <div className="bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span className="text-xs font-bold text-blue-700 uppercase">
                        Thiết kế sơ đồ
                    </span>
                </div>
            </div>

            <div className="flex gap-8">
                {/* TRÁI: AREA THIẾT KẾ */}
                <div className="flex-grow bg-white p-8 rounded-[2rem] shadow-sm border overflow-hidden">
                    {/* MÀN HÌNH */}
                    <div className="mb-12 flex flex-col items-center">
                        <div className="w-3/4 h-1.5 bg-gray-200 rounded-full shadow-inner"></div>
                        <p className="text-[9px] text-gray-600 mt-2 tracking-widest uppercase font-bold">
                            Màn hình
                        </p>
                    </div>

                    {/* GRID */}
                    <div className="flex flex-col gap-3 items-center">
                        {grid.map((row, rIndex) => {
                            // Biến đếm số ghế để in lên UI (bỏ qua Aisle và Null)
                            let currentSeatNum = 1;

                            return (
                                <div key={row.label} className="flex items-center gap-4">
                                    <div className="w-5 font-bold text-gray-600 text-xs text-center">
                                        {row.label}
                                    </div>

                                    <div
                                        className="grid gap-1.5"
                                        style={{
                                            gridTemplateColumns: `repeat(${row.seats.length}, 40px)`,
                                            gridAutoRows: '40px'
                                        }}
                                    >
                                        {row.seats.map((seat, sIndex) => {
                                            const isDouble = seat.type === 'double';
                                            const isAisle = seat.type === 'aisle';

                                            if (isDouble && seat.pair < sIndex) return null;

                                            // Gán số ghế hiện tại nếu là ghế hợp lệ
                                            const displayNum =
                                                seat.type && !isAisle ? currentSeatNum : '';
                                            if (seat.type && !isAisle)
                                                currentSeatNum += isDouble ? 2 : 1;

                                            return (
                                                <div
                                                    key={seat.id}
                                                    onClick={() => handleSeatClick(rIndex, sIndex)}
                                                    style={{
                                                        gridColumn: isDouble ? 'span 2' : 'auto'
                                                    }}
                                                    className={`relative flex items-center justify-center cursor-pointer transition-all border rounded-lg hover:scale-105 active:scale-95
                                                        ${!seat.type ? 'bg-gray-100 border-dashed border-gray-300' : ''}
                                                        ${seat.type && !isAisle && !isDouble ? 'bg-white shadow-sm border-gray-200' : ''}
                                                        ${isDouble ? 'bg-pink-50 border-pink-100' : ''}
                                                        ${isAisle ? 'bg-transparent border-dashed border-gray-300 opacity-50' : ''} /* 👈 Lối đi */
                                                    `}
                                                >
                                                    {renderIcon(seat, sIndex)}

                                                    {/* Hiển thị số ghế lên góc (Xoá số nếu là Lối đi) */}
                                                    {displayNum !== '' && (
                                                        <span className="absolute -top-1.5 -right-1.5 text-[8px] bg-gray-700 text-white w-4 h-4 flex items-center justify-center rounded-full shadow-sm">
                                                            {displayNum}
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* NÚT + - */}
                                    <div className="flex gap-1 ml-2">
                                        <button
                                            onClick={() => applyRow(rIndex)}
                                            className="w-6 h-6 flex items-center justify-center bg-green-500 hover:bg-green-600 text-white text-[10px] rounded font-bold transition-colors"
                                        >
                                            +
                                        </button>
                                        <button
                                            onClick={() => clearRow(rIndex)}
                                            className="w-6 h-6 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white text-[10px] rounded font-bold transition-colors"
                                        >
                                            -
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* PHẢI: TYPE SELECTOR */}
                <div className="w-72 flex flex-col gap-6">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                            Loại ghế / Thiết lập
                        </h3>
                        <div className="space-y-2">
                            <ToolBtn
                                active={selectedType === 'regular'}
                                onClick={() => setSelectedType('regular')}
                                icon={<IconArmchair size={20} className="text-blue-500" />}
                                label="Thường"
                            />
                            <ToolBtn
                                active={selectedType === 'vip'}
                                onClick={() => setSelectedType('vip')}
                                icon={<IconArmchair2 size={20} className="text-amber-500" />}
                                label="VIP"
                            />
                            <ToolBtn
                                active={selectedType === 'double'}
                                onClick={() => setSelectedType('double')}
                                icon={<IconSofa size={22} className="text-pink-500" />}
                                label="Ghế đôi"
                            />
                            {/* 👈 Đã sửa icon thành MoveHorizontal từ lucide-react */}
                            <ToolBtn
                                active={selectedType === 'aisle'}
                                onClick={() => setSelectedType('aisle')}
                                icon={<MoveHorizontal size={20} className="text-indigo-400" />}
                                label="Lối đi (Aisle)"
                            />

                            <div className="pt-2 border-t mt-2">
                                <ToolBtn
                                    active={selectedType === 'null'}
                                    onClick={() => setSelectedType('null')}
                                    icon={<IconEraser size={20} className="text-gray-400" />}
                                    label="Tẩy xóa (Xoá ghế)"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-white shadow-lg transition-all active:scale-95
                            ${loading ? 'bg-gray-300' : 'bg-black hover:bg-gray-800'}
                        `}
                    >
                        {loading ? (
                            'ĐANG LƯU...'
                        ) : (
                            <>
                                <Save size={18} /> LƯU SƠ ĐỒ
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ToolBtn = ({ icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
            active ? 'bg-blue-50 border-blue-400' : 'bg-white border-gray-100 hover:bg-gray-50'
        }`}
    >
        <div className="scale-90">{icon}</div>
        <span className={`font-bold text-[13px] ${active ? 'text-blue-700' : 'text-gray-600'}`}>
            {label}
        </span>
    </button>
);

export default SeatLayoutEditor;
