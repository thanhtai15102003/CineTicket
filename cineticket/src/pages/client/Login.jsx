import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);

    // ==================== STATE QUẢN LÝ THÔNG BÁO (TOAST) ====================
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        // Tự động ẩn sau 3 giây
        setTimeout(() => {
            setToast((prev) => ({ ...prev, show: false }));
        }, 3000);
    };

    const [loginData, setLoginData] = useState({
        account: '',
        password: '',
        remember: false
    });

    const [registerData, setRegisterData] = useState({
        username: '',
        full_name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        password: '',
        confirmPassword: '',
        gender: 'male'
    });

    // ==================== XỬ LÝ ĐĂNG NHẬP (API) ====================
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(
                'https://cinema-api-production-f2bc.up.railway.app/api/v1/login',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json'
                    },
                    body: JSON.stringify({
                        email: loginData.account,
                        username: loginData.account,
                        password: loginData.password
                    })
                }
            );

            const result = await response.json();

            if (response.ok) {
                localStorage.setItem('token', result.token);
                localStorage.setItem('currentUser', JSON.stringify(result.user));

                showToast(`Đăng nhập thành công! Chào mừng ${result.user.full_name}`, 'success');

                // Đợi 1.5s để user nhìn thấy thông báo rồi mới chuyển trang
                setTimeout(() => {
                    navigate('/');
                }, 1500);
            } else {
                showToast(result.message || 'Email hoặc mật khẩu không đúng!', 'error');
                setLoading(false); // Chỉ tắt loading khi lỗi, thành công thì để im chờ chuyển trang
            }
        } catch (error) {
            console.error('Login error:', error);
            showToast('Có lỗi kết nối đến server. Vui lòng thử lại sau!', 'error');
            setLoading(false);
        }
    };

    // ==================== XỬ LÝ ĐĂNG KÝ (API) ====================
    const handleRegisterSubmit = async (e) => {
        e.preventDefault();

        if (registerData.password !== registerData.confirmPassword) {
            showToast('Mật khẩu xác nhận không khớp!', 'error');
            return;
        }

        setLoading(true);

        try {
            const payload = {
                username: registerData.username,
                password: registerData.password,
                full_name: registerData.full_name,
                email: registerData.email,
                phone: registerData.phone,
                date_of_birth: registerData.date_of_birth,
                gender: registerData.gender
            };

            const response = await fetch(
                'https://cinema-api-production-f2bc.up.railway.app/api/v1/register',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json'
                    },
                    body: JSON.stringify(payload)
                }
            );

            const result = await response.json();

            if (response.ok) {
                showToast('Đăng ký thành công! Vui lòng đăng nhập.', 'success');
                setIsLogin(true); // Trượt qua tab đăng nhập
                setRegisterData({
                    username: '',
                    full_name: '',
                    email: '',
                    phone: '',
                    date_of_birth: '',
                    password: '',
                    confirmPassword: '',
                    gender: 'male'
                });
            } else {
                showToast(
                    result.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin!',
                    'error'
                );
            }
        } catch (error) {
            console.error('Register error:', error);
            showToast('Có lỗi kết nối đến server. Vui lòng thử lại sau!', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleLoginChange = (e) => {
        const { name, value, type, checked } = e.target;
        setLoginData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleRegisterChange = (e) => {
        const { name, value } = e.target;
        setRegisterData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 overflow-hidden relative selection:bg-red-500 selection:text-white">
            {/* ==================== HIỆU ỨNG THÔNG BÁO (TOAST) ==================== */}
            <div
                className={`fixed top-8 right-8 z-[100] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform ${
                    toast.show
                        ? 'translate-y-0 opacity-100 visible'
                        : '-translate-y-8 opacity-0 invisible'
                }`}
            >
                <div
                    className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${
                        toast.type === 'success'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_10px_40px_-10px_rgba(16,185,129,0.3)]'
                            : 'bg-red-500/10 border-red-500/20 text-red-400 shadow-[0_10px_40px_-10px_rgba(239,68,68,0.3)]'
                    }`}
                >
                    {toast.type === 'success' ? (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    ) : (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    )}
                    <p className="text-sm font-semibold tracking-wide">{toast.message}</p>
                </div>
            </div>

            {/* ==================== HIỆU ỨNG BACKGROUND LẠ ==================== */}
            <div
                className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/20 blur-[150px] rounded-full mix-blend-screen pointer-events-none animate-pulse"
                style={{ animationDuration: '4s' }}
            />
            <div
                className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-600/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none animate-pulse"
                style={{ animationDuration: '6s' }}
            />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />

            {/* Container Chính (Glassmorphism) */}
            <div className="relative w-full max-w-[1000px] h-[680px] rounded-[2.5rem] overflow-hidden border border-white/5 bg-black/40 backdrop-blur-3xl shadow-[0_20px_60px_-15px_rgba(220,38,38,0.15)] flex">
                {/* ==================== FORM ĐĂNG NHẬP ==================== */}
                <div
                    className={`absolute top-0 left-0 h-full w-1/2 flex items-center justify-center px-10 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] z-10 
                    ${isLogin ? 'translate-x-0 opacity-100 scale-100' : '-translate-x-[20%] opacity-0 scale-95 pointer-events-none'}`}
                >
                    <div className="w-full max-w-[340px]">
                        {/* Logo Text Nhỏ */}
                        <div className="flex items-center gap-2 mb-8">
                            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center -skew-x-6 rounded shadow-[0_0_15px_rgba(220,38,38,0.4)]">
                                <span className="text-white font-black text-sm italic tracking-tighter">
                                    CT
                                </span>
                            </div>
                            <span className="text-xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500">
                                CINETICKET
                            </span>
                        </div>

                        <h2 className="text-3xl font-bold text-white mb-2">Đăng Nhập</h2>
                        <p className="text-zinc-500 text-sm mb-8 font-medium">
                            Chào mừng bạn quay trở lại với rạp chiếu.
                        </p>

                        <form onSubmit={handleLoginSubmit} className="space-y-5">
                            <div className="space-y-1">
                                <label className="text-zinc-400 text-xs font-bold uppercase tracking-wider ml-1">
                                    Email / Tài khoản
                                </label>
                                <input
                                    type="text"
                                    name="account"
                                    value={loginData.account}
                                    onChange={handleLoginChange}
                                    placeholder="Nhập tài khoản của bạn"
                                    className="w-full rounded-2xl bg-zinc-900/50 border border-white/5 px-5 py-3.5 text-sm text-white placeholder-zinc-600 outline-none transition-all duration-300 focus:bg-zinc-900 focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 hover:border-white/10"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-zinc-400 text-xs font-bold uppercase tracking-wider ml-1">
                                    Mật khẩu
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={loginData.password}
                                    onChange={handleLoginChange}
                                    placeholder="••••••••"
                                    className="w-full rounded-2xl bg-zinc-900/50 border border-white/5 px-5 py-3.5 text-sm text-white placeholder-zinc-600 outline-none transition-all duration-300 focus:bg-zinc-900 focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 hover:border-white/10 tracking-widest"
                                    required
                                />
                            </div>

                            <div className="flex items-center justify-between text-sm pt-2">
                                <label className="flex items-center gap-2.5 text-zinc-400 cursor-pointer group">
                                    <div className="relative flex items-center justify-center">
                                        <input
                                            type="checkbox"
                                            name="remember"
                                            checked={loginData.remember}
                                            onChange={handleLoginChange}
                                            className="peer appearance-none w-5 h-5 rounded-md border border-white/10 bg-zinc-900/50 checked:bg-red-500 checked:border-red-500 transition-colors cursor-pointer"
                                        />
                                        <svg
                                            className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </div>
                                    <span className="font-medium group-hover:text-zinc-300 transition-colors">
                                        Ghi nhớ tôi
                                    </span>
                                </label>
                                <button
                                    type="button"
                                    className="font-medium text-zinc-400 hover:text-red-400 transition-colors"
                                >
                                    Quên mật khẩu?
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 py-4 text-sm font-bold tracking-wide text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_20px_-10px_rgba(225,29,72,0.6)] active:scale-95 disabled:opacity-70 disabled:hover:transform-none disabled:cursor-not-allowed"
                            >
                                {loading && isLogin ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg
                                            className="animate-spin h-5 w-5 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        ĐANG XỬ LÝ...
                                    </span>
                                ) : (
                                    'ĐĂNG NHẬP'
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* ==================== FORM ĐĂNG KÝ ==================== */}
                <div
                    className={`absolute top-0 right-0 h-full w-1/2 flex items-center justify-center px-10 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] z-10
                    ${!isLogin ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-[20%] opacity-0 scale-95 pointer-events-none'}`}
                >
                    <div className="w-full max-w-[400px]">
                        <h2 className="text-3xl font-bold text-white mb-2">Tạo Tài Khoản</h2>
                        <p className="text-zinc-500 text-sm mb-8 font-medium">
                            Bắt đầu hành trình điện ảnh của bạn ngay hôm nay.
                        </p>

                        <form onSubmit={handleRegisterSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    name="username"
                                    value={registerData.username}
                                    onChange={handleRegisterChange}
                                    placeholder="Tên đăng nhập"
                                    className="w-full rounded-xl bg-zinc-900/50 border border-white/5 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:bg-zinc-900 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/10 hover:border-white/10"
                                    required
                                />
                                <input
                                    type="text"
                                    name="full_name"
                                    value={registerData.full_name}
                                    onChange={handleRegisterChange}
                                    placeholder="Họ và tên"
                                    className="w-full rounded-xl bg-zinc-900/50 border border-white/5 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:bg-zinc-900 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/10 hover:border-white/10"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="email"
                                    name="email"
                                    value={registerData.email}
                                    onChange={handleRegisterChange}
                                    placeholder="Email"
                                    className="w-full rounded-xl bg-zinc-900/50 border border-white/5 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:bg-zinc-900 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/10 hover:border-white/10"
                                    required
                                />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={registerData.phone}
                                    onChange={handleRegisterChange}
                                    placeholder="Số điện thoại"
                                    className="w-full rounded-xl bg-zinc-900/50 border border-white/5 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:bg-zinc-900 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/10 hover:border-white/10"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="relative">
                                    <input
                                        type="date"
                                        name="date_of_birth"
                                        value={registerData.date_of_birth}
                                        onChange={handleRegisterChange}
                                        className="w-full rounded-xl bg-zinc-900/50 border border-white/5 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:bg-zinc-900 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/10 hover:border-white/10 [color-scheme:dark]"
                                        required
                                    />
                                </div>
                                <select
                                    name="gender"
                                    value={registerData.gender}
                                    onChange={handleRegisterChange}
                                    className="w-full rounded-xl bg-zinc-900/50 border border-white/5 px-4 py-3 text-sm text-white outline-none transition-all focus:bg-zinc-900 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/10 hover:border-white/10 appearance-none cursor-pointer"
                                >
                                    <option value="male" className="bg-zinc-900">
                                        Nam
                                    </option>
                                    <option value="female" className="bg-zinc-900">
                                        Nữ
                                    </option>
                                    <option value="other" className="bg-zinc-900">
                                        Khác
                                    </option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="password"
                                    name="password"
                                    value={registerData.password}
                                    onChange={handleRegisterChange}
                                    placeholder="Mật khẩu"
                                    className="w-full rounded-xl bg-zinc-900/50 border border-white/5 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:bg-zinc-900 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/10 hover:border-white/10 tracking-widest"
                                    required
                                />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={registerData.confirmPassword}
                                    onChange={handleRegisterChange}
                                    placeholder="Xác nhận MK"
                                    className="w-full rounded-xl bg-zinc-900/50 border border-white/5 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:bg-zinc-900 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/10 hover:border-white/10 tracking-widest"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-6 rounded-2xl bg-zinc-100 py-4 text-sm font-bold tracking-wide text-black transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_10px_20px_-10px_rgba(255,255,255,0.4)] active:scale-95 disabled:opacity-70 disabled:hover:transform-none disabled:cursor-not-allowed"
                            >
                                {loading && !isLogin ? 'ĐANG XỬ LÝ...' : 'TẠO TÀI KHOẢN'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* ==================== SLIDING OVERLAY PANEL ==================== */}
                <div
                    className={`absolute top-0 w-1/2 h-full z-20 transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] 
                    ${isLogin ? 'translate-x-full rounded-l-[2.5rem]' : 'translate-x-0 rounded-r-[2.5rem]'}`}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-red-700 via-red-600 to-rose-600 shadow-[inset_0_0_50px_rgba(0,0,0,0.3)]">
                        <div className="absolute -top-24 -left-24 h-[300px] w-[300px] rounded-full bg-white/20 blur-[80px]" />
                        <div className="absolute -bottom-24 -right-24 h-[300px] w-[300px] rounded-full bg-black/40 blur-[80px]" />
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
                    </div>

                    <div className="relative flex h-full flex-col items-center justify-center px-12 text-center text-white">
                        <div
                            className={`transition-all duration-700 absolute w-full px-12 flex flex-col items-center
                            ${isLogin ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}
                        >
                            <h2 className="mb-4 text-4xl font-black drop-shadow-lg">
                                Bạn Mới Tới?
                            </h2>
                            <p className="mb-10 text-[15px] leading-relaxed text-red-100 font-medium">
                                Đăng ký thành viên ngay hôm nay để nhận vô vàn ưu đãi đặc quyền,
                                tích điểm và đặt vé xem phim nhanh nhất.
                            </p>
                            <button
                                onClick={() => setIsLogin(false)}
                                className="group relative rounded-full border border-white/50 px-10 py-3.5 text-sm font-bold tracking-widest uppercase overflow-hidden transition-all duration-300 hover:border-white hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                            >
                                <span className="relative z-10 transition-colors group-hover:text-red-600">
                                    ĐĂNG KÝ NGAY
                                </span>
                                <div className="absolute inset-0 h-full w-full bg-white scale-x-0 origin-left transition-transform duration-300 ease-out group-hover:scale-x-100" />
                            </button>
                        </div>

                        <div
                            className={`transition-all duration-700 absolute w-full px-12 flex flex-col items-center
                            ${!isLogin ? 'opacity-100 translate-y-0 delay-100' : 'opacity-0 -translate-y-8 pointer-events-none'}`}
                        >
                            <h2 className="mb-4 text-4xl font-black drop-shadow-lg">
                                Chào Mừng Lại!
                            </h2>
                            <p className="mb-10 text-[15px] leading-relaxed text-red-100 font-medium">
                                Đã có tài khoản? Hãy đăng nhập để tiếp tục quản lý vé xem phim và
                                xem lịch sử giao dịch của bạn.
                            </p>
                            <button
                                onClick={() => setIsLogin(true)}
                                className="group relative rounded-full border border-white/50 px-10 py-3.5 text-sm font-bold tracking-widest uppercase overflow-hidden transition-all duration-300 hover:border-white hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                            >
                                <span className="relative z-10 transition-colors group-hover:text-red-600">
                                    ĐĂNG NHẬP
                                </span>
                                <div className="absolute inset-0 h-full w-full bg-white scale-x-0 origin-left transition-transform duration-300 ease-out group-hover:scale-x-100" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
