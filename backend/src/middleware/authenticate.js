import { verifyAccessToken } from '../lib/auth.js';

/**
 * Middleware to authenticate requests using JWT
 * Extracts token from Authorization header and verifies it
 * 
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function authenticateRequest(req, res, next) {
    try {
        // Get Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            res.status(401).json({ error: 'No authorization header' });
            return;
        }

        // Extract token (format: "Bearer <token>")
        const parts = authHeader.split(' ');

        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            res.status(401).json({ error: 'Invalid authorization format' });
            return;
        }

        const token = parts[1];

        // Verify token
        const payload = verifyAccessToken(token);

        // Attach user to request
        req.user = payload;

        next();

    } catch (error) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
}

/**
 * Optional authentication - doesn't fail if no token
 * Useful for endpoints that work differently for authenticated users
 * 
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function optionalAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader) {
            const parts = authHeader.split(' ');
            if (parts.length === 2 && parts[0] === 'Bearer') {
                const token = parts[1];
                const payload = verifyAccessToken(token);
                req.user = payload;
            }
        }
    } catch (error) {
        // Silently fail for optional auth
    }

    next();
}
