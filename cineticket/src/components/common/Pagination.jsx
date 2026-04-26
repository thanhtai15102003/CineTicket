// components/common/Pagination.jsx
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    // Nếu chỉ có 1 trang hoặc không có trang nào thì ẩn luôn thanh phân trang
    if (!totalPages || totalPages <= 1) return null;

    // Thuật toán tạo danh sách trang thông minh (có dấu ...)
    const getPageNumbers = () => {
        const pages = [];

        if (totalPages <= 7) {
            // Nếu có ít hơn 7 trang: Hiển thị toàn bộ
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Nếu đang ở những trang đầu (1, 2, 3, 4)
            if (currentPage <= 4) {
                pages.push(1, 2, 3, 4, 5, '...', totalPages);
            }
            // Nếu đang ở những trang cuối (ví dụ total = 20, current = 17, 18, 19, 20)
            else if (currentPage >= totalPages - 3) {
                pages.push(
                    1,
                    '...',
                    totalPages - 4,
                    totalPages - 3,
                    totalPages - 2,
                    totalPages - 1,
                    totalPages
                );
            }
            // Nếu đang ở giữa (ví dụ total = 20, current = 10)
            else {
                pages.push(
                    1,
                    '...',
                    currentPage - 1,
                    currentPage,
                    currentPage + 1,
                    '...',
                    totalPages
                );
            }
        }
        return pages;
    };

    return (
        <div className="flex items-center justify-center gap-1.5 mt-6">
            {/* Nút Previous */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-500 transition-all hover:bg-gray-50 hover:text-gray-800 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200"
                title="Trang trước"
            >
                <ChevronLeft size={18} />
            </button>

            {/* Danh sách các số trang */}
            {getPageNumbers().map((page, index) => {
                if (page === '...') {
                    return (
                        <span
                            key={`ellipsis-${index}`}
                            className="flex items-center justify-center w-9 h-9 text-gray-400 font-medium select-none"
                        >
                            ...
                        </span>
                    );
                }

                const isActive = currentPage === page;

                return (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`flex items-center justify-center w-9 h-9 rounded-lg text-sm font-semibold transition-all duration-200 ${
                            isActive
                                ? 'bg-red-600 text-white shadow-md shadow-red-500/30 border-transparent scale-105'
                                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-red-600 hover:border-red-200'
                        }`}
                    >
                        {page}
                    </button>
                );
            })}

            {/* Nút Next */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-500 transition-all hover:bg-gray-50 hover:text-gray-800 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200"
                title="Trang sau"
            >
                <ChevronRight size={18} />
            </button>
        </div>
    );
};

export default Pagination;
