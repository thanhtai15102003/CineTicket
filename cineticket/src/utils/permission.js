export const permissions = {
    admin: [
        'admin_dashboard',
        'manage_users',
        'manage_cinemas',
        'manage_movies',
        'admin_combo',
        'admin_banners'
    ],
    manager: [
        'manage_rooms',
        'manage_seat_layouts',
        'manage_showtimes',
        'manage_combo',
        'manage_cinema-info',
        'manager_tickets',
        'manager_dashboard'
    ],
    staff: []
};

export const hasPermission = (user, permission) => {
    if (!user) return false;

    const roleName = user.role?.role_name; // 🔥 fix ở đây

    return permissions[roleName]?.includes(permission);
};