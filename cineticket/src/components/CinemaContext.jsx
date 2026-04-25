import { createContext, useState, useContext, useEffect } from 'react';

const CinemaContext = createContext();

export const CinemaProvider = ({ children }) => {
    // State chứa thông tin rạp đang chọn
    const [selectedCinema, setSelectedCinema] = useState(() => {
        const saved = localStorage.getItem('selectedCinema');
        return saved ? JSON.parse(saved) : null;
    });

    // Hàm cập nhật rạp
    const changeCinema = (cinema) => {
        setSelectedCinema(cinema);
        localStorage.setItem('selectedCinema', JSON.stringify(cinema));
    };

    return (
        <CinemaContext.Provider value={{ selectedCinema, changeCinema }}>
            {children}
        </CinemaContext.Provider>
    );
};

export const useCinema = () => useContext(CinemaContext);
