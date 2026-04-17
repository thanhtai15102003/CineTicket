export const showtimes = [
    {
        showtime_id: 101,
        movie_id: 1,
        cinema: 'CineTicket Quang Trung',
        region: 'TP.HCM',
        room: 'Phòng 1',
        show_date: '2026-04-20', // Dùng định dạng YYYY-MM-DD để dễ sort
        start_time: '09:30',
        end_time: '11:45', // Thêm để biết thời lượng chiếu thực tế
        format: '2D', // 2D / 3D / IMAX / 4DX...
        price: 95000, // Giá vé chuẩn (đơn vị VND)
        available_seats: 45, // Số ghế còn lại
        total_seats: 120
    },
    {
        showtime_id: 102,
        movie_id: 1,
        cinema: 'CineTicket Quang Trung',
        region: 'TP.HCM',
        room: 'Phòng 2',
        show_date: '2026-04-20',
        start_time: '10:30',
        end_time: '12:45',
        format: '2D',
        price: 95000,
        available_seats: 32,
        total_seats: 120
    },
    {
        showtime_id: 103,
        movie_id: 1,
        cinema: 'CineTicket Quang Trung',
        region: 'TP.HCM',
        room: 'Phòng 1',
        show_date: '2026-04-20',
        start_time: '15:00',
        end_time: '17:15',
        format: '2D',
        price: 110000,
        available_seats: 68,
        total_seats: 120
    },
    {
        showtime_id: 104,
        movie_id: 1,
        cinema: 'CineTicket TP.HCM',
        region: 'TP.HCM',
        room: 'Phòng 1',
        show_date: '2026-04-21',
        start_time: '13:00',
        end_time: '15:15',
        format: '2D',
        price: 95000,
        available_seats: 50,
        total_seats: 100
    },
    {
        showtime_id: 105,
        movie_id: 1,
        cinema: 'CineTicket Hà Nội',
        region: 'Hà Nội',
        room: 'Phòng 3',
        show_date: '2026-04-20',
        start_time: '09:00',
        end_time: '11:15',
        format: '2D',
        price: 90000,
        available_seats: 78,
        total_seats: 110
    },
    {
        showtime_id: 106,
        movie_id: 1,
        cinema: 'CineTicket Đà Nẵng',
        region: 'Đà Nẵng',
        room: 'Phòng 2',
        show_date: '2026-04-22',
        start_time: '18:45',
        end_time: '21:00',
        format: '3D',
        price: 130000,
        available_seats: 25,
        total_seats: 90
    },

    // ==================== Movie 2 ====================
    {
        showtime_id: 201,
        movie_id: 2,
        cinema: 'CineTicket TP.HCM',
        region: 'TP.HCM',
        room: 'Phòng 5',
        show_date: '2026-04-20',
        start_time: '10:00',
        end_time: '12:10',
        format: '2D',
        price: 85000,
        available_seats: 60,
        total_seats: 100
    },
    {
        showtime_id: 202,
        movie_id: 2,
        cinema: 'CineTicket Hà Nội',
        region: 'Hà Nội',
        room: 'Phòng 1',
        show_date: '2026-04-21',
        start_time: '14:30',
        end_time: '16:40',
        format: '3D',
        price: 125000,
        available_seats: 40,
        total_seats: 90
    },

    // Thêm thêm dữ liệu cho movie 3, 4... để test tốt hơn
    {
        showtime_id: 301,
        movie_id: 3,
        cinema: 'CineTicket Quang Trung',
        region: 'TP.HCM',
        room: 'Phòng 4',
        show_date: '2026-04-20',
        start_time: '11:00',
        end_time: '13:20',
        format: '2D',
        price: 100000,
        available_seats: 55,
        total_seats: 120
    },
    {
        showtime_id: 401,
        movie_id: 4,
        cinema: 'CineTicket TP.HCM',
        region: 'TP.HCM',
        room: 'Phòng 3',
        show_date: '2026-04-22',
        start_time: '16:00',
        end_time: '18:30',
        format: '2D',
        price: 95000,
        available_seats: 70,
        total_seats: 110
    },
    {
        showtime_id: 109,
        movie_id: 1,
        cinema: 'CineTicket TP.HCM',
        region: 'TP.HCM',
        room: 'Phòng 1',
        show_date: '2026-04-20', // Dùng định dạng YYYY-MM-DD để dễ sort
        start_time: '09:30',
        end_time: '11:45', // Thêm để biết thời lượng chiếu thực tế
        format: '2D', // 2D / 3D / IMAX / 4DX...
        price: 95000, // Giá vé chuẩn (đơn vị VND)
        available_seats: 45, // Số ghế còn lại
        total_seats: 120
    }
];