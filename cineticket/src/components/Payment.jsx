import { useState } from 'react';
import { CreditCard, Tag, CheckCircle2, AlertCircle, TicketPercent } from 'lucide-react';

const PAYMENT_METHODS = [
    {
        id: 'momo',
        name: 'Ví điện tử MoMo',
        icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRoNz2gtWB8db4uhkDHXbGnYQ94sQb1BlSww&s',
        description: 'Thanh toán nhanh chóng qua ứng dụng MoMo'
    },
    {
        id: 'vnpay',
        name: 'VNPAY-QR',
        icon: 'https://yt3.googleusercontent.com/JM1m2wng0JQUgSg9ZSEvz7G4Rwo7pYb4QBYip4PAhvGRyf1D_YTbL2DdDjOy0qOXssJPdz2r7Q=s900-c-k-c0x00ffffff-no-rj',
        description: 'Quét mã QR qua ứng dụng ngân hàng'
    },
    {
        id: 'zalopay',
        name: 'Ví ZaloPay',
        icon: 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay-Square.png',
        description: 'Thanh toán tiện lợi qua ZaloPay'
    },
    {
        id: 'atm',
        name: 'Thẻ ATM nội địa',
        icon: 'https://cdn-icons-png.flaticon.com/512/6963/6963703.png',
        description: 'Hỗ trợ tất cả các ngân hàng nội địa'
    },
    {
        id: 'credit',
        name: 'Thẻ quốc tế (Visa, Master, JCB)',
        icon: 'https://cdn-icons-png.flaticon.com/512/217/217425.png',
        description: 'Thanh toán bằng thẻ tín dụng/ghi nợ'
    }
];

const Payment = ({ paymentMethod, setPaymentMethod, onDiscountChange, setToast }) => {
    const [voucherCode, setVoucherCode] = useState('');
    const [voucherStatus, setVoucherStatus] = useState('');

    const handleApplyVoucher = () => {
        if (!voucherCode.trim()) return;

        const code = voucherCode.toUpperCase().trim();
        if (code === 'GALAXY' || code === 'ITNAM4') {
            onDiscountChange(20000);
            setVoucherStatus('success');
            setToast({
                show: true,
                message: 'Tuyệt vời! Đã áp dụng mã giảm giá 20.000đ.',
                type: 'success'
            });
        } else {
            onDiscountChange(0);
            setVoucherStatus('error');
        }
    };

    return (
        <div className="space-y-6">
            {/* ======================================= */}
            {/* MỤC 1: KHUYẾN MÃI                       */}
            {/* ======================================= */}
            <div className="bg-zinc-900/60 p-6 md:p-8 rounded-3xl border border-zinc-800 shadow-lg">
                <h2 className="text-[17px] font-bold text-white flex items-center gap-2.5 mb-5">
                    <TicketPercent className="text-orange-500" size={20} />
                    Mã khuyến mãi
                </h2>

                <div className="relative">
                    <div
                        className={`flex items-center bg-zinc-950 border rounded-2xl p-1.5 transition-all duration-300 focus-within:ring-1 focus-within:ring-orange-500 focus-within:border-orange-500
                        ${voucherStatus === 'error' ? 'border-red-500/50' : voucherStatus === 'success' ? 'border-green-500/50' : 'border-zinc-800'}`}
                    >
                        <input
                            type="text"
                            placeholder="Nhập mã (Thử: ITNAM4)"
                            value={voucherCode}
                            onChange={(e) => {
                                setVoucherCode(e.target.value);
                                setVoucherStatus('');
                            }}
                            className="flex-1 bg-transparent border-none outline-none text-white px-4 py-2.5 placeholder:text-zinc-600 font-medium tracking-wide"
                        />

                        <button
                            onClick={handleApplyVoucher}
                            disabled={!voucherCode.trim()}
                            className="bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors duration-300"
                        >
                            Áp dụng
                        </button>
                    </div>

                    <div className="mt-3 px-2 min-h-[20px]">
                        {voucherStatus === 'error' && (
                            <p className="text-red-400 text-sm flex items-center gap-1.5">
                                <AlertCircle size={15} /> Mã không hợp lệ hoặc đã hết lượt sử dụng.
                            </p>
                        )}
                        {voucherStatus === 'success' && (
                            <p className="text-green-400 text-sm flex items-center gap-1.5">
                                <CheckCircle2 size={15} /> Đã giảm thành công 20.000đ vào tổng tiền!
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* ======================================= */}
            {/* MỤC 2: PHƯƠNG THỨC THANH TOÁN           */}
            {/* ======================================= */}
            <div className="bg-zinc-900/60 p-6 md:p-8 rounded-3xl border border-zinc-800 shadow-lg">
                <h2 className="text-[17px] font-bold text-white flex items-center gap-2.5 mb-5">
                    <CreditCard className="text-orange-500" size={20} />
                    Phương thức thanh toán
                </h2>

                {/* Danh sách bọc trong một khối liền mạch */}
                <div className="flex flex-col bg-zinc-950/50 rounded-2xl border border-zinc-800/80 overflow-hidden">
                    {PAYMENT_METHODS.map((method, index) => {
                        const isSelected = paymentMethod === method.id;
                        return (
                            <div
                                key={method.id}
                                onClick={() => setPaymentMethod(method.id)}
                                className={`group flex items-center gap-4 p-4 cursor-pointer transition-colors duration-200
                                    ${index !== PAYMENT_METHODS.length - 1 ? 'border-b border-zinc-800/80' : ''}
                                    ${isSelected ? 'bg-orange-500/10' : 'hover:bg-zinc-800/40'}
                                `}
                            >
                                {/* Nút Radio: Dùng kiểu viền cam đồng bộ Dark mode */}
                                <div className="shrink-0 flex items-center justify-center w-5 h-5 ml-1">
                                    {isSelected ? (
                                        <div className="w-5 h-5 rounded-full border-[5px] border-orange-500 bg-transparent"></div>
                                    ) : (
                                        <div className="w-5 h-5 rounded-full border-2 border-zinc-600 group-hover:border-zinc-400"></div>
                                    )}
                                </div>

                                {/* Khung Logo: Ô vuông trắng nhỏ bo góc như Icon App iOS */}
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm p-1.5">
                                    <img
                                        src={method.icon}
                                        alt={method.name}
                                        className="max-w-full max-h-full object-contain"
                                    />
                                </div>

                                {/* Nội dung Text */}
                                <div className="flex-1">
                                    <h3
                                        className={`text-[15px] transition-colors duration-200 ${isSelected ? 'text-orange-400 font-semibold' : 'text-zinc-200 font-medium group-hover:text-white'}`}
                                    >
                                        {method.name}
                                    </h3>
                                    <p className="text-[13px] text-zinc-500 mt-0.5">
                                        {method.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Payment;
