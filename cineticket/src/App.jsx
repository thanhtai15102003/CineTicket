import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Movies from './pages/Movies';
import MovieDetail from './pages/MovieDetail';

import Home from './pages/Home';

function App() {
    return (
        <Router>
            <Routes>
                {/* Trang chủ */}
                <Route
                    path="/"
                    element={
                        <MainLayout>
                            <Home />
                        </MainLayout>
                    }
                />
                {/* Trang danh sách phim */}
                <Route
                    path="/movies"
                    element={
                        <MainLayout>
                            <Movies />
                        </MainLayout>
                    }
                />
                {/* Trang chi tiết phim */}
                <Route
                    path="/movie/:id"
                    element={
                        <MainLayout>
                            <MovieDetail />
                        </MainLayout>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;
