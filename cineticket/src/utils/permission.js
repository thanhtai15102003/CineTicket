export const permissions = {
    super_admin: ['manage_users'],
    admin: [],
    user: []
};

export const hasPermission = (user, permission) => {
    if (!user) return false;
    return permissions[user.role_name]?.includes(permission);
};
