import { useState, useEffect } from 'react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Barcode from 'react-barcode';

// DỮ LIỆU GIẢ LẬP LỊCH SỬ GIAO DỊCH (Đợi có API sẽ thay thế bằng state)
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
        status: 'upcoming' // upcoming, completed, cancelled
    },
    {
        id: 'CT8823155',
        movie_title: 'Dune: Hành Tinh Cát - Phần 2',
        poster_url:
            'https://files.betacorp.vn/media%2fimages%2f2024%2f02%2f27%2f400x600-111153-270224-21.jpg',
        cinema_name: 'CINETICKET GÒ VẤP',
        show_date: '10/03/2026',
        show_time: '14:15',
        room: 'Rạp 1',
        seats: 'K10',
        total_price: 90000,
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
        room: 'Rạp IMAX',
        seats: 'E5, E6, E7',
        total_price: 360000,
        status: 'cancelled'
    }
];

const Profile = () => {
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const [activeTab, setActiveTab] = useState('Thông Tin Cá Nhân');
    const tabs = ['Lịch Sử Giao Dịch', 'Thông Tin Cá Nhân', 'Thông Báo', 'Quà Tặng', 'Chính Sách'];

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(
                    'https://cinema-api-production-f2bc.up.railway.app/api/v1/users/me',
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    setUserData(data.data || data);
                } else {
                    console.error('Không thể lấy thông tin user');
                }
            } catch (error) {
                console.error('Lỗi khi gọi API profile:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center pt-20">
                <LoadingSpinner isDark={true} />
            </div>
        );
    }

    const memberCode = userData?.member_code
        ? userData.member_code
        : userData?.phone
          ? `CT${userData.phone}`
          : 'CT0000000000';

    return (
        <div className="min-h-screen bg-zinc-950 pt-28 pb-20 selection:bg-red-500 selection:text-white relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[500px] bg-red-600/10 blur-[150px] rounded-full pointer-events-none z-0"></div>

            <div className="max-w-6xl mx-auto px-4 md:px-6 relative z-10">
                {/* THANH TABS NAVIGATION */}
                <div className="flex overflow-x-auto border-b border-zinc-800/80 mb-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={` whitespace-nowrap px-6 py-4 text-[15px] font-bold tracking-wide transition-all duration-300 relative ${
                                activeTab === tab
                                    ? 'text-white'
                                    : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-red-500 shadow-[0_-2px_10px_rgba(239,68,68,0.8)]"></span>
                            )}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* ===== CỘT TRÁI: THẺ THÀNH VIÊN (LUÔN HIỂN THỊ CHUNG) ===== */}
                    <div className="lg:col-span-4 w-full max-w-sm mx-auto lg:mx-0">
                        <div className="relative aspect-[1/1.4] sm:aspect-[1.586/1] lg:aspect-[1/1.4] rounded-2xl overflow-hidden shadow-2xl group cursor-pointer transition-transform duration-500 hover:-translate-y-2 flex flex-col">
                            <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 via-zinc-900 to-black border border-white/10 rounded-2xl"></div>
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-red-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                            <div className="relative p-6 flex flex-col justify-between flex-1">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center -skew-x-6 shadow-[0_0_10px_rgba(220,38,38,0.5)]">
                                            <span className="text-white font-black text-xs italic">
                                                CT
                                            </span>
                                        </div>
                                        <span className="text-white font-black text-sm tracking-widest">
                                            CINETICKET
                                        </span>
                                    </div>
                                    <div className="px-3 py-1 bg-gradient-to-r from-amber-200 to-yellow-500 text-black text-[10px] font-black uppercase tracking-widest rounded-full shadow-[0_0_15px_rgba(252,211,77,0.4)]">
                                        {userData.role?.role_name || 'Member'}
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <p className="text-zinc-400 text-[10px] font-medium uppercase tracking-widest mb-1">
                                        Thành viên
                                    </p>
                                    <p className="text-white font-bold text-xl uppercase tracking-wide truncate drop-shadow-sm">
                                        {userData.full_name || 'THÀNH VIÊN MỚI'}
                                    </p>
                                </div>

                                <div className="mt-auto bg-white p-3 rounded-xl flex flex-col items-center justify-center shadow-inner">
                                    <Barcode
                                        value={memberCode}
                                        width={1.8}
                                        height={45}
                                        displayValue={true}
                                        background="#ffffff"
                                        lineColor="#000000"
                                        fontSize={14}
                                        margin={0}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="text-center mt-4">
                            <p className="text-sm text-zinc-500">
                                Tham gia từ: {formatDate(userData.created_at || new Date())}
                            </p>
                        </div>
                    </div>

                    {/* ===== CỘT PHẢI: THAY ĐỔI DỰA TRÊN TAB ĐANG CHỌN ===== */}
                    <div className="lg:col-span-8">
                        {/* TAB 1: THÔNG TIN CÁ NHÂN */}
                        {activeTab === 'Thông Tin Cá Nhân' && userData && (
                            <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-8 lg:p-10 shadow-2xl animate-fade-in-up">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-1.5 h-6 bg-red-600 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.5)]"></div>
                                    <h3 className="text-xl font-bold text-white uppercase tracking-widest">
                                        Hồ Sơ Của Tôi
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    {/* (Giữ nguyên các thẻ input form như cũ) */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
                                            Họ và tên
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-5 w-5"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </div>
                                            <input
                                                type="text"
                                                value={userData.full_name || ''}
                                                readOnly
                                                className="w-full bg-black/40 border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-white font-medium focus:outline-none cursor-not-allowed hover:border-white/10 transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
                                            Ngày sinh
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-5 w-5"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </div>
                                            <input
                                                type="text"
                                                value={formatDate(userData.date_of_birth)}
                                                readOnly
                                                className="w-full bg-black/40 border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-white font-medium focus:outline-none cursor-not-allowed hover:border-white/10 transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
                                            Giới tính
                                        </label>
                                        <div className="flex h-[52px] items-center gap-8 bg-black/40 border border-white/5 rounded-xl px-4">
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <input
                                                    type="radio"
                                                    name="gender"
                                                    value="male"
                                                    checked={userData.gender === 'male'}
                                                    readOnly
                                                    className="w-4 h-4 accent-red-500 bg-zinc-800 border-zinc-700"
                                                />
                                                <span className="text-zinc-300 text-sm font-medium group-hover:text-white transition-colors">
                                                    Nam
                                                </span>
                                            </label>
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <input
                                                    type="radio"
                                                    name="gender"
                                                    value="female"
                                                    checked={userData.gender === 'female'}
                                                    readOnly
                                                    className="w-4 h-4 accent-red-500 bg-zinc-800 border-zinc-700"
                                                />
                                                <span className="text-zinc-300 text-sm font-medium group-hover:text-white transition-colors">
                                                    Nữ
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
                                            Số điện thoại
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-5 w-5"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                                </svg>
                                            </div>
                                            <input
                                                type="text"
                                                value={userData.phone || ''}
                                                readOnly
                                                className="w-full bg-black/40 border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-white font-medium focus:outline-none cursor-not-allowed hover:border-white/10 transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 md:col-span-2">
                                        <label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
                                            Email
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-5 w-5"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                                </svg>
                                            </div>
                                            <input
                                                type="email"
                                                value={userData.email || ''}
                                                readOnly
                                                className="w-full bg-black/40 border border-white/5 rounded-xl py-3.5 pl-12 pr-24 text-white font-medium focus:outline-none cursor-not-allowed hover:border-white/10 transition-colors"
                                            />
                                            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white uppercase font-bold tracking-wider px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                                                Thay đổi
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 md:col-span-2">
                                        <label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
                                            Mật khẩu
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-5 w-5"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </div>
                                            <input
                                                type="password"
                                                value="123456789"
                                                readOnly
                                                className="w-full bg-black/40 border border-white/5 rounded-xl py-3.5 pl-12 pr-24 text-zinc-500 focus:outline-none cursor-not-allowed tracking-[0.3em]"
                                            />
                                            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-red-500 hover:text-white uppercase font-bold tracking-wider px-3 py-1.5 bg-red-500/10 hover:bg-red-600 rounded-lg transition-colors">
                                                Đổi mật khẩu
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-10 pt-6 border-t border-white/5 flex justify-end">
                                    <button className="group relative inline-flex items-center justify-center px-10 py-3.5 text-sm font-bold tracking-[0.15em] text-white uppercase rounded-full bg-red-600 overflow-hidden shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-transform hover:-translate-y-1">
                                        <span className="relative z-10 flex items-center gap-2">
                                            Lưu thay đổi
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: LỊCH SỬ GIAO DỊCH (VÉ ĐÃ ĐẶT) */}
                        {activeTab === 'Lịch Sử Giao Dịch' && (
                            <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-10 shadow-2xl animate-fade-in-up">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-6 bg-red-600 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.5)]"></div>
                                        <h3 className="text-xl font-bold text-white uppercase tracking-widest">
                                            Vé Đã Đặt
                                        </h3>
                                    </div>
                                    <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-medium text-zinc-400">
                                        {MOCK_HISTORY.length} giao dịch
                                    </span>
                                </div>

                                <div className="flex flex-col gap-6">
                                    {MOCK_HISTORY.length === 0 ? (
                                        <div className="text-center py-12 text-zinc-500">
                                            Bạn chưa có giao dịch nào.
                                        </div>
                                    ) : (
                                        MOCK_HISTORY.map((item, index) => (
                                            <div
                                                key={index}
                                                className="flex flex-col md:flex-row bg-black/40 border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-colors shadow-lg relative"
                                            >
                                                {/* Khu vực viền răng cưa giả hiệu ứng xé vé */}
                                                <div className="hidden md:block absolute left-28 top-0 bottom-0 w-[1px] border-l-2 border-dashed border-zinc-800 z-10"></div>

                                                {/* Cột trái: Poster Phim */}
                                                <div className="w-full md:w-28 h-40 md:h-auto flex-shrink-0 relative">
                                                    <img
                                                        src={item.poster_url}
                                                        alt={item.movie_title}
                                                        className="w-full h-full object-cover opacity-90"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent md:hidden"></div>
                                                </div>

                                                {/* Cột phải: Chi tiết vé */}
                                                <div className="p-5 md:pl-8 flex-1 flex flex-col justify-between">
                                                    {/* Hàng trên: Mã vé & Trạng thái */}
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">
                                                                Mã giao dịch: {item.id}
                                                            </p>
                                                            <h4 className="text-lg md:text-xl font-bold text-white line-clamp-1">
                                                                {item.movie_title}
                                                            </h4>
                                                        </div>
                                                        <div>
                                                            {item.status === 'upcoming' && (
                                                                <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-[11px] font-bold uppercase tracking-wider whitespace-nowrap">
                                                                    Sắp chiếu
                                                                </span>
                                                            )}
                                                            {item.status === 'completed' && (
                                                                <span className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-[11px] font-bold uppercase tracking-wider whitespace-nowrap">
                                                                    Đã xem
                                                                </span>
                                                            )}
                                                            {item.status === 'cancelled' && (
                                                                <span className="px-3 py-1 bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-full text-[11px] font-bold uppercase tracking-wider whitespace-nowrap">
                                                                    Đã hủy
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Hàng giữa: Thông tin rạp & thời gian */}
                                                    <div className="grid grid-cols-2 md:flex md:gap-8 gap-y-3 text-sm text-zinc-300">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                                                                Rạp
                                                            </span>
                                                            <span className="font-semibold text-white flex items-center gap-1.5">
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    viewBox="0 0 20 20"
                                                                    fill="currentColor"
                                                                    className="w-3.5 h-3.5 text-red-500"
                                                                >
                                                                    <path
                                                                        fillRule="evenodd"
                                                                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                                                        clipRule="evenodd"
                                                                    />
                                                                </svg>
                                                                <span className="truncate max-w-[120px]">
                                                                    {item.cinema_name}
                                                                </span>
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                                                                Suất chiếu
                                                            </span>
                                                            <span className="font-semibold text-white flex items-center gap-1.5">
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    viewBox="0 0 20 20"
                                                                    fill="currentColor"
                                                                    className="w-3.5 h-3.5 text-red-500"
                                                                >
                                                                    <path
                                                                        fillRule="evenodd"
                                                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                                                        clipRule="evenodd"
                                                                    />
                                                                </svg>
                                                                {item.show_time} - {item.show_date}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-col gap-1 col-span-2 md:col-span-1">
                                                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                                                                Ghế / Rạp
                                                            </span>
                                                            <span className="font-semibold text-white flex items-center gap-1.5">
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    viewBox="0 0 20 20"
                                                                    fill="currentColor"
                                                                    className="w-3.5 h-3.5 text-red-500"
                                                                >
                                                                    <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                                                                    <path
                                                                        fillRule="evenodd"
                                                                        d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"
                                                                        clipRule="evenodd"
                                                                    />
                                                                </svg>
                                                                <span className="text-red-400">
                                                                    {item.seats}
                                                                </span>{' '}
                                                                <span className="text-zinc-500 font-normal">
                                                                    ({item.room})
                                                                </span>
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 pt-4 border-t border-dashed border-zinc-800 flex justify-between items-center">
                                                        <div className="text-lg font-black text-white">
                                                            {item.total_price.toLocaleString(
                                                                'vi-VN'
                                                            )}{' '}
                                                            đ
                                                        </div>
                                                        <button className="text-xs font-bold text-red-500 hover:text-white uppercase tracking-wider transition-colors px-3 py-1.5 bg-red-500/10 hover:bg-red-600 rounded-lg">
                                                            Xem chi tiết vé
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* CÁC TABS KHÁC (ĐỂ TRỐNG TẠM THỜI) */}
                        {['Thông Báo', 'Quà Tặng', 'Chính Sách'].includes(activeTab) && (
                            <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-10 shadow-2xl flex flex-col items-center justify-center min-h-[400px] animate-fade-in-up">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-16 h-16 text-zinc-700 mb-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="1"
                                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                    />
                                </svg>
                                <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-2">
                                    Chưa có dữ liệu
                                </h3>
                                <p className="text-zinc-500 text-sm">
                                    Tính năng này đang được phát triển.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
