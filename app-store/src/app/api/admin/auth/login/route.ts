import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyPassword, generateAccessToken, generateRefreshToken, calculateLockDuration } from '@/lib/auth';
import { sanitizeInput } from '@/lib/security';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
    try {
        const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

        const rateLimit = await checkRateLimit(clientIP, 'auth');
        if (!rateLimit.allowed) {
            return NextResponse.json(
                { error: 'Too many login attempts. Please try again later.', resetAt: rateLimit.resetAt },
                { status: 429 }
            );
        }

        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        const sanitizedEmail = sanitizeInput(email.toLowerCase());

        const result = await pool.query(
            `SELECT id, email, password, role, email_verified, account_status, 
              failed_login_attempts, locked_until
       FROM users 
       WHERE email = $1 AND role = 'ADMIN'`,
            [sanitizedEmail]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 });
        }

        const admin = result.rows[0];

        if (admin.locked_until && new Date(admin.locked_until) > new Date()) {
            const minutesRemaining = Math.ceil((new Date(admin.locked_until).getTime() - Date.now()) / 60000);
            return NextResponse.json(
                { error: `Account is locked. Please try again in ${minutesRemaining} minutes.`, lockedUntil: admin.locked_until },
                { status: 423 }
            );
        }

        if (admin.account_status === 'suspended') {
            return NextResponse.json({ error: 'Account has been suspended.' }, { status: 403 });
        }

        const isValidPassword = await verifyPassword(password, admin.password);

        if (!isValidPassword) {
            const newAttempts = admin.failed_login_attempts + 1;
            const lockDuration = calculateLockDuration(newAttempts);

            if (lockDuration > 0) {
                const lockedUntil = new Date(Date.now() + lockDuration * 60000);
                await pool.query(
                    `UPDATE users SET failed_login_attempts = $1, locked_until = $2, account_status = 'locked' WHERE id = $3`,
                    [newAttempts, lockedUntil, admin.id]
                );
                return NextResponse.json(
                    { error: `Too many failed attempts. Account locked for ${lockDuration} minutes.`, lockedUntil },
                    { status: 423 }
                );
            } else {
                await pool.query('UPDATE users SET failed_login_attempts = $1 WHERE id = $2', [newAttempts, admin.id]);
            }
            return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 });
        }

        if (!admin.email_verified) {
            return NextResponse.json({ error: 'Please verify your email address before logging in.' }, { status: 403 });
        }

        await pool.query(
            `UPDATE users SET failed_login_attempts = 0, locked_until = NULL, account_status = 'active' WHERE id = $1`,
            [admin.id]
        );

        const accessToken = generateAccessToken(admin.id, admin.email, admin.role);
        const refreshToken = generateRefreshToken(admin.id);

        const deviceInfo = request.headers.get('user-agent') || 'Unknown device';
        await pool.query(
            `INSERT INTO sessions (user_id, refresh_token, device_info, ip_address, expires_at)
       VALUES ($1, $2, $3, $4, NOW() + INTERVAL '7 days')`,
            [admin.id, refreshToken, deviceInfo, clientIP]
        );

        // Log admin login
        await pool.query(
            `INSERT INTO admin_actions (admin_id, action_type, details)
       VALUES ($1, 'LOGIN', $2)`,
            [admin.id, `Admin logged in from IP: ${clientIP}`]
        );

        const response = NextResponse.json(
            { success: true, accessToken, user: { id: admin.id, email: admin.email, role: admin.role } },
            { status: 200 }
        );

        response.cookies.set('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60,
            path: '/',
        });

        return response;

    } catch (error) {
        console.error('Admin login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
