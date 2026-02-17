import pool from './db.js';

/**
 * Calculate trust score for a review
 * @param {Object} factors - Trust score factors
 * @param {boolean} factors.isLoggedIn
 * @param {boolean} factors.isEmailVerified
 * @param {boolean} factors.isSuspiciousIP
 * @param {boolean} factors.isDuplicate
 * @param {number} [factors.accountAgeDays]
 * @param {boolean} [factors.hasSpamHistory]
 * @returns {number} Trust score (can be negative)
 */
export function calculateTrustScore(factors) {
    let score = 0;

    // Positive factors
    if (factors.isLoggedIn) score += 5;
    if (factors.isEmailVerified) score += 3;

    // Guest user baseline
    if (!factors.isLoggedIn) score += 1;

    // Negative factors
    if (factors.isSuspiciousIP) score -= 10;
    if (factors.isDuplicate) score -= 5;

    // Account age factor (new accounts are suspicious)
    if (factors.accountAgeDays !== undefined && factors.accountAgeDays < 7) {
        score -= 2;
    }

    // Spam history
    if (factors.hasSpamHistory) score -= 8;

    return score;
}

/**
 * Determine moderation status based on trust score
 * @param {number} trustScore - Calculated trust score
 * @returns {'approved' | 'pending' | 'spam'} Moderation status
 */
export function getModerationStatus(trustScore) {
    if (trustScore >= 5) return 'approved';
    if (trustScore >= 0) return 'pending';
    return 'spam';
}

/**
 * Check if review is duplicate
 * @param {number} appId - App ID
 * @param {string} ipAddress - IP address
 * @param {string} fingerprint - Browser fingerprint
 * @param {string} message - Review message
 * @returns {Promise<boolean>} True if duplicate found
 */
export async function isDuplicateReview(
    appId,
    ipAddress,
    fingerprint,
    message
) {
    try {
        const result = await pool.query(
            `SELECT COUNT(*) FROM reviews 
       WHERE app_id = $1 
       AND (ip_address = $2 OR fingerprint = $3)
       AND message = $4
       AND created_at > NOW() - INTERVAL '24 hours'`,
            [appId, ipAddress, fingerprint, message]
        );

        return parseInt(result.rows[0].count) > 0;
    } catch (error) {
        console.error('Error checking duplicate review:', error);
        return false;
    }
}

/**
 * Get user's spam history
 * @param {number | null} userId - User ID (optional)
 * @param {string} ipAddress - IP address
 * @returns {Promise<boolean>} True if user has spam history
 */
export async function hasSpamHistory(userId, ipAddress) {
    try {
        let query;
        let params;

        if (userId) {
            query = `SELECT COUNT(*) FROM reviews 
               WHERE user_id = $1 AND is_spam = true`;
            params = [userId];
        } else {
            query = `SELECT COUNT(*) FROM reviews 
               WHERE ip_address = $1 AND is_spam = true`;
            params = [ipAddress];
        }

        const result = await pool.query(query, params);
        return parseInt(result.rows[0].count) > 0;
    } catch (error) {
        console.error('Error checking spam history:', error);
        return false;
    }
}

/**
 * Update IP fingerprint suspicious score
 * @param {string} ipAddress - IP address
 * @param {string} fingerprint - Browser fingerprint
 * @param {number} increment - Score increment (positive or negative)
 * @returns {Promise<void>}
 */
export async function updateSuspiciousScore(
    ipAddress,
    fingerprint,
    increment
) {
    try {
        await pool.query(
            `INSERT INTO ip_fingerprints (ip_address, fingerprint, suspicious_score, last_seen)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (ip_address, fingerprint)
       DO UPDATE SET 
         suspicious_score = ip_fingerprints.suspicious_score + $3,
         last_seen = NOW()`,
            [ipAddress, fingerprint, increment]
        );
    } catch (error) {
        console.error('Error updating suspicious score:', error);
    }
}

/**
 * Get suspicious score for IP/fingerprint
 * @param {string} ipAddress - IP address
 * @param {string} fingerprint - Browser fingerprint
 * @returns {Promise<number>} Suspicious score
 */
export async function getSuspiciousScore(
    ipAddress,
    fingerprint
) {
    try {
        const result = await pool.query(
            `SELECT suspicious_score FROM ip_fingerprints 
       WHERE ip_address = $1 AND fingerprint = $2`,
            [ipAddress, fingerprint]
        );

        if (result.rows.length === 0) return 0;
        return result.rows[0].suspicious_score;
    } catch (error) {
        console.error('Error getting suspicious score:', error);
        return 0;
    }
}
