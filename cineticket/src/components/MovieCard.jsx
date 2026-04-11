import { Ticket, Clock, Calendar } from 'lucide-react';

const MovieCard = ({ movie }) => {
    return (
        <div className="group relative bg-zinc-900 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            {/* Poster */}
            <div className="relative">
                <img 
                    src={movie.poster_url} 
                    alt={movie.title}
                    className="w-full h-[380px] object-cover transition-transform duration-300 group-hover:scale-105"
                />
                
                {/* Age Limit */}
                <div className="absolute top-4 right-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-md">
                    {movie.age_limit}
                </div>

                {/* Duration */}
                <div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs px-3 py-1 rounded flex items-center gap-1">
                    <Clock size={14} />
                    {movie.duration} phút
                </div>
            </div>

            {/* Thông tin */}
            <div className="p-5">
                <h3 className="font-bold text-lg text-white line-clamp-2 min-h-[56px] group-hover:text-red-500 transition-colors">
                    {movie.title}
                </h3>

                <div className="flex items-center gap-2 text-sm text-zinc-400 mt-2">
                    <Calendar size={16} />
                    <span>{new Date(movie.release_date).getFullYear()}</span>
                    <span className="mx-2">•</span>
                    <span>{movie.language}</span>
                </div>

                {/* Nút hành động */}
                <div className="flex gap-3 mt-6">
                    <button className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2">
                        <Ticket size={18} />
                        Mua vé
                    </button>
                    
                    <button className="flex-1 border border-zinc-700 hover:border-zinc-500 text-white font-medium py-3.5 rounded-xl transition-all">
                        Chi tiết
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MovieCard;