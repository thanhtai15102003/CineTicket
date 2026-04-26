// src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useLocation } from 'react-router-dom';

// Import các mảnh ghép vừa tách ra
import MembershipCard from '../../components/profile/MembershipCard';
import UserInfoForm from '../../components/profile/UserInfoForm';
import TransactionHistory from '../../components/profile/TransactionHistory';

const Profile = () => {
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(location.state?.targetTab || 'Thông Tin Cá Nhân');
    

    const tabs = ['Lịch Sử Giao Dịch', 'Thông Tin Cá Nhân', 'Thông Báo', 'Quà Tặng', 'Chính Sách'];

    useEffect(() => {
        // Kiểm tra xem có yêu cầu mở tab cụ thể từ Header/Sidebar gửi sang không
        if (location.state?.targetTab) {
            // 1. Chuyển sang đúng tab đó
            setActiveTab(location.state.targetTab);

            // 2. Xóa cái "phong bì" state này đi.
            // Mục đích: Để nếu user lỡ tay bấm F5 (Reload trang), trình duyệt sẽ không nhớ lệnh mở tab cũ nữa mà quay về mặc định.
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(
                    'https://cinema-api-production-f2bc.up.railway.app/api/v1/users/me',
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (response.ok) {
                    const data = await response.json();
                    setUserData(data.data || data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUserProfile();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    if (isLoading)
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <LoadingSpinner isDark={true} />
            </div>
        );

    const memberCode = userData?.member_code
        ? userData.member_code
        : `CT${userData?.phone || '0000000000'}`;

    return (
        <div className="min-h-screen bg-zinc-950 pt-28 pb-20 relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[500px] bg-red-600/10 blur-[150px] rounded-full pointer-events-none z-0"></div>

            <div className="max-w-6xl mx-auto px-4 md:px-6 relative z-10">
                {/* THANH TABS NAVIGATION */}
                <div className="flex overflow-x-auto border-b border-zinc-800/80 mb-10 [&::-webkit-scrollbar]:hidden">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`whitespace-nowrap px-6 py-4 text-[15px] font-bold tracking-wide relative ${
                                activeTab === tab
                                    ? 'text-white'
                                    : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-red-500"></span>
                            )}
                        </button>
                    ))}
                </div>

                {/* VÙNG NỘI DUNG GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Luôn render cột trái (Thẻ thành viên) */}
                    <div className="lg:col-span-4">
                        <MembershipCard
                            userData={userData}
                            memberCode={memberCode}
                            formatDate={formatDate}
                        />
                    </div>

                    {/* Dựa vào Active Tab để render nội dung cột phải */}
                    <div className="lg:col-span-8">
                        {activeTab === 'Thông Tin Cá Nhân' && (
                            <UserInfoForm userData={userData} formatDate={formatDate} />
                        )}
                        {activeTab === 'Lịch Sử Giao Dịch' && <TransactionHistory />}

                        {/* Các Tab đang phát triển */}
                        {['Thông Báo', 'Quà Tặng', 'Chính Sách'].includes(activeTab) && (
                            <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-10 flex items-center justify-center min-h-[400px]">
                                <p className="text-zinc-500 text-sm">
                                    Tính năng "{activeTab}" đang được phát triển.
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
