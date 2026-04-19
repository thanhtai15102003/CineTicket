import React, { useState } from 'react';
import { Save, CheckCircle, Info } from 'lucide-react';
import { IconArmchair, IconArmchair2, IconSofa } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import Toast from '../../components/common/Toast';

const SeatLayout = () => {
    const [selectedSeats, setSelectedSeats] = useState(['C12']);
    const [isSaved, setIsSaved] = useState(false);
    const [isActive, setIsActive] = useState(false);

    // 👉 Toast state
    const [toast, setToast] = useState({
        show: false,
        message: ''
    });

    const navigate = useNavigate();

    const showToast = (message) => {
        setToast({ show: true, message });
    };

    const toggleSeat = (id) => {
        if (selectedSeats.includes(id)) {
            setSelectedSeats(selectedSeats.filter((s) => s !== id));
        } else {
            setSelectedSeats([...selectedSeats, id]);
        }
    };

    const handleSaveDraft = () => {
        setIsSaved(true);
        setIsActive(true);
        showToast('Lưu sơ đồ ghế thành công 🎉');
    };

    const handleUpdate = () => {
        showToast('Cập nhật thành công 🚀');

        // delay nhẹ cho user thấy toast rồi mới chuyển trang
        setTimeout(() => {
            navigate('/admin/rooms');
        }, 1200);
    };

    const rowsData = [
        { label: 'A', type: 'normal', count: 13 },
        { label: 'B', type: 'normal', count: 13 },
        { label: 'C', type: 'normal', count: 13 },
        { label: 'D', type: 'normal', count: 13 },
        { label: 'E', type: 'vip', count: 13 },
        { label: 'F', type: 'vip', count: 13 },
        { label: 'G', type: 'double', count: 6 }
    ];

    const getIcon = (type, isSelected, isDouble) => {
        const baseClass = isSelected
            ? 'scale-110 text-black'
            : 'text-slate-400 opacity-60 group-hover:opacity-100 group-hover:text-black';

        if (type === 'vip') {
            return <IconArmchair2 size={24} className={`transition-all ${baseClass}`} />;
        }

        if (type === 'double') {
            return <IconSofa size={isDouble ? 32 : 28} className={`transition-all ${baseClass}`} />;
        }

        return <IconArmchair size={24} className={`transition-all ${baseClass}`} />;
    };

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen text-slate-800">
            {/* 🔥 TOAST */}
            {toast.show && (
                <Toast
                    message={toast.message}
                    onClose={() => setToast({ show: false, message: '' })}
                />
            )}

            <div className="max-w-7xl mx-auto lg:flex gap-10">
                {/* LEFT */}
                <div className="flex-grow">
                    <h2 className="text-xl md:text-2xl font-bold mb-6">Thiết lập sơ đồ ghế</h2>

                    <div className="bg-white p-4 md:p-10 rounded-3xl shadow-sm border">
                        {/* SCREEN */}
                        <div className="mb-10 md:mb-20 flex flex-col items-center">
                            <div className="w-4/5 h-2 bg-slate-200 rounded-full"></div>
                            <p className="mt-3 text-[10px] text-slate-400 uppercase tracking-widest">
                                Màn hình chiếu
                            </p>
                        </div>

                        {/* SEATS */}
                        <div className="flex flex-col gap-4">
                            {rowsData.map((row) => (
                                <div key={row.label} className="flex items-center gap-3">
                                    <div className="w-6 text-sm font-bold text-slate-300">
                                        {row.label}
                                    </div>

                                    <div className="flex gap-1 sm:gap-2 justify-center w-full">
                                        {Array.from({ length: row.count }).map((_, index) => {
                                            const seatNumber =
                                                row.type === 'double'
                                                    ? `${index * 2 + 1}-${index * 2 + 2}`
                                                    : index + 1;

                                            const seatId = `${row.label}${seatNumber}`;
                                            const isSelected = selectedSeats.includes(seatId);
                                            const isDouble = row.type === 'double';

                                            return (
                                                <div
                                                    key={seatId}
                                                    onClick={() => toggleSeat(seatId)}
                                                    className={`
                                                        relative flex items-center justify-center cursor-pointer
                                                        transition-all duration-300 group
                                                        ${
                                                            isDouble
                                                                ? 'w-12 sm:w-16 md:w-20'
                                                                : 'w-7 sm:w-9 md:w-11'
                                                        }
                                                        h-7 sm:h-9 md:h-11
                                                    `}
                                                >
                                                    {getIcon(row.type, isSelected, isDouble)}

                                                    {/* TOOLTIP */}
                                                    <div
                                                        className="
                                                        absolute -top-6 left-1/2 -translate-x-1/2
                                                        text-[10px] px-2 py-0.5 rounded bg-black text-white
                                                        opacity-0 group-hover:opacity-100 transition pointer-events-none
                                                    "
                                                    >
                                                        {seatId}
                                                    </div>

                                                    {isSelected && (
                                                        <CheckCircle
                                                            size={12}
                                                            className="absolute -top-1 -right-1 text-black bg-white rounded-full"
                                                        />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT */}
                <div className="w-full lg:w-96 mt-8 flex flex-col gap-6">
                    {/* INFO */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border">
                        <div className="flex items-center gap-2 mb-6">
                            <Info size={18} className="text-slate-400" />
                            <h3 className="text-lg font-bold">Thông Tin</h3>
                        </div>

                        {/* STATUS */}
                        <div className="flex justify-between py-3 border-b">
                            <span className="text-sm text-slate-400">Trạng Thái</span>
                            <span
                                className={`text-sm font-bold ${isSaved ? 'text-green-600' : 'text-slate-600'}`}
                            >
                                {isSaved ? 'Đã xuất bản' : 'Chưa xuất bản'}
                            </span>
                        </div>

                        {/* ACTIVE */}
                        <div className="flex justify-between py-3 items-center">
                            <span className="text-sm text-slate-400">Hoạt Động</span>

                            {isSaved ? (
                                <button
                                    onClick={() => setIsActive(!isActive)}
                                    className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
                                        isActive ? 'bg-green-500' : 'bg-slate-300'
                                    }`}
                                >
                                    <div
                                        className={`bg-white w-4 h-4 rounded-full shadow transform transition ${
                                            isActive ? 'translate-x-6' : ''
                                        }`}
                                    ></div>
                                </button>
                            ) : (
                                <span className="text-sm text-slate-400 italic">Ngoại tuyến</span>
                            )}
                        </div>

                        {/* BUTTONS */}
                        <div className="flex flex-col gap-3 mt-6">
                            <button
                                onClick={isSaved ? () => navigate('/admin/rooms') : handleSaveDraft}
                                className="flex items-center justify-center gap-2 bg-slate-100 px-6 py-3 rounded-xl"
                            >
                                <Save size={16} />
                                {isSaved ? 'Danh sách' : 'Lưu Nháp'}
                            </button>

                            <button
                                onClick={isSaved ? handleUpdate : handleSaveDraft}
                                className="bg-black text-white px-6 py-3 rounded-xl"
                            >
                                {isSaved ? 'Cập nhật' : 'Xuất Bản Ngay'}
                            </button>
                        </div>
                    </div>

                    {/* LEGEND */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border">
                        <h3 className="text-lg font-bold mb-6">Chú thích ghế</h3>

                        <LegendItem icon={<IconArmchair size={22} />} label="Ghế Thường" />
                        <LegendItem icon={<IconArmchair2 size={22} />} label="Ghế VIP" />
                        <LegendItem icon={<IconSofa size={26} />} label="Ghế Đôi" />

                        <div className="pt-5 mt-5 border-t">
                            <div className="flex items-center gap-3">
                                <CheckCircle size={16} />
                                <span className="text-xs font-black text-slate-500 uppercase">
                                    Ghế đang chọn
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const LegendItem = ({ icon, label }) => (
    <div className="flex items-center gap-3 mb-4">
        <div className="w-8 flex justify-center">{icon}</div>
        <span className="text-xs font-bold text-slate-500 uppercase">{label}</span>
    </div>
);

export default SeatLayout;
