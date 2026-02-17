import { connectDB } from './db';

interface RateLimitConfig {
    windowMs: number; // Time window in milliseconds
    maxRequests: number; // Maximum requests per window
}

const rateLimitConfigs: Record<string, RateLimitConfig> = {
    general: { windowMs: 15 * 60 * 1000, maxRequests: 100 }, // 100 requests per 15 minutes
    auth: { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 attempts per 15 minutes
    review: { windowMs: 60 * 60 * 1000, maxRequests: 3 }, // 3 reviews per hour
    upload: { windowMs: 60 * 60 * 1000, maxRequests: 10 }, // 10 uploads per hour
};

/**
 * Check if request should be rate limited
 * @param identifier - IP address or user ID
 * @param endpoint - Endpoint name (general, auth, review, upload)
 * @returns Object with allowed status and remaining requests
 */
export async function checkRateLimit(
    identifier: string,
    endpoint: keyof typeof rateLimitConfigs = 'general'
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
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
 */
export async function cleanupRateLimits(): Promise<void> {
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
