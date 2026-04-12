// src/pages/Movies.jsx
import { useState, useEffect } from 'react';
import MovieSection from '../components/MovieSection';
import LoadingSpinner from '../components/common/LoadingSpinner';

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

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="pt-8">
            <MovieSection showAll={true} isHome={false} />
        </div>
    );
};

export default Movies;
