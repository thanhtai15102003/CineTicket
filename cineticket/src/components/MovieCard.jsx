import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';

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

    // ================== LOGIC ĐỘ TUỔI ==================
    const getAgeLimitUI = (age) => {
        // Nếu admin không nhập, nhập 0, hoặc nhập chữ P -> Phổ biến
        if (!age || age === '0' || age === 0 || String(age).toUpperCase() === 'P') {
            return {
                label: 'P',
                bgColor: 'bg-green-500',
                shadow: 'shadow-[0_0_12px_rgba(34,197,94,0.6)]'
            };
        }

        // Lọc lấy số từ chuỗi (ví dụ "C18", "18+" sẽ thành 18)
        const numAge = parseInt(String(age).replace(/\D/g, ''), 10);

        if (isNaN(numAge) || numAge === 0) {
            return {
                label: 'P',
                bgColor: 'bg-green-500',
                shadow: 'shadow-[0_0_12px_rgba(34,197,94,0.6)]'
            };
        } else if (numAge >= 18) {
            return {
                label: '18+',
                bgColor: 'bg-red-600',
                shadow: 'shadow-[0_0_12px_rgba(220,38,38,0.6)]'
            };
        } else if (numAge >= 16) {
            return {
                label: '16+',
                bgColor: 'bg-orange-500',
                shadow: 'shadow-[0_0_12px_rgba(249,115,22,0.6)]'
            };
        } else if (numAge >= 13) {
            return {
                label: '13+',
                bgColor: 'bg-blue-600',
                shadow: 'shadow-[0_0_12px_rgba(37,99,235,0.6)]'
            };
        } else {
            // Trường hợp ngoại lệ khác (ví dụ nhập 10 tuổi)
            return {
                label: `${numAge}+`,
                bgColor: 'bg-teal-500',
                shadow: 'shadow-[0_0_12px_rgba(20,184,166,0.6)]'
            };
        }
    };

    const ageStyle = getAgeLimitUI(movie.age_limit);

    return (
        <>
            {/* Container chính */}
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

                    {/* 3. Age Limit Tag (Bo tròn, đổi màu động theo độ tuổi) */}
                    <div
                        className={`absolute top-3 right-3 z-20 flex items-center justify-center w-9 h-9 rounded-full text-white text-[12px] font-black tracking-wider border-2 border-zinc-950/40 backdrop-blur-md transition-colors ${ageStyle.bgColor} ${ageStyle.shadow}`}
                    >
                        {ageStyle.label}
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

                {/* 5. Khu vực Title dưới poster */}
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

            {/* 🎬 6. Modal Trailer ĐÃ ĐƯỢC DÙNG PORTAL ĐỂ PHÓNG TO TOÀN MÀN HÌNH */}
            {openTrailer &&
                createPortal(
                    <div
                        className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[100] p-4 transition-all duration-300"
                        onClick={() => setOpenTrailer(false)}
                    >
                        <div
                            className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.3)] border border-zinc-800 animate-zoomIn"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setOpenTrailer(false)}
                                className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors border border-white/10"
                            >
                                ✕
                            </button>

                            <iframe
                                className="w-full h-full"
                                src={getEmbedUrl(movie.trailer_url)}
                                title={`${movie.title} - Trailer`}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    </div>,
                    document.body // <-- DỊCH CHUYỂN MODAL RA THẲNG BODY
                )}
        </>
    );
};

export default MovieCard;
