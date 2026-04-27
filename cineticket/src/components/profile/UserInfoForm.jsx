import { useState, useEffect } from 'react';

const UserInfoForm = ({ userData, formatDate }) => {
    // State lưu trữ dữ liệu form
    const [email, setEmail] = useState('');

    // State cho phần đổi mật khẩu
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // State quản lý chế độ chỉnh sửa (Đóng/Mở ô nhập liệu)
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);

    // State quản lý hiệu ứng loading khi bấm Lưu
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Đồng bộ email từ API vào state khi load trang
    useEffect(() => {
        if (userData?.email) {
            setEmail(userData.email);
        }
    }, [userData]);

    // Reset các trường mật khẩu
    const resetPasswordFields = () => {
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    // ================= XỬ LÝ CẬP NHẬT GỘP CHUNG 1 API =================
    const handleUpdateProfile = async () => {
        const payload = {};

        // --- 1. VALIDATION EMAIL ---
        if (isEditingEmail) {
            if (!email.trim()) {
                alert('❌ Email không được để trống!');
                return;
            }
            if (email.trim() !== userData.email) {
                payload.email = email.trim();
            }
        }

        // --- 2. VALIDATION MẬT KHẨU ---
        if (isEditingPassword) {
            if (!oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
                alert('❌ Vui lòng nhập đầy đủ thông tin mật khẩu (Cũ, Mới, Xác nhận)!');
                return;
            }
            if (newPassword !== confirmPassword) {
                alert('❌ Mật khẩu mới và Xác nhận mật khẩu không khớp nhau!');
                return;
            }
            if (oldPassword === newPassword) {
                alert('❌ Mật khẩu mới không được trùng với mật khẩu cũ!');
                return;
            }

            // Gán đúng các key theo yêu cầu của API mới
            payload.current_password = oldPassword.trim();
            payload.password = newPassword.trim();
            payload.password_confirmation = confirmPassword.trim();
        }

        // Kiểm tra xem user có thực sự thay đổi gì không
        if (Object.keys(payload).length === 0) {
            alert('Bạn chưa nhập thông tin thay đổi nào!');
            return;
        }

        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('token');

            // --- 3. GỌI API CẬP NHẬT ---
            const response = await fetch(
                'https://cinema-api-production-f2bc.up.railway.app/api/v1/users/me',
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                }
            );

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Cập nhật thất bại. Vui lòng kiểm tra lại!');
            }

            // --- 4. HOÀN TẤT THÀNH CÔNG ---
            alert('🎉 Cập nhật thông tin thành công!');
            setIsEditingEmail(false);
            setIsEditingPassword(false);
            resetPasswordFields();

            window.location.reload(); // Refresh để tải lại dữ liệu mới nhất
        } catch (error) {
            console.error('Lỗi API:', error);
            alert('❌ ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-8 lg:p-10 shadow-2xl animate-fade-in-up">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-1.5 h-6 bg-red-600 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.5)]"></div>
                <h3 className="text-xl font-bold text-white uppercase tracking-widest">
                    Hồ Sơ Của Tôi
                </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Họ và tên */}
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
                            value={userData?.full_name || ''}
                            readOnly
                            className="w-full bg-black/40 border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-white font-medium focus:outline-none cursor-not-allowed hover:border-white/10 transition-colors"
                        />
                    </div>
                </div>

                {/* Ngày sinh */}
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
                            value={formatDate(userData?.date_of_birth)}
                            readOnly
                            className="w-full bg-black/40 border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-white font-medium focus:outline-none cursor-not-allowed hover:border-white/10 transition-colors"
                        />
                    </div>
                </div>

                {/* Giới tính */}
                <div className="flex flex-col gap-2">
                    <label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
                        Giới tính
                    </label>
                    <div className="flex h-[52px] items-center gap-8 bg-black/40 border border-white/5 rounded-xl px-4 hover:border-white/10 transition-colors">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="radio"
                                checked={userData?.gender === 'male'}
                                readOnly
                                className="w-4 h-4 accent-red-500 bg-zinc-800"
                            />
                            <span className="text-zinc-300 text-sm font-medium group-hover:text-white transition-colors">
                                Nam
                            </span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="radio"
                                checked={userData?.gender === 'female'}
                                readOnly
                                className="w-4 h-4 accent-red-500 bg-zinc-800"
                            />
                            <span className="text-zinc-300 text-sm font-medium group-hover:text-white transition-colors">
                                Nữ
                            </span>
                        </label>
                    </div>
                </div>

                {/* Số điện thoại */}
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
                            value={userData?.phone || ''}
                            readOnly
                            className="w-full bg-black/40 border border-white/5 rounded-xl py-3.5 pl-12 pr-24 text-white font-medium focus:outline-none cursor-not-allowed hover:border-white/10 transition-colors"
                        />
                        <button
                            type="button"
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white uppercase font-bold tracking-wider px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            Cập nhật
                        </button>
                    </div>
                </div>

                {/* ================= EDIT EMAIL ================= */}
                <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
                        Email
                    </label>
                    <div className="relative">
                        <div
                            className={`absolute left-4 top-1/2 -translate-y-1/2 ${isEditingEmail ? 'text-red-500' : 'text-zinc-500'} transition-colors`}
                        >
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
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            readOnly={!isEditingEmail}
                            placeholder="Nhập email mới..."
                            className={`w-full rounded-xl py-3.5 pl-12 pr-24 text-white font-medium focus:outline-none transition-all duration-300 ${
                                isEditingEmail
                                    ? 'bg-zinc-800 border border-red-500/50 shadow-[0_0_15px_rgba(220,38,38,0.2)]'
                                    : 'bg-black/40 border border-white/5 cursor-not-allowed hover:border-white/10'
                            }`}
                        />
                        <button
                            type="button"
                            onClick={() => {
                                if (isEditingEmail) {
                                    setIsEditingEmail(false);
                                    setEmail(userData?.email || '');
                                } else {
                                    setIsEditingEmail(true);
                                }
                            }}
                            className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs uppercase font-bold tracking-wider px-3 py-1.5 rounded-lg transition-colors ${
                                isEditingEmail
                                    ? 'text-zinc-300 hover:text-white bg-zinc-700 hover:bg-zinc-600'
                                    : 'text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10'
                            }`}
                        >
                            {isEditingEmail ? 'Hủy bỏ' : 'Thay đổi'}
                        </button>
                    </div>
                </div>

                {/* ================= EDIT MẬT KHẨU ================= */}
                <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
                        Mật khẩu
                    </label>

                    {/* Trạng thái 1: Khi CHƯA bấm Đổi mật khẩu (Hiển thị 1 ô ẩn) */}
                    {!isEditingPassword && (
                        <div className="relative animate-fade-in">
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
                                value="123456789" // Mock hiển thị sao sao
                                readOnly
                                className="w-full bg-black/40 border border-white/5 rounded-xl py-3.5 pl-12 pr-[120px] text-zinc-500 focus:outline-none cursor-not-allowed tracking-[0.3em] hover:border-white/10 transition-colors"
                            />
                            <button
                                type="button"
                                onClick={() => setIsEditingPassword(true)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-red-500 hover:text-white uppercase font-bold tracking-wider px-3 py-1.5 bg-red-500/10 hover:bg-red-600 rounded-lg transition-all duration-300"
                            >
                                Đổi mật khẩu
                            </button>
                        </div>
                    )}

                    {/* Trạng thái 2: Khi ĐÃ bấm Đổi mật khẩu (Xổ ra 3 ô) */}
                    {isEditingPassword && (
                        <div className="bg-zinc-800/50 border border-red-500/30 rounded-2xl p-5 mt-1 space-y-4 shadow-[0_0_15px_rgba(220,38,38,0.1)] animate-fade-in-up relative">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEditingPassword(false);
                                    resetPasswordFields();
                                }}
                                className="absolute top-4 right-4 text-xs text-zinc-400 hover:text-white uppercase font-bold tracking-wider transition-colors"
                            >
                                Hủy bỏ
                            </button>

                            <div className="flex flex-col gap-1.5 pr-16">
                                <label className="text-zinc-300 text-[11px] uppercase tracking-wide">
                                    Mật khẩu hiện tại
                                </label>
                                <input
                                    type="password"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    placeholder="Nhập mật khẩu cũ..."
                                    className="w-full bg-zinc-950 border border-white/10 rounded-lg py-2.5 px-4 text-white text-sm focus:outline-none focus:border-red-500 transition-colors"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-red-400 text-[11px] font-bold uppercase tracking-wide">
                                    Mật khẩu mới
                                </label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Nhập mật khẩu mới..."
                                    className="w-full bg-zinc-950 border border-red-500/50 rounded-lg py-2.5 px-4 text-white text-sm focus:outline-none focus:border-red-500 transition-colors"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-red-400 text-[11px] font-bold uppercase tracking-wide">
                                    Xác nhận mật khẩu mới
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Nhập lại mật khẩu mới..."
                                    className="w-full bg-zinc-950 border border-red-500/50 rounded-lg py-2.5 px-4 text-white text-sm focus:outline-none focus:border-red-500 transition-colors"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Nút Cập Nhật Tổng */}
            <div className="mt-10 pt-6 border-t border-white/5 flex justify-end">
                <button
                    onClick={handleUpdateProfile}
                    disabled={isSubmitting || (!isEditingEmail && !isEditingPassword)}
                    className={`group relative inline-flex items-center justify-center px-10 py-3.5 text-sm font-bold tracking-[0.15em] text-white uppercase rounded-full overflow-hidden transition-transform ${
                        isSubmitting || (!isEditingEmail && !isEditingPassword)
                            ? 'bg-zinc-700 opacity-50 cursor-not-allowed'
                            : 'bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:-translate-y-1'
                    }`}
                >
                    <span className="relative z-10 flex items-center gap-2">
                        {isSubmitting ? 'Đang cập nhật...' : 'Lưu thay đổi'}
                        {!isSubmitting && (
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
                        )}
                    </span>
                </button>
            </div>
        </div>
    );
};

export default UserInfoForm;
