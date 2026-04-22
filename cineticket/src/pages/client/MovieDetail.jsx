import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const MovieDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);

    const [openTrailer, setOpenTrailer] = useState(false);

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

                // ✅ FORMAT DATA
                const formatted = {
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

                    // ✅ FIX ACTORS
                    actors: found.actors
                        ? typeof found.actors === 'string'
                            ? found.actors.split(',')
                            : found.actors
                        : [],

                    // ✅ FIX GENRE
                    genre: Array.isArray(found.genres) ? found.genres.map((g) => g.genre_name) : []
                };

                setMovie(formatted);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchMovie();
    }, [id]);

    // ================= UTILS =================
    const getEmbedUrl = (url) => {
        if (!url) return '';
        return url.replace('watch?v=', 'embed/') + '?autoplay=1';
    };

    // ================= LOADING =================
    if (loading) {
        return <div className="text-white text-center py-20">Đang tải...</div>;
    }

    if (!movie) {
        return <div className="text-white text-center py-20">Không tìm thấy phim</div>;
    }

    return (
        <div className="bg-zinc-950 text-white">
            {/* Banner */}
            <div className="relative h-[400px] md:h-[500px]">
                <img
                    src={movie.backdrop_url}
                    className="w-full h-full object-cover"
                    alt={movie.title}
                />

                <div className="absolute inset-0 bg-black/50"></div>

                {movie.trailer_url && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <button
                            onClick={() => setOpenTrailer(true)}
                            className="w-20 h-20 bg-red-600 rounded-full"
                        >
                            ▶
                        </button>
                    </div>
                )}
            </div>

            {/* INFO */}
            <div className="max-w-6xl mx-auto px-6 py-12 flex gap-10">
                <img src={movie.poster_url} className="w-[260px] rounded-xl" />

                <div>
                    <h1 className="text-3xl font-bold mb-4">
                        {movie.title} ({movie.age_limit})
                    </h1>

                    <div className="grid grid-cols-2 gap-4 text-sm text-zinc-300">
                        <p>⏱️ {movie.duration} phút</p>
                        <p>📅 {movie.release_date}</p>
                        <p>⭐ {movie.rating}</p>
                        <p>🌍 {movie.country}</p>
                        <p>🎬 {movie.genre.join(', ')}</p>
                        <p>🎥 {movie.director}</p>
                        <p className="col-span-2">🎭 {movie.actors.join(', ')}</p>
                    </div>
                </div>
            </div>

            {/* DESCRIPTION */}
            <div className="max-w-6xl mx-auto px-6 pb-12">
                <h2 className="text-xl font-bold mb-4">Nội dung phim</h2>
                <p className="text-zinc-300">{movie.description}</p>
            </div>

            {/* TRAILER MODAL */}
            {openTrailer && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center">
                    <div className="relative w-[800px]">
                        <button
                            onClick={() => setOpenTrailer(false)}
                            className="absolute -top-10 right-0 text-white text-2xl"
                        >
                            ✕
                        </button>

                        <iframe
                            className="w-full h-[450px]"
                            src={getEmbedUrl(movie.trailer_url)}
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MovieDetail;
