import { useState, useEffect } from 'react';
import { Popcorn } from 'lucide-react';
import LoadingSpinner from './common/LoadingSpinner'; // Đảm bảo đường dẫn import đúng

const Combos = ({ onChange }) => {
    const [comboData, setComboData] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [loading, setLoading] = useState(true);

    // =======================================================
    // 1. FETCH API ĐỘNG THEO ID RẠP & ĐỒNG BỘ GIỎ HÀNG
    // =======================================================
    useEffect(() => {
        const fetchCombos = async () => {
            try {
                // 🌟 LẤY ID RẠP ĐỘNG: Đọc thông tin suất chiếu từ LocalStorage
                const savedShowtime = JSON.parse(localStorage.getItem('bookingShowtime') || '{}');
                const cinemaId = savedShowtime.cinema_id;

                // Nếu trong suất chiếu không có cinema_id, báo lỗi và dừng tải
                if (!cinemaId) {
                    console.error('Không tìm thấy mã rạp (cinema_id) để tải Combo!');
                    setLoading(false);
                    return;
                }

                // 🌟 GỌI API: Truyền thẳng cinemaId động vào URL
                const res = await fetch(
                    `https://cinema-api-production-f2bc.up.railway.app/api/v1/combos?cinema_id=${cinemaId}`
                );
                const json = await res.json();

                // Chuẩn hóa mảng dữ liệu
                let fetchedData = Array.isArray(json.data)
                    ? json.data
                    : Array.isArray(json)
                      ? json
                      : [];

                // 🌟 BỘ LỌC KÉP: Chỉ lấy món đang mở bán tại rạp (effective_status === 'active')
                fetchedData = fetchedData.filter((c) => c.effective_status === 'active');
                setComboData(fetchedData);

                // 🌟 ĐỒNG BỘ GIỎ HÀNG CŨ (Từ popup gợi ý) & ÉP THEO GIÁ MỚI CỦA API
                const savedCombos = JSON.parse(localStorage.getItem('selectedCombos') || '[]');
                if (savedCombos.length > 0) {
                    const initialQty = {};
                    savedCombos.forEach((c) => {
                        initialQty[c.combo_id] = c.quantity;
                    });

                    setQuantities(initialQty);

                    // Thuật toán: Áp dữ liệu mới nhất (giá mới, trạng thái mới) vào những món khách đã chọn
                    const updatedCart = fetchedData
                        .map((combo) => ({
                            ...combo,
                            // Ép lấy giá mới nhất từ API phòng trường hợp Manager vừa đổi giá
                            price: Number(combo.current_price ?? combo.price),
                            quantity: initialQty[combo.combo_id] || 0
                        }))
                        .filter((c) => c.quantity > 0);

                    onChange(updatedCart);
                    localStorage.setItem('selectedCombos', JSON.stringify(updatedCart));
                }
            } catch (error) {
                console.error('Lỗi tải danh sách Combo:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCombos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // =======================================================
    // 2. HÀM CẬP NHẬT GIỎ HÀNG LÚC KHÁCH BẤM (+ / -)
    // =======================================================
    const updateParent = (newState) => {
        const selectedCombos = comboData
            .map((combo) => ({
                ...combo,
                // 🌟 LUÔN LẤY GIÁ TẠI RẠP (current_price) ĐỂ TÍNH TỔNG TIỀN
                price: Number(combo.current_price ?? combo.price),
                quantity: newState[combo.combo_id] || 0
            }))
            .filter((c) => c.quantity > 0);

        onChange(selectedCombos);
        localStorage.setItem('selectedCombos', JSON.stringify(selectedCombos));
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

    if (loading) {
        return (
            <div className="mt-12 py-10 flex justify-center">
                <LoadingSpinner isDark={true} />
            </div>
        );
    }

    // Nếu rạp không bán combo nào hoặc tắt hết thì ẩn luôn khối HTML này
    if (comboData.length === 0) {
        return null;
    }

    return (
        <div className="mt-12">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-[1px] bg-orange-500"></div>
                <h2 className="text-xl font-bold uppercase tracking-widest text-white">
                    Bắp Nước <span className="text-orange-500 font-light">Kèm Theo</span>
                </h2>
                <div className="flex-1 h-[1px] bg-gradient-to-r from-zinc-800 to-transparent"></div>
            </div>

            <div className="space-y-4">
                {comboData.map((combo) => {
                    const qty = quantities[combo.combo_id] || 0;
                    const isSelected = qty > 0;

                    // 🌟 HIỂN THỊ GIÁ TẠI RẠP RA GIAO DIỆN
                    const displayPrice = Number(combo.current_price ?? combo.price);

                    return (
                        <div
                            key={combo.combo_id}
                            className={`group flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 p-4 rounded-2xl transition-all duration-300 border
                                ${
                                    isSelected
                                        ? 'bg-orange-500/[0.03] border-orange-500/30 shadow-[0_4px_20px_rgba(249,115,22,0.05)]'
                                        : 'bg-zinc-900/30 border-white/5 hover:bg-zinc-900/50 hover:border-white/10'
                                }`}
                        >
                            <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl bg-black/20 p-2.5 flex items-center justify-center">
                                {combo.image_url ? (
                                    <img
                                        src={combo.image_url}
                                        alt={combo.combo_name}
                                        className={`w-full h-full object-contain transition-transform duration-500 drop-shadow-xl ${
                                            isSelected ? 'scale-110' : 'group-hover:scale-105'
                                        }`}
                                    />
                                ) : (
                                    <Popcorn size={40} className="text-zinc-600" />
                                )}
                            </div>

                            <div className="flex-1 w-full text-left">
                                <h3 className="text-lg font-bold text-zinc-100 tracking-wide">
                                    {combo.combo_name}
                                </h3>
                                <p className="text-sm text-zinc-400 mt-1 mb-2 font-medium">
                                    {combo.description}
                                </p>
                                {/* In giá tiền bằng displayPrice */}
                                <p className="text-orange-400 font-bold text-base">
                                    {displayPrice.toLocaleString('vi-VN')} ₫
                                </p>
                            </div>

                            <div className="w-full sm:w-auto flex justify-end mt-2 sm:mt-0">
                                <div className="flex items-center gap-4 bg-black/40 rounded-full p-1 border border-white/5">
                                    <button
                                        onClick={() => decrease(combo.combo_id)}
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
                                        onClick={() => increase(combo.combo_id)}
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
