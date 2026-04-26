// src/components/profile/TransactionHistory.jsx
import React, { useState } from 'react';


// DỮ LIỆU GIẢ LẬP LỊCH SỬ GIAO DỊCH
const MOCK_HISTORY = [
    {
        id: 'CT8829102',
        movie_title: 'Phí Phông: Quỷ Máu Rừng Thiêng',
        poster_url:
            'https://files.betacorp.vn/media%2fimages%2f2026%2f03%2f26%2fanh%2Dchup%2Dman%2Dhinh%2D2026%2D03%2D26%2D114032%2D114119%2D260326%2D54.png',
        cinema_name: 'CINETICKET PREMIUM QUẬN 1',
        show_date: '20/04/2026',
        show_time: '19:30',
        room: 'Rạp 3',
        seats: 'H7, H8',
        total_price: 180000,
        status: 'upcoming'
    },
    {
        id: 'CT8823155',
        movie_title: 'Dune: Hành Tinh Cát - Phần 2',
        poster_url:
            'https://files.betacorp.vn/media%2fimages%2f2024%2f02%2f27%2f400x600-111153-270224-21.jpg',
        cinema_name: 'CINETICKET GÒ VẤP',
        show_date: '10/03/2026',
        show_time: '14:15',
        room: 'Rạp IMAX',
        seats: 'K10',
        total_price: 150000,
        status: 'completed'
    },
    {
        id: 'CT8810023',
        movie_title: 'Mai',
        poster_url:
            'https://files.betacorp.vn/media%2fimages%2f2024%2f01%2f30%2fmai-163236-300124-74.jpg',
        cinema_name: 'CINETICKET THỦ ĐỨC',
        show_date: '15/02/2026',
        show_time: '20:00',
        room: 'Rạp 1',
        seats: 'E5, E6, E7',
        total_price: 360000,
        status: 'cancelled'
    }
];

