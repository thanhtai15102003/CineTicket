import { useState, useEffect } from 'react';

const Hero = () => {
    const featuredMovies = [
        {
            id: 1,
            title: 'ĐỨC PHẬT',
            subtitle: 'Hành Trình Giác Ngộ',
            description:
                'Câu chuyện cảm động về hành trình vĩ đại của Tất Đạt Đa Cồ Đàm từ một vị thái tử rũ bỏ nhung lụa để đi tìm chân lý, cho đến khi trở thành Đức Phật Thích Ca Mâu Ni.',
            image: 'https://picsum.photos/id/1015/1920/1080',
            rating: '8.9',
            genre: 'Tâm Linh • Sử Thi',
            age: 'P'
        },
        {
            id: 2,
            title: 'AVENGERS',
            subtitle: 'Doomsday',
            description:
                'Những anh hùng vĩ đại nhất Trái Đất phải tập hợp lại một lần nữa để đối mặt với Doctor Doom - một mối đe dọa có khả năng bẻ cong cả thực tại và đa vũ trụ.',
            image: 'https://picsum.photos/id/870/1920/1080',
            rating: '9.2',
            genre: 'Hành Động • Viễn Tưởng',
            age: 'C13'
        },
        {
            id: 3,
            title: 'MẬT NGỮ',
            subtitle: 'Bí Ẩn Tử Thần',
            description:
                'Trò chơi chết chóc bắt đầu khi những bí mật đen tối dần được hé lộ. Một nhóm người bị mắc kẹt phải giải mã các ký tự cổ xưa để tìm đường sống sót.',
            image: 'https://picsum.photos/id/201/1920/1080',
            rating: '7.8',
            genre: 'Kinh Dị • Tâm Lý',
            age: 'C18'
        }
    ];

    const [currentSlide, setCurrentSlide] = useState(0);

    // Xử lý tự động chuyển slide
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % featuredMovies.length);
        }, 6000); // Tăng lên 6s để người dùng kịp đọc và ngắm hiệu ứng zoom

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative w-full h-[85vh] min-h-[600px] max-h-[800px] bg-zinc-950 overflow-hidden">
            {/* ================= RENDER CÁC SLIDES ================= */}
            {featuredMovies.map((movie, index) => {
                const isActive = index === currentSlide;

                return (
                    <div
                        key={movie.id}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                            isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
                        }`}
                    >
                        {/* 1. Background Image với hiệu ứng Zoom chậm (Ken Burns effect) */}
                        <div
                            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[6000ms] ease-linear ${
                                isActive ? 'scale-105' : 'scale-100'
                            }`}
                            style={{ backgroundImage: `url(${movie.image})` }}
                        />

                        {/* 2. Lớp phủ Gradient (Tạo độ sâu & Hòa trộn vào background trang web) */}
                        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/70 to-transparent opacity-90"></div>
                        {/* Gradient dưới đáy để hòa mượt vào MovieSection bên dưới */}
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent"></div>

                        {/* 3. Nội dung chính */}
                        <div className="absolute inset-0 flex items-center">
                            <div className="max-w-7xl mx-auto px-6 w-full mt-10 md:mt-20">
                                {/* Bọc nội dung trong 1 thẻ để làm animation trượt lên khi đổi slide */}
                                <div
                                    className={`max-w-2xl transform transition-all duration-1000 delay-300 ${
                                        isActive
                                            ? 'translate-y-0 opacity-100'
                                            : 'translate-y-10 opacity-0'
                                    }`}
                                >
                                    {/* Các thẻ Tag (Glassmorphism) */}
                                    <div className="flex flex-wrap items-center gap-3 mb-6">
                                        <div className="px-3 py-1 bg-red-600/90 backdrop-blur-md text-white text-[11px] font-black tracking-widest rounded shadow-[0_0_15px_rgba(220,38,38,0.5)] border border-red-500/50">
                                            {movie.age}
                                        </div>
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md text-white text-xs font-bold tracking-wider rounded-full border border-white/10">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                                className="w-4 h-4 text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.8)]"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            {movie.rating}
                                        </div>
                                        <div className="px-4 py-1 bg-white/10 backdrop-blur-md text-zinc-300 text-xs font-semibold tracking-wider rounded-full border border-white/10">
                                            {movie.genre}
                                        </div>
                                    </div>

                                    {/* Tiêu đề Phim */}
                                    <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] tracking-tighter mb-2 drop-shadow-2xl uppercase">
                                        {movie.title}
                                    </h1>
                                    <h2 className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-400 tracking-wide mb-6 drop-shadow-lg">
                                        {movie.subtitle}
                                    </h2>

                                    {/* Mô tả */}
                                    <p className="text-zinc-300 text-base md:text-lg leading-relaxed mb-10 line-clamp-3 md:line-clamp-4 font-medium max-w-xl text-shadow-sm">
                                        {movie.description}
                                    </p>

                                    {/* Các nút hành động */}
                                    <div className="flex flex-wrap items-center gap-5">
                                        <button className="group relative inline-flex items-center justify-center px-8 py-3.5 text-sm font-bold tracking-widest text-white uppercase rounded-full bg-gradient-to-r from-red-600 to-red-800 overflow-hidden shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(220,38,38,0.6)]">
                                            <span className="relative z-10 flex items-center gap-2">
                                                Mua vé ngay
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </span>
                                            <div className="absolute inset-0 bg-white/20 scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></div>
                                        </button>

                                        <button className="px-8 py-3.5 text-sm font-bold tracking-widest text-white uppercase rounded-full bg-white/10 backdrop-blur-md border border-white/20 transition-all duration-300 hover:bg-white hover:text-black hover:scale-105 shadow-xl">
                                            Xem Trailer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* ================= ĐIỀU HƯỚNG SLIDE (Sleek Lines) ================= */}
            <div className="absolute bottom-10 left-6 md:left-auto md:right-10 z-20 flex gap-3">
                {featuredMovies.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`relative h-1.5 rounded-full overflow-hidden transition-all duration-500 cursor-pointer ${
                            index === currentSlide
                                ? 'w-12 bg-white/20'
                                : 'w-4 bg-white/30 hover:bg-white/50'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                    >
                        {/* Thanh tiến trình chạy trong 6s khi slide đang active */}
                        {index === currentSlide && (
                            <div
                                className="absolute top-0 left-0 h-full bg-red-600 rounded-full"
                                style={{
                                    animation: 'progress 6s linear infinite'
                                }}
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Cần thêm chút keyframe cho thanh progress bar chạy */}
            <style jsx>{`
                @keyframes progress {
                    0% {
                        width: 0%;
                    }
                    100% {
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
};

export default Hero;
