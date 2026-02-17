// Security configuration constants

export const SECURITY_CONFIG = {
    // Password requirements
    PASSWORD: {
        MIN_LENGTH: 8,
        REQUIRE_UPPERCASE: true,
        REQUIRE_LOWERCASE: true,
        REQUIRE_NUMBER: true,
        REQUIRE_SPECIAL_CHAR: true,
    },

    // JWT configuration
    JWT: {
        ACCESS_TOKEN_EXPIRY: '15m', // 15 minutes
        REFRESH_TOKEN_EXPIRY: '7d', // 7 days
        ALGORITHM: 'HS256',
    },

    // Rate limiting thresholds
    RATE_LIMITS: {
        GENERAL: {
            WINDOW_MS: 15 * 60 * 1000, // 15 minutes
            MAX_REQUESTS: 100,
        },
        AUTH: {
            WINDOW_MS: 15 * 60 * 1000, // 15 minutes
            MAX_REQUESTS: 5,
        },
        REVIEW: {
            WINDOW_MS: 60 * 60 * 1000, // 1 hour
            MAX_REQUESTS: 3,
        },
        UPLOAD: {
            WINDOW_MS: 60 * 60 * 1000, // 1 hour
            MAX_REQUESTS: 10,
        },
    },

    // File upload limits
    FILE_LIMITS: {
        APK: {
            MAX_SIZE_MB: 100,
            MIME_TYPES: ['application/vnd.android.package-archive', 'application/zip'],
        },
        ICON: {
            MAX_SIZE_MB: 2,
            MIME_TYPES: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
        },
        SCREENSHOT: {
            MAX_SIZE_MB: 5,
            MIME_TYPES: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
        },
    },

    // Trust score thresholds
    TRUST_SCORE: {
        AUTO_APPROVE: 5, // Score >= 5 auto-approves
        MANUAL_REVIEW: 0, // Score 0-4 goes to manual review
        AUTO_SPAM: -1, // Score < 0 auto-marks as spam
    },

    // Review content limits
    REVIEW: {
        MAX_LENGTH: 500,
        MIN_LENGTH: 1,
    },

    // Account security
    ACCOUNT: {
        MAX_FAILED_LOGIN_ATTEMPTS: 5,
        LOCKOUT_DURATION_MINUTES: 30,
        EMAIL_VERIFICATION_EXPIRY_HOURS: 24,
        PASSWORD_RESET_EXPIRY_HOURS: 1,
    },

    // Session management
    SESSION: {
        MAX_SESSIONS_PER_USER: 5, // Maximum concurrent sessions
        SESSION_CLEANUP_INTERVAL_HOURS: 24,
    },

    // CORS settings
    CORS: {
        ALLOWED_ORIGINS: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
        ALLOWED_METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        ALLOWED_HEADERS: ['Content-Type', 'Authorization'],
        CREDENTIALS: true,
    },

    // Content Security Policy
    CSP: {
        DIRECTIVES: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://www.google.com', 'https://www.gstatic.com'],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
            fontSrc: ["'self'", 'data:'],
            connectSrc: ["'self'", 'https://s3.us-east-005.backblazeb2.com'],
            frameSrc: ["'self'", 'https://www.google.com'],
        },
    },
};

// Environment-specific overrides
if (process.env.NODE_ENV === 'production') {
    // Stricter settings for production
    SECURITY_CONFIG.RATE_LIMITS.GENERAL.MAX_REQUESTS = 50;
    SECURITY_CONFIG.ACCOUNT.MAX_FAILED_LOGIN_ATTEMPTS = 3;
}
