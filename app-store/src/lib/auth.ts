import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const SALT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-change-in-production';
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days

export interface TokenPayload {
    userId: string;
    email: string;
    role: 'USER' | 'DEVELOPER' | 'ADMIN';
}

/**
 * Hash a password using bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 * @param password - Plain text password
 * @param hash - Hashed password
 * @returns True if password matches
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

/**
 * Generate a JWT access token
 * @param userId - User ID
 * @param email - User email
 * @param role - User role
 * @returns JWT access token
 */
export function generateAccessToken(userId: string, email: string, role: 'USER' | 'DEVELOPER' | 'ADMIN'): string {
    const payload: TokenPayload = { userId, email, role };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

/**
 * Generate a JWT refresh token
 * @param userId - User ID
 * @returns JWT refresh token
 */
export function generateRefreshToken(userId: string): string {
    return jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

/**
 * Verify and decode a JWT access token
 * @param token - JWT token
 * @returns Decoded token payload
 */
export function verifyAccessToken(token: string): TokenPayload {
    try {
        return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
}

/**
 * Verify and decode a JWT refresh token
 * @param token - JWT refresh token
 * @returns Decoded token payload
 */
export function verifyRefreshToken(token: string): { userId: string } {
    try {
        return jwt.verify(token, JWT_REFRESH_SECRET) as { userId: string };
    } catch (error) {
        throw new Error('Invalid or expired refresh token');
    }
}

/**
 * Generate a random email verification token
 * @returns UUID token
 */
export function generateEmailVerificationToken(): string {
    return uuidv4();
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Object with isValid and error message
 */
export function validatePasswordStrength(password: string): { isValid: boolean; error?: string } {
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
 * @param attempts - Number of failed attempts
 * @returns Lock duration in minutes
 */
export function calculateLockDuration(attempts: number): number {
    if (attempts >= 5) return 30; // 30 minutes for 5+ attempts
    if (attempts >= 3) return 15; // 15 minutes for 3-4 attempts
    return 0;
}
