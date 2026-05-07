import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapPin, Phone, Info, PlayCircle, Clock, CalendarDays, AlertTriangle } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useCinema } from '../../components/CinemaContext';

const CinemaDetailsPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [isLoading, setIsLoading] = useState(true);
    const [cinemaData, setCinemaData] = useState(null);
    const [error, setError] = useState(null);

    // Khai báo lấy dữ liệu từ Context
    const { selectedCinema, changeCinema } = useCinema();

    useEffect(() => {
        const fetchCinemaDetails = async () => {
            setIsLoading(true);
            setError(null);

            try {
                if (!id) {
                    throw new Error('Không tìm thấy ID rạp trên URL.');
                }

                // Gọi API lấy dữ liệu rạp + danh sách phim
                const response = await fetch(
                    `https://cinema-api-production-f2bc.up.railway.app/api/v1/cinemas/${id}/movies`
                );

                if (!response.ok) {
                    throw new Error('Rạp không tồn tại hoặc lỗi kết nối máy chủ!');
                }

                const json = await response.json();
                const payload = json.data || json; // Bọc data nếu có

                // 1. GOM DỮ LIỆU RẠP (cinema_info)
                const rawCinema = payload.cinema_info || {};

                const mappedCinemaInfo = {
                    id: rawCinema.cinema_id,
                    name: rawCinema.name || 'Đang cập nhật',
                    city_name: rawCinema.city_name || 'Đang cập nhật',
                    address: rawCinema.address || 'Đang cập nhật',
                    description: rawCinema.description || 'Chưa có thông tin mô tả cho rạp này.',
                    hotline: rawCinema.phone || '1900 xxxx',
                    map_url: rawCinema.map_url || '',
                    image:
                        rawCinema.images && rawCinema.images.length > 0
                            ? rawCinema.images[0]
                            : 'https://placehold.co/1200x500/18181b/ffffff?text=CineTicket'
                };

                // 2. GOM DỮ LIỆU PHIM VÀ SUẤT CHIẾU (movies)
                const mappedMovies = payload.movies || [];

                // Lưu vào state
                setCinemaData({
                    cinema_info: mappedCinemaInfo,
                    movies: mappedMovies
                });
            } catch (err) {
                console.error('Lỗi fetch chi tiết rạp:', err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCinemaDetails();
    }, [id]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white">
                <LoadingSpinner isDark={true} />
                <p className="mt-4 text-zinc-400 animate-pulse">Đang tải thông tin rạp...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white p-6">
                <div className="bg-red-500/10 border border-red-500/30 p-8 rounded-3xl flex flex-col items-center max-w-md text-center">
                    <AlertTriangle className="text-red-500 mb-4" size={48} />
                    <h2 className="text-xl font-bold mb-2">Không thể tải dữ liệu</h2>
                    <p className="text-zinc-400 text-sm mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-2.5 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-semibold transition"
                    >
                        Quay lại Trang chủ
                    </button>
                </div>
            </div>
        );
    }

    if (!cinemaData) return null;
    const { cinema_info, movies } = cinemaData;

    // Kiểm tra xem rạp hiện tại có phải là rạp đang được chọn trong Context không
    const isCurrentSelected = selectedCinema?.id === cinema_info.id;

    return (
        <div className="bg-zinc-950 min-h-screen text-white relative pb-24">
            <div className="max-w-7xl mx-auto px-6 pt-[100px] pb-8">
                {/* BREADCRUMB */}
                <div className="flex items-center gap-2 text-sm text-zinc-400 mb-6">
                    <span
                        className="hover:text-white cursor-pointer transition-colors"
                        onClick={() => navigate('/')}
                    >
                        Trang chủ
                    </span>
                    <span>/</span>
                    <span className="hover:text-white cursor-pointer transition-colors">
                        Hệ thống rạp
                    </span>
                    <span>/</span>
                    <span className="text-orange-500 font-medium">{cinema_info.name}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-8 space-y-8">
                        {/* ẢNH BÌA RẠP */}
                        <div className="w-full aspect-[21/9] rounded-3xl overflow-hidden shadow-2xl relative group">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
                            <img
                                src={cinema_info.image}
                                alt={cinema_info.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src =
                                        'https://placehold.co/1200x500/18181b/ffffff?text=CineTicket';
                                }}
                            />
                            <div className="absolute bottom-6 left-6 z-20">
                                <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold uppercase tracking-widest rounded-full mb-3 inline-block">
                                    {cinema_info.city_name}
                                </span>
                                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                                    {cinema_info.name}
                                </h1>
                            </div>
                        </div>

                        {/* THÔNG TIN LIÊN HỆ & NÚT CHỌN RẠP CONTEXT */}
                        <div className="bg-zinc-900/60 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-zinc-800 shadow-lg flex flex-col sm:flex-row gap-6 sm:items-center justify-between">
                            <div className="space-y-4 flex-1">
                                <div className="flex items-start gap-3">
                                    <MapPin className="text-orange-500 shrink-0 mt-0.5" size={20} />
                                    <p className="text-zinc-300 text-sm">{cinema_info.address}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="text-orange-500 shrink-0" size={20} />
                                    <p className="text-zinc-300 text-sm font-medium">
                                        {cinema_info.hotline}
                                    </p>
                                </div>
                            </div>

                            {/* NÚT LƯU VÀO CONTEXT Ở ĐÂY */}
                            <div className="shrink-0 flex flex-col gap-3">
                                <button
                                    onClick={() => {
                                        changeCinema({
                                            id: cinema_info.id,
                                            name: cinema_info.name,
                                            address: cinema_info.address
                                        });
                                    }}
                                    disabled={isCurrentSelected}
                                    className={`w-full sm:w-auto px-6 py-3 rounded-xl font-medium transition-colors duration-300 flex items-center justify-center gap-2 ${
                                        isCurrentSelected
                                            ? 'bg-orange-500/20 text-orange-500 border border-orange-500/50 cursor-default'
                                            : 'bg-zinc-800 hover:bg-zinc-700 text-white border border-transparent'
                                    }`}
                                >
                                    {isCurrentSelected
                                        ? '❤️ Rạp đang chọn'
                                        : '📍 Đặt làm rạp ưu tiên'}
                                </button>
                            </div>
                        </div>

                        {/* MÔ TẢ */}
                        <div className="bg-zinc-900/60 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-zinc-800 shadow-lg">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2.5 mb-4">
                                <Info className="text-orange-500" size={20} /> Giới thiệu rạp
                            </h2>
                            <p className="text-zinc-400 text-sm leading-loose whitespace-pre-wrap text-justify">
                                {cinema_info.description}
                            </p>
                        </div>

                        {/* BẢN ĐỒ THẬT */}
                        {cinema_info.map_url && (
                            <div className="bg-zinc-900/60 backdrop-blur-xl p-3 md:p-4 rounded-3xl border border-zinc-800 shadow-lg overflow-hidden">
                                <div className="w-full aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden bg-zinc-800">
                                    {cinema_info.map_url.startsWith('http') ? (
                                        // Nếu là Link (URL) thì bọc trong thẻ iframe
                                        <iframe
                                            src={cinema_info.map_url}
                                            width="100%"
                                            height="100%"
                                            style={{ border: 0 }}
                                            allowFullScreen=""
                                            loading="lazy"
                                            title="Bản đồ rạp"
                                        ></iframe>
                                    ) : (
                                        // Nếu là Mã Iframe (bắt đầu bằng <iframe) thì render trực tiếp
                                        <div
                                            className="w-full h-full"
                                            dangerouslySetInnerHTML={{
                                                __html: cinema_info.map_url
                                            }}
                                        />
                                    )}
                                </div>
                                <style>{`iframe { width: 100% !important; height: 100% !important; border: none; }`}</style>
                            </div>
                        )}
                    </div>

                    {/* ========================================================== */}
                    {/* CỘT PHẢI: PHIM ĐANG CHIẾU & SUẤT CHIẾU                     */}
                    {/* ========================================================== */}
                    <div className="lg:col-span-4">
                        <div className="bg-zinc-900/60 backdrop-blur-xl p-6 rounded-3xl border border-zinc-800 shadow-lg sticky top-24">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2.5 mb-6 uppercase tracking-wide border-b border-zinc-800 pb-4">
                                <PlayCircle className="text-orange-500" size={22} /> Hôm nay chiếu
                                gì?
                            </h2>

                            <div className="space-y-6">
                                {movies && movies.length > 0 ? (
                                    movies.map((movie) => (
                                        <div
                                            key={movie.movie_id}
                                            className="flex gap-4 group cursor-pointer border-b border-zinc-800/50 pb-5 last:border-0 last:pb-0"
                                            onClick={() => navigate(`/movie/${movie.movie_id}`)}
                                        >
                                            {/* Poster */}
                                            <div className="w-24 h-36 rounded-xl overflow-hidden shrink-0 shadow-md relative">
                                                <img
                                                    src={movie.poster_url}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    alt={movie.movie_title}
                                                />
                                                <div className="absolute top-1 left-1 bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded">
                                                    {movie.age_limit ? `T${movie.age_limit}` : 'P'}
                                                </div>
                                            </div>

                                            {/* Thông tin */}
                                            <div className="flex flex-col flex-1 py-1">
                                                <h3 className="text-sm font-bold text-white leading-tight group-hover:text-orange-400 line-clamp-2">
                                                    {movie.movie_title}
                                                </h3>
                                                <p className="text-[12px] text-zinc-500 mt-1 truncate">
                                                    {movie.genres
                                                        ?.map((g) => g.genre_name)
                                                        .join(', ')}
                                                </p>
                                                <p className="text-[12px] text-zinc-500 mt-0.5 flex items-center gap-1">
                                                    <Clock size={12} /> {movie.duration} phút
                                                </p>

                                                {/* Hiển thị các Suất Chiếu (Showtimes) */}
                                                {movie.showtimes && movie.showtimes.length > 0 ? (
                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                        {movie.showtimes.map((st) => (
                                                            <button
                                                                key={st.showtime_id}
                                                                onClick={(e) => {
                                                                    e.stopPropagation(); // CHẶN: Không cho click lan ra ngoài thẻ chứa phim
                                                                    navigate(
                                                                        `/booking/${st.showtime_id}`
                                                                    ); // Chuyển hướng sang trang đặt vé
                                                                }}
                                                                className="px-2.5 py-1 text-[11px] font-semibold bg-zinc-800 text-zinc-300 rounded hover:bg-orange-500 hover:text-white transition"
                                                            >
                                                                {st.start_time}
                                                            </button>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-[11px] text-zinc-600 italic mt-3">
                                                        Hết suất chiếu hôm nay
                                                    </p>
                                                )}

                                                <div className="mt-4">
                                                    <button className="w-full py-1.5 bg-orange-600/10 text-orange-500 border border-orange-500/30 rounded-lg text-xs font-semibold hover:bg-orange-600 hover:text-white transition-all duration-300">
                                                        MUA VÉ NGAY
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-10 opacity-60">
                                        <CalendarDays size={40} className="text-zinc-600 mb-3" />
                                        <p className="text-zinc-400 text-sm italic">
                                            Hiện rạp chưa có lịch chiếu phim nào...
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CinemaDetailsPage;
