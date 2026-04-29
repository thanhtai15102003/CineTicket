import { useState } from 'react';
import Combo1 from '../assets/imgs/combo1.png';

const comboData = [
    {
        id: 1,
        name: 'Combo Couple',
        description: '1 bắp lớn + 2 nước ngọt',
        price: 99000,
        image: Combo1
    },
    {
        id: 2,
        name: 'Combo Family',
        description: '2 bắp lớn + 4 nước ngọt',
        price: 179000,
        image: 'https://cdn-icons-png.flaticon.com/512/1046/1046784.png'
    },
    {
        id: 3,
        name: 'Combo Single',
        description: '1 bắp vừa + 1 nước',
        price: 59000,
        image: 'https://cdn-icons-png.flaticon.com/512/135/135620.png'
    }
];

const Combos = ({ onChange }) => {
    const [quantities, setQuantities] = useState({});

    const updateParent = (state) => {
        const selectedCombos = comboData
            .map((combo) => ({
                ...combo,
                quantity: state[combo.id] || 0
            }))
            .filter((c) => c.quantity > 0);

        onChange(selectedCombos);
    };

    const increase = (id) => {
        const newQty = (quantities[id] || 0) + 1;
        const newState = { ...quantities, [id]: newQty };
        setQuantities(newState);
        updateParent(newState);
    };

    const decrease = (id) => {
        const newQty = Math.max((quantities[id] || 0) - 1, 0);
        const newState = { ...quantities, [id]: newQty };
        setQuantities(newState);
        updateParent(newState);
    };

    return (
        <div className="mt-12">
            {/* TIÊU ĐỀ THANH LỊCH */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-[1px] bg-orange-500"></div>
                <h2 className="text-xl font-bold uppercase tracking-widest text-white">
                    Bắp Nước <span className="text-orange-500 font-light">Kèm Theo</span>
                </h2>
                <div className="flex-1 h-[1px] bg-gradient-to-r from-zinc-800 to-transparent"></div>
            </div>

            {/* DANH SÁCH COMBO */}
            <div className="space-y-4">
                {comboData.map((combo) => {
                    const qty = quantities[combo.id] || 0;
                    const isSelected = qty > 0;

                    return (
                        <div
                            key={combo.id}
                            className={`group flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 p-4 rounded-2xl transition-all duration-300 border
                                ${
                                    isSelected
                                        ? 'bg-orange-500/[0.03] border-orange-500/30 shadow-[0_4px_20px_rgba(249,115,22,0.05)]'
                                        : 'bg-zinc-900/30 border-white/5 hover:bg-zinc-900/50 hover:border-white/10'
                                }`}
                        >
                            {/* 1. HÌNH ẢNH (Nền trong suốt, bo góc nhẹ) */}
                            <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl bg-black/20 p-2.5 flex items-center justify-center">
                                <img
                                    src={combo.image}
                                    alt={combo.name}
                                    className={`w-full h-full object-contain transition-transform duration-500 drop-shadow-xl ${
                                        isSelected ? 'scale-110' : 'group-hover:scale-105'
                                    }`}
                                />
                            </div>

                            {/* 2. THÔNG TIN (Font chữ tinh tế) */}
                            <div className="flex-1 w-full text-left">
                                <h3 className="text-lg font-bold text-zinc-100 tracking-wide">
                                    {combo.name}
                                </h3>
                                <p className="text-sm text-zinc-400 mt-1 mb-2 font-medium">
                                    {combo.description}
                                </p>
                                <p className="text-orange-400 font-bold text-base">
                                    {combo.price.toLocaleString('vi-VN')} ₫
                                </p>
                            </div>

                            {/* 3. NÚT CHỌN SỐ LƯỢNG (Dạng viên thuốc - Pill shape) */}
                            <div className="w-full sm:w-auto flex justify-end mt-2 sm:mt-0">
                                <div className="flex items-center gap-4 bg-black/40 rounded-full p-1 border border-white/5">
                                    <button
                                        onClick={() => decrease(combo.id)}
                                        disabled={qty === 0}
                                        className={`w-8 h-8 flex items-center justify-center rounded-full text-lg transition-all duration-200
                                            ${
                                                qty > 0
                                                    ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                                                    : 'text-zinc-600 cursor-not-allowed'
                                            }`}
                                    >
                                        −
                                    </button>

                                    <span
                                        className={`w-4 text-center font-bold text-base transition-colors ${
                                            qty > 0 ? 'text-white' : 'text-zinc-500'
                                        }`}
                                    >
                                        {qty}
                                    </span>

                                    <button
                                        onClick={() => increase(combo.id)}
                                        className="w-8 h-8 flex items-center justify-center rounded-full bg-orange-600 text-white text-lg hover:bg-orange-500 transition-all duration-200 shadow-[0_0_10px_rgba(234,88,12,0.3)]"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Combos;
