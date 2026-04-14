import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // State quản lý user
    const [currentUser, setCurrentUser] = useState(null);

    // Hàm load user từ localStorage
    const loadUser = () => {
        const user = localStorage.getItem('currentUser');
        if (user) {
            setCurrentUser(JSON.parse(user));
        } else {
            setCurrentUser(null);
        }
    };

    // Load user khi component mount và lắng nghe thay đổi
    useEffect(() => {
        loadUser();

        // Lắng nghe sự kiện storage (khi login từ tab khác)
        window.addEventListener('storage', loadUser);

        return () => {
            window.removeEventListener('storage', loadUser);
        };
    }, []);

    // Kiểm tra lại user mỗi khi quay lại trang (optional nhưng rất hữu ích)
    useEffect(() => {
        loadUser();
    }, [location.pathname]); // Mỗi khi đổi route sẽ kiểm tra lại

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        setCurrentUser(null);
        navigate('/');
        alert('Đã đăng xuất thành công!');
    };

    return (
        <header className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-between h-20">
                    {/* LOGO */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="w-11 h-11 bg-red-600 rounded-xl flex items-center justify-center">
                            <span className="text-3xl">🎬</span>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tighter text-red-500">
                                CINETICKET
                            </h1>
                            <p className="text-xs text-zinc-500 -mt-1">Đặt vé xem phim</p>
                        </div>
                    </div>

                    {/* MENU */}
                    <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium ml-12">
                        <Link
                            to="/movies"
                            className={`relative inline-block h-6 uppercase pb-2 transition-colors duration-200 ${isActive('/movies') ? 'text-red-500' : 'text-zinc-300 hover:text-red-500'}`}
                        >
                            Phim
                            {isActive('/movies') && (
                                <span className="absolute left-0 bottom-[-4px] w-full h-[2px] bg-red-500"></span>
                            )}
                        </Link>
                        <Link
                            to="#"
                            className="text-zinc-300 hover:text-red-500 transition-colors duration-200 uppercase"
                        >
                            Lịch chiếu
                        </Link>
                        <Link
                            to="#"
                            className="text-zinc-300 hover:text-red-500 transition-colors duration-200 uppercase"
                        >
                            Rạp
                        </Link>
                        <Link
                            to="#"
                            className="text-zinc-300 hover:text-red-500 transition-colors duration-200 uppercase"
                        >
                            Giá vé
                        </Link>
                    </nav>

                    {/* SEARCH */}
                    <div className="hidden md:flex flex-1 max-w-md mx-10">
                        <div className="relative w-full">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Tìm phim, diễn viên, rạp..."
                                className="w-full bg-zinc-900 border border-zinc-700 focus:border-red-600 rounded-full py-3 pl-12 pr-5 text-sm text-white placeholder-zinc-400 focus:outline-none"
                            />
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-5 h-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M21 21l-6-6m2-5a7 7 0 01-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="flex items-center gap-4">
                        <button className="hidden sm:flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:text-white border border-zinc-700 hover:border-zinc-600 rounded-full transition-all">
                            Vé của tôi
                        </button>

                        {currentUser ? (
                            // ĐÃ ĐĂNG NHẬP
                            <div className="flex items-center gap-3">
                                <div
                                    onClick={() => navigate('/profile')}
                                    className="flex items-center gap-3 cursor-pointer group"
                                >
                                    <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center text-white font-bold text-lg ring-2 ring-red-500/30">
                                        {currentUser.full_name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="hidden md:block">
                                        <p className="text-sm font-medium text-white group-hover:text-red-400 transition">
                                            {currentUser.full_name}
                                        </p>
                                        <p className="text-xs text-zinc-500">Thành viên</p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleLogout}
                                    className="px-5 py-2 text-sm font-medium text-red-400 hover:text-red-500 border border-red-500/30 hover:border-red-500 rounded-full transition-all"
                                >
                                    Đăng xuất
                                </button>
                            </div>
                        ) : (
                            // CHƯA ĐĂNG NHẬP
                            <button
                                onClick={() => navigate('/login')}
                                className="flex items-center gap-2 px-6 py-2.5 bg-white text-black text-sm font-semibold rounded-full hover:bg-zinc-200 transition-all"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-5 h-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7"
                                    />
                                </svg>
                                Đăng nhập
                            </button>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 text-white"
                        >
                            {isMenuOpen ? '✕' : '☰'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-zinc-950 border-t border-zinc-800 px-6 py-6">
                    <div className="flex flex-col gap-5 text-base font-medium">
                        <Link to="/movies" className="text-white py-3">
                            Phim
                        </Link>
                        <Link to="#" className="text-white py-3">
                            Lịch chiếu
                        </Link>
                        <Link to="#" className="text-white py-3">
                            Rạp
                        </Link>
                        <Link to="#" className="text-white py-3">
                            Giá vé
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
