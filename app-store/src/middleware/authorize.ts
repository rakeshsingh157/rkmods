import { NextRequest, NextResponse } from 'next/server';
import { TokenPayload } from '@/lib/auth';

type UserRole = 'USER' | 'DEVELOPER' | 'ADMIN';

/**
 * Middleware to check if user has required role(s)
 * Must be used after authentication middleware
 */
export function requireRoles(...allowedRoles: UserRole[]) {
    return (
        handler: (request: NextRequest, user: TokenPayload) => Promise<NextResponse>
    ) => {
        return async (request: NextRequest, user: TokenPayload): Promise<NextResponse> => {
            // Check if user's role is in allowed roles
            if (!allowedRoles.includes(user.role)) {
                return NextResponse.json(
                    { error: 'Forbidden: Insufficient permissions' },
                    { status: 403 }
                );
            }

            return handler(request, user);
        };
    };
}

/**
 * Check if user has specific role
 */
export function hasRole(user: TokenPayload, role: UserRole): boolean {
    return user.role === role;
}

/**
 * Check if user is admin
 */
export function isAdmin(user: TokenPayload): boolean {
    return user.role === 'ADMIN';
}

/**
 * Check if user is developer
 */
export function isDeveloper(user: TokenPayload): boolean {
    return user.role === 'DEVELOPER';
}

/**
 * Check if user is regular user
 */
export function isRegularUser(user: TokenPayload): boolean {
    return user.role === 'USER';
}
