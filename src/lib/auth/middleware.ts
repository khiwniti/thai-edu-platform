// Authentication Middleware - Request Authorization
// Thai Education Platform

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractBearerToken, type JWTPayload } from './jwt';
import type { UserRole } from '@prisma/client';

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

/**
 * Middleware to verify JWT token
 */
export async function withAuth(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // Try to get token from Authorization header
    const authHeader = request.headers.get('Authorization');
    let token = extractBearerToken(authHeader);

    // If no bearer token, try to get from cookies
    if (!token) {
      token = request.cookies.get('accessToken')?.value || null;
    }

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    // Verify token
    const payload = await verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Attach user to request
    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.user = payload;

    // Call handler
    return await handler(authenticatedRequest);
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { error: 'Unauthorized - Authentication failed' },
      { status: 401 }
    );
  }
}

/**
 * Middleware to require specific roles
 */
export function withRole(allowedRoles: UserRole[]) {
  return async (
    request: NextRequest,
    handler: (req: AuthenticatedRequest) => Promise<NextResponse>
  ): Promise<NextResponse> => {
    return withAuth(request, async (req: AuthenticatedRequest) => {
      const user = req.user;

      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      if (!allowedRoles.includes(user.role as UserRole)) {
        return NextResponse.json(
          { error: 'Forbidden - Insufficient permissions' },
          { status: 403 }
        );
      }

      return await handler(req);
    });
  };
}

/**
 * Middleware to require admin role
 */
export async function withAdmin(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  return withRole(['ADMIN'])(request, handler);
}

/**
 * Middleware to require teacher or admin role
 */
export async function withTeacher(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  return withRole(['TEACHER', 'ADMIN'])(request, handler);
}

/**
 * Middleware to require student role
 */
export async function withStudent(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  return withRole(['STUDENT'])(request, handler);
}

/**
 * Optional authentication - doesn't fail if no token
 */
export async function withOptionalAuth(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const authHeader = request.headers.get('Authorization');
    let token = extractBearerToken(authHeader);

    if (!token) {
      token = request.cookies.get('accessToken')?.value || null;
    }

    if (token) {
      const payload = await verifyToken(token);
      if (payload) {
        const authenticatedRequest = request as AuthenticatedRequest;
        authenticatedRequest.user = payload;
      }
    }

    return await handler(request as AuthenticatedRequest);
  } catch (error) {
    // Continue without authentication
    return await handler(request as AuthenticatedRequest);
  }
}
