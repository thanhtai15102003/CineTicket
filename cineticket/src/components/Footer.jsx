const Footer = () => {
    return (
        <footer className="bg-zinc-950 border-t border-zinc-800 mt-10">
            <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
                {/* Logo + mô tả */}
                <div>
                    <h2 className="text-red-500 text-2xl font-bold tracking-tighter mb-4">
                        CineTicket
                    </h2>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                        Đặt vé xem phim nhanh chóng, tiện lợi. Trải nghiệm điện ảnh đỉnh cao ngay
                        hôm nay.
                    </p>
                </div>

                {/* Menu */}
                <div>
                    <h3 className="text-white font-semibold mb-4">Danh mục</h3>
                    <ul className="space-y-2 text-zinc-400 text-sm">
                        <li className="hover:text-red-500 cursor-pointer">Phim</li>
                        <li className="hover:text-red-500 cursor-pointer">Rạp</li>
                        <li className="hover:text-red-500 cursor-pointer">Giá vé</li>
                        <li className="hover:text-red-500 cursor-pointer">Tin tức</li>
                    </ul>
                </div>

                {/* Hỗ trợ */}
                <div>
                    <h3 className="text-white font-semibold mb-4">Hỗ trợ</h3>
                    <ul className="space-y-2 text-zinc-400 text-sm">
                        <li className="hover:text-red-500 cursor-pointer">Liên hệ</li>
                        <li className="hover:text-red-500 cursor-pointer">FAQ</li>
                        <li className="hover:text-red-500 cursor-pointer">Điều khoản</li>
                        <li className="hover:text-red-500 cursor-pointer">Chính sách</li>
                    </ul>
                </div>

                {/* Liên hệ */}
                <div>
                    <h3 className="text-white font-semibold mb-4">Liên hệ</h3>
                    <ul className="space-y-2 text-zinc-400 text-sm">
                        <li>📍 TP.HCM, Việt Nam</li>
                        <li>📞 0123 456 789</li>
                        <li>✉️ support@cineticket.vn</li>
                    </ul>

                    {/* Social */}
                    <div className="flex gap-3 mt-4">
                        <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center hover:bg-red-500 cursor-pointer transition">
                            f
                        </div>
                        <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center hover:bg-red-500 cursor-pointer transition">
                            in
                        </div>
                        <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center hover:bg-red-500 cursor-pointer transition">
                            yt
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom */}
            <div className="border-t border-zinc-800 py-6 text-center text-zinc-500 text-sm">
                © 2026 CineTicket. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;
