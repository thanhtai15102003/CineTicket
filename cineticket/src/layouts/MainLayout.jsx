// src/layouts/MainLayout.jsx
import Header from '../components/Header';
import Footer from '../components/Footer';

const MainLayout = ({ children }) => {
    return (
        <div className="bg-zinc-950 text-white min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    );
};

export default MainLayout;
