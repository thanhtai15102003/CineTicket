import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const isActive = (path) => location.pathname === path;

    return (
        <header className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-between h-20">
                    {/* ==================== LOGO ==================== */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="w-11 h-11 bg-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                            <span className="text-3xl">🎬</span>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tighter text-red-500">
                                CINETICKET
                            </h1>
                            <p className="text-xs text-zinc-500 -mt-1">Đặt vé xem phim</p>
                        </div>
                    </div>

                    {/* ==================== MENU DESKTOP ==================== */}
                    <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium ml-12">
                        <Link
                            to="/movies"
                            className={`relative inline-block h-6 uppercase pb-2 transition-colors duration-200 ${
                                isActive('/movies')
                                    ? 'text-red-500'
                                    : 'text-zinc-300 hover:text-red-500'
                            }`}
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
                            Lịch chiếu theo rạp
                        </Link>
                        <div className="relative group">
                            <div className="text-zinc-300 hover:text-red-500 transition-colors duration-200 cursor-pointer uppercase">
                                Rạp
                            </div>
                            <div className="absolute top-full left-0 mt-4 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-50">
                                <ul className="py-2 text-sm">
                                    <li className="px-4 py-3 hover:bg-zinc-800 cursor-pointer text-zinc-300 hover:text-red-500">
                                        CineTicket TP.HCM
                                    </li>
                                    <li className="px-4 py-3 hover:bg-zinc-800 cursor-pointer text-zinc-300 hover:text-red-500">
                                        CineTicket Hà Nội
                                    </li>
                                    <li className="px-4 py-3 hover:bg-zinc-800 cursor-pointer text-zinc-300 hover:text-red-500">
                                        CineTicket Đà Nẵng
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <Link
                            to="#"
                            className="text-zinc-300 hover:text-red-500 transition-colors duration-200 uppercase"
                        >
                            Giá vé
                        </Link>
                    </nav>

                    {/* ==================== SEARCH BAR ==================== */}
                    <div className="hidden md:flex flex-1 max-w-md mx-10">
                        <div className="relative w-full">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Tìm phim, diễn viên, rạp..."
                                className="w-full bg-zinc-900 border border-zinc-700 focus:border-red-600 rounded-full py-3 pl-12 pr-5 text-sm text-white placeholder-zinc-400 focus:outline-none transition-all"
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

                    {/* ==================== RIGHT SIDE ==================== */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <button className="hidden sm:flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:text-white border border-zinc-700 hover:border-zinc-600 rounded-full transition-all">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5z"
                                />
                            </svg>
                            Vé của tôi
                        </button>

                        <button className="flex items-center gap-2 px-6 py-2.5 bg-white text-black text-sm font-semibold rounded-full hover:bg-zinc-200 transition-all">
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

                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 text-white"
                        >
                            {isMenuOpen ? (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-7 h-7"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 18L18 6M6 6h12v12"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-7 h-7"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* ==================== MOBILE MENU ==================== */}
            {isMenuOpen && (
                <div className="md:hidden bg-zinc-950 border-t border-zinc-800 px-6 py-6">
                    <div className="flex flex-col gap-5 text-base font-medium">
                        <Link to="/movies" className="text-white py-3">
                            Phim
                        </Link>
                        <Link to="/schedule" className="text-white py-3">
                            Lịch chiếu
                        </Link>
                        <a href="#" className="text-red-500 py-3">
                            Rạp
                        </a>
                        <a href="#" className="text-white py-3">
                            Giá vé
                        </a>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
