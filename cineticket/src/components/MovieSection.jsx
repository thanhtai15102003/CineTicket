import { useState, useEffect } from 'react';
import MovieCard from '../components/MovieCard';

const MovieSection = ({ showAll = false, onShowAll, isHome = false }) => {
    const [activeTab, setActiveTab] = useState('now_showing');

    const [nowShowing, setNowShowing] = useState([]);
    const [comingSoon, setComingSoon] = useState([]);

    // ================= FETCH API =================
    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const res = await fetch(
                    'https://cinema-api-production-f2bc.up.railway.app/api/v1/movies'
                );

                const json = await res.json();

                // ✅ SAFE DATA
                const now = Array.isArray(json?.now_showing) ? json.now_showing : [];

                const soon = Array.isArray(json?.coming_soon) ? json.coming_soon : [];

                // ✅ FORMAT DATA CHO UI
                const formatMovie = (m) => ({
                    movie_id: m.movie_id,
                    title: m.title || 'No title',
                    duration: m.duration || 0,
                    description: m.description || '',
                    release_date: m.release_date || '',
                    age_limit: m.age_limit || '',
                    poster_url: m.poster_url || 'https://via.placeholder.com/300x450?text=No+Image',
                    trailer_url: m.trailer_url || '#',

                    // 👇 FIX ACTORS
                    actors: m.actors
                        ? typeof m.actors === 'string'
                            ? m.actors.split(',')
                            : m.actors
                        : [],

                    director: m.director || 'N/A',

                    // 👇 FIX GENRE (QUAN TRỌNG)
                    genres: Array.isArray(m.genres) ? m.genres.map((g) => g.genre_name) : []
                });

                setNowShowing(now.map(formatMovie));
                setComingSoon(soon.map(formatMovie));
            } catch (err) {
                console.error('Lỗi fetch movies:', err);
            }
        };

        fetchMovies();
    }, []);

    // ================= DISPLAY =================
    const displayedNowShowing = showAll ? nowShowing : nowShowing.slice(0, 4);
    const displayedUpcoming = showAll ? comingSoon : comingSoon.slice(0, 4);

    const filteredMovies = activeTab === 'now_showing' ? displayedNowShowing : displayedUpcoming;

    return (
        <section className="bg-zinc-950 py-14">
            <div className="max-w-7xl mx-auto px-6">
                {isHome && (
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-white mb-3">Phim nổi bật</h2>
                    </div>
                )}

                {/* TAB */}
                <div className="flex flex-col items-center mb-16">
                    <div className="inline-flex bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800">
                        <button
                            onClick={() => setActiveTab('now_showing')}
                            className={`px-8 py-3 rounded-xl ${
                                activeTab === 'now_showing'
                                    ? 'bg-red-600 text-white'
                                    : 'text-zinc-500'
                            }`}
                        >
                            PHIM ĐANG CHIẾU
                        </button>

                        <button
                            onClick={() => setActiveTab('upcoming')}
                            className={`px-8 py-3 rounded-xl ${
                                activeTab === 'upcoming' ? 'bg-red-600 text-white' : 'text-zinc-500'
                            }`}
                        >
                            PHIM SẮP CHIẾU
                        </button>
                    </div>
                </div>

                {/* LIST */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {filteredMovies.map((movie) => (
                        <MovieCard key={movie.movie_id} movie={movie} />
                    ))}
                </div>

                {/* BUTTON */}
                {isHome && !showAll && (
                    <div className="mt-12 text-center">
                        <button
                            onClick={onShowAll}
                            className="px-10 py-3 border text-zinc-400 rounded-full hover:bg-white hover:text-black"
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
