import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MovieCard = ({ movie }) => {
    const [openTrailer, setOpenTrailer] = useState(false);
    const navigate = useNavigate();
    // Hàm convert link youtube → embed
    const getEmbedUrl = (url) => {
        return url.replace('watch?v=', 'embed/');
    };

    return (
        <>
            <div className="group cursor-pointer"
                onClick={() => navigate(`/movie/${movie.movie_id}`)}
            >
                {/* Poster */}
                <div className="relative overflow-hidden rounded-2xl">
                    <img
                        src={movie.poster_url}
                        alt={movie.title}
                        className="w-full h-[360px] object-cover"
                    />

                    {/* Hover info */}
                    <div
                        className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black via-black/80 to-transparent 
          p-4 translate-y-full group-hover:translate-y-0 transition duration-500"
                    >
                        <h3 className="text-white font-semibold text-lg mb-2">{movie.title}</h3>

                        <div className="text-sm text-zinc-300 space-y-1">
                            <p>⏱️ {movie.duration} phút</p>
                            <p>🌍 Việt Nam</p>
                        </div>
                    </div>

                    {/* Age */}
                    <div className="absolute top-3 left-3 bg-red-600 text-white text-xs px-2 py-1 rounded">
                        {movie.age_limit}
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-4 text-center space-y-3">
                    <h3 className="text-white font-semibold text-lg line-clamp-1">{movie.title}</h3>

                    <div className="flex justify-center gap-3">
                        {/* Trailer */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setOpenTrailer(true);
                            }}
                            className="px-4 py-2 text-sm border border-zinc-700 text-zinc-300 rounded-full hover:bg-white hover:text-black transition"
                        >
                            Trailer
                        </button>

                        {/* Mua vé */}
                        <button onClick={(e) => { e.stopPropagation();  navigate(`/movie/${movie.movie_id}`)}} className="px-4 py-2 text-sm bg-red-600 text-white rounded-full hover:bg-red-700 transition">
                            Mua vé
                        </button>
                    </div>
                </div>
            </div>

            {/* 🎬 Modal Trailer */}
            {openTrailer && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="relative w-[90%] md:w-[800px]">
                        {/* Nút đóng */}
                        <button
                            onClick={() => setOpenTrailer(false)}
                            className="absolute -top-10 right-0 text-white text-2xl"
                        >
                            ✖
                        </button>

                        {/* Video */}
                        <iframe
                            className="w-full h-[300px] md:h-[450px] rounded-xl"
                            src={getEmbedUrl(movie.trailer_url)}
                            title="Trailer"
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            )}
        </>
    );
};

export default MovieCard;
