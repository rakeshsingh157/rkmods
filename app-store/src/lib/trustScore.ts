import pool from './db';

interface TrustScoreFactors {
    isLoggedIn: boolean;
    isEmailVerified: boolean;
    isSuspiciousIP: boolean;
    isDuplicate: boolean;
    accountAgeDays?: number;
    hasSpamHistory?: boolean;
}

/**
 * Calculate trust score for a review
 * @param factors - Trust score factors
 * @returns Trust score (can be negative)
 */
export function calculateTrustScore(factors: TrustScoreFactors): number {
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
 * @param trustScore - Calculated trust score
 * @returns Moderation status
 */
export function getModerationStatus(trustScore: number): 'approved' | 'pending' | 'spam' {
    if (trustScore >= 5) return 'approved';
    if (trustScore >= 0) return 'pending';
    return 'spam';
}

/**
 * Check if review is duplicate
 * @param appId - App ID
 * @param ipAddress - IP address
 * @param fingerprint - Browser fingerprint
 * @param message - Review message
 * @returns True if duplicate found
 */
export async function isDuplicateReview(
    appId: number,
    ipAddress: string,
    fingerprint: string,
    message: string
): Promise<boolean> {
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
 * @param userId - User ID (optional)
 * @param ipAddress - IP address
 * @returns True if user has spam history
 */
export async function hasSpamHistory(userId: number | null, ipAddress: string): Promise<boolean> {
    try {
        let query: string;
        let params: any[];

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
 * @param ipAddress - IP address
 * @param fingerprint - Browser fingerprint
 * @param increment - Score increment (positive or negative)
 */
export async function updateSuspiciousScore(
    ipAddress: string,
    fingerprint: string,
    increment: number
): Promise<void> {
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
 * @param ipAddress - IP address
 * @param fingerprint - Browser fingerprint
 * @returns Suspicious score
 */
export async function getSuspiciousScore(
    ipAddress: string,
    fingerprint: string
): Promise<number> {
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
