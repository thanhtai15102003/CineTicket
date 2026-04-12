// src/components/MovieSection.jsx
import { useState } from 'react';
import MovieCard from '../components/MovieCard';
import { getNowShowingMovies, getUpcomingMovies } from '..//data/movie';

const MovieSection = ({ showAll = false, onShowAll, isHome = false }) => {
    const [activeTab, setActiveTab] = useState('now_showing');

    const allNowShowing = getNowShowingMovies();
    const allUpcoming = getUpcomingMovies();

    const displayedNowShowing = showAll ? allNowShowing : allNowShowing.slice(0, 4);
    const displayedUpcoming = showAll ? allUpcoming : allUpcoming.slice(0, 4);

    const filteredMovies = activeTab === 'now_showing' ? displayedNowShowing : displayedUpcoming;

    return (
        <section className="bg-zinc-950 py-14">
            <div className="max-w-7xl mx-auto px-6">
                {/* Tiêu đề chỉ hiển thị ở trang chủ */}
                {isHome && (
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-white mb-3">Phim nổi bật</h2>
                    </div>
                )}

                {/* Thanh Tab */}
                <div className="flex flex-col items-center mb-16">
                    <div className="inline-flex bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800">
                        <button
                            onClick={() => setActiveTab('now_showing')}
                            className={`px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                                activeTab === 'now_showing'
                                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                                    : 'text-zinc-500 hover:text-white'
                            }`}
                        >
                            PHIM ĐANG CHIẾU
                        </button>
                        <button
                            onClick={() => setActiveTab('upcoming')}
                            className={`px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                                activeTab === 'upcoming'
                                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                                    : 'text-zinc-500 hover:text-white'
                            }`}
                        >
                            PHIM SẮP CHIẾU
                        </button>
                    </div>
                    <div className="h-1 w-20 bg-red-600 mt-6 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.8)]"></div>
                </div>

                {/* Danh sách phim */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                    {filteredMovies.map((movie) => (
                        <div
                            key={movie.movie_id}
                            className="animate-in fade-in slide-in-from-bottom-4 duration-700"
                        >
                            <MovieCard movie={movie} />
                        </div>
                    ))}
                </div>

                {/* Nút "Xem tất cả phim" - Chỉ hiển thị ở trang chủ và khi chưa showAll */}
                {isHome && !showAll && (
                    <div className="mt-12 text-center">
                        <button
                            onClick={onShowAll}
                            className="px-10 py-3.5 border-2 border-zinc-800 text-zinc-400 font-bold rounded-full hover:bg-white hover:text-black hover:border-white transition-all duration-300"
                        >
                            XEM TẤT CẢ PHIM
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

export default MovieSection;
