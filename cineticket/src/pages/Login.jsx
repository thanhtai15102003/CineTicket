import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);

    // Giả lập Database Users (giống bảng users của bạn)
    const [users, setUsers] = useState([
        {
            user_id: 1,
            username: 'admin',
            password_hash: '123456',
            full_name: 'Nguyễn Thành Tài',
            email: 'tai@gmail.com',
            phone: '0123456789',
            gender: 'Nam',
            date_of_birth: '2000-01-01',
            role_id: 1,
            cinema_id: null,
            status: 'active',
            created_at: '2026-04-01'
        },
        {
            user_id: 2,
            username: 'user1',
            password_hash: '123456',
            full_name: 'Trần Thị Bích',
            email: 'bich@gmail.com',
            phone: '0987654321',
            gender: 'Nữ',
            date_of_birth: '1998-05-15',
            role_id: 2,
            cinema_id: null,
            status: 'active',
            created_at: '2026-04-01'
        }
    ]);

    const [loginData, setLoginData] = useState({
        email: '',
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

    // Xử lý Login
    const handleLoginSubmit = (e) => {
        e.preventDefault();

        const user = users.find(
            (u) =>
                (u.email === loginData.email || u.username === loginData.email) &&
                u.password_hash === loginData.password
        );

        if (user) {
            if (user.status !== 'active') {
                alert('Tài khoản của bạn đã bị khóa!');
                return;
            }

            alert(`Đăng nhập thành công! Chào mừng ${user.full_name}`);
            localStorage.setItem('currentUser', JSON.stringify(user));
            navigate('/');
        } else {
            alert('Email hoặc mật khẩu không đúng!');
        }
    };

    // Xử lý Đăng ký - Giống bảng users
    const handleRegisterSubmit = (e) => {
        e.preventDefault();

        if (registerData.password !== registerData.confirmPassword) {
            alert('Mật khẩu xác nhận không khớp!');
            return;
        }

        // Kiểm tra email đã tồn tại
        const emailExists = users.some((u) => u.email === registerData.email);
        if (emailExists) {
            alert('Email này đã được sử dụng!');
            return;
        }

        // Tạo user mới giống cấu trúc bảng users
        const newUser = {
            user_id: Date.now(), // tạm dùng timestamp làm id
            username: registerData.email.split('@')[0],
            password_hash: registerData.password, // thực tế nên hash
            full_name: registerData.full_name,
            email: registerData.email,
            phone: registerData.phone || null,
            gender: registerData.gender,
            date_of_birth: null, // có thể thêm sau
            role_id: 2, // 2 = User thường
            cinema_id: null,
            status: 'active',
            created_at: new Date().toISOString().split('T')[0]
        };

        setUsers([...users, newUser]);

        alert('Đăng ký tài khoản thành công! Bạn có thể đăng nhập ngay bây giờ.');
        setIsLogin(true); // Chuyển về tab Đăng nhập
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
                {/* LOGIN FORM */}
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
                                    Email hoặc số điện thoại
                                </label>
                                <input
                                    type="text"
                                    name="email"
                                    value={loginData.email}
                                    onChange={handleLoginChange}
                                    placeholder="Nhập email hoặc số điện thoại"
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
                                className="w-full rounded-2xl bg-red-600 py-4 text-lg font-semibold text-white transition duration-300 hover:scale-[1.02] hover:bg-red-700 hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] active:scale-95"
                            >
                                Đăng nhập
                            </button>
                        </form>
                    </div>
                </div>

                {/* REGISTER FORM - Đã chỉnh giống database */}
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

                {/* Sliding Panel giữ nguyên */}
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
