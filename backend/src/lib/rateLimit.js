import { connectDB } from './db.js';

const rateLimitConfigs = {
    general: {
        maxRequests: 100,
        windowMs: 15 * 60 * 1000, // 15 minutes
    },
    auth: {
        maxRequests: 5,
        windowMs: 15 * 60 * 1000, // 15 minutes
    },
    review: {
        maxRequests: 3,
        windowMs: 60 * 60 * 1000, // 1 hour
    },
    reply: {
        maxRequests: 10,
        windowMs: 60 * 60 * 1000, // 1 hour
    },
    upload: {
        maxRequests: 10,
        windowMs: 60 * 60 * 1000, // 1 hour
    },
};

/**
 * Check if request should be rate limited
 * @param {string} identifier - IP address or user ID
 * @param {string} endpoint - Endpoint name (general, auth, review, upload)
 * @returns {Promise<{ allowed: boolean; remaining: number; resetAt: Date }>} Object with allowed status and remaining requests
 */
export async function checkRateLimit(
    identifier,
    endpoint = 'general'
) {
    const config = rateLimitConfigs[endpoint];

    try {
        const db = await connectDB();
        const rateLimitsCollection = db.collection('rate_limits');

        // Get or create rate limit record
        const record = await rateLimitsCollection.findOne({
            identifier,
            endpoint
        });

        const now = new Date();

        if (!record) {
            // First request - create record
            await rateLimitsCollection.insertOne({
                identifier,
                endpoint,
                count: 1,
                window_start: now
            });

            return {
                allowed: true,
                remaining: config.maxRequests - 1,
                resetAt: new Date(now.getTime() + config.windowMs),
            };
        }

        const windowStart = new Date(record.window_start);
        const windowEnd = new Date(windowStart.getTime() + config.windowMs);

        // Check if window has expired
        if (now > windowEnd) {
            // Reset window
            await rateLimitsCollection.updateOne(
                { identifier, endpoint },
                { $set: { count: 1, window_start: now } }
            );

            return {
                allowed: true,
                remaining: config.maxRequests - 1,
                resetAt: new Date(now.getTime() + config.windowMs),
            };
        }

        // Window is still active
        const currentCount = record.count;

        if (currentCount >= config.maxRequests) {
            // Rate limit exceeded
            return {
                allowed: false,
                remaining: 0,
                resetAt: windowEnd,
            };
        }

        // Increment count
        await rateLimitsCollection.updateOne(
            { identifier, endpoint },
            { $inc: { count: 1 } }
        );

        return {
            allowed: true,
            remaining: config.maxRequests - currentCount - 1,
            resetAt: windowEnd,
        };

    } catch (error) {
        console.error('Rate limit check error:', error);
        // On error, allow the request (fail open)
        return {
            allowed: true,
            remaining: config.maxRequests,
            resetAt: new Date(Date.now() + config.windowMs),
        };
    }
}

/**
 * Clean up old rate limit records (run periodically)
 * @returns {Promise<void>}
 */
export async function cleanupRateLimits() {
    try {
        const db = await connectDB();
        const rateLimitsCollection = db.collection('rate_limits');

        // Delete records older than 24 hours
        const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
        await rateLimitsCollection.deleteMany({
            window_start: { $lt: cutoffTime }
        });
    } catch (error) {
        console.error('Rate limit cleanup error:', error);
    }
}
