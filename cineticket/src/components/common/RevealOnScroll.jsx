// src/components/common/RevealOnScroll.jsx
import { useState, useEffect, useRef } from 'react';

const RevealOnScroll = ({ children, delay = 0, className = '' }) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    // Chỉ hiện 1 lần, hiện xong thì hủy theo dõi để tối ưu hiệu năng
                    observer.unobserve(entry.target);
                }
            },
            {
                threshold: 0.1, // Kích hoạt khi cuộn tới 10% chiều cao phần tử
                rootMargin: '0px 0px -50px 0px' // Kích hoạt sớm một chút trước khi cuộn tới hẳn
            }
        );

        if (ref.current) observer.observe(ref.current);

        return () => {
            if (ref.current) observer.disconnect();
        };
    }, []);

    return (
        <div
            ref={ref}
            className={`transition-all duration-[800ms] ease-out ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            } ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
};

export default RevealOnScroll;
