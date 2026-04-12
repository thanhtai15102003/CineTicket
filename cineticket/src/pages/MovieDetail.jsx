import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { movies } from '../data/movie';
import { showtimes } from '../data/showtimes';


const MovieDetail = () => {
    const { id } = useParams();
    const movie = movies.find((m) => m.movie_id === Number(id));

    const [isOpenRegion, setIsOpenRegion] = useState(false);
    const [isOpenCinema, setIsOpenCinema] = useState(false);

    const [openTrailer, setOpenTrailer] = useState(false);

    const getEmbedUrl = (url) => {
        return url.replace('watch?v=', 'embed/') + '?autoplay=1';
    };

    // 1. Lấy suất chiếu của phim
    const movieShowtimes = showtimes.filter((s) => s.movie_id === movie.movie_id);

    // 2. Lấy danh sách ngày
    const uniqueDates = [...new Set(movieShowtimes.map((s) => s.show_date))].sort();

    // 3. State chọn ngày
    const [selectedDate, setSelectedDate] = useState(uniqueDates[0]);

     //Danh sách khu vực
    const uniqueRegions = [...new Set(movieShowtimes.map(s => s.region))];
    //Chọn khu vực State
    const [selectedRegion, setSelectedRegion] = useState(uniqueRegions[0]);

    // lọc theo rạp
    const uniqueCinemas = [
        ...new Set(movieShowtimes.filter((s) => s.region === selectedRegion).map((s) => s.cinema))
    ];
    const [selectedCinema, setSelectedCinema] = useState(uniqueCinemas[0]);


    // 4. Lọc theo ngày
    const filteredShowtimes = movieShowtimes.filter((s) => s.show_date === selectedDate && s.region === selectedRegion && (selectedCinema === "ALL" || s.cinema === selectedCinema));

    // 5. Group lại
    const grouped = filteredShowtimes.reduce((acc, item) => {
        if (!acc[item.cinema]) acc[item.cinema] = {};
        if (!acc[item.cinema][item.room]) acc[item.cinema][item.room] = [];

        acc[item.cinema][item.room].push(item);
        return acc;
    }, {});

   

    if (!movie) return <div className="text-white">Không tìm thấy phim</div>;

    return (
        <div className="bg-zinc-950 text-white">
            {/* ==================== 1. BANNER ==================== */}
            <div className="relative h-[400px] md:h-[500px]">
                {/* Ảnh sáng hơn */}
                <img
                    src={movie.backdrop_url}
                    className="w-full h-full object-cover brightness-105 contrast-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>

                {/* Nút Play */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <button
                        onClick={() => setOpenTrailer(true)}
                        className="w-20 h-20 flex items-center justify-center bg-red-600 rounded-full 
  hover:scale-110 hover:bg-red-700 transition-all duration-300 
  shadow-[0_0_25px_rgba(220,38,38,0.7)]"
                    >
                        {/* Icon Play */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-10 h-10 text-white ml-1"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* ==================== 2. INFO ==================== */}
            <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-10">
                {/* Poster */}
                <img src={movie.poster_url} className="w-[260px] rounded-xl shadow-lg" />

                {/* Info */}
                <div>
                    <h1 className="text-3xl font-bold mb-4">
                        {movie.title} ({movie.age_limit})
                    </h1>

                    <div className="grid grid-cols-2 gap-4 text-zinc-300 text-sm">
                        <p>⏱️ {movie.duration} phút</p>
                        <p>📅 {movie.release_date}</p>
                        <p>⭐ {movie.rating}</p>
                        <p>🌍 {movie.country} </p>
                        <p>🎬 {movie.genre.join(', ')}</p>
                        <p>🏢 {movie.producer}</p>
                        <p>🎥 Đạo diễn: {movie.director}</p>
                        <p>🎭 Diễn viên: {movie.actors.join(', ')}</p>
                    </div>
                </div>
            </div>

            {/* ==================== 3. NỘI DUNG ==================== */}
            <div className="max-w-6xl mx-auto px-6 pb-12">
                <h2 className="text-2xl font-bold mb-4">Nội dung phim</h2>
                <p className="text-zinc-300 leading-relaxed">{movie.description}</p>
            </div>

            {/* ==================== 4.1 DANH SÁCH KHU VỰC ==================== */}
            {/* ==================== 4.1 FILTER ==================== */}
            <div className="max-w-6xl mx-auto px-6 pb-12">
                <div className="flex flex-wrap items-start gap-6">
                    {/* KHU VỰC */}
                    <div className="flex flex-col w-[180px] relative">
                        <h2 className="text-sm text-zinc-400 mb-2">Khu vực</h2>

                        <div
                            onClick={() => setIsOpenRegion(!isOpenRegion)}
                            className="bg-zinc-900 border border-zinc-700 px-4 py-2 rounded-lg cursor-pointer flex justify-between items-center"
                        >
                            <span className="truncate">{selectedRegion}</span>
                            <span>▼</span>
                        </div>

                        {isOpenRegion && (
                            <div className="absolute top-full mt-2 w-full bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg z-50">
                                {uniqueRegions.map((region) => (
                                    <div
                                        key={region}
                                        onClick={() => {
                                            setSelectedRegion(region);
                                            setSelectedCinema('ALL');
                                            setIsOpenRegion(false);
                                        }}
                                        className="px-4 py-2 hover:bg-zinc-800 cursor-pointer"
                                    >
                                        {region}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* RẠP */}
                    <div className="flex flex-col w-[220px] relative">
                        <h2 className="text-sm text-zinc-400 mb-2">Rạp</h2>

                        <div
                            onClick={() => setIsOpenCinema(!isOpenCinema)}
                            className="bg-zinc-900 border border-zinc-700 px-4 py-2 rounded-lg cursor-pointer flex justify-between items-center"
                        >
                            <span className="truncate">{selectedCinema}</span>
                            <span>▼</span>
                        </div>

                        {isOpenCinema && (
                            <div className="absolute top-full mt-2 w-full bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg z-50">
                                <div
                                    onClick={() => {
                                        setSelectedCinema('ALL');
                                        setIsOpenCinema(false);
                                    }}
                                    className="px-4 py-2 hover:bg-zinc-800 cursor-pointer"
                                >
                                    Tất cả
                                </div>

                                {uniqueCinemas.map((cinema) => (
                                    <div
                                        key={cinema}
                                        onClick={() => {
                                            setSelectedCinema(cinema);
                                            setIsOpenCinema(false);
                                        }}
                                        className="px-4 py-2 hover:bg-zinc-800 cursor-pointer"
                                    >
                                        {cinema}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* LỊCH CHIẾU */}
                    <div className="flex-1 min-w-[250px]">
                        <h2 className="text-sm text-zinc-400 mb-2">Lịch chiếu</h2>

                        <div className="flex gap-2 flex-wrap">
                            {uniqueDates.map((date) => (
                                <button
                                    key={date}
                                    onClick={() => setSelectedDate(date)}
                                    className={`px-3 py-1.5 rounded-full text-xs ${
                                        selectedDate === date
                                            ? 'bg-red-600 text-white'
                                            : 'bg-zinc-800 text-zinc-300'
                                    }`}
                                >
                                    {date}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ==================== 5. SUẤT CHIẾU ==================== */}
            <div className="max-w-6xl mx-auto px-6 pb-20">
                <h2 className="text-2xl font-bold mb-6">Suất chiếu</h2>

                <div className="space-y-6">
                    {Object.entries(grouped).map(([cinema, rooms]) => (
                        <div key={cinema} className="bg-zinc-950 p-4 rounded-xl">
                            <h3 className="font-semibold text-base mb-3">{cinema}</h3>

                            {Object.entries(rooms).map(([room, times]) => (
                                <div key={room} className="mb-4">
                                    <p className="text-zinc-500 text-sm mb-2">{room}</p>

                                    <div className="flex gap-2 flex-wrap">
                                        {(times || []).map((time) => (
                                            <button
                                                key={time.showtime_id}
                                                className="min-w-[70px] px-2 py-1 text-xs text-center border border-zinc-700 rounded-md 
                             text-zinc-300 hover:bg-red-600 hover:text-white 
                             hover:border-red-600 transition-all duration-200"
                                            >
                                                {time.start_time}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* 🎬 MODAL TRAILER */}
            {openTrailer && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="relative w-[90%] md:w-[800px]">
                        <button
                            onClick={() => setOpenTrailer(false)}
                            className="absolute -top-10 right-0 text-white text-2xl"
                        >
                            ✖
                        </button>

                        <iframe
                            className="w-full h-[300px] md:h-[450px] rounded-xl"
                            src={getEmbedUrl(movie.trailer_url)}
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            )}
        </div>
    );
};;

export default MovieDetail;
