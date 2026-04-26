// src/pages/Movies.jsx
import { useState, useEffect } from 'react';
import MovieSection from '../../components/MovieSection';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Movies = () => {
    const [isLoading, setIsLoading] = useState(true);

    // Giả lập loading khi chuyển từ trang chủ sang trang Phim
    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 700); // loading khoảng 0.7 giây

        return () => clearTimeout(timer);
    }, []);

    // Đã căn giữa toàn bộ màn hình và thiết lập nền đen cho phần loading
    if (isLoading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center pt-20">
                <LoadingSpinner isDark={true} />
            </div>
        );
    }

    return (
        <div className="pt-8">
            <MovieSection showAll={true} isHome={false} />
        </div>
    );
};

export default Movies;
