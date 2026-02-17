import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { hashPassword, generateEmailVerificationToken, validatePasswordStrength } from '@/lib/auth';
import { isValidEmail, sanitizeInput } from '@/lib/security';
import { sendVerificationEmail } from '@/lib/email';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
    try {
        const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

        const rateLimit = await checkRateLimit(clientIP, 'auth');
        if (!rateLimit.allowed) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.', resetAt: rateLimit.resetAt },
                { status: 429 }
            );
        }

        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        const sanitizedEmail = sanitizeInput(email.toLowerCase());

        if (!isValidEmail(sanitizedEmail)) {
            return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
        }

        const passwordValidation = validatePasswordStrength(password);
        if (!passwordValidation.isValid) {
            return NextResponse.json({ error: passwordValidation.error }, { status: 400 });
        }

        const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [sanitizedEmail]);

        if (existingUser.rows.length > 0) {
            return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
        }

        const hashedPassword = await hashPassword(password);
        const verificationToken = generateEmailVerificationToken();

        const result = await pool.query(
            `INSERT INTO users (email, password, role, verification_token, email_verified, account_status)
       VALUES ($1, $2, 'USER', $3, FALSE, 'active')
       RETURNING id, email, role, created_at`,
            [sanitizedEmail, hashedPassword, verificationToken]
        );

        const user = result.rows[0];

        sendVerificationEmail(sanitizedEmail, verificationToken, 'user')
            .catch(error => console.error('Error sending verification email:', error));

        return NextResponse.json(
            {
                success: true,
                message: 'Account created successfully. Please check your email to verify your account.',
                user: { id: user.id, email: user.email, role: user.role },
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('User signup error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
