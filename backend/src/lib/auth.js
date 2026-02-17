import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const SALT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-change-in-production';
const ACCESS_TOKEN_EXPIRY = '30d'; // 30 days
const REFRESH_TOKEN_EXPIRY = '30d'; // 30 days

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
export async function hashPassword(password) {
    return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} True if password matches
 */
export async function verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);
}

/**
 * Generate a JWT access token
 * @param {string} userId - User ID
 * @param {string} email - User email
 * @param {'USER' | 'DEVELOPER' | 'ADMIN'} role - User role
 * @returns {string} JWT access token
 */
export function generateAccessToken(userId, email, role) {
    const payload = { userId, email, role };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

/**
 * Generate a JWT refresh token
 * @param {string} userId - User ID
 * @returns {string} JWT refresh token
 */
export function generateRefreshToken(userId) {
    return jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

/**
 * Verify and decode a JWT access token
 * @param {string} token - JWT token
 * @returns {Object} Decoded token payload
 */
export function verifyAccessToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
}

/**
 * Verify and decode a JWT refresh token
 * @param {string} token - JWT refresh token
 * @returns {{userId: string}} Decoded token payload
 */
export function verifyRefreshToken(token) {
    try {
        return jwt.verify(token, JWT_REFRESH_SECRET);
    } catch (error) {
        throw new Error('Invalid or expired refresh token');
    }
}

/**
 * Generate a random email verification token
 * @returns {string} UUID token
 */
export function generateEmailVerificationToken() {
    return uuidv4();
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {{isValid: boolean, error?: string}} Object with isValid and error message
 */
export function validatePasswordStrength(password) {
    if (password.length < 8) {
        return { isValid: false, error: 'Password must be at least 8 characters long' };
    }
    if (!/[A-Z]/.test(password)) {
        return { isValid: false, error: 'Password must contain at least one uppercase letter' };
    }
    if (!/[a-z]/.test(password)) {
        return { isValid: false, error: 'Password must contain at least one lowercase letter' };
    }
    if (!/[0-9]/.test(password)) {
        return { isValid: false, error: 'Password must contain at least one number' };
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return { isValid: false, error: 'Password must contain at least one special character' };
    }
    return { isValid: true };
}

/**
 * Calculate account lock duration in minutes
 * @param {number} attempts - Number of failed attempts
 * @returns {number} Lock duration in minutes
 */
export function calculateLockDuration(attempts) {
    if (attempts >= 5) return 30; // 30 minutes for 5+ attempts
    if (attempts >= 3) return 15; // 15 minutes for 3-4 attempts
    return 0;
}
