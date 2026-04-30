export const permissions = {
    admin: ['manage_users', 'manage_cinemas', 'manage_movies', 'admin_combo'],
    manager: ['manage_rooms', 'manage_seat_layouts', 'manage_showtimes', 'manage_combo'],
    staff: []
};

export const hasPermission = (user, permission) => {
    if (!user) return false;

    const roleName = user.role?.role_name; // 🔥 fix ở đây

    return permissions[roleName]?.includes(permission);
};