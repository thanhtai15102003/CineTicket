import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
    {/*------------Clinet--------------- */}
import MainLayout from './layouts/MainLayout';
import Home from './pages/client/Home';
import Movies from './pages/client/Movies';
import MovieDetail from './pages/client/MovieDetail';
import Booking from './pages/client/Booking';
import Login from './pages/client/Login';
import ComboPage from './pages/client/ComboPage';
import Profile from './pages/client/Profile';
import PaymentPage from './pages/client/PaymentPage';

    {/*------------Admin--------------- */}
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Admin/DashBoard';
import Users from './pages/admin/Admin/User';
import Areas from './pages/admin/Admin/Areas';
import Cinemas from './pages/admin/Admin/Cinemas';
import MoviesAdmin from './pages/admin/Admin/Movie';
import Combo from './pages/admin/Admin/AdminCombo';


    {/*----------------Manager---------------*/}
import SeatLayoutManagement from './pages/admin/Manager/SeatLayoutManagement';
import SeatLayoutEditor from './pages/admin/Manager/Modal_Create_Manager/SeatLayoutEditor';
import ShowtimeManagement from './pages/admin/Manager/ShowtimeManagement';
import CreateShowtime from './pages/admin/Manager/Modal_Create_Manager/CreateShowtime';
import Rooms from './pages/admin/Manager/Rooms';
import SeatLayout from './pages/admin/Manager/SeatLayout';
import ManagerCombo from './pages/admin/Manager/ManagerCombo';


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
                {/* Trang profile */}
                <Route
                    path="/profile"
                    element={
                        <MainLayout>
                            <Profile />
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
                {/* Trang chọn combo */}
                <Route
                    path="/combo/:showtimeId"
                    element={
                        <MainLayout>
                            <ComboPage />
                        </MainLayout>
                    }
                />

                {/* Trang thanh toán */}
                <Route
                    path="/payment/:showtimeId"
                    element={
                        <MainLayout>
                            <PaymentPage />
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

                {/* --------------------- Trang admin dashboard -------------------------- */}
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
                {/* Trang quản lý combo */}
                <Route
                    path="/admin/combo"
                    element={
                        <AdminLayout>
                            <Combo />
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
                {/*--------------------------- Trang quản lý của Manager chi nhánh------------------------ */}
                {/* Quản lý phòng */}
                <Route
                    path="/admin/rooms"
                    element={
                        <AdminLayout>
                            <Rooms />
                        </AdminLayout>
                    }
                />
                {/* Quản lý sơ đồ ghế */}
                <Route
                    path="/admin/seat-layout/:id"
                    element={
                        <AdminLayout>
                            <SeatLayout />
                        </AdminLayout>
                    }
                />
                <Route
                    path="/admin/seat-layout"
                    element={
                        <AdminLayout>
                            <SeatLayoutManagement />
                        </AdminLayout>
                    }
                />
                <Route
                    path="/admin/seat-layout/:id/edit"
                    element={
                        <AdminLayout>
                            <SeatLayoutEditor />
                        </AdminLayout>
                    }
                />

                <Route
                    path="/admin/seat-layout/create"
                    element={
                        <AdminLayout>
                            <SeatLayoutEditor />
                        </AdminLayout>
                    }
                />

                {/* Trang quản lý suất chiếu */}
                <Route
                    path="/admin/showtimes"
                    element={
                        <AdminLayout>
                            <ShowtimeManagement />
                        </AdminLayout>
                    }
                />
                {/* Trang tạo suất chiếu */}
                <Route
                    path="/admin/showtimes/create"
                    element={
                        <AdminLayout>
                            <CreateShowtime />
                        </AdminLayout>
                    }
                />
                {/* Trang quản lý Combo */}
                <Route
                    path="/manager/combo"
                    element={
                        <AdminLayout>
                            <ManagerCombo />
                        </AdminLayout>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;
