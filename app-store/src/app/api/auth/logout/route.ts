import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        // Get refresh token from cookie
        const refreshToken = request.cookies.get('refreshToken')?.value;

        if (refreshToken) {
            // Delete session from database
            await pool.query(
                'DELETE FROM sessions WHERE refresh_token = $1',
                [refreshToken]
            );
        }

        // Create response
        const response = NextResponse.json(
            {
                success: true,
                message: 'Logged out successfully',
            },
            { status: 200 }
        );

        // Clear refresh token cookie
        response.cookies.delete('refreshToken');

        return response;

    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
