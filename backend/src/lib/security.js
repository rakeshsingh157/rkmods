import validator from 'validator';
import crypto from 'crypto';

/**
 * Sanitize user input to prevent XSS attacks
 * @param {string} input - User input string
 * @returns {string} Sanitized string
 */
export function sanitizeInput(input) {
    if (input === null || input === undefined) return '';

    // Ensure input is a string
    const stringInput = String(input);

    // Remove HTML tags
    let sanitized = stringInput.replace(/<[^>]*>/g, '');

    // Escape special characters
    sanitized = validator.escape(sanitized);

    // Trim whitespace
    sanitized = sanitized.trim();

    return sanitized;
}

/**
 * Validate email format
 * @param {string} email - Email address
 * @returns {boolean} True if valid email
 */
export function isValidEmail(email) {
    return validator.isEmail(email);
}

/**
 * Validate and sanitize review content
 * @param {string} content - Review message
 * @returns {{isValid: boolean, sanitized: string, error?: string}} Object with sanitized content and validation result
 */
export function validateReviewContent(content) {
    // Remove HTML tags
    const sanitized = sanitizeInput(content);

    // Check length
    if (sanitized.length === 0) {
        return { isValid: false, sanitized, error: 'Review cannot be empty' };
    }

    if (sanitized.length > 500) {
        return { isValid: false, sanitized, error: 'Review must be 500 characters or less' };
    }

    // Check for profanity (basic check - you can enhance this)
    const profanityWords = ['spam', 'scam']; // Add more as needed
    const lowerContent = sanitized.toLowerCase();
    const hasProfanity = profanityWords.some(word => lowerContent.includes(word));

    if (hasProfanity) {
        return { isValid: false, sanitized, error: 'Review contains inappropriate content' };
    }

    return { isValid: true, sanitized };
}

/**
 * Validate file MIME type
 * @param {string} mimeType - File MIME type
 * @param {string[]} allowedTypes - Array of allowed MIME types
 * @returns {boolean} True if valid
 */
export function isValidMimeType(mimeType, allowedTypes) {
    return allowedTypes.includes(mimeType);
}

/**
 * Validate file size
 * @param {number} sizeBytes - File size in bytes
 * @param {number} maxSizeMB - Maximum size in MB
 * @returns {boolean} True if valid
 */
export function isValidFileSize(sizeBytes, maxSizeMB) {
    const maxBytes = maxSizeMB * 1024 * 1024;
    return sizeBytes <= maxBytes;
}

/**
 * Generate browser fingerprint from request headers
 * @param {string} userAgent - User-Agent header
 * @param {string} acceptLanguage - Accept-Language header
 * @param {string} acceptEncoding - Accept-Encoding header
 * @returns {string} Fingerprint hash
 */
export function generateFingerprint(
    userAgent,
    acceptLanguage,
    acceptEncoding
) {
    const data = `${userAgent}|${acceptLanguage}|${acceptEncoding}`;
    return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Check if IP address is suspicious (basic check)
 * @param {string} ipAddress - IP address
 * @returns {boolean} True if suspicious
 */
export function isSuspiciousIP(ipAddress) {
    // Add your logic here - check against known VPN/proxy IPs, blacklists, etc.
    // For now, just a placeholder
    const suspiciousPatterns = [
        '0.0.0.0',
        '127.0.0.1',
    ];

    return suspiciousPatterns.includes(ipAddress);
}

/**
 * Prevent SQL injection by validating input
 * @param {string} input - User input
 * @returns {boolean} True if safe
 */
export function isSafeSQLInput(input) {
    // Check for common SQL injection patterns
    const sqlPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
        /(--|;|\/\*|\*\/)/,
        /('|(\\'))/,
    ];

    return !sqlPatterns.some(pattern => pattern.test(input));
}
