import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/client/Home';
import Movies from './pages/client/Movies';
import MovieDetail from './pages/client/MovieDetail';
import Booking from './pages/client/Booking';
import Login from './pages/client/Login';

import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/DashBoard';
import Users from './pages/admin/User';
import Areas from './pages/admin/Areas';
import Cinemas from './pages/admin/Cinemas';
import MoviesAdmin from './pages/admin/Movie';



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
                {/* Trang booking vé */}
                <Route
                    path="/booking/:showtimeId"
                    element={
                        <MainLayout>
                            <Booking />
                        </MainLayout>
                    }
                />
                <Route
                    path="/login"
                    element={
                        <MainLayout>
                            <Login />
                        </MainLayout>
                    }
                />

                {/* Trang admin dashboard */}
                <Route
                    path="/dashboard"
                    element={
                        <AdminLayout>
                            <Dashboard />
                        </AdminLayout>
                    }
                />
                {/* Trang quản lý người dùng */}
                <Route
                    path="/admin/users"
                    element={
                        <AdminLayout>
                            <Users />
                        </AdminLayout>
                    }
                />
                {/* Trang quản lý rạp */}
                <Route
                    path="/admin/areas"
                    element={
                        <AdminLayout>
                            <Areas />
                        </AdminLayout>
                    }
                />

                <Route
                    path="/admin/cinemas"
                    element={
                        <AdminLayout>
                           <Cinemas />
                        </AdminLayout>
                    }
                />

                {/* Trang quản lý phim */}
                <Route
                    path="/admin/movies"
                    element={
                        <AdminLayout>
                            <MoviesAdmin />
                        </AdminLayout>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;
