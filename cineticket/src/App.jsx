import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Movies from './pages/client/Movies';
import MovieDetail from './pages/client/MovieDetail';
import Booking from './pages/client/Booking';
import Login from './pages/client/Login';

import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/DashBoard';
import Users from './pages/admin/User';

import Home from './pages/client/Home';

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
            </Routes>
        </Router>
    );
}

export default App;
