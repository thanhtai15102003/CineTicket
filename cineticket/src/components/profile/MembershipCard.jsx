// src/components/profile/MembershipCard.jsx
import Barcode from 'react-barcode';

const MembershipCard = ({ userData, memberCode, formatDate }) => {
    return (
        <div className="w-full max-w-sm mx-auto lg:mx-0">
            <div className="relative aspect-[1/1.4] sm:aspect-[1.586/1] lg:aspect-[1/1.4] rounded-2xl overflow-hidden shadow-2xl group cursor-pointer transition-transform duration-500 hover:-translate-y-2 flex flex-col">
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 via-zinc-900 to-black border border-white/10 rounded-2xl"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-red-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                <div className="relative p-6 flex flex-col justify-between flex-1">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center -skew-x-6 shadow-[0_0_10px_rgba(220,38,38,0.5)]">
                                <span className="text-white font-black text-xs italic">CT</span>
                            </div>
                            <span className="text-white font-black text-sm tracking-widest">
                                CINETICKET
                            </span>
                        </div>
                        <div className="px-3 py-1 bg-gradient-to-r from-amber-200 to-yellow-500 text-black text-[10px] font-black uppercase tracking-widest rounded-full shadow-[0_0_15px_rgba(252,211,77,0.4)]">
                            {userData?.role?.role_name || 'Member'}
                        </div>
                    </div>

                    <div className="mb-4">
                        <p className="text-zinc-400 text-[10px] font-medium uppercase tracking-widest mb-1">
                            Thành viên
                        </p>
                        <p className="text-white font-bold text-xl uppercase tracking-wide truncate drop-shadow-sm">
                            {userData?.full_name || 'THÀNH VIÊN MỚI'}
                        </p>
                    </div>

                    <div className="mt-auto bg-white p-3 rounded-xl flex flex-col items-center justify-center shadow-inner">
                        <Barcode
                            value={memberCode}
                            width={1.8}
                            height={45}
                            displayValue={true}
                            background="#ffffff"
                            lineColor="#000000"
                            fontSize={14}
                            margin={0}
                        />
                    </div>
                </div>
            </div>
            <div className="text-center mt-4">
                <p className="text-sm text-zinc-500">
                    Tham gia từ: {formatDate(userData?.created_at || new Date())}
                </p>
            </div>
        </div>
    );
};

export default MembershipCard;
