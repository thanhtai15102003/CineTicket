// src/components/Toast.jsx
import { useEffect } from 'react';

const Toast = ({ message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000); // Tự động đóng sau 3 giây

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed top-6 right-6 bg-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50 animate-slide-in">
            <span className="text-2xl">🎉</span>
            <span className="font-medium pr-4">{message}</span>
            <button
                onClick={onClose}
                className="ml-auto text-white hover:text-gray-200 text-xl leading-none"
            >
                ×
            </button>
        </div>
    );
};

export default Toast;
