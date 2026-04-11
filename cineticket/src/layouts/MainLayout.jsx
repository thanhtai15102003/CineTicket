import Header from "../components/Header";
import Hero from "../components/Hero";
const MainLayout = ({ children }) => {
  return (
    <div className="bg-black text-white min-h-screen">
      <Header/>
      <Hero />
      <main className="p-5">{children}</main>
    
      <footer className="p-4 border-t border-gray-700 text-center">
        © 2026 Cinema
      </footer>
    </div>
  );
};

export default MainLayout;