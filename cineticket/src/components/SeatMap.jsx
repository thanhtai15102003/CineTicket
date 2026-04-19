import { IconArmchair, IconArmchair2, IconSofa } from '@tabler/icons-react';

const SeatMap = ({ showtime, selectedSeats = [], onSeatSelect, heldSeats = [], timer = 0 }) => {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const cols = Array.from({ length: 14 }, (_, i) => i + 1);

    const soldSeats = new Set(['G8', 'G9', 'F8', 'F9']);
    const vipSeats = new Set(['F12', 'F13', 'F14']);
    const doubleRows = new Set(['G']); // 👈 hàng ghế đôi

    const isSelected = (seatId) => selectedSeats.some((s) => s.id === seatId);
    const isHeld = (seatId) => heldSeats.includes(seatId);

    const getPrice = (row, col) => {
        if (doubleRows.has(row)) return 180000;
        if (vipSeats.has(`${row}${col}`)) return 130000;
        if (['A', 'B'].includes(row)) return 75000;
        return 95000;
    };

    // 🚫 RULE orphan (không áp dụng cho ghế đôi)
    const createsOrphanSeat = (row, col) => {
        const currentRowSeats = cols.map((c) => `${row}${c}`);

        const newSelected = new Set(selectedSeats.map((s) => s.id));
        newSelected.add(`${row}${col}`);

        const isBlocked = (seatId) => soldSeats.has(seatId) || newSelected.has(seatId);

        let emptyCount = 0;

        for (let i = 0; i < currentRowSeats.length; i++) {
            const seat = currentRowSeats[i];

            if (!isBlocked(seat)) {
                emptyCount++;
            } else {
                // nếu đoạn ghế trống = 1 → orphan
                if (emptyCount === 1) return true;
                emptyCount = 0;
            }
        }

        // check cuối hàng
        if (emptyCount === 1) return true;

        return false;
    };

    const handleClick = (row, col) => {
        const isDouble = doubleRows.has(row);

        // 👉 GHẾ ĐÔI
        if (isDouble) {
            const start = col % 2 === 0 ? col - 1 : col;
            const pair = [`${row}${start}`, `${row}${start + 1}`];

            // nếu 1 trong 2 ghế đã bán → block
            if (pair.some((id) => soldSeats.has(id))) return;

            pair.forEach((id, i) => {
                const seat = {
                    id,
                    row,
                    number: start + i,
                    label: id,
                    price: getPrice(row, col),
                    type: 'double'
                };
                onSeatSelect(seat);
            });

            return;
        }

        // 👉 GHẾ THƯỜNG
        const seatId = `${row}${col}`;
        if (soldSeats.has(seatId)) return;

        if (createsOrphanSeat(row, col)) {
            alert('Không được để ghế trống giữa 2 ghế!');
            return;
        }

        const seat = {
            id: seatId,
            row,
            number: col,
            label: seatId,
            price: getPrice(row, col),
            type: vipSeats.has(seatId) ? 'vip' : 'regular'
        };

        onSeatSelect(seat);
    };

    return (
        <div className="bg-zinc-900 p-6 md:p-10 rounded-2xl shadow-lg">
            {/* SCREEN */}
            <div className="w-full max-w-[700px] mx-auto mb-10">
                <div className="bg-gradient-to-r from-zinc-600 to-zinc-400 text-center py-3 rounded-t-full text-sm tracking-[0.3em] text-black font-semibold shadow-md">
                    SCREEN
                </div>
            </div>

            {/* SEATS */}
            <div className="space-y-4">
                {rows.map((row) => (
                    <div key={row} className="flex items-center justify-center gap-3">
                        <span className="w-5 text-zinc-500 text-xs">{row}</span>

                        <div className="flex gap-2">
                            {cols.map((col) => {
                                const isDouble = doubleRows.has(row);

                                // 👉 render ghế đôi chỉ 1 lần / cặp
                                if (isDouble && col % 2 === 0) return null;

                                const seatId = `${row}${col}`;
                                const pairId = isDouble ? `${row}${col}-${col + 1}` : seatId;

                                const sold = isDouble
                                    ? soldSeats.has(`${row}${col}`) ||
                                      soldSeats.has(`${row}${col + 1}`)
                                    : soldSeats.has(seatId);

                                const selected = isDouble
                                    ? isSelected(`${row}${col}`) && isSelected(`${row}${col + 1}`)
                                    : isSelected(seatId);

                                let stateClass = '';

                                if (sold) stateClass = 'text-zinc-700 cursor-not-allowed';
                                else if (selected) stateClass = 'text-white scale-110';
                                else stateClass = 'text-zinc-400 hover:text-white';

                                return (
                                    <div
                                        key={pairId}
                                        onClick={() => handleClick(row, col)}
                                        className="relative group cursor-pointer transition-all duration-200"
                                    >
                                        {/* ICON */}
                                        {isDouble ? (
                                            <IconSofa
                                                size={34}
                                                className={`transition ${stateClass}`}
                                            />
                                        ) : vipSeats.has(seatId) ? (
                                            <IconArmchair2
                                                size={26}
                                                className={`transition ${stateClass}`}
                                            />
                                        ) : (
                                            <IconArmchair
                                                size={26}
                                                className={`transition ${stateClass}`}
                                            />
                                        )}

                                        {/* TOOLTIP */}
                                        <div
                                            className="
                                            absolute -top-6 left-1/2 -translate-x-1/2
                                            text-[10px] px-2 py-0.5 rounded bg-black text-white
                                            opacity-0 group-hover:opacity-100 transition pointer-events-none
                                        "
                                        >
                                            {isDouble ? pairId : seatId}
                                        </div>

                                        {selected && (
                                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full"></div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <span className="w-5 text-zinc-500 text-xs">{row}</span>
                    </div>
                ))}
            </div>

            {/* LEGEND */}
            <div className="flex flex-wrap justify-center gap-6 mt-10 text-xs text-zinc-300">
                <Legend icon={<IconArmchair size={20} />} label="Thường" />
                <Legend icon={<IconArmchair2 size={20} />} label="VIP" />
                <Legend icon={<IconSofa size={22} />} label="Ghế đôi" />
                <Legend dot label="Đang chọn" />
                <Legend color="bg-zinc-700" label="Đã bán" />
            </div>
        </div>
    );
};

const Legend = ({ icon, label, dot, color }) => (
    <div className="flex items-center gap-2">
        {icon && <div>{icon}</div>}
        {dot && <div className="w-2 h-2 bg-white rounded-full"></div>}
        {color && <div className={`w-4 h-4 rounded ${color}`}></div>}
        <span>{label}</span>
    </div>
);

export default SeatMap;
