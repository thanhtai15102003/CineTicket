import { useState, useEffect } from 'react';
import {
    Save,
    MapPin,
    Image as ImageIcon,
    UploadCloud,
    X,
    Lock,
    Building2,
    AlertCircle,
    ToggleLeft,
    ToggleRight
} from 'lucide-react';

const ManagerCinemaPage = () => {
    // State lưu dữ liệu rạp
    const [cinemaData, setCinemaData] = useState({
        id: null,
        cinema_name: '',
        address: '',
        description: '',
        is_active: true,
        images: [],
        image_files: [] // Lưu file thật để upload nếu cần
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const getToken = () => localStorage.getItem('token');

    // ==========================================
    // 1. TẢI DỮ LIỆU TỪ API
    // ==========================================
    useEffect(() => {
        const fetchMyCinema = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(
                    'https://cinema-api-production-f2bc.up.railway.app/api/v1/manager/my-cinema',
                    {
                        headers: {
                            Authorization: `Bearer ${getToken()}`,
                            Accept: 'application/json'
                        }
                    }
                );

                if (!res.ok) {
                    console.error('Không lấy được dữ liệu rạp');
                    return;
                }

                const json = await res.json();
                const data = json.data || json;

                // Xử lý địa chỉ: Ghép địa chỉ + Quận + Thành phố
                const fullAddress = `${data.address || ''}, ${data.region?.city || ''}`;

                // Xử lý ảnh (Parse từ JSON nếu BE lưu dạng chuỗi, hoặc set rỗng nếu null)
                let parsedImages = [];
                if (data.images) {
                    parsedImages =
                        typeof data.images === 'string' ? JSON.parse(data.images) : data.images;
                }

                setCinemaData({
                    id: data.cinema_id,
                    cinema_name: data.cinema_name || '',
                    address: fullAddress.replace(/,\s*$/, ''), // Cắt dấu phẩy dư ở cuối nếu có
                    description: data.description || '',
                    is_active: data.status === 'active',
                    images: parsedImages,
                    image_files: []
                });
            } catch (error) {
                console.error('Lỗi lấy dữ liệu rạp:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMyCinema();
    }, []);

    // ==========================================
    // 2. XỬ LÝ SỰ KIỆN GIAO DIỆN
    // ==========================================
    const handleChange = (e) => {
        const { name, value } = e.target;
        setCinemaData((prev) => ({ ...prev, [name]: value }));
    };

    const toggleStatus = () => {
        setCinemaData((prev) => ({ ...prev, is_active: !prev.is_active }));
    };

    // Xử lý chọn ảnh từ máy tính (Preview)
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const newImages = files.map((file) => URL.createObjectURL(file));

        setCinemaData((prev) => ({
            ...prev,
            images: [...prev.images, ...newImages],
            image_files: [...prev.image_files, ...files] // Lưu file để upload
        }));

        // Reset input file
        e.target.value = null;
    };

    const handleRemoveImage = (indexToRemove) => {
        setCinemaData((prev) => ({
            ...prev,
            images: prev.images.filter((_, index) => index !== indexToRemove),
            image_files: prev.image_files.filter((_, index) => index !== indexToRemove)
        }));
    };

    // ==========================================
    // 3. LƯU DỮ LIỆU
    // ==========================================
    const handleSave = async () => {
        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append('description', cinemaData.description || '');
            formData.append('status', cinemaData.is_active ? 'active' : 'inactive');
            // 1. Lọc ra các ảnh cũ muốn giữ lại (những link KHÔNG bắt đầu bằng 'blob:')
            const existingImages = cinemaData.images.filter((img) => !img.startsWith('blob:'));
            existingImages.forEach((url, index) => {
                formData.append(`existing_images[${index}]`, url);
            });
            // 2. Gửi các file ảnh mới lên (được lưu trong mảng image_files)
            if (cinemaData.image_files && cinemaData.image_files.length > 0) {
                cinemaData.image_files.forEach((file) => {
                    formData.append('images[]', file);
                });
            }
            // Dùng trick _method: PUT cho Laravel khi dùng FormData
            formData.append('_method', 'PUT');
            const res = await fetch(
                `https://cinema-api-production-f2bc.up.railway.app/api/v1/manager/my-cinema`,
                {
                    method: 'POST', // Phải dùng POST khi gửi FormData kèm _method: PUT
                    headers: {
                        Authorization: `Bearer ${getToken()}`,
                        Accept: 'application/json'
                    },
                    body: formData
                }
            );
            if (res.ok) {
                const result = await res.json();
                alert('Đã cập nhật thông tin rạp thành công!');

                // Cập nhật lại state với dữ liệu mới từ BE (để các link blob được thay bằng link Cloudinary thật)
                const updatedCinema = result.cinema;
                setCinemaData((prev) => ({
                    ...prev,
                    images: updatedCinema.images || [],
                    image_files: [] // Xóa hàng chờ file sau khi đã up xong
                }));
            } else {
                const errorData = await res.json();
                alert(errorData.message || 'Dữ liệu không hợp lệ!');
            }
        } catch (error) {
            console.error(error);
            alert('Có lỗi mạng xảy ra khi lưu!');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64 text-slate-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mr-3"></div>
                Đang tải thông tin rạp...
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto pb-10">
            {/* Header Hành động */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                        Thông tin chi nhánh
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Quản lý và cập nhật các thông tin vận hành tại rạp của bạn.
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isSaving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                        <Save size={18} />
                    )}
                    {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* CỘT TRÁI: THÔNG TIN CƠ BẢN */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Block: Thông tin cố định (Read-only) */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-2 text-slate-800 font-bold text-lg">
                                <Building2 size={20} className="text-slate-400" />
                                Định danh rạp
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-lg border border-amber-200">
                                <Lock size={12} />
                                Chỉ Admin Tổng được cấp quyền sửa đổi
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Tên chi nhánh
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={cinemaData.cinema_name}
                                        disabled
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-500 font-medium cursor-not-allowed"
                                    />
                                    <Lock
                                        size={16}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Địa chỉ & Bản đồ (Tọa độ)
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-3 text-slate-400">
                                        <MapPin size={18} />
                                    </div>
                                    <textarea
                                        value={cinemaData.address}
                                        disabled
                                        rows="2"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-slate-500 font-medium cursor-not-allowed resize-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Block: Mô tả rạp (Được phép sửa) */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                        <div className="flex items-center gap-2 text-slate-800 font-bold text-lg mb-6 border-b border-slate-100 pb-4">
                            <AlertCircle size={20} className="text-blue-500" />
                            Thông tin vận hành & Mô tả
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Giới thiệu rạp (Hiển thị cho khách hàng)
                            </label>
                            <textarea
                                name="description"
                                value={cinemaData.description}
                                onChange={handleChange}
                                rows="5"
                                placeholder="Nhập thông tin giới thiệu, các sự kiện hoặc thông báo quan trọng của rạp..."
                                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors"
                            />
                            <p className="text-xs text-slate-500 mt-2">
                                Bạn có thể cập nhật các thông báo khẩn cấp (như thay đổi bãi đỗ xe,
                                sửa chữa) tại đây.
                            </p>
                        </div>
                    </div>
                </div>

                {/* CỘT PHẢI: TRẠNG THÁI & HÌNH ẢNH */}
                <div className="flex flex-col gap-6">
                    {/* Block: Trạng thái hoạt động */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-4">
                            Trạng thái đóng/mở
                        </h3>
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <div>
                                <p className="font-semibold text-slate-800">Đón khách</p>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Mở cửa bán vé trên web
                                </p>
                            </div>
                            <button
                                onClick={toggleStatus}
                                className="transition-all duration-300 focus:outline-none"
                            >
                                {cinemaData.is_active ? (
                                    <ToggleRight size={40} className="text-green-500" />
                                ) : (
                                    <ToggleLeft size={40} className="text-slate-400" />
                                )}
                            </button>
                        </div>
                        {!cinemaData.is_active && (
                            <div className="mt-3 p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-100">
                                Hệ thống đang chặn khách hàng mua vé tại rạp này.
                            </div>
                        )}
                    </div>

                    {/* Block: Thư viện hình ảnh */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex-1">
                        <div className="flex items-center gap-2 text-slate-800 font-bold mb-4 border-b border-slate-100 pb-4">
                            <ImageIcon size={20} className="text-purple-500" />
                            Hình ảnh sự kiện rạp
                        </div>

                        <div className="flex flex-col gap-4">
                            {/* Khu vực Upload (Đã gắn input hidden để click vào được) */}
                            <div className="relative border-2 border-dashed border-slate-300 hover:border-red-500 bg-slate-50 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors group">
                                <div className="p-3 bg-white shadow-sm rounded-full mb-3 group-hover:scale-110 transition-transform">
                                    <UploadCloud
                                        size={24}
                                        className="text-slate-500 group-hover:text-red-500"
                                    />
                                </div>
                                <p className="text-sm font-semibold text-slate-700">Tải ảnh lên</p>
                                <p className="text-xs text-slate-500 mt-1 text-center">
                                    Định dạng JPG, PNG. Tối đa 2MB
                                </p>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>

                            {/* Danh sách ảnh hiện tại */}
                            {cinemaData.images.length > 0 && (
                                <div className="grid grid-cols-2 gap-3 mt-2">
                                    {cinemaData.images.map((img, idx) => (
                                        <div
                                            key={idx}
                                            className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-video"
                                        >
                                            <img
                                                // Nếu backend trả về URL lỗi, chặn hiện xám
                                                src={
                                                    img ||
                                                    'https://placehold.co/400x200?text=No+Image'
                                                }
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src =
                                                        'https://placehold.co/400x200?text=Loi+Anh';
                                                }}
                                                alt="Cinema"
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            {/* Nút xóa ảnh */}
                                            <button
                                                onClick={() => handleRemoveImage(idx)}
                                                className="absolute top-1.5 right-1.5 p-1 bg-black/50 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all"
                                                title="Xóa ảnh"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerCinemaPage;
