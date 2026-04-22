import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);

    const [loginData, setLoginData] = useState({
        account: '',
        password: '',
        remember: false
    });

    const [registerData, setRegisterData] = useState({
        full_name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        gender: 'Nam'
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
                // Lưu token và user vào localStorage
                localStorage.setItem('token', result.token);
                localStorage.setItem('currentUser', JSON.stringify(result.user));

                alert(`Đăng nhập thành công! Chào mừng ${result.user.full_name}`);
                navigate('/'); // hoặc trang dashboard tùy bạn
            } else {
                alert(result.message || 'Email hoặc mật khẩu không đúng!');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Có lỗi kết nối đến server. Vui lòng thử lại sau!');
        } finally {
            setLoading(false);
        }
    };

    // ==================== XỬ LÝ ĐĂNG KÝ (Tạm giữ nguyên hoặc bạn có thể thêm API sau) ====================
    const handleRegisterSubmit = (e) => {
        e.preventDefault();

        if (registerData.password !== registerData.confirmPassword) {
            alert('Mật khẩu xác nhận không khớp!');
            return;
        }

        alert('Đăng ký thành công! (Chức năng đăng ký API sẽ được thêm sau)');
        setIsLogin(true);
        setRegisterData({
            full_name: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
            gender: 'Nam'
        });
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
        <div className="min-h-screen bg-black flex items-center justify-center px-4 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(220,38,38,0.25),transparent_60%)]" />
            <div className="absolute inset-0 bg-[url('/images/cinema-bg.jpg')] bg-cover bg-center opacity-10" />

            <div className="relative w-full max-w-5xl h-[650px] rounded-[40px] overflow-hidden border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_0_60px_rgba(255,0,0,0.18)]">
                {/* ==================== FORM ĐĂNG NHẬP ==================== */}
                <div
                    className={`absolute top-0 h-full w-1/2 flex items-center justify-center px-12 transition-all duration-700 z-20 ${isLogin ? 'left-0 opacity-100' : 'left-0 opacity-0 pointer-events-none'}`}
                >
                    <div className="w-full max-w-sm">
                        <h1 className="text-5xl font-black tracking-widest bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent mb-3">
                            CINETICKET
                        </h1>
                        <p className="text-zinc-400 mb-10">Chào mừng bạn quay trở lại 🎬</p>

                        <form onSubmit={handleLoginSubmit} className="space-y-5">
                            <div>
                                <label className="block text-zinc-400 mb-2 text-sm">
                                    Email hoặc tên đăng nhập
                                </label>
                                <input
                                    type="text"
                                    name="account"
                                    value={loginData.account}
                                    onChange={handleLoginChange}
                                    placeholder="Nhập email hoặc tên đăng nhập"
                                    className="w-full rounded-2xl bg-zinc-900/80 border border-zinc-700 px-5 py-4 text-white outline-none transition focus:border-red-500 focus:shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-zinc-400 mb-2 text-sm">Mật khẩu</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={loginData.password}
                                    onChange={handleLoginChange}
                                    placeholder="Nhập mật khẩu"
                                    className="w-full rounded-2xl bg-zinc-900/80 border border-zinc-700 px-5 py-4 text-white outline-none transition focus:border-red-500 focus:shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                                    required
                                />
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center gap-2 text-zinc-400 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="remember"
                                        checked={loginData.remember}
                                        onChange={handleLoginChange}
                                        className="accent-red-600"
                                    />
                                    Ghi nhớ tôi
                                </label>
                                <button
                                    type="button"
                                    className="text-red-400 hover:text-red-300 transition"
                                >
                                    Quên mật khẩu?
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-2xl bg-red-600 py-4 text-lg font-semibold text-white transition duration-300 hover:scale-[1.02] hover:bg-red-700 hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* ==================== FORM ĐĂNG KÝ (giữ nguyên) ==================== */}
                <div
                    className={`absolute top-0 h-full w-1/2 flex items-center justify-center px-12 transition-all duration-700 z-20 ${!isLogin ? 'left-1/2 opacity-100' : 'left-1/2 opacity-0 pointer-events-none'}`}
                >
                    <div className="w-full max-w-sm">
                        <h1 className="text-5xl font-black tracking-widest bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent mb-3">
                            CINETICKET
                        </h1>
                        <p className="text-zinc-400 mb-10">
                            Tạo tài khoản để bắt đầu trải nghiệm 🍿
                        </p>

                        <form onSubmit={handleRegisterSubmit} className="space-y-4">
                            <input
                                type="text"
                                name="full_name"
                                value={registerData.full_name}
                                onChange={handleRegisterChange}
                                placeholder="Họ và tên"
                                className="w-full rounded-2xl bg-zinc-900/80 border border-zinc-700 px-5 py-4 text-white outline-none transition focus:border-red-500"
                                required
                            />

                            <input
                                type="email"
                                name="email"
                                value={registerData.email}
                                onChange={handleRegisterChange}
                                placeholder="Email"
                                className="w-full rounded-2xl bg-zinc-900/80 border border-zinc-700 px-5 py-4 text-white outline-none transition focus:border-red-500"
                                required
                            />

                            <input
                                type="tel"
                                name="phone"
                                value={registerData.phone}
                                onChange={handleRegisterChange}
                                placeholder="Số điện thoại"
                                className="w-full rounded-2xl bg-zinc-900/80 border border-zinc-700 px-5 py-4 text-white outline-none transition focus:border-red-500"
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <select
                                    name="gender"
                                    value={registerData.gender}
                                    onChange={handleRegisterChange}
                                    className="w-full rounded-2xl bg-zinc-900/80 border border-zinc-700 px-5 py-4 text-white outline-none transition focus:border-red-500"
                                >
                                    <option value="Nam">Nam</option>
                                    <option value="Nữ">Nữ</option>
                                    <option value="Khác">Khác</option>
                                </select>
                            </div>

                            <input
                                type="password"
                                name="password"
                                value={registerData.password}
                                onChange={handleRegisterChange}
                                placeholder="Mật khẩu"
                                className="w-full rounded-2xl bg-zinc-900/80 border border-zinc-700 px-5 py-4 text-white outline-none transition focus:border-red-500"
                                required
                            />

                            <input
                                type="password"
                                name="confirmPassword"
                                value={registerData.confirmPassword}
                                onChange={handleRegisterChange}
                                placeholder="Xác nhận mật khẩu"
                                className="w-full rounded-2xl bg-zinc-900/80 border border-zinc-700 px-5 py-4 text-white outline-none transition focus:border-red-500"
                                required
                            />

                            <button
                                type="submit"
                                className="w-full rounded-2xl bg-red-600 py-4 text-lg font-semibold text-white transition duration-300 hover:scale-[1.02] hover:bg-red-700 hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] active:scale-95"
                            >
                                Đăng ký
                            </button>
                        </form>
                    </div>
                </div>

                {/* Sliding Panel */}
                <div
                    className={`absolute top-0 h-full w-1/2 z-30 transition-all duration-700 ${isLogin ? 'left-1/2' : 'left-0'}`}
                >
                    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-red-600 via-red-700 to-red-900 px-10 text-center text-white">
                        <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-black/20 blur-3xl" />

                        <div className="relative z-10 max-w-sm">
                            <h2 className="mb-4 text-4xl font-black">
                                {isLogin ? 'Xin chào!' : 'Chào mừng trở lại!'}
                            </h2>
                            <p className="mb-8 text-sm leading-7 text-red-100">
                                {isLogin
                                    ? 'Chưa có tài khoản? Đăng ký ngay để khám phá thế giới điện ảnh và đặt vé nhanh chóng.'
                                    : 'Đã có tài khoản? Đăng nhập để tiếp tục hành trình xem phim của bạn.'}
                            </p>
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="rounded-full border border-white/70 px-8 py-3 font-semibold transition duration-300 hover:bg-white hover:text-red-700 hover:scale-105"
                            >
                                {isLogin ? 'Đăng ký' : 'Đăng nhập'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
