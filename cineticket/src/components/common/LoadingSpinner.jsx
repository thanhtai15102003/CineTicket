import { Clapperboard } from 'lucide-react';

// Thêm prop isDark, mặc định là false (dùng cho Admin)
const LoadingSpinner = ({ isDark = false }) => {
    return (
        <div
            className={`flex flex-col justify-center items-center py-24 relative w-full overflow-hidden rounded-xl ${isDark ? 'bg-transparent' : 'bg-white/50'}`}
        >
            {/* Hào quang đỏ mờ ảo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-red-500/10 blur-[40px] rounded-full animate-pulse"></div>

            {/* Vòng cuộn phim xoay (Cinematic Spinner) */}
            <div className="relative flex items-center justify-center z-10">
                {/* Vòng ngoài xoay thuận - Đổi màu viền dựa theo Theme */}
                <div
                    className={`w-16 h-16 border-[3px] border-t-red-600 border-b-red-600 rounded-full animate-spin shadow-[0_0_20px_rgba(220,38,38,0.2)] ${isDark ? 'border-zinc-800' : 'border-gray-100'}`}
                ></div>

                {/* Vòng trong xoay ngược */}
                <div
                    className={`absolute w-10 h-10 border-[3px] border-l-red-500 border-r-red-500 rounded-full animate-[spin_1.5s_reverse_infinite] ${isDark ? 'border-zinc-800' : 'border-gray-100'}`}
                ></div>

                {/* Icon máy quay ở giữa */}
                <div className="absolute text-red-600 animate-pulse">
                    <Clapperboard size={20} strokeWidth={2.5} />
                </div>
            </div>

            {/* Text loading */}
            <div className="relative z-10 mt-6 flex flex-col items-center">
                <p className="text-xs font-black text-red-600 uppercase tracking-[0.3em] drop-shadow-sm animate-pulse">
                    Đang tải dữ liệu
                </p>
                <div className="flex gap-1.5 mt-2.5">
                    <span
                        className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce"
                        style={{ animationDelay: '0s' }}
                    ></span>
                    <span
                        className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                    ></span>
                    <span
                        className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce"
                        style={{ animationDelay: '0.4s' }}
                    ></span>
                </div>
            </div>
        </div>
    );
};

export default LoadingSpinner;
