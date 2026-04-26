import { useState, useEffect } from 'react';
import MovieCard from '../components/MovieCard';
import LoadingSpinner from './common/LoadingSpinner';
import RevealOnScroll from './common/RevealOnScroll'; // <-- ĐÃ IMPORT

const MovieSection = ({ showAll = false, onShowAll, isHome = false }) => {
    const [activeTab, setActiveTab] = useState('now_showing');

    const [nowShowing, setNowShowing] = useState([]);
    const [comingSoon, setComingSoon] = useState([]);

    const [isLoading, setIsLoading] = useState(true);

    // ================= FETCH API =================
    useEffect(() => {
        const fetchMovies = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(
                    'https://cinema-api-production-f2bc.up.railway.app/api/v1/movies'
                );

                const json = await res.json();

                const now = Array.isArray(json?.now_showing) ? json.now_showing : [];
                const soon = Array.isArray(json?.coming_soon) ? json.coming_soon : [];

                const formatMovie = (m) => ({
                    movie_id: m.movie_id,
                    title: m.title || 'No title',
                    duration: m.duration || 0,
                    description: m.description || '',
                    release_date: m.release_date || '',
                    age_limit: m.age_limit || '',
                    poster_url: m.poster_url || 'https://via.placeholder.com/300x450?text=No+Image',
                    trailer_url: m.trailer_url || '#',
                    actors: m.actors
                        ? typeof m.actors === 'string'
                            ? m.actors.split(',')
                            : m.actors
                        : [],
                    director: m.director || 'N/A',
                    genres: Array.isArray(m.genres) ? m.genres.map((g) => g.genre_name) : []
                });

                setNowShowing(now.map(formatMovie));
                setComingSoon(soon.map(formatMovie));
            } catch (err) {
                console.error('Lỗi fetch movies:', err);
            } finally {
                setTimeout(() => setIsLoading(false), 500);
            }
        };

        fetchMovies();
    }, []);

    // ================= DISPLAY =================
    const displayedNowShowing = showAll ? nowShowing : nowShowing.slice(0, 4);
    const displayedUpcoming = showAll ? comingSoon : comingSoon.slice(0, 4);

    const filteredMovies = activeTab === 'now_showing' ? displayedNowShowing : displayedUpcoming;

    return (
        <section
            className={`relative bg-zinc-950 overflow-hidden ${isHome ? 'pt-[100px] pb-16' : 'pt-[100px] pb-8'}`}
        >
            {/* BACKGROUND EFFECT */}
            <div className="absolute top-0 left-[15%] w-[50%] h-[300px] bg-red-600/10 blur-[120px] rounded-full pointer-events-none opacity-60 z-0"></div>

            <div className="relative max-w-7xl mx-auto px-4 md:px-6 z-10">
                {/* ================= HEADER & TABS ================= */}
                <RevealOnScroll delay={0}>
                    <div className="relative z-40 flex items-center gap-5 mb-8 border-b border-zinc-800/80 pb-1">
                        <div className="flex items-center gap-2.5 sm:border-r sm:border-zinc-800 sm:pr-6">
                            <div className="w-1 h-5 bg-red-600 rounded-full shadow-[0_0_8px_rgba(220,38,38,0.5)]"></div>
                            <h2 className="text-lg md:text-xl font-black tracking-widest text-white uppercase drop-shadow-md">
                                PHIM
                            </h2>
                        </div>

                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => setActiveTab('now_showing')}
                                className={`relative text-[14px] md:text-[15px] font-bold transition-all duration-300 pb-2 cursor-pointer ${
                                    activeTab === 'now_showing'
                                        ? 'text-white'
                                        : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                            >
                                Đang chiếu
                                {activeTab === 'now_showing' && (
                                    <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-red-500 shadow-[0_-2px_8px_rgba(239,68,68,0.8)]"></span>
                                )}
                            </button>

                            <button
                                onClick={() => setActiveTab('upcoming')}
                                className={`relative text-[14px] md:text-[15px] font-bold transition-all duration-300 pb-2 cursor-pointer ${
                                    activeTab === 'upcoming'
                                        ? 'text-white'
                                        : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                            >
                                Sắp chiếu
                                {activeTab === 'upcoming' && (
                                    <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-red-500 shadow-[0_-2px_8px_rgba(239,68,68,0.8)]"></span>
                                )}
                            </button>
                        </div>
                    </div>
                </RevealOnScroll>

                {/* ================= LIST PHIM / LOADING ================= */}
                <div className="relative z-30 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 min-h-[300px]">
                    {isLoading ? (
                        <div className="col-span-full">
                            <LoadingSpinner isDark={true} />
                        </div>
                    ) : filteredMovies.length > 0 ? (
                        filteredMovies.map((movie, index) => (
                            // Áp dụng delay bậc thang: index * 100ms
                            <RevealOnScroll
                                key={movie.movie_id}
                                delay={index * 100}
                                className="h-full"
                            >
                                <MovieCard movie={movie} />
                            </RevealOnScroll>
                        ))
                    ) : (
                        <RevealOnScroll className="col-span-full py-16 flex flex-col justify-center items-center text-zinc-500">
                            <p>Không có phim nào để hiển thị.</p>
                        </RevealOnScroll>
                    )}
                </div>

                {/* ================= BUTTON XEM TẤT CẢ ================= */}
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
