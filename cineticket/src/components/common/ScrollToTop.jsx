import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // Cuộn mượt mà lên đầu trang mỗi khi đường dẫn (pathname) thay đổi
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth' // 'auto' nếu muốn nó giật lên ngay lập tức
        });
    }, [pathname]);

    return null; // Component này vô hình, không render ra HTML
};

export default ScrollToTop;
