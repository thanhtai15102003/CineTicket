export const permissions = {
    super_admin: ['manage_users', 'manage_cinemas', 'manage_movies'],
    admin: [],
    user: []
};

export const hasPermission = (user, permission) => {
    if (!user) return false;
    return permissions[user.role_name]?.includes(permission);
};
