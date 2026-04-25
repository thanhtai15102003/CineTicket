import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MovieCard = ({ movie }) => {
    const [openTrailer, setOpenTrailer] = useState(false);
    const navigate = useNavigate();

    // Hàm convert link youtube → embed
    const getEmbedUrl = (url) => {
        if (!url) return '';
        // Xử lý cả dạng watch?v= và youtu.be/
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        const id = match && match[2].length === 11 ? match[2] : null;
        return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : '';
    };

    // Giả định movie.genres là mảng string, nếu là string cách nhau dấu phẩy thì split
    const genres = Array.isArray(movie.genres)
        ? movie.genres
        : movie.genres
          ? movie.genres.split(',').map((g) => g.trim())
          : [];

    return (
        <>
            {/* Container chính: Thêm overflow-hidden để phục vụ hiệu ứng zoom hình ảnh */}
            <div className="group relative rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 transition-all duration-500 hover:border-zinc-700 hover:shadow-2xl hover:shadow-red-500/10">
                {/* 1. Khu vực Poster & Hover Effects (Tỷ lệ 2:3 chuẩn cinematic) */}
                <div
                    className="relative aspect-[2/3] overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/movie/${movie.movie_id}`)}
                >
                    {/* Poster với hiệu ứng Zoom nhẹ khi hover */}
                    <img
                        src={
                            movie.poster_url || 'https://via.placeholder.com/300x450?text=No+Poster'
                        }
                        alt={movie.title}
                        className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                    />

                    {/* Lớp phủ Gradient mượt mà (chỉ xuất hiện rõ khi hover) */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />

                    {/* 2. Thông tin chi tiết hiện khi Hover (Slide up nhẹ) */}
                    <div className="absolute bottom-0 left-0 w-full p-5 z-20 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                        {/* Thể loại dạng tag nhỏ, thanh lịch */}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                            {genres.slice(0, 2).map((genre, index) => (
                                <span
                                    key={index}
                                    className="text-[11px] font-medium text-zinc-300 bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-sm border border-white/5"
                                >
                                    {genre}
                                </span>
                            ))}
                        </div>

                        <h3 className="text-white font-bold text-xl mb-1.5 leading-snug line-clamp-2">
                            {movie.title}
                        </h3>

                        <div className="flex items-center gap-4 text-sm text-zinc-400 font-medium">
                            <span className="flex items-center gap-1.5">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 text-red-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                {movie.duration} phút
                            </span>
                            <span className="text-zinc-600">|</span>
                            <span>{movie.director?.split(',')[0] || 'N/A'}</span>
                        </div>
                    </div>

                    {/* 3. Age Limit Tag (Thiết kế lại thành bo tròn, sang hơn) */}
                    <div className="absolute top-4 right-4 z-20 font-bold bg-red-600/90 backdrop-blur-sm text-white text-[11px] w-9 h-9 rounded-full flex items-center justify-center shadow-lg border border-red-500/20">
                        {movie.age_limit}
                    </div>

                    {/* 4. Các nút chức năng (Nổi lên trên poster khi hover - Glassmorphism style) */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        {/* Nút Xem Trailer (Kính mờ) */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setOpenTrailer(true);
                            }}
                            className="flex items-center gap-2.5 px-6 py-3 bg-black/40 text-white rounded-full backdrop-blur-lg border border-white/10 hover:bg-white hover:text-black hover:scale-105 transition-all duration-300 shadow-xl"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <span className="text-sm font-semibold tracking-wide">Xem Trailer</span>
                        </button>

                        {/* Nút Chi tiết/Mua vé nhanh (Hiện ra từ dưới) */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/movie/${movie.movie_id}`);
                            }}
                            className="mt-12 text-sm font-bold text-white/70 hover:text-white underline underline-offset-4 decoration-red-500 translate-y-4 group-hover:translate-y-0 transition-all duration-700 delay-150"
                        >
                            Xem chi tiết & Đặt vé
                        </button>
                    </div>
                </div>

                {/* 5. Khu vực Title dưới poster (Vẫn giữ để đảm bảo UI không bị trống khi không hover) */}
                <div
                    className="p-4 pt-5 text-center cursor-pointer"
                    onClick={() => navigate(`/movie/${movie.movie_id}`)}
                >
                    <h3 className="text-white font-semibold text-lg line-clamp-1 group-hover:text-red-500 transition-colors">
                        {movie.title}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1 font-medium tracking-wider uppercase">
                        {genres.slice(0, 1).join(' / ') || 'Đang cập nhật'}
                    </p>
                </div>
            </div>

            {/* 🎬 6. Modal Trailer (Nâng cấp animation & backdrop) */}
            {openTrailer && (
                <div
                    className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] backdrop-blur-sm p-4 transition-all duration-300"
                    onClick={() => setOpenTrailer(false)} // Click ra ngoài để đóng
                >
                    <div
                        className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden shadow-2xl shadow-red-500/10 border border-zinc-800 animate-zoomIn"
                        onClick={(e) => e.stopPropagation()} // Ngăn đóng khi click vào video
                    >
                        {/* Nút đóng xịn xò hơn */}
                        <button
                            onClick={() => setOpenTrailer(false)}
                            className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white/70 hover:bg-white hover:text-black hover:rotate-90 transition-all duration-300"
                        >
                            ✖
                        </button>

                        {/* Video với autoplay */}
                        <iframe
                            className="w-full h-full"
                            src={getEmbedUrl(movie.trailer_url)}
                            title={`${movie.title} - Trailer`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            )}
        </>
    );
};

export default MovieCard;
