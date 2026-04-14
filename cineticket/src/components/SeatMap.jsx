import { useEffect } from 'react';

const SeatMap = ({ showtime, selectedSeats = [], onSeatSelect, heldSeats = [], timer = 0 }) => {
    // 👉 Chỉ đến hàng G
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const cols = Array.from({ length: 14 }, (_, i) => i + 1);

    const soldSeats = new Set(['G8', 'G9', 'F8', 'F9']);
    const vipSeats = new Set(['F12', 'F13', 'F14', 'G12', 'G13', 'G14']);

    const isSelected = (seatId) => selectedSeats.some((s) => s.id === seatId);
    const isHeld = (seatId) => heldSeats.includes(seatId);

    const getPrice = (row, col) => {
        if (vipSeats.has(`${row}${col}`)) return 130000;
        if (['A', 'B'].includes(row)) return 75000;
        return 95000;
    };

    const handleClick = (row, col) => {
        const seatId = `${row}${col}`;
        if (soldSeats.has(seatId)) return;

        const seat = {
            id: seatId,
            row,
            number: col,
            label: `${row}${col}`,
            price: getPrice(row, col),
            type: vipSeats.has(seatId) ? 'vip' : 'regular'
        };

        onSeatSelect(seat);
    };

    return (
        <div className="bg-zinc-900 p-6 md:p-10 rounded-2xl shadow-lg">
            {/* 🎬 SCREEN */}
            <div className="w-full max-w-[700px] mx-auto mb-10">
                <div className="bg-gradient-to-r from-zinc-600 to-zinc-400 text-center py-3 rounded-t-full text-sm tracking-[0.3em] text-black font-semibold shadow-md">
                    SCREEN
                </div>
            </div>

            {/* 🎟️ SEATS */}
            <div className="space-y-3">
                {rows.map((row) => (
                    <div key={row} className="flex items-center justify-center gap-3">
                        {/* Row label trái */}
                        <span className="w-5 text-zinc-500 text-xs">{row}</span>

                        <div className="flex gap-1.5">
                            {cols.map((col) => {
                                const seatId = `${row}${col}`;
                                const sold = soldSeats.has(seatId);
                                const vip = vipSeats.has(seatId);
                                const selected = isSelected(seatId);
                                const held = isHeld(seatId);

                                let style =
                                    'w-8 h-8 flex items-center justify-center text-[10px] rounded-md transition-all duration-200';

                                if (sold) {
                                    style += ' bg-zinc-700 text-zinc-500 cursor-not-allowed';
                                } else if (selected) {
                                    style +=
                                        ' bg-red-600 text-white scale-110 shadow-lg cursor-pointer';
                                } else if (held) {
                                    style += ' bg-yellow-400 text-black cursor-pointer';
                                } else if (vip) {
                                    style +=
                                        ' bg-orange-400 hover:bg-orange-500 text-black cursor-pointer hover:-translate-y-1';
                                } else {
                                    style +=
                                        ' bg-zinc-800 hover:bg-zinc-600 text-white cursor-pointer hover:-translate-y-1';
                                }

                                return (
                                    <div
                                        key={col}
                                        className={style}
                                        onClick={() => handleClick(row, col)}
                                    >
                                        {col}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Row label phải */}
                        <span className="w-5 text-zinc-500 text-xs">{row}</span>
                    </div>
                ))}
            </div>

            {/* 🎯 LEGEND */}
            <div className="flex flex-wrap justify-center gap-6 mt-10 text-xs text-zinc-300">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-zinc-800 rounded"></div> Thường
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-orange-400 rounded"></div> VIP
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-red-600 rounded"></div> Đang chọn
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-yellow-400 rounded"></div> Giữ ({timer}s)
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-zinc-700 rounded"></div> Đã bán
                </div>
            </div>
        </div>
    );
};

export default SeatMap;
