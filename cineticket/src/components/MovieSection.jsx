import { useState, useEffect } from 'react';
import MovieCard from '../components/MovieCard';
import LoadingSpinner from './common/LoadingSpinner';
import RevealOnScroll from './common/RevealOnScroll';

// 👉 IMPORT HOOK CONTEXT TỪ FILE CỦA BẠN
import { useCinema } from '../components/CinemaContext';

const MovieSection = ({ showAll = false, onShowAll, isHome = false }) => {
    const [activeTab, setActiveTab] = useState('now_showing');

    // ================= LẤY STATE TỪ CONTEXT =================
    const { selectedCinema, changeCinema } = useCinema();

    // State cho danh sách Rạp
    const [cinemas, setCinemas] = useState([]);

    // State cho Phim
    const [nowShowing, setNowShowing] = useState([]);
    const [comingSoon, setComingSoon] = useState([]); // Chứa phim sắp chiếu TOÀN HỆ THỐNG
    const [isLoading, setIsLoading] = useState(true);

    // ================= 1. FETCH DANH SÁCH RẠP & PHIM SẮP CHIẾU (GLOBAL) =================
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // 1.1 Lấy danh sách rạp
                const resCinemas = await fetch(
                    'https://cinema-api-production-f2bc.up.railway.app/api/v1/cinemas'
                );
                const jsonCinemas = await resCinemas.json();
                const cinemaData = Array.isArray(jsonCinemas?.data)
                    ? jsonCinemas.data
                    : Array.isArray(jsonCinemas)
                      ? jsonCinemas
                      : [];
                setCinemas(cinemaData);

                if (cinemaData.length > 0 && !selectedCinema) {
                    changeCinema(cinemaData[0]);
                }

                // 1.2 Lấy danh sách Phim Sắp Chiếu (TOÀN HỆ THỐNG)
                const resMovies = await fetch(
                    'https://cinema-api-production-f2bc.up.railway.app/api/v1/movies'
                );
                const jsonMovies = await resMovies.json();
                const soonList = Array.isArray(jsonMovies?.coming_soon)
                    ? jsonMovies.coming_soon
                    : [];

                const formatGlobalMovie = (m) => ({
                    movie_id: m.movie_id,
                    title: m.title || m.movie_title || m.movie_name || 'Đang cập nhật',
                    duration: m.duration || 0,
                    age_limit: m.age_limit || m.age_rating || '',
                    poster_url: m.poster_url || 'https://via.placeholder.com/300x450?text=No+Image',
                    description: m.description || '',
                    release_date: m.release_date || '',
                    trailer_url: m.trailer_url || '#',
                    actors: m.actors
                        ? typeof m.actors === 'string'
                            ? m.actors.split(',')
                            : m.actors
                        : [],
                    director: m.director || 'N/A',
                    genres: Array.isArray(m.genres)
                        ? m.genres.map((g) => (typeof g === 'string' ? g : g.genre_name || g))
                        : [],
                    showtimes: [] // Phim sắp chiếu chưa có lịch
                });

                setComingSoon(soonList.map(formatGlobalMovie));
            } catch (err) {
                console.error('Lỗi fetch data ban đầu:', err);
            }
        };

        fetchInitialData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ================= 2. FETCH PHIM ĐANG CHIẾU THEO RẠP (TỪ CONTEXT) =================
    useEffect(() => {
        if (!selectedCinema || !selectedCinema.cinema_id) return;

        const fetchMoviesByCinema = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(
                    `https://cinema-api-production-f2bc.up.railway.app/api/v1/cinemas/${selectedCinema.cinema_id}/movies`
                );
                const json = await res.json();

                const moviesList = Array.isArray(json?.movies) ? json.movies : [];

                const formatCinemaMovie = (m) => ({
                    movie_id: m.movie_id,
                    title: m.movie_title || m.movie_name || m.title || 'Đang cập nhật tên phim',
                    duration: m.duration || 0,
                    age_limit: m.age_limit || m.age_rating || '',
                    poster_url: m.poster_url || 'https://via.placeholder.com/300x450?text=No+Image',
                    showtimes: m.showtimes || [],
                    description: m.description || '',
                    release_date: m.release_date || '',
                    trailer_url: m.trailer_url || '#',
                    actors: m.actors
                        ? typeof m.actors === 'string'
                            ? m.actors.split(',')
                            : m.actors
                        : [],
                    director: m.director || 'N/A',
                    genres: Array.isArray(m.genres)
                        ? m.genres.map((g) => (typeof g === 'string' ? g : g.genre_name || g))
                        : []
                });

                setNowShowing(moviesList.map(formatCinemaMovie));
            } catch (err) {
                console.error(`Lỗi fetch phim của rạp ${selectedCinema.cinema_id}:`, err);
            } finally {
                setTimeout(() => setIsLoading(false), 500);
            }
        };

        fetchMoviesByCinema();
    }, [selectedCinema?.cinema_id]);

    // ================= XỬ LÝ ĐỔI RẠP =================
    const handleCinemaChange = (e) => {
        const cinemaId = parseInt(e.target.value);
        const selected = cinemas.find((c) => c.cinema_id === cinemaId);
        if (selected) {
            changeCinema(selected);
        }
    };

    // ================= DISPLAY =================
    const displayedNowShowing = showAll ? nowShowing : nowShowing.slice(0, 4);
    const displayedUpcoming = showAll ? comingSoon : comingSoon.slice(0, 4);

    const filteredMovies = activeTab === 'now_showing' ? displayedNowShowing : displayedUpcoming;

    return (
        <section
            className={`relative bg-zinc-950 overflow-hidden ${isHome ? 'pt-[100px] pb-16' : 'pt-[100px] pb-8'}`}
        >
            <div className="absolute top-0 left-[15%] w-[50%] h-[300px] bg-red-600/10 blur-[120px] rounded-full pointer-events-none opacity-60 z-0"></div>

            <div className="relative max-w-7xl mx-auto px-4 md:px-6 z-10">
                {/* HEADER & TABS */}
                <RevealOnScroll delay={0}>
                    <div className="relative z-40 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-zinc-800/80 pb-3">
                        <div className="flex items-center gap-5">
                            <div className="flex items-center gap-2.5 sm:border-r sm:border-zinc-800 sm:pr-6">
                                <div className="w-1 h-5 bg-red-600 rounded-full shadow-[0_0_8px_rgba(220,38,38,0.5)]"></div>
                                <h2 className="text-lg md:text-xl font-black tracking-widest text-white uppercase drop-shadow-md">
                                    PHIM
                                </h2>
                            </div>

                            <div className="flex items-center gap-6">
                                <button
                                    onClick={() => setActiveTab('now_showing')}
                                    className={`relative text-[14px] md:text-[15px] font-bold transition-all duration-300 pb-1 cursor-pointer ${
                                        activeTab === 'now_showing'
                                            ? 'text-white'
                                            : 'text-zinc-500 hover:text-zinc-300'
                                    }`}
                                >
                                    Đang chiếu
                                    {activeTab === 'now_showing' && (
                                        <span className="absolute bottom-[-5px] left-0 w-full h-[2px] bg-red-500 shadow-[0_-2px_8px_rgba(239,68,68,0.8)]"></span>
                                    )}
                                </button>

                                <button
                                    onClick={() => setActiveTab('upcoming')}
                                    className={`relative text-[14px] md:text-[15px] font-bold transition-all duration-300 pb-1 cursor-pointer ${
                                        activeTab === 'upcoming'
                                            ? 'text-white'
                                            : 'text-zinc-500 hover:text-zinc-300'
                                    }`}
                                >
                                    Sắp chiếu
                                    {activeTab === 'upcoming' && (
                                        <span className="absolute bottom-[-5px] left-0 w-full h-[2px] bg-red-500 shadow-[0_-2px_8px_rgba(239,68,68,0.8)]"></span>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* SELECT RẠP - CHỈ HIỆN KHI ĐANG Ở TAB "ĐANG CHIẾU" */}
                    </div>
                </RevealOnScroll>

                {/* LIST PHIM / LOADING */}
                <div className="relative z-30 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 min-h-[300px]">
                    {isLoading && activeTab === 'now_showing' ? (
                        <div className="col-span-full">
                            <LoadingSpinner isDark={true} />
                        </div>
                    ) : filteredMovies.length > 0 ? (
                        filteredMovies.map((movie, index) => (
                            <RevealOnScroll
                                key={`${activeTab}-${movie.movie_id}`} // Ép render lại hiệu ứng khi đổi tab
                                delay={index * 100}
                                className="h-full"
                            >
                                <MovieCard movie={movie} />
                            </RevealOnScroll>
                        ))
                    ) : (
                        <RevealOnScroll className="col-span-full py-16 flex flex-col justify-center items-center text-zinc-500">
                            {activeTab === 'now_showing' ? (
                                <>
                                    <p className="text-lg">
                                        Hiện chưa có suất chiếu nào tại rạp này.
                                    </p>
                                    <p className="text-sm mt-2">
                                        Vui lòng chọn rạp khác hoặc quay lại sau.
                                    </p>
                                </>
                            ) : (
                                <p className="text-lg">
                                    Hệ thống đang cập nhật phim mới, vui lòng quay lại sau.
                                </p>
                            )}
                        </RevealOnScroll>
                    )}
                </div>

                {/* BUTTON XEM TẤT CẢ */}
                {isHome && !showAll && !isLoading && filteredMovies.length > 0 && (
                    <RevealOnScroll delay={200} className="mt-12 text-center relative z-30">
                        <button
                            onClick={onShowAll}
                            className="group relative inline-flex items-center justify-center px-8 py-3 text-xs font-bold tracking-[0.15em] text-zinc-300 uppercase rounded-full border border-zinc-700 overflow-hidden transition-all duration-500 hover:border-red-500 hover:text-white"
                        >
                            <span className="relative z-10">Xem tất cả</span>
                            <div className="absolute inset-0 w-full h-full bg-red-600 scale-x-0 origin-left transition-transform duration-500 ease-out group-hover:scale-x-100"></div>
                        </button>
                    </RevealOnScroll>
                )}
            </div>
        </section>
    );
};

export default MovieSection;
