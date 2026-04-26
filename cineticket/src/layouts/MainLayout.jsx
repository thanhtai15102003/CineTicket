// src/layouts/MainLayout.jsx
import Header from '../components/Header';
import Footer from '../components/Footer';
import { CinemaProvider } from '../components/CinemaContext';
import ScrollToTop from '../components/common/ScrollToTop';

const MainLayout = ({ children }) => {
    return (
        <div className="bg-zinc-950 text-white min-h-screen flex flex-col">
            <CinemaProvider>
                <ScrollToTop />
                <Header />
                <main className="flex-grow">{children}</main>
                <Footer />
            </CinemaProvider>
        </div>
    );
};

export default MainLayout;
