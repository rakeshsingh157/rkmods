import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, TokenPayload } from '@/lib/auth';

// Extend NextRequest to include user data
export interface AuthenticatedRequest extends NextRequest {
    user?: TokenPayload;
}

/**
 * Middleware to authenticate requests using JWT
 * Extracts token from Authorization header and verifies it
 */
export async function authenticateRequest(
    request: NextRequest
): Promise<{ authenticated: boolean; user?: TokenPayload; error?: string }> {
    try {
        // Get Authorization header
        const authHeader = request.headers.get('authorization');

        if (!authHeader) {
            return { authenticated: false, error: 'No authorization header' };
        }

        // Extract token (format: "Bearer <token>")
        const parts = authHeader.split(' ');

        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return { authenticated: false, error: 'Invalid authorization format' };
        }

        const token = parts[1];

        // Verify token
        const payload = verifyAccessToken(token);

        return { authenticated: true, user: payload };

    } catch (error) {
        return { authenticated: false, error: 'Invalid or expired token' };
    }
}

/**
 * Create authentication middleware for API routes
 * Returns 401 if not authenticated
 */
export function requireAuth(
    handler: (request: NextRequest, user: TokenPayload) => Promise<NextResponse>
) {
    return async (request: NextRequest): Promise<NextResponse> => {
        const { authenticated, user, error } = await authenticateRequest(request);

        if (!authenticated || !user) {
            return NextResponse.json(
                { error: error || 'Unauthorized' },
                { status: 401 }
            );
        }

        return handler(request, user);
    };
}

/**
 * Optional authentication - doesn't fail if no token
 * Useful for endpoints that work differently for authenticated users
 */
export async function optionalAuth(
    request: NextRequest
): Promise<TokenPayload | null> {
    const { authenticated, user } = await authenticateRequest(request);
    return authenticated && user ? user : null;
}
