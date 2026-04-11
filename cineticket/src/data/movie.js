// src/data/movies.js

export const movies = [
    {
        movie_id: 1,
        title: 'ĐỨC PHẬT',
        duration: 148,
        description:
            'Câu chuyện cảm động về hành trình giác ngộ của Đức Phật Siddhartha Gautama từ hoàng tử đến bậc giác ngộ.',
        language: 'Tiếng Việt',
        release_date: '2026-04-01',
        end_date: '2026-06-30',
        age_limit: 'P',
        poster_url: 'https://picsum.photos/id/1015/300/400',
        trailer_url: 'https://www.youtube.com/watch?v=example1',
        status: 'now_showing',
        created_at: '2025-12-01',
        updated_at: '2026-04-01'
    },
    {
        movie_id: 2,
        title: 'AVENGERS: DOOMSDAY',
        duration: 165,
        description:
            'Các anh hùng vĩ đại nhất Trái Đất phải đối mặt với mối đe dọa lớn nhất từ trước đến nay.',
        language: 'Tiếng Anh - Phụ đề Việt',
        release_date: '2026-05-01',
        end_date: '2026-07-15',
        age_limit: 'C13',
        poster_url: 'https://picsum.photos/id/870/300/400',
        trailer_url: 'https://www.youtube.com/watch?v=example2',
        status: 'now_showing',
        created_at: '2025-11-15',
        updated_at: '2026-04-05'
    },
    {
        movie_id: 3,
        title: 'MẬT NGỮ',
        duration: 132,
        description:
            'Một trò chơi chết chóc bắt đầu khi những bí mật đen tối của gia đình dần được hé lộ.',
        language: 'Tiếng Việt',
        release_date: '2026-04-15',
        end_date: '2026-06-20',
        age_limit: 'C18',
        poster_url: 'https://picsum.photos/id/201/300/400',
        trailer_url: 'https://www.youtube.com/watch?v=example3',
        status: 'now_showing',
        created_at: '2026-01-10',
        updated_at: '2026-04-10'
    },
    {
        movie_id: 4,
        title: 'SIÊU LỪA SIÊU LẬU',
        duration: 118,
        description:
            'Bộ phim hài hành động đầy kịch tính và tiếng cười với những màn lừa đảo thông minh.',
        language: 'Tiếng Việt',
        release_date: '2026-03-20',
        end_date: '2026-05-30',
        age_limit: 'C13',
        poster_url: 'https://picsum.photos/id/133/300/400',
        trailer_url: 'https://www.youtube.com/watch?v=example4',
        status: 'now_showing',
        created_at: '2025-12-20',
        updated_at: '2026-03-25'
    },
    {
        movie_id: 5,
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
        status: 'upcoming',
        created_at: '2026-02-01',
        updated_at: '2026-04-01'
    },
    {
        movie_id: 6,
        title: 'KUNG FU PANDA 4',
        duration: 94,
        description:
            'Po trở lại với hành trình mới đầy hài hước và những trận chiến kung fu đỉnh cao.',
        language: 'Tiếng Việt lồng tiếng',
        release_date: '2026-06-15',
        end_date: '2026-08-20',
        age_limit: 'P',
        poster_url: 'https://picsum.photos/id/237/300/400',
        trailer_url: 'https://www.youtube.com/watch?v=example6',
        status: 'upcoming',
        created_at: '2026-01-05',
        updated_at: '2026-04-01'
    }
];

// Hàm hỗ trợ lọc phim
export const getNowShowingMovies = () => {
    return movies.filter((movie) => movie.status === 'now_showing');
};

export const getUpcomingMovies = () => {
    return movies.filter((movie) => movie.status === 'upcoming');
};
