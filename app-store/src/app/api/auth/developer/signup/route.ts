import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { hashPassword, generateEmailVerificationToken, validatePasswordStrength } from '@/lib/auth';
import { isValidEmail, sanitizeInput } from '@/lib/security';
import { sendVerificationEmail } from '@/lib/email';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
    try {
        // Get client IP for rate limiting
        const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

        // TEMPORARY: Rate limiting disabled for local development due to IPv6 DNS issue
        // TODO: Re-enable once IPv6 connectivity is fixed or database connection is working
        /*
        const rateLimit = await checkRateLimit(clientIP, 'auth');
        if (!rateLimit.allowed) {
            return NextResponse.json(
                {
                    error: 'Too many requests. Please try again later.',
                    resetAt: rateLimit.resetAt
                },
                { status: 429 }
            );
        }
        */

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

        // Validate email format
        if (!isValidEmail(sanitizedEmail)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        // Validate password strength
        const passwordValidation = validatePasswordStrength(password);
        if (!passwordValidation.isValid) {
            return NextResponse.json(
                { error: passwordValidation.error },
                { status: 400 }
            );
        }

        // Check if email already exists
        const db = await connectDB();
        const usersCollection = db.collection('users');

        const existingUser = await usersCollection.findOne({ email: sanitizedEmail });

        if (existingUser) {
            return NextResponse.json(
                { error: 'Email already registered' },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Generate verification token
        const verificationToken = generateEmailVerificationToken();

        // Create user
        const newUser = {
            email: sanitizedEmail,
            password: hashedPassword,
            role: 'DEVELOPER' as const,
            verification_token: verificationToken,
            email_verified: false,
            account_status: 'active',
            created_at: new Date()
        };

        const result = await usersCollection.insertOne(newUser);
        const user = { ...newUser, id: result.insertedId };

        // Send verification email (don't await to avoid blocking response)
        sendVerificationEmail(sanitizedEmail, verificationToken, 'developer')
            .catch(error => console.error('Error sending verification email:', error));

        return NextResponse.json(
            {
                success: true,
                message: 'Account created successfully. Please check your email to verify your account.',
                user: {
                    id: user.id.toString(),
                    email: user.email,
                    role: user.role,
                },
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
