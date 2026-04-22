import { useState, useEffect } from 'react';
import Toast from '../../components/common/Toast';

const BASE_URL = 'https://cinema-api-production-f2bc.up.railway.app/api/v1';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;

    const [form, setForm] = useState({
        user_id: null,
        username: '',
        password_hash: '',
        full_name: '',
        email: '',
        phone: '',
        gender: 'Nam',
        date_of_birth: '',
        role_name: 'admin',
        status: 'active',
        region: 'TP. Hồ Chí Minh',
        cinema_id: ''
    });

    const [successMessage, setSuccessMessage] = useState('');

    // ================== LOAD API ==================
    const fetchManagers = async () => {
        try {
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
                    role_name: 'admin'
                }));

                setUsers(mappedUsers);
            } else {
                alert('Không lấy được danh sách manager');
            }
        } catch (err) {
            console.error(err);
            alert('Lỗi API');
        }
    };

    useEffect(() => {
        fetchManagers();
    }, []);

    // ================== TOGGLE STATUS (NEW) ==================
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
                body: JSON.stringify({
                    status: newStatus
                })
            });

            const data = await res.json();

            if (res.ok) {
                setUsers((prev) =>
                    prev.map((u) => (u.user_id === id ? { ...u, status: newStatus } : u))
                );
            } else {
                alert(data.message || 'Lỗi cập nhật trạng thái');
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
                fetchManagers();
            } else {
                alert(data.message || 'Lỗi tạo admin');
            }
        } catch (err) {
            console.error(err);
        }
    };

    // ================== DELETE ==================
    const handleDelete = async (id) => {
        if (!confirm('Xóa tài khoản này?')) return;

        try {
            const token = localStorage.getItem('token');

            await fetch(`${BASE_URL}/admin/managers/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setSuccessMessage('Đã xóa!');
            fetchManagers();
        } catch (err) {
            alert('Lỗi xóa');
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

    const currentUsers = filteredUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // ================== UI ==================
    return (
        <div className="p-6 max-w-7xl mx-auto">
            {successMessage && (
                <Toast message={successMessage} onClose={() => setSuccessMessage('')} />
            )}

            {/* FORM (GIỮ NGUYÊN) */}
            <div className="bg-white p-8 rounded-2xl shadow-lg mb-10">
                <h3 className="text-2xl font-semibold mb-6">Tạo tài khoản Admin</h3>

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
                            <th className="p-4 text-left">Email</th>
                            <th className="p-4 text-left">Trạng thái</th>
                            <th className="p-4 text-center">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {currentUsers.map((user) => (
                            <tr key={user.user_id} className="border-t">
                                <td className="p-4">{user.full_name}</td>
                                <td className="p-4">{user.username}</td>
                                <td className="p-4">{user.email}</td>

                                {/* ================= STATUS TOGGLE ================= */}
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

                                <td className="p-4 text-center">
                                    <button
                                        onClick={() => handleDelete(user.user_id)}
                                        className="text-red-500"
                                    >
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Users;
