// src/components/MovieSection.jsx
import { useState, useEffect } from 'react';
import MovieCard from '../components/MovieCard';

const API_BASE_URL = 'https://cinema-api-production-f2bc.up.railway.app/api/v1';

const MovieSection = ({ showAll = false, onShowAll, isHome = false }) => {
    const [activeTab, setActiveTab] = useState('now_showing');

    const [nowShowing, setNowShowing] = useState([]);
    const [upcoming, setUpcoming] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch dữ liệu từ API
    useEffect(() => {
        const fetchMovies = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch phim đang chiếu (now showing)
                const nowRes = await fetch(`${API_BASE_URL}/movies?status=active`);
                if (!nowRes.ok) throw new Error('Không thể tải phim đang chiếu');
                const nowData = await nowRes.json();
                setNowShowing(nowData.data || []);

                // Fetch phim sắp chiếu (upcoming) - giả sử API có param status=upcoming hoặc end_date > today
                // Nếu API chưa có endpoint riêng, bạn có thể filter theo release_date > today
                const upcomingRes = await fetch(`${API_BASE_URL}/movies`);
                if (!upcomingRes.ok) throw new Error('Không thể tải phim sắp chiếu');
                const upcomingData = await upcomingRes.json();

                // Filter phim sắp chiếu (release_date > hôm nay)
                const today = new Date().toISOString().split('T')[0];
                const filteredUpcoming = (upcomingData.data || []).filter(
                    (movie) => movie.release_date && movie.release_date.split('T')[0] > today
                );

                setUpcoming(filteredUpcoming);
            } catch (err) {
                console.error('Fetch error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMovies();
    }, []); // Chỉ chạy 1 lần khi component mount

    // Lấy dữ liệu hiển thị theo tab và showAll
    const displayedNowShowing = showAll ? nowShowing : nowShowing.slice(0, 4);
    const displayedUpcoming = showAll ? upcoming : upcoming.slice(0, 4);

    const filteredMovies = activeTab === 'now_showing' ? displayedNowShowing : displayedUpcoming;

    if (loading) {
        return (
            <section className="bg-zinc-950 py-14">
                <div className="max-w-7xl mx-auto px-6 text-center text-zinc-400">
                    Đang tải phim...
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="bg-zinc-950 py-14">
                <div className="max-w-7xl mx-auto px-6 text-center text-red-500">Lỗi: {error}</div>
            </section>
        );
    }

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
                {filteredMovies.length === 0 ? (
                    <div className="text-center text-zinc-400 py-10">
                        Hiện không có phim nào trong danh mục này.
                    </div>
                ) : (
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
                )}

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
