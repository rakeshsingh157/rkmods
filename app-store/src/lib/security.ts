import validator from 'validator';

/**
 * Sanitize user input to prevent XSS attacks
 * @param input - User input string
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
    // Remove HTML tags
    let sanitized = input.replace(/<[^>]*>/g, '');

    // Escape special characters
    sanitized = validator.escape(sanitized);

    // Trim whitespace
    sanitized = sanitized.trim();

    return sanitized;
}

/**
 * Validate email format
 * @param email - Email address
 * @returns True if valid email
 */
export function isValidEmail(email: string): boolean {
    return validator.isEmail(email);
}

/**
 * Validate and sanitize review content
 * @param content - Review message
 * @returns Object with sanitized content and validation result
 */
export function validateReviewContent(content: string): {
    isValid: boolean;
    sanitized: string;
    error?: string
} {
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
 * @param mimeType - File MIME type
 * @param allowedTypes - Array of allowed MIME types
 * @returns True if valid
 */
export function isValidMimeType(mimeType: string, allowedTypes: string[]): boolean {
    return allowedTypes.includes(mimeType);
}

/**
 * Validate file size
 * @param sizeBytes - File size in bytes
 * @param maxSizeMB - Maximum size in MB
 * @returns True if valid
 */
export function isValidFileSize(sizeBytes: number, maxSizeMB: number): boolean {
    const maxBytes = maxSizeMB * 1024 * 1024;
    return sizeBytes <= maxBytes;
}

/**
 * Generate browser fingerprint from request headers
 * @param userAgent - User-Agent header
 * @param acceptLanguage - Accept-Language header
 * @param acceptEncoding - Accept-Encoding header
 * @returns Fingerprint hash
 */
export function generateFingerprint(
    userAgent: string,
    acceptLanguage: string,
    acceptEncoding: string
): string {
    const crypto = require('crypto');
    const data = `${userAgent}|${acceptLanguage}|${acceptEncoding}`;
    return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Check if IP address is suspicious (basic check)
 * @param ipAddress - IP address
 * @returns True if suspicious
 */
export function isSuspiciousIP(ipAddress: string): boolean {
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
 * @param input - User input
 * @returns True if safe
 */
export function isSafeSQLInput(input: string): boolean {
    // Check for common SQL injection patterns
    const sqlPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
        /(--|;|\/\*|\*\/)/,
        /('|(\\'))/,
    ];

    return !sqlPatterns.some(pattern => pattern.test(input));
}
