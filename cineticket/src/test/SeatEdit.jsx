import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { IconArmchair, IconArmchair2, IconSofa } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import Toast from '../../components/common/Toast';

/* ================= GENERATE GRID ================= */

const generateGrid = (rows, cols) => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    return Array.from({ length: rows }, (_, r) => ({
        label: letters[r],
        seats: Array.from({ length: cols }, (_, c) => ({
            id: `${letters[r]}${c + 1}`,
            type: null, // null | regular | vip | double
            pair: null
        }))
    }));
};

/* ================= COMPONENT ================= */

const SeatLayoutEditor = () => {
    const [grid, setGrid] = useState(generateGrid(8, 13));
    const [selectedType, setSelectedType] = useState('regular');
    const [toast, setToast] = useState({ show: false, message: '' });

    const navigate = useNavigate();

    const showToast = (msg) => setToast({ show: true, message: msg });

    /* ================= CLICK ================= */

    const handleSeatClick = (rIndex, sIndex) => {
        setGrid((prev) => {
            const newGrid = [...prev];
            const row = newGrid[rIndex];

            // 👉 GHẾ ĐÔI
            if (selectedType === 'double') {
                if (sIndex === row.seats.length - 1) return prev;

                const nextSeat = row.seats[sIndex + 1];

                if (row.seats[sIndex].type || nextSeat.type) return prev;

                row.seats[sIndex] = {
                    ...row.seats[sIndex],
                    type: 'double',
                    pair: sIndex + 1
                };

                row.seats[sIndex + 1] = {
                    ...nextSeat,
                    type: 'double',
                    pair: sIndex
                };

                return [...newGrid];
            }

            // 👉 GHẾ THƯỜNG / VIP
            row.seats[sIndex] = {
                ...row.seats[sIndex],
                type: selectedType,
                pair: null
            };

            return [...newGrid];
        });
    };

    /* ================= DOUBLE CLICK (XOÁ) ================= */

    const handleSeatDoubleClick = (rIndex, sIndex) => {
        setGrid((prev) => {
            const newGrid = [...prev];
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
                newGrid[rIndex].seats[sIndex] = {
                    ...seat,
                    type: null,
                    pair: null
                };
            }

            return [...newGrid];
        });
    };

    /* ================= APPLY ROW ================= */

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
                    type: selectedType,
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

    /* ================= RENDER SEAT ================= */

    const renderSeat = (seat, index) => {
        const base = 'h-10 flex items-center justify-center transition';

        if (!seat.type) {
            return (
                <div className={`${base} w-10 border-2 border-dashed rounded-lg text-gray-400`}>
                    +
                </div>
            );
        }

        // 👉 DOUBLE
        if (seat.type === 'double') {
            if (seat.pair < index) return null;

            return (
                <div className={`${base} col-span-2`}>
                    <IconSofa size={32} />
                </div>
            );
        }

        // 👉 VIP
        if (seat.type === 'vip') {
            return (
                <div className={`${base} w-10`}>
                    <IconArmchair2 size={24} />
                </div>
            );
        }

        // 👉 REGULAR
        return (
            <div className={`${base} w-10`}>
                <IconArmchair size={24} />
            </div>
        );
    };

    /* ================= SAVE ================= */

    const handleSave = () => {
        const data = grid.flatMap((row) =>
            row.seats.map((s, i) => ({
                seat_id: `${row.label}${i + 1}`,
                row_label: row.label,
                seat_number: i + 1,
                seat_type: s.type || 'empty'
            }))
        );

        console.log('DATA:', data);

        showToast('Lưu thành công 🎉');

        setTimeout(() => {
            navigate('/admin/seat-layout');
        }, 1200);
    };

    /* ================= UI ================= */

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {toast.show && (
                <Toast
                    message={toast.message}
                    onClose={() => setToast({ show: false, message: '' })}
                />
            )}

            <h1 className="text-2xl font-bold mb-6">Thiết lập sơ đồ ghế</h1>

            <div className="max-w-7xl mx-auto flex gap-10">
                {/* LEFT */}
                <div className="flex-grow bg-white p-8 rounded-3xl shadow border">
                    {/* SCREEN */}
                    <div className="mb-14 flex flex-col items-center">
                        <div className="w-4/5 h-2 bg-gray-300 rounded-full"></div>
                        <p className="text-xs text-gray-400 mt-2 uppercase">Màn hình</p>
                    </div>

                    {/* GRID */}
                    <div className="flex flex-col gap-4">
                        {grid.map((row, rIndex) => (
                            <div key={row.label} className="flex items-center gap-3">
                                <div className="w-6 text-gray-400 font-bold">{row.label}</div>

                                {/* 👉 GRID FIX CHÍNH */}
                                <div
                                    className="grid gap-2"
                                    style={{
                                        gridTemplateColumns: `repeat(${row.seats.length}, 40px)`
                                    }}
                                >
                                    {row.seats.map((seat, sIndex) => (
                                        <div
                                            key={seat.id}
                                            onClick={() => handleSeatClick(rIndex, sIndex)}
                                            onDoubleClick={() =>
                                                handleSeatDoubleClick(rIndex, sIndex)
                                            }
                                            className="cursor-pointer hover:scale-110"
                                        >
                                            {renderSeat(seat, sIndex)}
                                        </div>
                                    ))}
                                </div>

                                {/* ACTION */}
                                <div className="flex gap-1 ml-2">
                                    <button
                                        onClick={() => applyRow(rIndex)}
                                        className="px-2 py-1 bg-green-500 text-white text-xs rounded"
                                    >
                                        +
                                    </button>

                                    <button
                                        onClick={() => clearRow(rIndex)}
                                        className="px-2 py-1 bg-red-500 text-white text-xs rounded"
                                    >
                                        -
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT */}
                <div className="w-80 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow border">
                        <h3 className="font-bold mb-4">Loại ghế</h3>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setSelectedType('regular')}
                                className={`p-2 border rounded ${
                                    selectedType === 'regular' ? 'bg-black text-white' : ''
                                }`}
                            >
                                <IconArmchair />
                            </button>

                            <button
                                onClick={() => setSelectedType('vip')}
                                className={`p-2 border rounded ${
                                    selectedType === 'vip' ? 'bg-black text-white' : ''
                                }`}
                            >
                                <IconArmchair2 />
                            </button>

                            <button
                                onClick={() => setSelectedType('double')}
                                className={`p-2 border rounded ${
                                    selectedType === 'double' ? 'bg-black text-white' : ''
                                }`}
                            >
                                <IconSofa />
                            </button>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow border">
                        <button
                            onClick={handleSave}
                            className="w-full bg-black text-white py-3 rounded-xl flex items-center justify-center gap-2"
                        >
                            <Save size={16} />
                            Lưu sơ đồ
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SeatLayoutEditor;
