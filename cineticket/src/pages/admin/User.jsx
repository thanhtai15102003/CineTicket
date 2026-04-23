import { useState, useEffect } from 'react';
import Toast from '../../components/common/Toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';

const BASE_URL = 'https://cinema-api-production-f2bc.up.railway.app/api/v1';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [cinemas, setCinemas] = useState([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        username: '',
        password_hash: '',
        full_name: '',
        email: '',
        phone: '',
        cinema_id: ''
    });

    const [successMessage, setSuccessMessage] = useState('');

    // ================== FETCH MANAGERS ==================
    const fetchManagers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const res = await fetch(`${BASE_URL}/admin/managers`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json'
                }
            });

            const data = await res.json();

            if (res.ok) {
                const mappedUsers = data.data.map((u) => ({
                    user_id: u.user_id,
                    username: u.username,
                    full_name: u.full_name,
                    email: u.email,
                    phone: u.phone,
                    status: u.status,
                    role_name: 'admin',
                    cinema_name: u.cinema?.cinema_name || 'Không có'
                }));

                setUsers(mappedUsers);
            } else {
                alert('Không lấy được danh sách manager');
            }
        } catch (err) {
            console.error(err);
            alert('Lỗi API');
        } finally {
            setLoading(false);
        }
    };

    // ================== FETCH CINEMAS ==================
    const fetchCinemas = async () => {
        try {
            const token = localStorage.getItem('token');

            const res = await fetch(`${BASE_URL}/admin/cinemas`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json'
                }
            });

            const data = await res.json();

            if (res.ok) {
                setCinemas(data.data);
            } else {
                alert('Không lấy được danh sách chi nhánh');
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchManagers();
        fetchCinemas();
    }, []);

    // reset page khi search/filter
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterRole]);

    // ================== TOGGLE STATUS ==================
    const toggleStatus = async (id, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

            const res = await fetch(`${BASE_URL}/admin/managers/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                setUsers((prev) =>
                    prev.map((u) => (u.user_id === id ? { ...u, status: newStatus } : u))
                );
            } else {
                alert('Lỗi cập nhật trạng thái');
            }
        } catch (err) {
            console.error(err);
            alert('Lỗi server');
        }
    };

    // ================== CREATE ==================
    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');

            const res = await fetch(`${BASE_URL}/admin/managers`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                },
                body: JSON.stringify({
                    username: form.username,
                    password: form.password_hash,
                    full_name: form.full_name,
                    email: form.email,
                    phone: form.phone,
                    cinema_id: form.cinema_id || null
                })
            });

            const data = await res.json();

            if (res.ok) {
                setSuccessMessage('Tạo admin thành công!');
                setForm({
                    username: '',
                    password_hash: '',
                    full_name: '',
                    email: '',
                    phone: '',
                    cinema_id: ''
                });
                fetchManagers();
            } else {
                alert(data.message || 'Lỗi tạo admin');
            }
        } catch (err) {
            console.error(err);
        }
    };

    // ================== FILTER ==================
    const filteredUsers = users.filter((user) => {
        const term = searchTerm.toLowerCase();

        return (
            (user.full_name?.toLowerCase().includes(term) ||
                user.username?.toLowerCase().includes(term) ||
                user.email?.toLowerCase().includes(term)) &&
            (filterRole === 'all' || user.role_name === filterRole)
        );
    });

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    const currentUsers = filteredUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {successMessage && (
                <Toast message={successMessage} onClose={() => setSuccessMessage('')} />
            )}

            {/* FORM */}
            <div className="bg-white p-8 rounded-2xl shadow-lg mb-10">
                <h3 className="text-2xl font-semibold mb-6">Tạo tài khoản Admin</h3>

                <div className="grid grid-cols-2 gap-4">
                    <input
                        type="text"
                        placeholder="Tên"
                        value={form.full_name}
                        onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                        className="border p-3 rounded-xl"
                    />

                    <input
                        type="text"
                        placeholder="Username"
                        value={form.username}
                        onChange={(e) => setForm({ ...form, username: e.target.value })}
                        className="border p-3 rounded-xl"
                    />

                    <input
                        type="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="border p-3 rounded-xl"
                    />

                    <input
                        type="text"
                        placeholder="Số điện thoại"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="border p-3 rounded-xl"
                    />

                    <input
                        type="password"
                        placeholder="Mật khẩu"
                        value={form.password_hash}
                        onChange={(e) => setForm({ ...form, password_hash: e.target.value })}
                        className="border p-3 rounded-xl"
                    />

                    <select
                        value={form.cinema_id}
                        onChange={(e) => setForm({ ...form, cinema_id: e.target.value })}
                        className="border p-3 rounded-xl"
                    >
                        <option value="">Chọn chi nhánh</option>
                        {cinemas.map((c) => (
                            <option key={c.cinema_id} value={c.cinema_id}>
                                {c.cinema_name}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={handleSave}
                    className="mt-6 bg-red-600 text-white px-6 py-3 rounded-xl"
                >
                    Tạo Admin
                </button>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-2xl shadow overflow-hidden">
                <div className="p-6 border-b">
                    <h3 className="text-xl font-semibold">
                        Danh sách manager ({filteredUsers.length})
                    </h3>
                </div>

                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-4 text-left">Tên</th>
                            <th className="p-4 text-left">Username</th>
                            <th className="p-4 text-left">Chi nhánh</th>
                            <th className="p-4 text-left">Email</th>
                            <th className="p-4 text-left">SĐT</th>
                            <th className="p-4 text-left">Trạng thái</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="text-center p-6">
                                    <LoadingSpinner />
                                </td>
                            </tr>
                        ) : currentUsers.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center p-6">
                                    Không có dữ liệu
                                </td>
                            </tr>
                        ) : (
                            currentUsers.map((user) => (
                                <tr key={user.user_id} className="border-t">
                                    <td className="p-4">{user.full_name}</td>
                                    <td className="p-4">{user.username}</td>
                                    <td className="p-4">{user.cinema_name}</td>
                                    <td className="p-4">{user.email}</td>
                                    <td className="p-4">{user.phone}</td>

                                    <td className="p-4">
                                        <button
                                            onClick={() => toggleStatus(user.user_id, user.status)}
                                            className={`w-12 h-6 rounded-full ${
                                                user.status === 'active'
                                                    ? 'bg-green-500'
                                                    : 'bg-gray-300'
                                            }`}
                                        >
                                            <div
                                                className={`w-5 h-5 bg-white rounded-full transition ${
                                                    user.status === 'active' ? 'translate-x-6' : ''
                                                }`}
                                            />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {!loading && totalPages > 1 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => setCurrentPage(page)}
                    />
                )}
            </div>
        </div>
    );
};

export default Users;
