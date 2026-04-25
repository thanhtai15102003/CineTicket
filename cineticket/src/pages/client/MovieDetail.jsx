import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useCinema } from '../../components/CinemaContext'; // Lấy Context vào

const DAY_NAMES = ['CN', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

const MovieDetail = () => {
    const { id } = useParams();

    // ================= CONTEXT: ĐỒNG BỘ RẠP TỪ HEADER =================
    const { selectedCinema: globalCinema, changeCinema } = useCinema();

    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);

    // trailer
    const [openTrailer, setOpenTrailer] = useState(false);

    // date picker
    const [selectedDate, setSelectedDate] = useState(0);
    const [dateOffset, setDateOffset] = useState(0);

    // regions
    const [regions, setRegions] = useState([]);
    const [selectedRegion, setSelectedRegion] = useState({
        id: 'ALL',
        name: 'Tất cả khu vực'
    });
    const [isOpenRegion, setIsOpenRegion] = useState(false);

    // cinemas
    const [cinemas, setCinemas] = useState([]);
    const [selectedCinema, setSelectedCinema] = useState({
        id: 'ALL',
        name: 'Tất cả rạp'
    });
    const [isOpenCinema, setIsOpenCinema] = useState(false);

    // showtimes (fake data per cinema)
    const [showtimes, setShowtimes] = useState({});

    // ================= ĐỒNG BỘ LOCAL STATE VỚI GLOBAL STATE =================
    useEffect(() => {
        // Nếu trên Header (Global) có chọn rạp, tự động ép local state đổi theo
        if (globalCinema && globalCinema.cinema_id) {
            const city = globalCinema.region?.city || globalCinema.city;
            if (city) {
                setSelectedRegion({ id: city, name: city });
            }
            setSelectedCinema({
                id: globalCinema.cinema_id,
                name: globalCinema.cinema_name || globalCinema.name
            });
        }
    }, [globalCinema]);

    // ================= DATE UTILS =================
    const getDates = () => {
        const today = new Date();
        return Array.from({ length: 5 }, (_, i) => {
            const d = new Date(today);
            d.setDate(today.getDate() + dateOffset + i);
            return d;
        });
    };

    const formatDate = (d) =>
        `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;

    // ================= FETCH MOVIE =================
    useEffect(() => {
        const fetchMovie = async () => {
            try {
                const res = await fetch(
                    'https://cinema-api-production-f2bc.up.railway.app/api/v1/movies'
                );
                const json = await res.json();
                const allMovies = [...(json?.now_showing || []), ...(json?.coming_soon || [])];
                const found = allMovies.find((m) => m.movie_id === Number(id));

                if (!found) {
                    setMovie(null);
                    return;
                }

                setMovie({
                    movie_id: found.movie_id,
                    title: found.title || '',
                    duration: found.duration || 0,
                    description: found.description || '',
                    release_date: found.release_date || '',
                    end_date: found.end_date || '',
                    age_limit: found.age_limit || '',
                    poster_url:
                        found.poster_url || 'https://via.placeholder.com/300x450?text=No+Image',
                    backdrop_url:
                        found.backdrop_url || 'https://via.placeholder.com/1200x500?text=No+Image',
                    trailer_url: found.trailer_url || '',
                    rating: found.rating || 'N/A',
                    country: found.country || 'N/A',
                    director: found.director || 'N/A',
                    actors: found.actors
                        ? typeof found.actors === 'string'
                            ? found.actors.split(',')
                            : found.actors
                        : [],
                    genre: Array.isArray(found.genres) ? found.genres.map((g) => g.genre_name) : []
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchMovie();
    }, [id]);

    // ================= FETCH REGIONS =================
    useEffect(() => {
        const fetchRegions = async () => {
            try {
                const res = await fetch(
                    'https://cinema-api-production-f2bc.up.railway.app/api/v1/regions'
                );
                const json = await res.json();
                const data = json?.data || json;

                const uniqueCities = [
                    ...new Map(data.map((r) => [r.city, { id: r.city, name: r.city }])).values()
                ];

                setRegions([{ id: 'ALL', name: 'Tất cả khu vực' }, ...uniqueCities]);
            } catch (err) {
                console.error(err);
            }
        };

        fetchRegions();
    }, []);

    // ================= FETCH CINEMAS =================
    useEffect(() => {
        const fetchCinemas = async () => {
            try {
                const res = await fetch(
                    'https://cinema-api-production-f2bc.up.railway.app/api/v1/cinemas'
                );
                const json = await res.json();
                const data = json?.data || json;
                const formatted = data.map((c) => ({
                    id: c.cinema_id,
                    name: c.cinema_name,
                    address: c.address || '',
                    region_id: c.region_id,
                    city: c.region?.city || ''
                }));
                setCinemas(formatted);

                // Generate fake showtimes per cinema
                const fakeSlots = [
                    '09:00',
                    '10:30',
                    '12:00',
                    '13:30',
                    '15:00',
                    '16:45',
                    '18:30',
                    '20:00',
                    '21:30',
                    '23:00'
                ];
                const fakeShowtimes = {};
                formatted.forEach((c) => {
                    const count = 4 + Math.floor(Math.random() * 5);
                    const shuffled = [...fakeSlots].sort(() => Math.random() - 0.5);
                    fakeShowtimes[c.id] = shuffled.slice(0, count).sort();
                });
                setShowtimes(fakeShowtimes);
            } catch (err) {
                console.error(err);
            }
        };
        fetchCinemas();
    }, []);

    // ================= FILTER =================
    const filteredCinemas =
        selectedRegion.id === 'ALL' ? cinemas : cinemas.filter((c) => c.city === selectedRegion.id);

    const displayedCinemas =
        selectedCinema.id === 'ALL'
            ? filteredCinemas
            : filteredCinemas.filter((c) => c.id === selectedCinema.id);

    // ================= UTILS =================
    const getEmbedUrl = (url) => {
        if (!url) return '';
        try {
            if (url.includes('watch?v=')) {
                const vid = url.split('watch?v=')[1].split('&')[0];
                return `https://www.youtube.com/embed/${vid}?autoplay=1`;
            }
            if (url.includes('youtu.be/')) {
                const vid = url.split('youtu.be/')[1].split('?')[0];
                return `https://www.youtube.com/embed/${vid}?autoplay=1`;
            }
            return '';
        } catch {
            return '';
        }
    };

    const isVipSlot = (slot) => ['21:30', '23:00', '20:00'].includes(slot);
    const isSoldSlot = (slot) => ['09:00', '10:30'].includes(slot);

    // ================= LOADING =================
    if (loading)
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-zinc-800 border-t-red-600 rounded-full animate-spin"></div>
            </div>
        );
    if (!movie)
        return (
            <div className="min-h-screen bg-zinc-950 text-white text-center py-40">
                Không tìm thấy phim
            </div>
        );

    const dates = getDates();

    return (
        <div className="bg-zinc-950 text-white min-h-screen">
            {/* ================= BANNER ================= */}
            <div className="relative h-[400px] md:h-[550px] overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${movie.backdrop_url})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/60 to-transparent" />

                {movie.trailer_url && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <button
                            onClick={() => setOpenTrailer(true)}
                            className="group relative w-20 h-20 rounded-full bg-red-600/80 backdrop-blur-sm flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.5)] border border-white/20 transition-all duration-300 hover:scale-110 hover:bg-red-600"
                        >
                            <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping opacity-20 group-hover:opacity-0"></div>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                className="w-8 h-8 ml-1 text-white"
                                fill="currentColor"
                            >
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            {/* ================= INFO ================= */}
            <div className="max-w-6xl mx-auto px-6 relative -mt-32 md:-mt-40 flex flex-col md:flex-row gap-8 lg:gap-12 z-10">
                <div className="w-[220px] md:w-[280px] flex-shrink-0 mx-auto md:mx-0">
                    <img
                        src={movie.poster_url}
                        className="w-full aspect-[2/3] object-cover rounded-2xl shadow-2xl shadow-black border border-white/10"
                        alt={movie.title}
                    />
                </div>
                <div className="flex-1 pt-4 md:pt-16 text-center md:text-left">
                    <div className="inline-block px-3 py-1 bg-red-600 text-white text-xs font-bold rounded mb-4">
                        {movie.age_limit}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight drop-shadow-lg text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-300">
                        {movie.title}
                    </h1>

                    <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-sm font-medium text-zinc-300 mb-6">
                        <span className="flex items-center gap-1">
                            <span className="text-red-500">⏱️</span> {movie.duration} phút
                        </span>
                        <span className="w-1.5 h-1.5 bg-zinc-700 rounded-full"></span>
                        <span className="flex items-center gap-1">
                            <span className="text-red-500">📅</span> {movie.release_date}
                        </span>
                        <span className="w-1.5 h-1.5 bg-zinc-700 rounded-full"></span>
                        <span className="flex items-center gap-1 text-yellow-400">
                            ⭐ {movie.rating}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 text-sm text-zinc-300 bg-zinc-900/50 p-5 rounded-2xl border border-white/5">
                        <p>
                            <span className="text-zinc-500 mr-2">Quốc gia:</span>{' '}
                            <span className="font-semibold text-white">{movie.country}</span>
                        </p>
                        <p>
                            <span className="text-zinc-500 mr-2">Đạo diễn:</span>{' '}
                            <span className="font-semibold text-white">{movie.director}</span>
                        </p>
                        <p>
                            <span className="text-zinc-500 mr-2">Thể loại:</span>{' '}
                            <span className="font-semibold text-white">
                                {movie.genre.join(', ')}
                            </span>
                        </p>
                        <p>
                            <span className="text-zinc-500 mr-2">Diễn viên:</span>{' '}
                            <span className="font-semibold text-white line-clamp-1">
                                {movie.actors.join(', ')}
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            {/* ================= DESCRIPTION ================= */}
            <div className="max-w-6xl mx-auto px-6 py-12 border-b border-zinc-800/80">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-1.5 h-6 bg-red-600 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.5)]"></div>
                    <h2 className="text-2xl font-bold uppercase tracking-widest">Nội dung phim</h2>
                </div>
                <p className="text-zinc-300 leading-relaxed text-[15px] md:text-base text-justify">
                    {movie.description}
                </p>
            </div>

            {/* ================= LỊCH CHIẾU (ĐÃ TÍCH HỢP GLOBAL STATE) ================= */}
            <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-1.5 h-6 bg-red-600 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.5)]"></div>
                    <h2 className="text-2xl font-bold uppercase tracking-widest">Lịch Chiếu</h2>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4 flex-wrap mb-10">
                    {/* Date slider */}
                    <div className="flex items-center bg-zinc-900/80 p-1.5 rounded-2xl border border-white/5 flex-shrink-0">
                        <button
                            onClick={() => {
                                setDateOffset(Math.max(0, dateOffset - 5));
                                setSelectedDate(0);
                            }}
                            className="text-zinc-500 hover:text-white text-2xl px-3 h-14 transition-colors"
                        >
                            ‹
                        </button>
                        <div className="flex gap-1">
                            {dates.map((d, i) => {
                                const isToday = i === 0 && dateOffset === 0;
                                const active = i === selectedDate;
                                return (
                                    <div
                                        key={i}
                                        onClick={() => setSelectedDate(i)}
                                        className={`flex flex-col items-center justify-center w-[75px] h-[56px] cursor-pointer rounded-xl transition-all select-none
                                            ${active ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}
                                    >
                                        <span className="text-[10px] font-medium uppercase tracking-wider">
                                            {isToday ? 'Hôm Nay' : DAY_NAMES[d.getDay()]}
                                        </span>
                                        <span className="text-lg font-bold">{formatDate(d)}</span>
                                    </div>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => {
                                setDateOffset(dateOffset + 5);
                                setSelectedDate(0);
                            }}
                            className="text-zinc-500 hover:text-white text-2xl px-3 h-14 transition-colors"
                        >
                            ›
                        </button>
                    </div>

                    {/* Region dropdown */}
                    <div className="relative">
                        <div
                            onClick={() => {
                                setIsOpenRegion(!isOpenRegion);
                                setIsOpenCinema(false);
                            }}
                            className={`bg-zinc-900/80 backdrop-blur-xl border px-5 py-3.5 rounded-2xl cursor-pointer flex items-center justify-between gap-8 min-w-[200px] text-sm font-medium transition-colors
                                ${isOpenRegion ? 'border-red-500 text-white' : 'border-white/5 hover:border-white/20 text-zinc-300'}`}
                        >
                            <span>{selectedRegion.name}</span>
                            <span
                                className={`text-zinc-500 text-[10px] transition-transform duration-300 ${isOpenRegion ? 'rotate-180' : ''}`}
                            >
                                ▼
                            </span>
                        </div>

                        {isOpenRegion && (
                            <div className="absolute top-full mt-2 w-full bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl z-50 shadow-2xl overflow-hidden py-2">
                                {regions.map((r) => (
                                    <div
                                        key={r.id}
                                        onClick={() => {
                                            setSelectedRegion(r);
                                            setSelectedCinema({ id: 'ALL', name: 'Tất cả rạp' });
                                            setIsOpenRegion(false);
                                            // Xóa lựa chọn rạp global nếu đổi thành phố
                                            changeCinema(null);
                                        }}
                                        className={`px-5 py-3 text-sm cursor-pointer transition-colors mx-2 rounded-xl
                                            ${selectedRegion.id === r.id ? 'bg-red-500/15 text-red-400 font-bold' : 'text-zinc-300 hover:bg-white/5 hover:text-white'}`}
                                    >
                                        {r.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Cinema dropdown (Sync with global context) */}
                    <div className="relative">
                        <div
                            onClick={() => {
                                setIsOpenCinema(!isOpenCinema);
                                setIsOpenRegion(false);
                            }}
                            className={`bg-zinc-900/80 backdrop-blur-xl border px-5 py-3.5 rounded-2xl cursor-pointer flex items-center justify-between gap-8 min-w-[220px] text-sm font-medium transition-colors
                                ${isOpenCinema ? 'border-red-500 text-white' : 'border-white/5 hover:border-white/20 text-zinc-300'}`}
                        >
                            <span className="truncate max-w-[150px]">{selectedCinema.name}</span>
                            <span
                                className={`text-zinc-500 text-[10px] transition-transform duration-300 ${isOpenCinema ? 'rotate-180' : ''}`}
                            >
                                ▼
                            </span>
                        </div>

                        {isOpenCinema && (
                            <div className="absolute top-full mt-2 w-full bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl z-50 shadow-2xl overflow-hidden max-h-64 overflow-y-auto py-2 custom-scrollbar">
                                <div
                                    onClick={() => {
                                        setSelectedCinema({ id: 'ALL', name: 'Tất cả rạp' });
                                        setIsOpenCinema(false);
                                        changeCinema(null); // Reset global state
                                    }}
                                    className={`px-5 py-3 text-sm cursor-pointer transition-colors mx-2 rounded-xl
                                        ${selectedCinema.id === 'ALL' ? 'bg-red-500/15 text-red-400 font-bold' : 'text-zinc-300 hover:bg-white/5 hover:text-white'}`}
                                >
                                    Tất cả rạp
                                </div>
                                {filteredCinemas.map((c) => (
                                    <div
                                        key={c.id}
                                        onClick={() => {
                                            setSelectedCinema(c);
                                            setIsOpenCinema(false);
                                            // Đồng bộ ngược lại cho Header (Global State)
                                            changeCinema({
                                                cinema_id: c.id,
                                                cinema_name: c.name,
                                                region: { city: c.city }
                                            });
                                        }}
                                        className={`px-5 py-3 text-sm cursor-pointer transition-colors mx-2 rounded-xl truncate
                                            ${selectedCinema.id === c.id ? 'bg-red-500/15 text-red-400 font-bold' : 'text-zinc-300 hover:bg-white/5 hover:text-white'}`}
                                    >
                                        {c.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="h-[1px] w-full bg-zinc-800 mb-8 rounded" />

                {/* ===== SHOWTIME LIST ===== */}
                <div className="flex flex-col gap-5">
                    {displayedCinemas.length === 0 ? (
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl py-12 text-center">
                            <p className="text-zinc-500 font-medium">
                                Không có suất chiếu nào phù hợp với lựa chọn của bạn.
                            </p>
                        </div>
                    ) : (
                        displayedCinemas.map((c) => (
                            <div
                                key={c.id}
                                className="bg-zinc-900/60 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/5 shadow-lg transition-all hover:border-white/10"
                            >
                                <div className="px-6 py-5 border-b border-white/5 bg-black/20 flex flex-col md:flex-row justify-between md:items-center gap-3">
                                    <div>
                                        <p className="font-bold text-lg text-white tracking-wide">
                                            {c.name}
                                        </p>
                                        {c.address && (
                                            <p className="text-sm text-zinc-500 mt-1 flex items-center gap-1.5">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-4 w-4 text-red-500"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                                {c.address}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="px-6 py-6 flex flex-wrap gap-4">
                                    {(showtimes[c.id] || []).map((slot) => (
                                        <button
                                            key={slot}
                                            disabled={isSoldSlot(slot)}
                                            className={`relative px-6 py-3 rounded-xl text-sm font-bold tracking-wider border transition-all duration-300
                                                ${
                                                    isSoldSlot(slot)
                                                        ? 'border-white/5 bg-white/5 text-zinc-600 line-through cursor-not-allowed'
                                                        : isVipSlot(slot)
                                                          ? 'border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white shadow-[0_0_15px_rgba(220,38,38,0.2)]'
                                                          : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-white hover:text-black hover:bg-white'
                                                }`}
                                        >
                                            {slot}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* ================= TRAILER MODAL ================= */}
            {openTrailer && (
                <div
                    className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all"
                    onClick={() => setOpenTrailer(false)}
                >
                    <div
                        className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.2)] border border-zinc-800"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setOpenTrailer(false)}
                            className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                            ✕
                        </button>
                        <iframe
                            className="w-full h-full"
                            src={getEmbedUrl(movie.trailer_url)}
                            allow="autoplay; encrypted-media; gyroscope"
                            allowFullScreen
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default MovieDetail;
