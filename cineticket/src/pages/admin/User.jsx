import { useState, useEffect } from 'react';
import Toast from '../../components/common/Toast';

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

    const [isEditing, setIsEditing] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const regions = ['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Các tỉnh khác'];

    const cinemas = {
        'TP. Hồ Chí Minh': [
            { id: 1, name: 'CGV Landmark 81' },
            { id: 2, name: 'CGV Vincom Center' },
            { id: 3, name: 'CGV SC VivoCity' },
            { id: 4, name: 'Lotte Cinema Diamond' },
            { id: 5, name: 'BHD Star Cineplex' }
        ],
        'Hà Nội': [{ id: 7, name: 'CGV Tràng Tiền' }],
        'Đà Nẵng': [{ id: 9, name: 'CGV Vincom Đà Nẵng' }],
        'Các tỉnh khác': [{ id: 10, name: 'CGV Biên Hòa' }]
    };

    // Load dữ liệu từ localStorage (không tạo data giả ở đây)
    useEffect(() => {
        const savedUsers = JSON.parse(localStorage.getItem('users')) || [];
        setUsers(savedUsers);
    }, []);

    // Lọc users
    const filteredUsers = users.filter((user) => {
        const term = searchTerm.toLowerCase();
        return (
            (user.full_name?.toLowerCase().includes(term) ||
                user.username?.toLowerCase().includes(term) ||
                user.email?.toLowerCase().includes(term)) &&
            (filterRole === 'all' || user.role_name === filterRole)
        );
    });

    // Phân trang
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const currentUsers = filteredUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (name === 'region') {
            setForm((prev) => ({ ...prev, cinema_id: '' }));
        }
        setErrorMessage('');
    };

    const resetForm = () => {
        setForm({
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
        setIsEditing(false);
        setErrorMessage('');
    };

    // Validation
    const validateForm = () => {
        if (!form.full_name?.trim()) return 'Vui lòng nhập Họ và tên';
        if (!form.username?.trim()) return 'Vui lòng nhập Username';
        if (form.username.length < 3) return 'Username phải có ít nhất 3 ký tự';
        if (!form.email?.trim() || !form.email.includes('@')) return 'Email không hợp lệ';

        // Kiểm tra username trùng
        const isDuplicate = users.some(
            (u) =>
                u.username.toLowerCase() === form.username.toLowerCase() &&
                u.user_id !== form.user_id
        );
        if (isDuplicate) return 'Username này đã tồn tại';

        if (!isEditing && !form.password_hash?.trim()) return 'Vui lòng nhập mật khẩu';
        if (!isEditing && form.password_hash.length < 4) return 'Mật khẩu phải có ít nhất 4 ký tự';

        return null;
    };

    const handleSave = () => {
        const error = validateForm();
        if (error) {
            setErrorMessage(error);
            alert(error);
            return;
        }

        const newCinemaId = form.cinema_id ? parseInt(form.cinema_id) : null;

        let updatedUsers;
        if (isEditing) {
            updatedUsers = users.map((user) =>
                user.user_id === form.user_id
                    ? { ...user, ...form, cinema_id: newCinemaId, role_id: 2 }
                    : user
            );
            setSuccessMessage('✅ Cập nhật tài khoản thành công!');
        } else {
            const newUser = {
                user_id: Date.now(),
                username: form.username.trim(),
                password_hash: form.password_hash.trim() || '123456',
                full_name: form.full_name.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
                gender: form.gender,
                date_of_birth: form.date_of_birth,
                role_id: 2,
                role_name: 'admin',
                region: form.region,
                cinema_id: newCinemaId,
                status: form.status,
                created_at: new Date().toISOString()
            };

            updatedUsers = [...users, newUser];
            setSuccessMessage('✅ Tạo tài khoản Admin thành công!');
        }

        setUsers(updatedUsers);
        localStorage.setItem('users', JSON.stringify(updatedUsers));

        // Reset sau khi tạo/cập nhật
        resetForm();
        setCurrentPage(1);
        setFilterRole('all'); // Reset về tất cả để thấy user mới
        setErrorMessage('');
    };

    const handleEdit = (user) => {
        setForm({
            user_id: user.user_id,
            username: user.username || '',
            password_hash: '',
            full_name: user.full_name || '',
            email: user.email || '',
            phone: user.phone || '',
            gender: user.gender || 'Nam',
            date_of_birth: user.date_of_birth || '',
            role_name: 'admin',
            status: user.status || 'active',
            region: user.region || 'TP. Hồ Chí Minh',
            cinema_id: user.cinema_id ? String(user.cinema_id) : ''
        });
        setIsEditing(true);
        setErrorMessage('');
    };

    const handleDelete = (user_id) => {
        if (!confirm('Bạn có chắc chắn muốn xóa người dùng này không?')) return;
        const updatedUsers = users.filter((u) => u.user_id !== user_id);
        setUsers(updatedUsers);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        setSuccessMessage('✅ Xóa tài khoản thành công!');
        if (currentUsers.length === 1 && currentPage > 1) {
            setCurrentPage((prev) => prev - 1);
        }
    };

    const handleRowClick = (user) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedUser(null);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Quản lý Tài khoản Admin</h2>

            {errorMessage && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6">
                    {errorMessage}
                </div>
            )}
            {/* Toast Component */}
            {successMessage && (
                <Toast message={successMessage} onClose={() => setSuccessMessage('')} />
            )}

            {/* Form tạo / chỉnh sửa */}
            <div className="bg-white p-8 rounded-2xl shadow-lg mb-10">
                <h3 className="text-2xl font-semibold mb-6">
                    {isEditing ? 'Chỉnh sửa tài khoản Admin' : 'Tạo tài khoản Admin mới'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input
                        name="full_name"
                        value={form.full_name}
                        onChange={handleInputChange}
                        placeholder="Họ và tên *"
                        className="border p-4 rounded-xl w-full"
                    />
                    <input
                        name="username"
                        value={form.username}
                        onChange={handleInputChange}
                        placeholder="Tên đăng nhập *"
                        className="border p-4 rounded-xl w-full"
                    />
                    <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleInputChange}
                        placeholder="Email *"
                        className="border p-4 rounded-xl w-full"
                    />
                    <input
                        name="phone"
                        value={form.phone}
                        onChange={handleInputChange}
                        placeholder="Số điện thoại"
                        className="border p-4 rounded-xl w-full"
                    />
                    <input
                        name="password_hash"
                        type="password"
                        value={form.password_hash}
                        onChange={handleInputChange}
                        placeholder={
                            isEditing ? 'Mật khẩu mới (bỏ trống nếu giữ nguyên)' : 'Mật khẩu *'
                        }
                        className="border p-4 rounded-xl w-full"
                    />
                    <input
                        name="date_of_birth"
                        type="date"
                        value={form.date_of_birth}
                        onChange={handleInputChange}
                        className="border p-4 rounded-xl w-full"
                    />

                    <select
                        name="gender"
                        value={form.gender}
                        onChange={handleInputChange}
                        className="border p-4 rounded-xl w-full"
                    >
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                        <option value="Khác">Khác</option>
                    </select>

                    <select
                        name="region"
                        value={form.region}
                        onChange={handleInputChange}
                        className="border p-4 rounded-xl w-full"
                    >
                        {regions.map((r) => (
                            <option key={r} value={r}>
                                {r}
                            </option>
                        ))}
                    </select>

                    <select
                        name="cinema_id"
                        value={form.cinema_id}
                        onChange={handleInputChange}
                        className="border p-4 rounded-xl w-full"
                    >
                        <option value="">Chọn chi nhánh rạp</option>
                        {(cinemas[form.region] || []).map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>

                    <select
                        name="status"
                        value={form.status}
                        onChange={handleInputChange}
                        className="border p-4 rounded-xl w-full"
                    >
                        <option value="active">Hoạt động</option>
                        <option value="inactive">Khóa</option>
                    </select>
                </div>

                <div className="mt-8 flex gap-4">
                    <button
                        onClick={handleSave}
                        className="bg-red-600 hover:bg-red-700 text-white px-10 py-3.5 rounded-xl font-medium transition"
                    >
                        {isEditing ? 'Cập nhật tài khoản' : 'Tạo tài khoản Admin'}
                    </button>
                    {isEditing && (
                        <button
                            onClick={resetForm}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-10 py-3.5 rounded-xl"
                        >
                            Hủy
                        </button>
                    )}
                </div>
            </div>

            {/* Tìm kiếm + Lọc */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <input
                    type="text"
                    placeholder="Tìm kiếm theo tên, username, email..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="flex-1 border p-4 rounded-xl"
                />
                <select
                    value={filterRole}
                    onChange={(e) => {
                        setFilterRole(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="border p-4 rounded-xl"
                >
                    <option value="all">Tất cả vai trò</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                    <option value="user">User</option>
                </select>
            </div>

            {/* Bảng danh sách */}
            <div className="bg-white rounded-2xl shadow overflow-hidden">
                <div className="p-6 border-b flex justify-between items-center">
                    <h3 className="text-xl font-semibold">
                        Danh sách tài khoản ({filteredUsers.length})
                    </h3>
                    <span className="text-sm text-gray-500">
                        Trang {currentPage} / {totalPages || 1}
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left p-5">Họ tên</th>
                                <th className="text-left p-5">Username</th>
                                <th className="text-left p-5">Email</th>
                                <th className="text-left p-5">Khu vực</th>
                                <th className="text-left p-5">Chi nhánh</th>
                                <th className="text-left p-5">Trạng thái</th>
                                <th className="text-center p-5">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {currentUsers.map((user) => (
                                <tr
                                    key={user.user_id}
                                    className="hover:bg-gray-50 cursor-pointer"
                                    onClick={() => handleRowClick(user)}
                                >
                                    <td className="p-5 font-medium">{user.full_name}</td>
                                    <td className="p-5">{user.username}</td>
                                    <td className="p-5">{user.email}</td>
                                    <td className="p-5">{user.region || '-'}</td>
                                    <td className="p-5">
                                        {user.cinema_id
                                            ? cinemas[user.region]?.find(
                                                  (c) => c.id === user.cinema_id
                                              )?.name || `Rạp #${user.cinema_id}`
                                            : '-'}
                                    </td>
                                    <td className="p-5">
                                        <span
                                            className={`px-4 py-1 rounded-full text-sm ${
                                                user.status === 'active'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                            }`}
                                        >
                                            {user.status === 'active' ? 'Hoạt động' : 'Khóa'}
                                        </span>
                                    </td>
                                    <td
                                        className="p-5 text-center"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                       
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(user.user_id);
                                            }}
                                            className="text-red-600"
                                        >
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Phân trang */}
                {totalPages > 1 && (
                    <div className="p-6 flex justify-center gap-2">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 border rounded-lg disabled:opacity-50"
                        >
                            Trước
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-4 py-2 border rounded-lg ${
                                    currentPage === page
                                        ? 'bg-red-600 text-white'
                                        : 'hover:bg-gray-100'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 border rounded-lg disabled:opacity-50"
                        >
                            Sau
                        </button>
                    </div>
                )}
            </div>

            {/* Modal chi tiết */}
            {showModal && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col">
                        <div className="bg-gray-900 text-white px-6 py-4 flex justify-between">
                            <h3 className="text-lg font-semibold">Thông tin chi tiết</h3>
                            <button onClick={closeModal} className="text-2xl">
                                ×
                            </button>
                        </div>

                        <div className="p-6 space-y-5 flex-1 overflow-y-auto">
                            <div>
                                <p className="text-xs text-gray-500">HỌ VÀ TÊN</p>
                                <p className="text-xl font-semibold">{selectedUser.full_name}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-5 text-sm">
                                <div>
                                    <p className="text-gray-500">Username</p>
                                    <p>{selectedUser.username}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Email</p>
                                    <p>{selectedUser.email}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Khu vực</p>
                                    <p>{selectedUser.region || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Chi nhánh</p>
                                    <p>
                                        {selectedUser.cinema_id
                                            ? cinemas[selectedUser.region]?.find(
                                                  (c) => c.id === selectedUser.cinema_id
                                              )?.name
                                            : '—'}
                                    </p>
                                </div>
                            </div>
                            <div className="pt-3 border-t">
                                <p className="text-gray-500 text-xs">Ngày tạo</p>
                                <p>
                                    {selectedUser.created_at
                                        ? new Date(selectedUser.created_at).toLocaleString('vi-VN')
                                        : '—'}
                                </p>
                            </div>
                        </div>

                        <div className="border-t px-6 py-4 flex gap-3">
                            <button
                                onClick={closeModal}
                                className="flex-1 py-3 bg-gray-100 rounded-xl"
                            >
                                Đóng
                            </button>
                            <button
                                onClick={() => {
                                    closeModal();
                                    handleEdit(selectedUser);
                                }}
                                className="flex-1 py-3 bg-red-600 text-white rounded-xl"
                            >
                                Chỉnh sửa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
