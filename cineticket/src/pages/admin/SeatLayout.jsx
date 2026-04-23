import React, { useState, useEffect } from 'react';
import { Save, XCircle, Info, ChevronLeft } from 'lucide-react';
import { IconArmchair, IconArmchair2, IconSofa, IconEraser } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import Toast from '../../components/common/Toast';
import { v4 as uuidv4 } from 'uuid'; // Bạn cần cài uuid: npm install uuid

const SeatLayout = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [loadingSave, setLoadingSave] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '' });

    // Dữ liệu chỉnh sửa
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [grid, setGrid] = useState([]);
    const [selectedType, setSelectedType] = useState('regular'); // Mặc định là ghế thường

    const showToast = (message) => setToast({ show: true, message });

    useEffect(() => {
        fetchLayout();
    }, [id]);

    const fetchLayout = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await fetch(
                `https://cinema-api-production-f2bc.up.railway.app/api/v1/manager/seat-layouts/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json'
                    }
                }
            );

            const json = await res.json();
            if (res.ok && json.data) {
                setName(json.data.name);
                setDescription(json.data.description || '');
                setGrid(json.data.layout_data || []);
            } else {
                showToast('Không tải được dữ liệu ❌');
            }
        } catch (err) {
            showToast('Lỗi kết nối server ❌');
        } finally {
            setLoading(false);
        }
    };

    /* ================= LOGIC THAY ĐỔI GHẾ ================= */
    const handleSeatClick = (rIndex, sIndex) => {
        const newGrid = [...grid];
        const row = newGrid[rIndex];
        const seat = row.seats[sIndex];

        // 1. Nếu đang chọn ghế đôi
        if (selectedType === 'double') {
            const nextSeat = row.seats[sIndex + 1];
            // Kiểm tra xem ô kế tiếp có trống để làm ghế đôi không
            if (!nextSeat || nextSeat.type === 'double') {
                showToast('Không đủ khoảng trống cho ghế đôi ❌');
                return;
            }
            
            const pairId = uuidv4();
            seat.type = 'double';
            seat.pair_uuid = pairId;
            nextSeat.type = 'double';
            nextSeat.pair_uuid = pairId;

        } else if (selectedType === 'null') { // Xóa ghế (Trống)
            handleDeleteSeat(newGrid, rIndex, sIndex);
        } else {
            // 2. Các loại ghế đơn (Thường, VIP, Hư)
            // Nếu click vào một ghế đang là 'đôi', phải xóa cả cặp trước
            if (seat.type === 'double') {
                handleDeleteSeat(newGrid, rIndex, sIndex);
            }
            seat.type = selectedType;
            seat.pair_uuid = null;
        }

        setGrid(newGrid);
    };

    const handleDeleteSeat = (newGrid, rIndex, sIndex) => {
        const seat = newGrid[rIndex].seats[sIndex];
        if (seat.type === 'double' && seat.pair_uuid) {
            // Tìm ghế cùng cặp để xóa
            newGrid[rIndex].seats.forEach(s => {
                if (s.pair_uuid === seat.pair_uuid) {
                    s.type = null;
                    s.pair_uuid = null;
                }
            });
        } else {
            seat.type = null;
            seat.pair_uuid = null;
        }
    };

    /* ================= SAVE API ================= */
    const handleUpdate = async () => {
        try {
            setLoadingSave(true);
            const token = localStorage.getItem('token');
            const res = await fetch(
                `https://cinema-api-production-f2bc.up.railway.app/api/v1/manager/seat-layouts/${id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name,
                        description,
                        layout_data: grid
                    })
                }
            );

            if (res.ok) {
                showToast('Cập nhật sơ đồ thành công 🎉');
            } else {
                showToast('Cập nhật thất bại ❌');
            }
        } catch (err) {
            showToast('Lỗi hệ thống ❌');
        } finally {
            setLoadingSave(false);
        }
    };

    /* ================= ICON RENDER ================= */
    const renderIcon = (seat) => {
        if (seat.type === 'broken') return <XCircle size={18} className="text-red-500" />;
        if (seat.type === 'vip') return <IconArmchair2 size={22} className="text-amber-500" />;
        if (seat.type === 'double') return <IconSofa size={26} className="text-pink-500" />;
        if (seat.type === 'regular') return <IconArmchair size={22} className="text-blue-500" />;
        return <div className="w-5 h-5 border-2 border-dashed border-gray-200 rounded-sm" />; // Ô trống
    };

    if (loading) return <div className="p-6">Đang tải dữ liệu...</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {toast.show && <Toast message={toast.message} onClose={() => setToast({ show: false, message: '' })} />}

            {/* HEADER */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full shadow border">
                    <ChevronLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Sửa sơ đồ: {name}</h1>
                    <p className="text-sm text-gray-400">ID sơ đồ: #{id}</p>
                </div>
            </div>

            <div className="flex gap-10">
                {/* TRÁI: SƠ ĐỒ GHẾ */}
                <div className="flex-grow bg-white p-10 rounded-3xl shadow-sm border relative">
                    <div className="mb-14 flex flex-col items-center">
                        <div className="w-4/5 h-2 bg-gray-300 rounded-full shadow-inner"></div>
                        <p className="text-[10px] text-gray-400 mt-2 tracking-[0.3em] uppercase">Màn hình</p>
                    </div>

                    <div className="flex flex-col gap-4 items-center">
                        {grid.map((row, rIndex) => (
                            <div key={rIndex} className="flex items-center gap-6">
                                <div className="w-6 font-bold text-gray-600 text-sm">{row.label}</div>
                                <div className="flex gap-2">
                                    {row.seats.map((seat, sIndex) => (
                                        <div
                                            key={`${row.label}${sIndex}`}
                                            onClick={() => handleSeatClick(rIndex, sIndex)}
                                            className={`w-10 h-10 flex items-center justify-center cursor-pointer transition-all border rounded-lg hover:scale-110
                                                ${seat.type ? 'bg-white shadow-sm' : 'bg-gray-50 border-dashed'}
                                                ${seat.type === 'double' ? 'w-[88px] bg-pink-50 border-pink-200' : ''}
                                            `}
                                            style={{ display: (seat.type === 'double' && seat.pair_uuid && grid[rIndex].seats[sIndex - 1]?.pair_uuid === seat.pair_uuid) ? 'none' : 'flex' }}
                                        >
                                            {renderIcon(seat)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* PHẢI: CÔNG CỤ CHỈNH SỬA */}
                <div className="w-96 space-y-6">
                    {/* THÔNG TIN CHUNG */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border">
                        <h3 className="font-bold flex items-center gap-2 mb-4">
                            <Info size={16} /> Thông tin sơ đồ
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-400 uppercase font-bold">Tên sơ đồ</label>
                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full mt-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 uppercase font-bold">Mô tả</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows="3"
                                    className="w-full mt-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* CHỌN LOẠI GHẾ ĐỂ VẼ */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border">
                        <h3 className="font-bold mb-4 tracking-tight">Chọn loại ghế muốn thay đổi</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <LegendBtn 
                                active={selectedType === 'regular'} 
                                onClick={() => setSelectedType('regular')}
                                icon={<IconArmchair className="text-blue-500" />} 
                                text="Thường" 
                            />
                            <LegendBtn 
                                active={selectedType === 'vip'} 
                                onClick={() => setSelectedType('vip')}
                                icon={<IconArmchair2 className="text-amber-500" />} 
                                text="VIP" 
                            />
                            <LegendBtn 
                                active={selectedType === 'double'} 
                                onClick={() => setSelectedType('double')}
                                icon={<IconSofa className="text-pink-500" />} 
                                text="Ghế Đôi" 
                            />
                             <LegendBtn 
                                active={selectedType === 'broken'} 
                                onClick={() => setSelectedType('broken')}
                                icon={<XCircle className="text-red-500" />} 
                                text="Ghế Hư" 
                            />
                            <LegendBtn 
                                active={selectedType === 'null'} 
                                onClick={() => setSelectedType('null')}
                                icon={<IconEraser className="text-gray-400" />} 
                                text="Xóa ô" 
                            />
                        </div>
                    </div>

                    {/* NÚT LƯU */}
                    <button
                        onClick={handleUpdate}
                        disabled={loadingSave}
                        className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-white shadow-lg transition-all
                            ${loadingSave ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}
                        `}
                    >
                        <Save size={20} />
                        {loadingSave ? 'Đang lưu...' : 'Lưu tất cả thay đổi'}
                    </button>
                </div>
            </div>
        </div>
    );
};

/* COMPONENT CON: NÚT CHÚ THÍCH */
const LegendBtn = ({ icon, text, active, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-3 p-3 border rounded-xl transition-all ${
            active ? 'border-blue-500 bg-blue-50 shadow-sm' : 'bg-white hover:bg-gray-50'
        }`}
    >
        <div className="scale-110">{icon}</div>
        <span className={`text-sm font-medium ${active ? 'text-blue-700' : 'text-gray-600'}`}>{text}</span>
    </button>
);

export default SeatLayout;