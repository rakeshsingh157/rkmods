import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyPassword, generateAccessToken, generateRefreshToken, calculateLockDuration } from '@/lib/auth';
import { sanitizeInput } from '@/lib/security';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
    try {
        // Get client IP for rate limiting
        const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

        // Rate limiting check (stricter for login)
        const rateLimit = await checkRateLimit(clientIP, 'auth');
        if (!rateLimit.allowed) {
            return NextResponse.json(
                {
                    error: 'Too many login attempts. Please try again later.',
                    resetAt: rateLimit.resetAt
                },
                { status: 429 }
            );
        }

        const body = await request.json();
        const { email, password } = body;

        // Validate required fields
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Sanitize email
        const sanitizedEmail = sanitizeInput(email.toLowerCase());

        // Get user from database
        const db = await connectDB();
        const usersCollection = db.collection('users');

        const user = await usersCollection.findOne({
            email: sanitizedEmail,
            role: 'DEVELOPER'
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Check if account is locked
        if (user.locked_until && new Date(user.locked_until) > new Date()) {
            const minutesRemaining = Math.ceil(
                (new Date(user.locked_until).getTime() - Date.now()) / 60000
            );
            return NextResponse.json(
                {
                    error: `Account is locked. Please try again in ${minutesRemaining} minutes.`,
                    lockedUntil: user.locked_until
                },
                { status: 423 }
            );
        }

        // Check if account is suspended
        if (user.account_status === 'suspended') {
            return NextResponse.json(
                { error: 'Account has been suspended. Please contact support.' },
                { status: 403 }
            );
        }

        // Verify password
        const isValidPassword = await verifyPassword(password, user.password);

        if (!isValidPassword) {
            // Increment failed login attempts
            const newAttempts = user.failed_login_attempts + 1;
            const lockDuration = calculateLockDuration(newAttempts);

            if (lockDuration > 0) {
                const lockedUntil = new Date(Date.now() + lockDuration * 60000);
                await usersCollection.updateOne(
                    { _id: user._id },
                    {
                        $set: {
                            failed_login_attempts: newAttempts,
                            locked_until: lockedUntil,
                            account_status: 'locked'
                        }
                    }
                );

                return NextResponse.json(
                    {
                        error: `Too many failed attempts. Account locked for ${lockDuration} minutes.`,
                        lockedUntil
                    },
                    { status: 423 }
                );
            } else {
                await usersCollection.updateOne(
                    { _id: user._id },
                    { $set: { failed_login_attempts: newAttempts } }
                );
            }

            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Check if email is verified
        if (!user.email_verified) {
            return NextResponse.json(
                { error: 'Please verify your email address before logging in.' },
                { status: 403 }
            );
        }

        // Reset failed login attempts and unlock account
        await usersCollection.updateOne(
            { _id: user._id },
            {
                $set: {
                    failed_login_attempts: 0,
                    locked_until: null,
                    account_status: 'active'
                }
            }
        );

        // Generate tokens
        const userId = user._id.toString();
        const accessToken = generateAccessToken(userId, user.email, user.role);
        const refreshToken = generateRefreshToken(userId);

        // Store refresh token in database
        const sessionsCollection = db.collection('sessions');
        const deviceInfo = request.headers.get('user-agent') || 'Unknown device';
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        await sessionsCollection.insertOne({
            user_id: user._id,
            refresh_token: refreshToken,
            device_info: deviceInfo,
            ip_address: clientIP,
            expires_at: expiresAt,
            created_at: new Date()
        });

        // Create response with httpOnly cookie for refresh token
        const response = NextResponse.json(
            {
                success: true,
                accessToken,
                user: {
                    id: userId,
                    email: user.email,
                    role: user.role,
                },
            },
            { status: 200 }
        );

        // Set httpOnly cookie for refresh token
        response.cookies.set('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/',
        });

        return response;

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
