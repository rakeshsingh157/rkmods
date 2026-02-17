import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        // Get token from query params
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json(
                { error: 'Verification token is required' },
                { status: 400 }
            );
        }

        // Find user with this verification token
        const db = await connectDB();
        const usersCollection = db.collection('users');

        const user = await usersCollection.findOne({
            verification_token: token,
            email_verified: false
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid or expired verification token' },
                { status: 400 }
            );
        }

        // Mark email as verified
        await usersCollection.updateOne(
            { _id: user._id },
            {
                $set: {
                    email_verified: true,
                    verification_token: null
                }
            }
        );

        return NextResponse.json(
            {
                success: true,
                message: 'Email verified successfully! You can now log in.',
                user: {
                    email: user.email,
                    role: user.role,
                },
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Email verification error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
