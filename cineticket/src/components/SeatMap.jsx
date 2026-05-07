import { useState } from 'react';
import { IconArmchair, IconArmchair2, IconSofa } from '@tabler/icons-react';
import { XCircle } from 'lucide-react';
import Toast from './common/Toast';

const SeatMap = ({
    seatLayout = [],
    soldSeats: initialSoldSeats = [],
    selectedSeats = [],
    onSeatSelect,
    heldSeats = [],
    prices
}) => {
    const [toast, setToast] = useState({ show: false, message: '', type: 'error' });
    const showToast = (message, type = 'error') => setToast({ show: true, message, type });

    const soldSet = new Set(initialSoldSeats);

    const isSelected = (seatId) => selectedSeats.some((s) => s.id === seatId);

    // 🌟 CHỈ KIỂM TRA ĐÚNG CHỮ (LABEL) - BỎ QUA CÁI ID LỘN XỘN CỦA BACKEND
    const isHeld = (seat) => {
        if (!seat) return false;
        const labelStr = seat.displayLabel ? String(seat.displayLabel).trim() : '';

        return heldSeats.some((h) => {
            return String(h).trim() === labelStr;
        });
    };

    const isSold = (seat) => {
        if (!seat) return false;
        if (isHeld(seat)) return false; // Ghế đang giữ thì cấm bôi xám

        const labelStr = seat.displayLabel ? String(seat.displayLabel).trim() : '';

        return initialSoldSeats.some((s) => {
            const soldItem = String(s.seat_label || s.id || s).trim();
            return soldItem === labelStr;
        });
    };

    const getPrice = (type) => {
        if (!prices) return 0;
        if (type === 'double') return prices.double || 0;
        if (type === 'vip') return prices.vip || 0;
        return prices.single || 0;
    };

    // TIỀN XỬ LÝ MẢNG GHẾ
    const processedLayout = seatLayout.map((row) => {
        let counter = 1;
        const newSeats = row.seats.map((seat) => {
            const isRealSeat = seat.type && seat.type !== 'aisle';
            return {
                ...seat,
                displayLabel: isRealSeat ? `${row.label}${counter++}` : seat.id
            };
        });
        return { ...row, seats: newSeats };
    });

    const countSandwichedOrphans = (row, currentSelectedIds) => {
        let orphans = 0;

        const isBlocked = (seat) => {
            return (
                isSold(seat) ||
                isHeld(seat) ||
                seat.type === 'broken' ||
                currentSelectedIds.includes(seat.displayLabel)
            );
        };

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
            isSold(seat) ||
            isHeld(seat)
        ) {
            return;
        }

        const isDouble = seat.type === 'double';
        const seatLabelToSend = seat.displayLabel;

        const isAlreadySelected = isSelected(seatLabelToSend);
        if (!isAlreadySelected) {
            const seatsToAdd = isDouble ? 2 : 1;
            if (selectedSeats.length + seatsToAdd > 8) {
                showToast('Quy định rạp: Bạn chỉ được mua tối đa 8 vé trong một giao dịch!');
                return;
            }
        }

        const currentSelectedIds = selectedSeats.map((s) => s.id);
        let newSelectedIds = [...currentSelectedIds];

        if (isAlreadySelected) {
            newSelectedIds = newSelectedIds.filter((id) => id !== seatLabelToSend);
            if (isDouble && seat.pair !== null && seat.pair !== undefined) {
                const pairSeat = row.seats[seat.pair];
                newSelectedIds = newSelectedIds.filter((id) => id !== pairSeat.displayLabel);
            }
        } else {
            newSelectedIds.push(seatLabelToSend);
            if (isDouble && seat.pair !== null && seat.pair !== undefined) {
                const pairSeat = row.seats[seat.pair];
                newSelectedIds.push(pairSeat.displayLabel);
            }
        }

        const orphansBefore = countSandwichedOrphans(row, currentSelectedIds);
        const orphansAfter = countSandwichedOrphans(row, newSelectedIds);

        if (orphansAfter > orphansBefore) {
            showToast('Quy định rạp: Không được để trống 1 ghế ở giữa 2 ghế khác!');
            return;
        }

        if (isDouble && seat.pair !== null && seat.pair !== undefined) {
            const pairSeat = row.seats[seat.pair];
            if (isSold(pairSeat)) return;

            const halfPrice = getPrice('double') / 2;

            onSeatSelect({
                seat_id: seat.id,
                id: seatLabelToSend,
                label: seatLabelToSend,
                price: halfPrice,
                type: 'double'
            });
            onSeatSelect({
                seat_id: pairSeat.id,
                id: pairSeat.displayLabel,
                label: pairSeat.displayLabel,
                price: halfPrice,
                type: 'double'
            });
        } else {
            onSeatSelect({
                seat_id: seat.id,
                id: seatLabelToSend,
                label: seatLabelToSend,
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
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ show: false, message: '', type: 'error' })}
                />
            )}

            <div className="min-w-[600px] w-full max-w-[700px] mx-auto mb-12">
                <div className="bg-gradient-to-r from-zinc-600 to-zinc-400 text-center py-2.5 rounded-t-full text-xs tracking-[0.4em] text-black font-bold shadow-[0_-5px_20px_rgba(255,255,255,0.1)]">
                    MÀN HÌNH
                </div>
            </div>

            <div className="flex flex-col items-center gap-4 min-w-max mx-auto pb-6">
                {processedLayout.map((row, rIndex) => (
                    <div key={row.label || rIndex} className="flex items-center gap-4">
                        <div className="w-6 font-bold text-zinc-500 text-sm text-center">
                            {row.label}
                        </div>

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

                                if (
                                    isDouble &&
                                    seat.pair !== null &&
                                    seat.pair !== undefined &&
                                    seat.pair < sIndex
                                ) {
                                    return null;
                                }

                                const sold = isDouble
                                    ? isSold(seat) || isSold(row.seats[seat.pair])
                                    : isSold(seat);

                                const selected = isDouble
                                    ? isSelected(seat.displayLabel) &&
                                      isSelected(row.seats[seat.pair]?.displayLabel)
                                    : isSelected(seat.displayLabel);

                                const held = isDouble
                                    ? isHeld(seat) || isHeld(row.seats[seat.pair])
                                    : isHeld(seat);

                                let stateClass = '';
                                let cursorClass = 'cursor-pointer';

                                if (!seat.type || isAisle) {
                                    cursorClass = 'cursor-default';
                                } else if (isBroken) {
                                    stateClass = 'text-red-900/50';
                                    cursorClass = 'cursor-not-allowed';
                                } else if (held) {
                                    // 🌟 ƯU TIÊN KIỂM TRA HELD TRƯỚC SOLD (Bóp nghẹt lỗi BE gửi nhầm vào mảng sold)
                                    stateClass =
                                        'text-yellow-500 animate-pulse drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]';
                                    cursorClass = 'cursor-not-allowed';
                                } else if (sold) {
                                    stateClass = 'text-zinc-700';
                                    cursorClass = 'cursor-not-allowed';
                                } else if (selected) {
                                    stateClass =
                                        'text-red-600 scale-115 drop-shadow-[0_0_12px_rgba(239,68,68,1)]';
                                } else {
                                    stateClass = 'text-zinc-400 hover:text-white hover:scale-105';
                                    if (isDouble)
                                        stateClass =
                                            'text-pink-400 hover:text-pink-300 hover:scale-105';
                                    if (seat.type === 'vip')
                                        stateClass =
                                            'text-orange-400 hover:text-orange-300 hover:scale-105';
                                }

                                const pairDisplayLabel = isDouble
                                    ? row.seats[seat.pair]?.displayLabel
                                    : '';

                                return (
                                    <div
                                        key={`${row.label}${sIndex}`}
                                        onClick={() => handleClick(row, seat)}
                                        style={{ gridColumn: isDouble ? 'span 2' : 'auto' }}
                                        className={`relative flex items-center justify-center transition-all duration-200 group ${cursorClass}`}
                                    >
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

                                                {!sold && !isBroken && (
                                                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] px-2 py-0.5 rounded bg-black border border-zinc-700 text-white opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-10">
                                                        {isDouble
                                                            ? `${seat.displayLabel}, ${pairDisplayLabel}`
                                                            : seat.displayLabel}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="w-6 font-bold text-zinc-500 text-sm text-center">
                            {row.label}
                        </div>
                    </div>
                ))}
            </div>

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
                <div className="flex items-center gap-2">
                    <IconArmchair size={20} className="text-yellow-500 animate-pulse" /> Đang giữ
                </div>
            </div>
        </div>
    );
};

export default SeatMap;
