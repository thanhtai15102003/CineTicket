import { useState } from 'react';

const comboData = [
    {
        id: 1,
        name: 'Combo Couple',
        description: '1 bắp lớn + 2 nước ngọt',
        price: 99000,
        image: 'https://cdn.galaxycine.vn/media/2026/2/5/co-combo-3-_1770279123026.png'
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
            <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-6 bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]"></div>
                <h2 className="text-2xl font-bold uppercase tracking-widest text-white">
                    Bắp Nước <span className="text-orange-500">Kèm Theo</span>
                </h2>
            </div>

            <div className="space-y-4">
                {comboData.map((combo) => {
                    const qty = quantities[combo.id] || 0;
                    const isSelected = qty > 0;

                    return (
                        <div
                            key={combo.id}
                            className={`group relative flex flex-col sm:flex-row items-center gap-5 sm:gap-6 p-4 sm:p-5 rounded-3xl transition-all duration-500 overflow-hidden
                                ${
                                    isSelected
                                        ? 'bg-gradient-to-r from-orange-500/10 to-zinc-900/80 border-orange-500/40 shadow-[0_0_20px_rgba(249,115,22,0.1)]'
                                        : 'bg-zinc-900/50 backdrop-blur-sm border-white/5 hover:bg-zinc-900/80 hover:border-white/20'
                                } border`}
                        >
                            {/* Hiệu ứng ánh sáng nền mờ ảo khi có số lượng */}
                            {isSelected && (
                                <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-orange-500/10 to-transparent blur-2xl pointer-events-none"></div>
                            )}

                            {/* LEFT - IMAGE */}
                            <div className="relative w-28 h-28 shrink-0 rounded-2xl bg-gradient-to-br from-zinc-800/80 to-zinc-900 p-3 flex items-center justify-center border border-white/5 group-hover:scale-105 transition-transform duration-500 shadow-inner">
                                {/* Vòng sáng sau lưng ảnh bắp nước */}
                                <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <img
                                    src={combo.image}
                                    alt={combo.name}
                                    className="w-full h-full object-contain relative z-10 drop-shadow-2xl"
                                />
                            </div>

                            {/* MIDDLE - INFO */}
                            <div className="flex-1 text-center sm:text-left w-full relative z-10">
                                <h3 className="text-xl font-bold text-white tracking-wide">
                                    {combo.name}
                                </h3>
                                <p className="text-zinc-400 text-sm mt-1.5 leading-relaxed max-w-sm mx-auto sm:mx-0">
                                    {combo.description}
                                </p>
                                <div className="mt-3 inline-block px-3 py-1 bg-zinc-950 rounded-lg border border-white/5 shadow-sm">
                                    <p className="text-orange-500 font-black text-lg">
                                        {combo.price.toLocaleString('vi-VN')} ₫
                                    </p>
                                </div>
                            </div>

                            {/* RIGHT - QUANTITY CONTROLS */}
                            <div className="flex items-center gap-1 bg-zinc-950/80 p-1.5 rounded-2xl border border-white/5 shadow-inner relative z-10 w-full sm:w-auto justify-center sm:justify-end">
                                <button
                                    onClick={() => decrease(combo.id)}
                                    disabled={qty === 0}
                                    className={`w-11 h-11 flex items-center justify-center rounded-xl text-xl font-medium transition-all duration-300
                                        ${
                                            qty > 0
                                                ? 'bg-zinc-800 text-white hover:bg-zinc-700 active:scale-95'
                                                : 'bg-transparent text-zinc-600 cursor-not-allowed'
                                        }`}
                                >
                                    −
                                </button>

                                <div className="w-12 flex items-center justify-center">
                                    <span
                                        className={`font-black text-xl transition-colors duration-300 ${
                                            qty > 0 ? 'text-orange-500' : 'text-white'
                                        }`}
                                    >
                                        {qty}
                                    </span>
                                </div>

                                <button
                                    onClick={() => increase(combo.id)}
                                    className="w-11 h-11 flex items-center justify-center rounded-xl bg-orange-600 text-white text-xl font-medium hover:bg-orange-500 active:scale-95 hover:shadow-[0_0_15px_rgba(234,88,12,0.5)] transition-all duration-300"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Combos;
