export var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "SUPER_ADMIN";
    UserRole["ADMIN"] = "ADMIN";
    UserRole["VENDOR"] = "VENDOR";
    UserRole["CASHIER"] = "CASHIER";
})(UserRole || (UserRole = {}));
const roleAuth = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }
        next();
    };
};
export const isSuperAdmin = roleAuth([UserRole.SUPER_ADMIN]);
export const isAdmin = roleAuth([UserRole.SUPER_ADMIN, UserRole.ADMIN]);
export const isVendor = roleAuth([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.VENDOR]);
