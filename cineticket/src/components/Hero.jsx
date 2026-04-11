import { useState, useEffect } from 'react';

const Hero = () => {
    const featuredMovies = [
        {
            id: 1,
            title: 'ĐỨC PHẬT',
            subtitle: 'Hành Trình Giác Ngộ',
            description:
                'Câu chuyện cảm động về hành trình giác ngộ của Đức Phật - bộ phim điện ảnh kinh điển 2026',
            image: 'https://picsum.photos/id/1015/1920/1080',
            rating: '8.9',
            genre: 'Tâm Linh • Sử Thi',
            age: 'P'
        },
        {
            id: 2,
            title: 'AVENGERS: DOOMSDAY',
            subtitle: 'Cuộc Chiến Cuối Cùng',
            description: 'Những anh hùng vĩ đại nhất Trái Đất đối mặt với mối đe dọa hủy diệt',
            image: 'https://picsum.photos/id/870/1920/1080',
            rating: '9.2',
            genre: 'Hành Động • Viễn Tưởng',
            age: 'C13'
        },
        {
            id: 3,
            title: 'MẬT NGỮ',
            subtitle: 'Bí Ẩn Tử Thần',
            description: 'Trò chơi chết chóc bắt đầu khi những bí mật đen tối dần được hé lộ',
            image: 'https://picsum.photos/id/201/1920/1080',
            rating: '7.8',
            genre: 'Kinh Dị • Tâm Lý',
            age: 'C18'
        }
    ];

    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % featuredMovies.length);
        }, 5000);

        return () => clearInterval(timer);
    }, []);

    const currentMovie = featuredMovies[currentSlide];

    return (
        <div className="relative h-[520px] md:h-[560px] lg:h-[580px] xl:h-[620px] w-full overflow-hidden">
            {/* Background */}
            <div
                className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
                style={{ backgroundImage: `url(${currentMovie.image})` }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/80 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/90"></div>
            </div>

            {/* Nội dung chính */}
            <div className="relative z-10 h-full flex items-center">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="max-w-lg">
                        {/* Rating */}
                        <div className="inline-flex items-center gap-2 mb-4">
                            <div className="px-4 py-1 bg-red-600 text-white text-sm font-bold rounded">
                                {currentMovie.age}
                            </div>
                            <div className="flex items-center gap-1 text-yellow-400">
                                ★{' '}
                                <span className="text-white font-semibold">
                                    {currentMovie.rating}
                                </span>
                            </div>
                        </div>

                        {/* Tiêu đề */}
                        <h1 className="text-5xl md:text-6xl font-bold text-white leading-[1.05] tracking-tighter mb-3">
                            {currentMovie.title}
                        </h1>
                        <h2 className="text-2xl md:text-3xl text-red-500 font-medium mb-6">
                            {currentMovie.subtitle}
                        </h2>

                        {/* Mô tả */}
                        <p className="text-zinc-300 text-base md:text-lg leading-relaxed mb-8 line-clamp-3">
                            {currentMovie.description}
                        </p>

                        {/* Nút hành động */}
                        <div className="flex flex-wrap gap-4">
                            <button className="bg-red-600 hover:bg-red-700 px-10 py-4 rounded-full font-semibold text-lg transition-all flex items-center gap-3">
                                MUA VÉ NGAY
                                <span>→</span>
                            </button>

                            <button className="border border-white/70 hover:border-white px-8 py-4 rounded-full font-semibold text-lg transition-all">
                                XEM TRAILER
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Slide Indicators */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
                {featuredMovies.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`transition-all duration-300 rounded-full h-2.5 ${
                            index === currentSlide
                                ? 'bg-red-600 w-10'
                                : 'bg-white/50 hover:bg-white/80 w-2.5'
                        }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default Hero;
