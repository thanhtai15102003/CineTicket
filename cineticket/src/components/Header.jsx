import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCinema } from './CinemaContext';

const Header = () => {
    // Cinema Context
    const { selectedCinema, changeCinema } = useCinema();

    const handleSelectCinema = (cinema) => {
        changeCinema(cinema);
        // Optional: Có thể thêm thông báo hoặc tự động đóng menu ở đây nếu muốn
    };

    const location = useLocation();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentUser, setCurrentUser] = useState(null);

    const [cinemasByCity, setCinemasByCity] = useState({});
    const [selectedRegion, setSelectedRegion] = useState(() => {
        return localStorage.getItem('selectedRegion') || 'Đang tải...';
    });

    const [scrolled, setScrolled] = useState(false);

    const loadUser = () => {
        const user = localStorage.getItem('currentUser');
        if (user) {
            setCurrentUser(JSON.parse(user));
        } else {
            setCurrentUser(null);
        }
    };

    useEffect(() => {
        loadUser();
        window.addEventListener('storage', loadUser);

        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);

        const fetchCinemasData = async () => {
            try {
                const response = await fetch(
                    'https://cinema-api-production-f2bc.up.railway.app/api/v1/cinemas'
                );
                const dataArray = await response.json();

                const groupedData = {};

                dataArray.forEach((cinema) => {
                    const city = cinema.region?.city || 'Chưa xác định';
                    if (!groupedData[city]) {
                        groupedData[city] = [];
                    }
                    groupedData[city].push(cinema);
                });

                setCinemasByCity(groupedData);

                const cities = Object.keys(groupedData);
                if (!localStorage.getItem('selectedRegion') && cities.length > 0) {
                    setSelectedRegion(cities[0]);
                    localStorage.setItem('selectedRegion', cities[0]);
                }
            } catch (error) {
                console.error('Lỗi khi tải dữ liệu rạp:', error);
                setSelectedRegion('Lỗi kết nối');
            }
        };

        fetchCinemasData();

        return () => {
            window.removeEventListener('storage', loadUser);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    useEffect(() => {
        loadUser();
    }, [location.pathname]);

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        setCurrentUser(null);
        navigate('/');
        alert('Đã đăng xuất thành công!');
    };

    const handleSelectRegion = (city) => {
        setSelectedRegion(city);
        localStorage.setItem('selectedRegion', city);
    };

    return (
        <header
            className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${
                scrolled
                    ? 'bg-zinc-950/80 backdrop-blur-xl border-white/5 shadow-lg shadow-black/50 py-0'
                    : 'bg-gradient-to-b from-zinc-950/90 to-transparent border-transparent py-2'
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <div className="flex items-center justify-between h-20 gap-4">
                    {/* LOGO */}
                    <div
                        className="flex items-center gap-3 flex-shrink-0 cursor-pointer group"
                        onClick={() => navigate('/')}
                    >
                        <div className="relative w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center -skew-x-6 group-hover:skew-x-0 transition-all duration-500 rounded-lg shadow-[0_0_20px_rgba(220,38,38,0.3)] group-hover:shadow-[0_0_25px_rgba(220,38,38,0.6)]">
                            <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-zinc-950 rounded-full border border-red-500/20"></div>
                            <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-zinc-950 rounded-full border border-red-500/20"></div>
                            <span className="text-white font-black text-2xl italic tracking-tighter">
                                CT
                            </span>
                        </div>

                        <div className="hidden sm:flex flex-col">
                            <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-500 group-hover:to-zinc-300 transition-all duration-300">
                                CINETICKET
                            </h1>
                            <p className="text-[10px] text-red-500 font-bold tracking-[0.2em] -mt-1 uppercase opacity-80">
                                Box Office
                            </p>
                        </div>
                    </div>

                    {/* MENU */}
                    <nav className="hidden lg:flex items-center gap-2 text-[14px] font-semibold">
                        {[
                            { path: '/movies', label: 'Phim' },
                            { path: '#', label: 'Lịch chiếu' },
                            { path: '#', label: 'Rạp' },
                            { path: '#', label: 'Giá vé' }
                        ].map((item, index) => (
                            <Link
                                key={index}
                                to={item.path}
                                className={`relative px-4 py-2 rounded-full transition-all duration-300 uppercase tracking-wide whitespace-nowrap ${
                                    isActive(item.path)
                                        ? 'text-white bg-white/10'
                                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                {item.label}
                                {isActive(item.path) && (
                                    <span className="absolute -bottom-[21px] left-1/2 -translate-x-1/2 w-8 h-[3px] bg-red-500 rounded-t-full shadow-[0_-2px_10px_rgba(239,68,68,0.8)]"></span>
                                )}
                            </Link>
                        ))}
                    </nav>

                    {/* SEARCH */}
                    <div className="hidden md:flex ml-auto w-52 lg:w-64 group relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-transparent rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative w-full">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Tìm phim, rạp..."
                                className="w-full bg-black/40 border border-white/10 focus:border-red-500/50 focus:bg-black/60 rounded-full py-2.5 pl-11 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-4 focus:ring-red-500/10 transition-all duration-300"
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-hover:text-red-400 transition-colors duration-300">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-4 h-4"
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

                    {/* RIGHT SIDE: REGION + USER */}
                    <div className="flex items-center gap-6 flex-shrink-0">
                        {/* ======================= REGION SELECTOR ======================= */}
                        <div className="hidden md:block relative group cursor-pointer">
                            <div className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors duration-200 py-4">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-5 h-5 text-red-500"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <span className="text-sm font-semibold whitespace-nowrap">
                                    {/* Nếu đã chọn rạp thì hiện tên rạp, chưa chọn thì hiện Tỉnh/Thành phố */}
                                    {selectedCinema ? selectedCinema.cinema_name : selectedRegion}
                                </span>
                            </div>

                            {/* MENU CẤP 1 (Danh sách Thành phố) */}
                            <div className="absolute top-[80%] right-0 w-60 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-out z-50 pt-4">
                                <div className="bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-2">
                                    <div className="px-4 py-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-white/5 mb-1">
                                        Tỉnh / Thành phố
                                    </div>
                                    {Object.keys(cinemasByCity).map((city) => (
                                        <div key={city} className="relative group/city">
                                            <div
                                                onClick={() => handleSelectRegion(city)}
                                                className={`px-4 py-3 text-sm font-medium rounded-xl flex items-center justify-between transition-colors
                        ${selectedRegion === city ? 'bg-red-500/10 text-red-400' : 'text-zinc-300 hover:bg-white/5 hover:text-white'}`}
                                            >
                                                {city}
                                                <svg
                                                    className="w-3 h-3 opacity-50"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="3"
                                                        d="M9 5l7 7-7 7"
                                                    />
                                                </svg>
                                            </div>

                                            {/* MENU CẤP 2 (Danh sách Rạp) */}
                                            <div className="absolute top-0 right-[100%] mr-2 w-64 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-2 opacity-0 invisible group-hover/city:opacity-100 group-hover/city:visible transition-all duration-300">
                                                <div className="px-3 py-2 text-[10px] font-bold text-red-500 uppercase border-b border-white/5 mb-1">
                                                    Rạp tại {city}
                                                </div>
                                                <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
                                                    {cinemasByCity[city].map((cinema) => {
                                                        // Kiểm tra rạp này có đang được chọn không
                                                        const isSelected =
                                                            selectedCinema?.cinema_id ===
                                                            cinema.cinema_id;
                                                        return (
                                                            <div
                                                                key={cinema.cinema_id}
                                                                // THÊM SỰ KIỆN ONCLICK Ở ĐÂY
                                                                onClick={() =>
                                                                    handleSelectCinema(cinema)
                                                                }
                                                                className={`px-3 py-2.5 text-sm rounded-lg cursor-pointer transition-colors ${
                                                                    isSelected
                                                                        ? 'bg-red-500/20 text-red-500 font-bold' // Highlight nếu được chọn
                                                                        : 'text-zinc-300 hover:text-white hover:bg-white/10'
                                                                }`}
                                                            >
                                                                {cinema.cinema_name}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* USER AREA */}
                        {currentUser ? (
                            <div className="relative group cursor-pointer py-4">
                                <div className="flex items-center gap-3 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full transition-colors border border-white/5">
                                    <div className="w-8 h-8 flex-shrink-0 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-[0_0_10px_rgba(220,38,38,0.4)]">
                                        {currentUser.full_name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="hidden sm:block pr-1">
                                        <p className="text-sm font-semibold text-zinc-200 truncate max-w-[90px] xl:max-w-[150px]">
                                            {currentUser.full_name}
                                        </p>
                                    </div>
                                </div>

                                <div className="absolute top-[80%] right-0 w-60 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-out z-50 transform origin-top-right group-hover:translate-y-0 translate-y-4 pt-4">
                                    <div className="bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-2 flex flex-col">
                                        <div className="px-3 py-3 border-b border-white/5 mb-2 flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                {currentUser.full_name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-sm text-white font-semibold truncate">
                                                    {currentUser.full_name}
                                                </p>
                                                <p className="text-xs text-zinc-500 truncate">
                                                    {currentUser.email || 'Thành viên'}
                                                </p>
                                            </div>
                                        </div>

                                        <Link
                                            to="/profile"
                                            className="px-3 py-2.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors flex items-center gap-3"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="w-4 h-4 text-zinc-400"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7"
                                                />
                                            </svg>
                                            Tài khoản
                                        </Link>

                                        <Link
                                            to="/history"
                                            className="px-3 py-2.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors flex items-center gap-3"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="w-4 h-4 text-zinc-400"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                                />
                                            </svg>
                                            Lịch sử đặt vé
                                        </Link>

                                        <div className="border-t border-white/5 my-1"></div>

                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-xl transition-colors flex items-center gap-3"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="w-4 h-4"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                                />
                                            </svg>
                                            Đăng xuất
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => navigate('/login')}
                                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white text-sm font-bold rounded-full hover:shadow-[0_0_20px_rgba(225,29,72,0.4)] hover:-translate-y-0.5 transition-all duration-300"
                            >
                                <span className="hidden sm:inline">Đăng nhập</span>
                            </button>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="lg:hidden relative w-10 h-10 flex flex-col justify-center items-center gap-1.5 bg-white/5 rounded-full border border-white/10"
                        >
                            <span
                                className={`w-5 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}
                            ></span>
                            <span
                                className={`w-5 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}
                            ></span>
                            <span
                                className={`w-5 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}
                            ></span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu (Responsive) */}
            <div
                className={`lg:hidden overflow-hidden transition-all duration-500 ease-in-out ${isMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className="bg-zinc-950/95 backdrop-blur-xl border-t border-white/5 px-4 py-6 flex flex-col gap-5 shadow-2xl">
                    <div className="flex flex-col gap-2 text-[15px] font-semibold">
                        {['Phim', 'Lịch chiếu', 'Rạp', 'Giá vé'].map((item, idx) => (
                            <Link
                                key={idx}
                                to={item === 'Phim' ? '/movies' : '#'}
                                className="text-zinc-300 hover:text-white hover:bg-white/5 px-4 py-3 rounded-xl transition-colors"
                            >
                                {item}
                            </Link>
                        ))}

                        <div className="mt-4 px-4">
                            <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">
                                Khu vực
                            </p>
                            <select
                                value={selectedRegion}
                                onChange={(e) => handleSelectRegion(e.target.value)}
                                className="w-full bg-black/40 text-white border border-white/10 rounded-xl p-3 focus:outline-none focus:border-red-500 appearance-none"
                            >
                                {Object.keys(cinemasByCity).map((city) => (
                                    <option key={city} value={city} className="bg-zinc-900">
                                        {city}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
