/**
 * Middleware to check if user has required role(s)
 * Must be used after authentication middleware
 * 
 * @param {...('USER' | 'DEVELOPER' | 'ADMIN')} allowedRoles
 */
export function requireRoles(...allowedRoles) {
    return (req, res, next) => {

        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        // Check if user's role is in allowed roles
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
            return;
        }

        next();
    };
}

/**
 * Check if user has specific role
 * @param {{role: string}} user
 * @param {string} role
 * @returns {boolean}
 */
export function hasRole(user, role) {
    return user.role === role;
}

/**
 * Check if user is admin
 * @param {{role: string}} user
 * @returns {boolean}
 */
export function isAdmin(user) {
    return user.role === 'ADMIN';
}

/**
 * Check if user is developer
 * @param {{role: string}} user
 * @returns {boolean}
 */
export function isDeveloper(user) {
    return user.role === 'DEVELOPER';
}

/**
 * Check if user is regular user
 * @param {{role: string}} user
 * @returns {boolean}
 */
export function isRegularUser(user) {
    return user.role === 'USER';
}
