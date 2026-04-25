// src/layouts/MainLayout.jsx
import Header from '../components/Header';
import Footer from '../components/Footer';
import { CinemaProvider } from '../components/CinemaContext';

const MainLayout = ({ children }) => {
    return (
        <div className="bg-zinc-950 text-white min-h-screen flex flex-col">
            <CinemaProvider>
                <Header />
                <main className="flex-grow">{children}</main>
                <Footer />
            </CinemaProvider>
        </div>
    );
};

export default MainLayout;
