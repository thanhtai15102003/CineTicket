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
        <div className="mt-10">
            <h2 className="text-2xl font-bold mb-6 text-white">🍿 Chọn Combo</h2>

            <div className="space-y-5">
                {comboData.map((combo) => (
                    <div
                        key={combo.id}
                        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center justify-between hover:border-orange-500 transition"
                    >
                        {/* LEFT */}
                        <div className="flex items-center gap-5">
                            <div className="w-24 h-24 bg-zinc-800 rounded-xl flex items-center justify-center">
                                <img src={combo.image} className="w-20 h-20 object-contain" />
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-white">{combo.name}</h3>

                                <p className="text-zinc-400 text-sm mt-1 max-w-md">
                                    {combo.description}
                                </p>

                                <p className="text-orange-500 font-bold mt-2">
                                    Giá: {combo.price.toLocaleString()} đ
                                </p>
                            </div>
                        </div>

                        {/* RIGHT - QUANTITY */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => decrease(combo.id)}
                                className="w-9 h-9 flex items-center justify-center rounded-full bg-zinc-800 text-white hover:bg-zinc-700"
                            >
                                −
                            </button>

                            <span className="text-white font-semibold text-lg w-6 text-center">
                                {quantities[combo.id] || 0}
                            </span>

                            <button
                                onClick={() => increase(combo.id)}
                                className="w-9 h-9 flex items-center justify-center rounded-full bg-orange-600 text-white hover:bg-orange-500 shadow-lg"
                            >
                                +
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Combos;
