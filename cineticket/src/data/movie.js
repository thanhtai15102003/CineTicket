// src/data/movies.js

export const movies = [
    // ==================== PHIM ĐANG CHIẾU ====================
    {
        movie_id: 1,
        title: 'HẸN EM NGÀY NHẬT THỰC',
        duration: 118,
        description:
            'Năm 1995, khi đang đứng trước một quyết định quan trọng của cuộc đời, Ân bất ngờ bị kéo trở lại quá khứ bởi những bức thư tình chưa từng trao tay. Hành trình tìm gặp Thiên - mối tình đầu từng khắc sâu trong tim - đưa cô về lại thôn xóm Trà Mây năm xưa, nơi những ký ức ngọt ngào xen lẫn tổn thương vẫn chưa hề nguôi ngoai. Trong khoảnh khắc định mệnh khi hai người bất ngờ chạm mặt, những bí mật bị che giấu suốt nhiều năm dần hé lộ, buộc Ân phải đối diện với sự thật và lựa chọn con đường cho riêng mình.',
        language: 'Tiếng Việt',
        release_date: '30/03/2026',
        end_date: '2026-06-30',
        age_limit: '16+',
        poster_url:
            'https://cinestar.com.vn/_next/image/?url=https%3A%2F%2Fapi-website.cinestar.com.vn%2Fmedia%2Fwysiwyg%2FPosters%2F04-2026%2Fhen-em.jpg&w=1920&q=75',
        trailer_url: 'https://www.youtube.com/watch?v=snG3te8ByyQ',
        backdrop_url:
            'https://iguov8nhvyobj.vcdn.cloud/media/catalog/product/cache/1/image/1800x/71252117777b696995f01934522c402d/t/e/teaser_hennt_16x9.jpg',
        status: 'now_showing',
        genre: ['Tình cảm', 'Tâm lý'],
        rating: 8.5,
        actors: ['Đoàn Thiên Ân', ' Khương Lê', 'NSND Lê Khanh'],
        director: 'Lê Thiện Viễn',
        country: 'Việt Nam',
        producer: 'Đang cập nhật'
    },
    {
        movie_id: 2,
        title: 'BẪY TIỀN',
        duration: 113,
        description:
            'Một bộ phim hành động kịch tính với những âm mưu và cuộc săn đuổi đầy căng thẳng.',
        language: 'Tiếng Việt',
        release_date: '2026-05-01',
        end_date: '2026-07-15',
        age_limit: 'C13',
        poster_url:
            'https://cinestar.com.vn/_next/image/?url=https%3A%2F%2Fapi-website.cinestar.com.vn%2Fmedia%2Fwysiwyg%2FPosters%2F04-2026%2Fbay-tien-poster.jpg&w=1920&q=75',
        trailer_url: 'https://www.youtube.com/watch?v=N1fKcXANtrY',
        status: 'now_showing',
        backdrop_url: 'https://i.ytimg.com/vi/0wuVwkK-Vsc/maxresdefault.jpg',
        genre: ['Tình cảm', 'Tâm lý'],
        rating: 8.5,
        actors: ['Đoàn Thiên Ân', ' Khương Lê', 'NSND Lê Khanh'],
        director: 'Lê Thiện Viễn',
        country: 'Việt Nam',
        producer: 'Đang cập nhật'
    },
    {
        movie_id: 3,
        title: 'DƯỚI BÓNG ĐIỆN HẠ',
        duration: 117,
        description:
            'Bộ phim kinh dị Hàn Quốc gây ám ảnh với không khí u tối và những bí mật gia đình.',
        language: 'Hàn Quốc - Phụ đề Việt',
        release_date: '2026-04-15',
        end_date: '2026-06-20',
        age_limit: 'C18',
        poster_url:
            'https://cinestar.com.vn/_next/image/?url=https%3A%2F%2Fapi-website.cinestar.com.vn%2Fmedia%2Fwysiwyg%2FPosters%2F04-2026%2FKING.jpg&w=1920&q=75',
        trailer_url: 'https://www.youtube.com/watch?v=ASLnhwDepn0',
        status: 'now_showing',
        backdrop_url:
            'https://thegioidienanh.vn/stores/news_dataimages/2026/042026/09/10/thumbnail/120260409104055.png',
        genre: ['Tình cảm', 'Tâm lý'],
        rating: 8.5,
        actors: ['Đoàn Thiên Ân', ' Khương Lê', 'NSND Lê Khanh'],
        director: 'Lê Thiện Viễn',
        country: 'Việt Nam',
        producer: 'Đang cập nhật'
    },
    {
        movie_id: 4,
        title: 'TA KHON QUỶ ĐỘI LỐP NGƯỜI',
        duration: 99,
        description: 'Phim hài hành động Thái Lan với những tình huống dở khóc dở cười.',
        language: 'Tiếng Thái - Phụ đề Việt',
        release_date: '2026-03-20',
        end_date: '2026-05-30',
        age_limit: 'C13',
        poster_url:
            'https://cinestar.com.vn/_next/image/?url=https%3A%2F%2Fapi-website.cinestar.com.vn%2Fmedia%2Fwysiwyg%2FPosters%2F04-2026%2Ftakhon.png&w=1920&q=75',
        trailer_url: 'https://www.youtube.com/watch?v=DkwNWXsI1Vo',
        status: 'now_showing',
        backdrop_url: 'https://i.ytimg.com/vi/g6BumUNQl1U/maxresdefault.jpg',
        genre: ['Tình cảm', 'Tâm lý'],
        rating: 8.5,
        actors: ['Đoàn Thiên Ân', ' Khương Lê', 'NSND Lê Khanh'],
        director: 'Lê Thiện Viễn',
        country: 'Việt Nam',
        producer: 'Đang cập nhật'
    },
    {
        movie_id: 5,
        title: 'SIÊU NHÂN SIÊU LẬU',
        duration: 105,
        description: 'Bộ phim hài Việt Nam gây bùng nổ phòng vé với dàn diễn viên nổi tiếng.',
        language: 'Tiếng Việt',
        release_date: '2026-04-10',
        end_date: '2026-06-10',
        age_limit: 'C13',
        poster_url: 'https://picsum.photos/id/1015/300/400',
        trailer_url: '#',
        status: 'now_showing',
        backdrop_url:
            'https://thegioidienanh.vn/stores/news_dataimages/2026/042026/09/10/thumbnail/120260409104055.png'
    },
    {
        movie_id: 6,
        title: 'MẬT NGỮ: BÍ ẨN TỬ THẦN',
        duration: 128,
        description: 'Phim kinh dị Việt Nam với twist bất ngờ đến phút cuối.',
        language: 'Tiếng Việt',
        release_date: '2026-04-20',
        end_date: '2026-07-05',
        age_limit: 'C18',
        poster_url: 'https://picsum.photos/id/201/300/400',
        trailer_url: '#',
        status: 'now_showing'
    },

    // ==================== PHIM SẮP CHIẾU ====================
    {
        movie_id: 7,
        title: 'DEADPOOL & WOLVERINE',
        duration: 127,
        description:
            'Deadpool và Wolverine hợp sức trong cuộc phiêu lưu điên rồ nhất lịch sử Marvel.',
        language: 'Tiếng Anh - Phụ đề Việt',
        release_date: '2026-07-10',
        end_date: '2026-09-10',
        age_limit: 'C18',
        poster_url: 'https://picsum.photos/id/180/300/400',
        trailer_url: 'https://www.youtube.com/watch?v=example5',
        status: 'upcoming'
    },
    {
        movie_id: 8,
        title: 'KUNG FU PANDA 4',
        duration: 94,
        description:
            'Po trở lại với hành trình mới đầy hài hước và những trận chiến kung fu đỉnh cao.',
        language: 'Tiếng Việt lồng tiếng',
        release_date: '2026-06-15',
        end_date: '2026-08-20',
        age_limit: 'P',
        poster_url: 'https://picsum.photos/id/237/300/400',
        trailer_url: '#',
        status: 'upcoming'
    },
    {
        movie_id: 9,
        title: 'THẾ GIỚI KẾT THÚC',
        duration: 142,
        description: 'Bộ phim khoa học viễn tưởng bom tấn của Hollywood.',
        language: 'Tiếng Anh - Phụ đề Việt',
        release_date: '2026-08-01',
        end_date: '2026-10-15',
        age_limit: 'C13',
        poster_url: 'https://picsum.photos/id/870/300/400',
        trailer_url: '#',
        status: 'upcoming'
    },
    {
        movie_id: 10,
        title: 'CON NHÓT MÓT CHỒNG',
        duration: 110,
        description: 'Phim hài Việt Nam tiếp nối thành công của series Con Nhót.',
        language: 'Tiếng Việt',
        release_date: '2026-07-20',
        end_date: '2026-09-05',
        age_limit: 'C13',
        poster_url: 'https://picsum.photos/id/133/300/400',
        trailer_url: '#',
        status: 'upcoming'
    },
    {
        movie_id: 11,
        title: 'OPPENHEIMER 2',
        duration: 165,
        description: 'Phần tiếp theo của bộ phim đoạt Oscar Oppenheimer.',
        language: 'Tiếng Anh - Phụ đề Việt',
        release_date: '2026-09-10',
        end_date: '2026-11-20',
        age_limit: 'C16',
        poster_url: 'https://picsum.photos/id/1016/300/400',
        trailer_url: '#',
        status: 'upcoming'
    },
    {
        movie_id: 12,
        title: 'LẬT MẶT 9: ĐỊA NGỤC',
        duration: 135,
        description: 'Phần mới nhất của series Lật Mặt nổi tiếng.',
        language: 'Tiếng Việt',
        release_date: '2026-08-15',
        end_date: '2026-10-10',
        age_limit: 'C18',
        poster_url: 'https://picsum.photos/id/201/300/400',
        trailer_url: '#',
        status: 'upcoming'
    }
];

// Hàm hỗ trợ
export const getNowShowingMovies = () => {
    return movies.filter((movie) => movie.status === 'now_showing');
};

export const getUpcomingMovies = () => {
    return movies.filter((movie) => movie.status === 'upcoming');
};

export const getAllMovies = () => {
    return [...movies]; // Trả về tất cả phim
};
