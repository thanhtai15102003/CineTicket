import { useLocation } from 'react-router-dom';

const BookingProgress = () => {
    const location = useLocation();

    const getCurrentStep = () => {
        if (location.pathname.includes('/booking/')) return 2;
        if (location.pathname.includes('/food/')) return 3;
        if (location.pathname.includes('/payment/')) return 4;
        if (location.pathname.includes('/confirmation/')) return 5;
        return 2;
    };

    const currentStep = getCurrentStep();

    const steps = [
        { id: 1, label: 'Chọn phim / Rạp / Suất' },
        { id: 2, label: 'Chọn ghế' },
        { id: 3, label: 'Chọn thức ăn' },
        { id: 4, label: 'Thanh toán' },
        { id: 5, label: 'Xác nhận' }
    ];

    return (
        <div className="mb-12 pt-6">
            <div className="flex justify-center">
                <div className="bg-zinc-900 rounded-full px-10 py-4 inline-flex items-center border border-zinc-800 shadow-xl">
                    {steps.map((step, index) => {
                        const isActive = step.id === currentStep;
                        const isCompleted = step.id < currentStep;

                        return (
                            <div key={step.id} className="flex items-center">
                                {/* Text step */}
                                <div className="relative">
                                    <div
                                        className={`px-6 py-2 text-sm font-medium transition-all whitespace-nowrap ${
                                            isActive
                                                ? 'text-red-500'
                                                : isCompleted
                                                  ? 'text-zinc-300'
                                                  : 'text-zinc-400'
                                        }`}
                                    >
                                        {step.label}
                                    </div>

                                    {/* Thanh gạch đỏ dưới bước active */}
                                    {isActive && (
                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-[3px] bg-red-600 rounded-full" />
                                    )}
                                </div>

                                {/* Đường phân cách (trừ bước cuối) */}
                                {index < steps.length - 1 && (
                                    <div className="w-8 h-[1px] bg-zinc-700 mx-2" />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default BookingProgress;
