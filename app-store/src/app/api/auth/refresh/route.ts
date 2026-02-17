import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyRefreshToken, generateAccessToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        // Get refresh token from cookie
        const refreshToken = request.cookies.get('refreshToken')?.value;

        if (!refreshToken) {
            return NextResponse.json(
                { error: 'No refresh token provided' },
                { status: 401 }
            );
        }

        // Verify refresh token
        let payload;
        try {
            payload = verifyRefreshToken(refreshToken);
        } catch (error) {
            return NextResponse.json(
                { error: 'Invalid or expired refresh token' },
                { status: 401 }
            );
        }

        // Check if refresh token exists in database
        const sessionResult = await pool.query(
            `SELECT s.id, u.id as user_id, u.email, u.role, u.account_status
       FROM sessions s
       JOIN users u ON s.user_id = u.id
       WHERE s.refresh_token = $1 AND s.expires_at > NOW()`,
            [refreshToken]
        );

        if (sessionResult.rows.length === 0) {
            return NextResponse.json(
                { error: 'Invalid or expired session' },
                { status: 401 }
            );
        }

        const session = sessionResult.rows[0];

        // Check if account is active
        if (session.account_status !== 'active') {
            return NextResponse.json(
                { error: 'Account is not active' },
                { status: 403 }
            );
        }

        // Generate new access token
        const accessToken = generateAccessToken(session.user_id, session.email, session.role);

        return NextResponse.json(
            {
                success: true,
                accessToken,
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Token refresh error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
