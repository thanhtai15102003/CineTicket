import { useState } from 'react'; // BỔ SUNG useState
import { IconArmchair, IconArmchair2, IconSofa } from '@tabler/icons-react';
import { XCircle } from 'lucide-react';
import Toast from './common/Toast'; // BỔ SUNG TOAST (Nhớ check lại đường dẫn tùy cấu trúc thư mục của bạn)

const SeatMap = ({
    seatLayout = [],
    soldSeats: initialSoldSeats = [],
    selectedSeats = [],
    onSeatSelect,
    heldSeats = [],
    timer = 0,
    prices
}) => {
    // STATE QUẢN LÝ TOAST
    const [toast, setToast] = useState({ show: false, message: '', type: 'error' });
    const showToast = (message, type = 'error') => setToast({ show: true, message, type });

    const soldSet = new Set(initialSoldSeats);

    const isSelected = (seatId) => selectedSeats.some((s) => s.id === seatId);
    const isHeld = (seatId) => heldSeats.includes(seatId);

    const getPrice = (type) => {
        if (!prices) return 0;
        if (type === 'double') return prices.double || 0; // Giá cả cặp ghế đôi
        if (type === 'vip') return prices.vip || 0;
        return prices.single || 0; // Giá ghế thường
    };

    // ================== HÀM ĐẾM SỐ LƯỢNG GHẾ TRỐNG BỊ KẸP GIỮA (SANDWICHED ORPHAN) ==================
    const countSandwichedOrphans = (row, currentSelectedIds) => {
        let orphans = 0;

        // Xem ghế là bị "Chặn" nếu đã bán, đang giữ, bị hỏng, hoặc đang được chọn
        const isBlocked = (seat) => {
            return (
                soldSet.has(seat.id) ||
                isHeld(seat.id) ||
                seat.type === 'broken' ||
                currentSelectedIds.includes(seat.id)
            );
        };

        // Tách hàng thành các block liền kề (bỏ qua khoảng trống/lối đi để tính toán chính xác)
        let currentBlock = [];
        const blocks = [];
        for (let s of row.seats) {
            if (!s.type || s.type === 'aisle') {
                if (currentBlock.length > 0) {
                    blocks.push(currentBlock);
                    currentBlock = [];
                }
            } else {
                currentBlock.push(s);
            }
        }
        if (currentBlock.length > 0) blocks.push(currentBlock);

        // Kiểm tra từng block xem có ghế trống nào bị kẹp giữa 2 ghế Blocked không
        for (let block of blocks) {
            for (let i = 0; i < block.length; i++) {
                const seat = block[i];
                if (!isBlocked(seat)) {
                    const leftBlocked = i > 0 && isBlocked(block[i - 1]);
                    const rightBlocked = i < block.length - 1 && isBlocked(block[i + 1]);

                    if (leftBlocked && rightBlocked) {
                        orphans++;
                    }
                }
            }
        }

        return orphans;
    };

    const handleClick = (row, seat) => {
        if (
            !seat ||
            !seat.type ||
            seat.type === 'aisle' ||
            seat.type === 'broken' ||
            soldSet.has(seat.id) ||
            isHeld(seat.id)
        ) {
            return;
        }

        const isDouble = seat.type === 'double';

        // 🚨 CHUẨN NGHIỆP VỤ 1: Giới hạn tối đa 8 vé / 1 giao dịch
        const isAlreadySelected = isSelected(seat.id);
        if (!isAlreadySelected) {
            const seatsToAdd = isDouble ? 2 : 1;
            if (selectedSeats.length + seatsToAdd > 8) {
                // THAY THẾ ALERT BẰNG TOAST
                showToast('Quy định rạp: Bạn chỉ được mua tối đa 8 vé trong một giao dịch!');
                return;
            }
        }

        // 🚨 CHUẨN NGHIỆP VỤ 2: Luật chống ghế mồ côi kẹp giữa (Sandwiched Orphan Rule)
        const currentSelectedIds = selectedSeats.map((s) => s.id);
        let newSelectedIds = [...currentSelectedIds];

        if (isAlreadySelected) {
            newSelectedIds = newSelectedIds.filter((id) => id !== seat.id);
            if (isDouble && seat.pair !== null && seat.pair !== undefined) {
                const pairId = row.seats[seat.pair].id;
                newSelectedIds = newSelectedIds.filter((id) => id !== pairId);
            }
        } else {
            newSelectedIds.push(seat.id);
            if (isDouble && seat.pair !== null && seat.pair !== undefined) {
                const pairId = row.seats[seat.pair].id;
                newSelectedIds.push(pairId);
            }
        }

        const orphansBefore = countSandwichedOrphans(row, currentSelectedIds);
        const orphansAfter = countSandwichedOrphans(row, newSelectedIds);

        if (orphansAfter > orphansBefore) {
            // THAY THẾ ALERT BẰNG TOAST
            showToast('Quy định rạp: Không được để trống 1 ghế ở giữa 2 ghế khác!');
            return;
        }

        if (isDouble && seat.pair !== null && seat.pair !== undefined) {
            const pairSeat = row.seats[seat.pair];
            if (soldSet.has(pairSeat.id)) return;

            // Với ghế đôi, ta chia đôi giá trị để khi Booking.jsx tính tổng (reduce price) sẽ ra đúng giá 1 cặp
            const halfPrice = getPrice('double') / 2;

            onSeatSelect({ id: seat.id, label: seat.id, price: halfPrice, type: 'double' });
            onSeatSelect({ id: pairSeat.id, label: pairSeat.id, price: halfPrice, type: 'double' });
        } else {
            onSeatSelect({
                id: seat.id,
                label: seat.id,
                price: getPrice(seat.type),
                type: seat.type
            });
        }
    };

    if (!seatLayout || seatLayout.length === 0) {
        return (
            <div className="text-center text-zinc-400 py-20">
                Sơ đồ ghế không có sẵn cho suất chiếu này.
            </div>
        );
    }

    return (
        <div className="bg-zinc-900 p-6 md:p-10 rounded-2xl shadow-lg overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* COMPONENT TOAST THÔNG BÁO LỖI */}
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ show: false, message: '', type: 'error' })}
                />
            )}

            {/* SCREEN */}
            <div className="min-w-[600px] w-full max-w-[700px] mx-auto mb-12">
                <div className="bg-gradient-to-r from-zinc-600 to-zinc-400 text-center py-2.5 rounded-t-full text-xs tracking-[0.4em] text-black font-bold shadow-[0_-5px_20px_rgba(255,255,255,0.1)]">
                    MÀN HÌNH
                </div>
            </div>

            {/* SEATS */}
            <div className="flex flex-col items-center gap-4 min-w-max mx-auto pb-6">
                {seatLayout.map((row, rIndex) => (
                    <div key={row.label || rIndex} className="flex items-center gap-4">
                        {/* ROW LABEL LEFT */}
                        <div className="w-6 font-bold text-zinc-500 text-sm text-center">
                            {row.label}
                        </div>

                        {/* ROW SEATS GRID */}
                        <div
                            className="grid gap-2"
                            style={{
                                gridTemplateColumns: `repeat(${row.seats.length}, 36px)`,
                                gridAutoRows: '36px'
                            }}
                        >
                            {row.seats.map((seat, sIndex) => {
                                const isDouble = seat.type === 'double';
                                const isAisle = seat.type === 'aisle';
                                const isBroken = seat.type === 'broken';

                                // Ẩn nửa bên phải của ghế đôi đi để gộp span 2
                                if (
                                    isDouble &&
                                    seat.pair !== null &&
                                    seat.pair !== undefined &&
                                    seat.pair < sIndex
                                ) {
                                    return null;
                                }

                                // Trạng thái ghế
                                const sold = isDouble
                                    ? soldSet.has(seat.id) || soldSet.has(row.seats[seat.pair]?.id)
                                    : soldSet.has(seat.id);

                                const selected = isDouble
                                    ? isSelected(seat.id) && isSelected(row.seats[seat.pair]?.id)
                                    : isSelected(seat.id);

                                const held = isHeld(seat.id);

                                let stateClass = '';
                                let cursorClass = 'cursor-pointer';

                                if (!seat.type || isAisle) {
                                    cursorClass = 'cursor-default';
                                } else if (isBroken) {
                                    stateClass = 'text-red-900/50'; // Màu đỏ sẫm mờ cho ghế bảo trì
                                    cursorClass = 'cursor-not-allowed';
                                } else if (sold) {
                                    stateClass = 'text-zinc-700';
                                    cursorClass = 'cursor-not-allowed';
                                } else if (selected) {
                                    // Chỉnh lại màu đỏ đậm hơn, phóng to hơn, và hiệu ứng glow đỏ mạnh hơn
                                    stateClass =
                                        'text-red-600 scale-115 drop-shadow-[0_0_12px_rgba(239,68,68,1)]';
                                } else if (held) {
                                    stateClass = 'text-yellow-400';
                                } else {
                                    stateClass = 'text-zinc-400 hover:text-white hover:scale-105';
                                    if (isDouble)
                                        stateClass =
                                            'text-pink-400 hover:text-pink-300 hover:scale-105';
                                    if (seat.type === 'vip')
                                        stateClass =
                                            'text-orange-400 hover:text-orange-300 hover:scale-105';
                                }

                                return (
                                    <div
                                        key={`${row.label}${sIndex}`}
                                        onClick={() => handleClick(row, seat)}
                                        style={{ gridColumn: isDouble ? 'span 2' : 'auto' }}
                                        className={`relative flex items-center justify-center transition-all duration-200 group ${cursorClass}`}
                                    >
                                        {/* ICON RENDER */}
                                        {seat.type && !isAisle && (
                                            <>
                                                {isBroken ? (
                                                    <XCircle
                                                        size={26}
                                                        className={`transition-all ${stateClass}`}
                                                    />
                                                ) : isDouble ? (
                                                    <IconSofa
                                                        size={34}
                                                        className={`transition-all ${stateClass}`}
                                                    />
                                                ) : seat.type === 'vip' ? (
                                                    <IconArmchair2
                                                        size={28}
                                                        className={`transition-all ${stateClass}`}
                                                    />
                                                ) : (
                                                    <IconArmchair
                                                        size={28}
                                                        className={`transition-all ${stateClass}`}
                                                    />
                                                )}

                                                {/* TOOLTIP HIỂN THỊ TÊN GHẾ */}
                                                {!sold && !isBroken && (
                                                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] px-2 py-0.5 rounded bg-black border border-zinc-700 text-white opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-10">
                                                        {isDouble
                                                            ? `${seat.id}, ${row.seats[seat.pair]?.id}`
                                                            : seat.id}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* ROW LABEL RIGHT */}
                        <div className="w-6 font-bold text-zinc-500 text-sm text-center">
                            {row.label}
                        </div>
                    </div>
                ))}
            </div>

            {/* LEGEND */}
            <div className="flex flex-wrap justify-center gap-6 mt-8 pt-6 border-t border-zinc-800 text-xs text-zinc-300">
                <div className="flex items-center gap-2">
                    <IconArmchair size={20} className="text-red-600" /> Đang chọn
                </div>
                <div className="flex items-center gap-2">
                    <IconArmchair2 size={20} className="text-orange-400" /> VIP
                </div>
                <div className="flex items-center gap-2">
                    <IconSofa size={24} className="text-pink-400" /> Ghế đôi
                </div>
                <div className="flex items-center gap-2">
                    <IconArmchair size={20} className="text-zinc-700" /> Đã bán
                </div>
                <div className="flex items-center gap-2">
                    <XCircle size={20} className="text-red-900/50" /> Bảo trì
                </div>
            </div>
        </div>
    );
};

export default SeatMap;