const TransactionHistory = () => {
    // State quản lý việc bật/tắt Popup mã QR vé
    const [selectedTicket, setSelectedTicket] = useState(null);

    // Hàm phụ trợ để lấy màu và nhãn cho trạng thái VÉ
    const getStatusInfo = (status) => {
        switch (status) {
            case 'upcoming': // Hoặc trạng thái từ BE trả về là 'unused'
                return {
                    label: 'Chưa sử dụng',
                    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                };
            case 'completed': // Hoặc 'used'
                return {
                    label: 'Đã sử dụng',
                    color: 'text-zinc-400 bg-zinc-800 border-zinc-700'
                };
            case 'cancelled':
                return {
                    label: 'Đã hủy',
                    color: 'text-red-400 bg-red-500/10 border-red-500/20'
                };
            default:
                return {
                    label: 'Không rõ',
                    color: 'text-zinc-400 bg-zinc-800 border-zinc-700'
                };
        }
    };

    return (
        <>
            <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl animate-fade-in-up">
                {/* Header Phần Lịch Sử */}
                <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-red-600 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.5)]"></div>
                        <h3 className="text-xl font-bold text-white uppercase tracking-widest">
                            Vé Đã Đặt
                        </h3>
                    </div>
                    <span className="px-4 py-1.5 bg-black/40 border border-white/5 rounded-full text-xs font-medium text-zinc-400">
                        {MOCK_HISTORY.length} giao dịch
                    </span>
                </div>

                {/* Danh Sách Vé */}
                <div className="flex flex-col gap-5">
                    {MOCK_HISTORY.length === 0 ? (
                        <div className="text-center py-16 bg-black/20 rounded-2xl border border-white/5">
                            <p className="text-zinc-500 font-medium">Bạn chưa có giao dịch nào.</p>
                        </div>
                    ) : (
                        MOCK_HISTORY.map((item, index) => {
                            const statusInfo = getStatusInfo(item.status);

                            return (
                                <div
                                    key={index}
                                    className="flex flex-col sm:flex-row bg-black/40 border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 hover:shadow-2xl hover:shadow-red-500/5 transition-all group"
                                >
                                    {/* 1. Poster Phim */}
                                    <div className="w-full sm:w-32 h-48 sm:h-auto flex-shrink-0 relative overflow-hidden">
                                        <img
                                            src={item.poster_url}
                                            alt={item.movie_title}
                                            className={`w-full h-full object-cover transition-all duration-500 ${item.status === 'upcoming' ? 'opacity-100 group-hover:scale-105' : 'opacity-60 grayscale-[50%]'}`}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent sm:hidden"></div>
                                    </div>

                                    {/* 2. Thông tin chính (Giữa) */}
                                    <div className="flex-1 p-5 md:p-6 flex flex-col justify-center">
                                        <div className="mb-4">
                                            <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">
                                                Mã GD:{' '}
                                                <span className="text-zinc-300">{item.id}</span>
                                            </p>
                                            <h4 className="text-xl font-bold text-white line-clamp-1 group-hover:text-red-400 transition-colors">
                                                {item.movie_title}
                                            </h4>
                                        </div>

                                        {/* Lưới thông tin chi tiết */}
                                        <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                                            <div className="flex items-center gap-2 text-zinc-400">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-4 w-4 text-zinc-500"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                                    />
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                                    />
                                                </svg>
                                                <span className="truncate">{item.cinema_name}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-zinc-400">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-4 w-4 text-zinc-500"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                    />
                                                </svg>
                                                <span>
                                                    {item.show_time} - {item.show_date}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-zinc-400">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-4 w-4 text-zinc-500"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                                    />
                                                </svg>
                                                <span>{item.room}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-zinc-400">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-4 w-4 text-red-500"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                                    />
                                                </svg>
                                                <span className="font-bold text-white">
                                                    Ghế:{' '}
                                                    <span className="text-red-400">
                                                        {item.seats}
                                                    </span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Đường xé vé (Chỉ hiện trên giao diện desktop) */}
                                    <div className="hidden sm:flex flex-col justify-center items-center relative">
                                        <div className="w-[1px] h-full border-l-2 border-dashed border-white/10"></div>
                                        <div className="absolute top-[-10px] w-5 h-5 rounded-full bg-zinc-950"></div>
                                        <div className="absolute bottom-[-10px] w-5 h-5 rounded-full bg-zinc-950"></div>
                                    </div>

                                    {/* 3. Giá tiền & Nút Hành động */}
                                    <div className="p-5 sm:w-48 bg-zinc-950/30 flex flex-row sm:flex-col justify-between items-center sm:items-end border-t sm:border-t-0 border-white/5">
                                        <span
                                            className={`px-3 py-1 border rounded-full text-[11px] font-bold uppercase tracking-wider ${statusInfo.color}`}
                                        >
                                            {statusInfo.label}
                                        </span>

                                        <div className="text-right flex flex-col items-end gap-3 mt-0 sm:mt-auto">
                                            <div className="text-xl font-black text-white">
                                                {item.total_price.toLocaleString('vi-VN')}đ
                                            </div>

                                            {/* NÚT BẤM THÔNG MINH DỰA THEO TRẠNG THÁI */}
                                            <button
                                                onClick={() => setSelectedTicket(item)}
                                                className={`... ${
                                                    item.status === 'upcoming'
                                                        ? 'bg-red-600 text-white hover:bg-red-700 shadow-[0_0_15px_rgba(220,38,38,0.4)]'
                                                        : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
                                                }`}
                                            >
                                                {item.status === 'upcoming'
                                                    ? 'Hiện mã QR'
                                                    : 'Chi tiết vé'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* ===================== POPUP E-TICKET (QR CODE) ===================== */}
            {selectedTicket && (
                <div
                    className="fixed inset-0 z-[999] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-fade-in"
                    onClick={() => setSelectedTicket(null)}
                >
                    <div
                        className="bg-white rounded-[2rem] w-full max-w-sm overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.2)] animate-scale-in relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Nút đóng */}
                        <button
                            onClick={() => setSelectedTicket(null)}
                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-black/10 text-black/60 rounded-full hover:bg-black/20 transition-colors z-10"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>

                        {/* Nửa trên: QR Code */}
                        <div className="pt-10 pb-6 px-8 flex flex-col items-center bg-gray-50 border-b-2 border-dashed border-gray-300 relative">
                            {/* 2 lỗ khoét giả xé vé */}
                            <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-black/90 rounded-full"></div>
                            <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-black/90 rounded-full"></div>

                            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4">
                                Quét mã tại quầy / lối vào
                            </p>

                            {/* DEMO QR CODE (Dùng API tạo QR miễn phí) */}
                            <div className="p-3 bg-white border border-gray-200 rounded-2xl shadow-sm mb-4">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${selectedTicket.id}&color=000000`}
                                    alt="QR Code"
                                    className={`w-40 h-40 ${selectedTicket.status !== 'upcoming' ? 'opacity-30' : ''}`}
                                />
                            </div>

                            {selectedTicket.status !== 'upcoming' && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="bg-black/80 text-white px-4 py-2 font-bold uppercase tracking-widest rounded-lg rotate-12">
                                        VÉ KHÔNG KHẢ DỤNG
                                    </span>
                                </div>
                            )}

                            <p className="font-mono text-xl tracking-[0.2em] text-gray-800 font-bold">
                                {selectedTicket.id}
                            </p>
                        </div>

                        {/* Nửa dưới: Thông tin vé */}
                        <div className="p-8 pt-6">
                            <h3 className="text-xl font-black text-gray-900 text-center mb-6 line-clamp-2">
                                {selectedTicket.movie_title}
                            </h3>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                                    <span className="text-gray-500 text-sm">Rạp</span>
                                    <span className="font-bold text-gray-900 text-right max-w-[60%]">
                                        {selectedTicket.cinema_name}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                                    <span className="text-gray-500 text-sm">Thời gian</span>
                                    <span className="font-bold text-gray-900">
                                        {selectedTicket.show_time} - {selectedTicket.show_date}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                                    <span className="text-gray-500 text-sm">Phòng chiếu</span>
                                    <span className="font-bold text-gray-900">
                                        {selectedTicket.room}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pt-1">
                                    <span className="text-gray-500 text-sm">Ghế ngồi</span>
                                    <span className="text-xl font-black text-red-600">
                                        {selectedTicket.seats}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};;

export default TransactionHistory;
