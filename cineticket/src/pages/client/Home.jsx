// src/pages/Home.jsx
import { useState } from 'react';
import Hero from '../../components/Hero';
import MovieSection from '../../components/MovieSection';

const Home = () => {
    const [showAll, setShowAll] = useState(false);

    const handleShowAll = () => {
        setShowAll(true);
        window.scrollTo({ top: 500, behavior: 'smooth' });
    };

    return (
        <>
            <Hero />
            <MovieSection showAll={showAll} onShowAll={handleShowAll} isHome={true} />
        </>
    );
};

export default Home;
