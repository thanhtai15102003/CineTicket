import { useState, useEffect } from 'react';
import LoadingSpinner from '../../components/common/LoadingSpinner';// Đảm bảo bạn có component này

const Profile = () => {
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Quản lý Tab giống Galaxy Cinema
    const [activeTab, setActiveTab] = useState('Thông Tin Cá Nhân');
    const tabs = ['Lịch Sử Giao Dịch', 'Thông Tin Cá Nhân', 'Thông Báo', 'Quà Tặng', 'Chính Sách'];

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                // Lấy token từ localStorage (bạn nhớ đổi tên key cho đúng với project của bạn)
                const token = localStorage.getItem('token');

                const response = await fetch(
                    'https://cinema-api-production-f2bc.up.railway.app/api/v1/users/me',
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            // Thêm Bearer token để xác thực
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    // Nếu API trả về object bọc trong thuộc tính data thì dùng data.data,
                    // nếu trả về thẳng object thì dùng thẳng data.
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

    // Hàm chuyển đổi format ngày từ "2020-11-10T17:00:00.000000Z" sang "10/11/2020"
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
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 pt-24 pb-20 selection:bg-red-500 selection:text-white">
            <div className="max-w-5xl mx-auto px-4 md:px-6">
                {/* THANH TABS NAVIGATION */}
                <div className="flex overflow-x-auto custom-scrollbar border-b border-zinc-800 mb-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={` whitespace-nowrap px-6 py-4 text-sm font-semibold transition-all duration-300 relative ${
                                activeTab === tab
                                    ? 'text-red-500'
                                    : 'text-zinc-400 hover:text-zinc-200'
                            }`}
                        >
                            {tab}
                            {/* Dòng line gạch dưới cho tab active */}
                            {activeTab === tab && (
                                <span className="absolute bottom-0 left-0 w-full h-[3px] bg-red-500 rounded-t-full shadow-[0_-2px_10px_rgba(239,68,68,0.8)]"></span>
                            )}
                        </button>
                    ))}
                </div>

                {/* NỘI DUNG TAB: THÔNG TIN CÁ NHÂN */}
                {activeTab === 'Thông Tin Cá Nhân' && userData && (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 shadow-2xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                            {/* Họ và tên */}
                            <div className="flex flex-col gap-2">
                                <label className="text-zinc-400 text-sm font-medium">
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
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-zinc-300 focus:outline-none cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            {/* Ngày sinh */}
                            <div className="flex flex-col gap-2">
                                <label className="text-zinc-400 text-sm font-medium">
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
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-zinc-300 focus:outline-none cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="flex flex-col gap-2">
                                <label className="text-zinc-400 text-sm font-medium">Email</label>
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
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-12 pr-20 text-zinc-300 focus:outline-none cursor-not-allowed"
                                    />
                                    <button className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-red-500 hover:text-red-400 font-medium">
                                        Thay đổi
                                    </button>
                                </div>
                            </div>

                            {/* Số điện thoại */}
                            <div className="flex flex-col gap-2">
                                <label className="text-zinc-400 text-sm font-medium">
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
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-zinc-300 focus:outline-none cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            {/* Giới tính */}
                            <div className="flex flex-col justify-center gap-4 mt-2">
                                <div className="flex items-center gap-8">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="male"
                                            checked={userData.gender === 'male'}
                                            readOnly
                                            className="w-5 h-5 accent-red-500 bg-zinc-800 border-zinc-700"
                                        />
                                        <span className="text-zinc-300 group-hover:text-white transition-colors">
                                            Nam
                                        </span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="female"
                                            checked={userData.gender === 'female'}
                                            readOnly
                                            className="w-5 h-5 accent-red-500 bg-zinc-800 border-zinc-700"
                                        />
                                        <span className="text-zinc-300 group-hover:text-white transition-colors">
                                            Nữ
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {/* Mật khẩu */}
                            <div className="flex flex-col gap-2">
                                <label className="text-zinc-400 text-sm font-medium">
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
                                        value="12345678" // Giả lập mật khẩu ẩn
                                        readOnly
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-12 pr-20 text-zinc-300 focus:outline-none cursor-not-allowed tracking-[0.2em]"
                                    />
                                    <button className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-red-500 hover:text-red-400 font-medium">
                                        Thay đổi
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Nút Cập Nhật */}
                        <div className="mt-10 flex justify-end">
                            <button className="px-8 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(225,29,72,0.4)] hover:-translate-y-0.5 transition-all duration-300">
                                Cập nhật
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
