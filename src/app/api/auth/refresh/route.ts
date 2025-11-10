// Refresh Token API Route
// POST /api/auth/refresh

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken, generateAccessToken, setAuthCookies } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookie or body
    let refreshToken = request.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      const body = await request.json();
      refreshToken = body.refreshToken;
    }

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token provided' },
        { status: 401 }
      );
    }

    // Verify refresh token
    const payload = await verifyToken(refreshToken);

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    // Check if session exists and is valid
    if (payload.sessionId) {
      const session = await prisma.session.findUnique({
        where: { sessionToken: payload.sessionId }
      });

      if (!session) {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 401 }
        );
      }

      if (session.expires < new Date()) {
        // Session expired, delete it
        await prisma.session.delete({
          where: { sessionToken: payload.sessionId }
        });

        return NextResponse.json(
          { error: 'Session expired' },
          { status: 401 }
        );
      }
    }

    // Get updated user data
    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: 'User not found or inactive' },
        { status: 401 }
      );
    }

    // Generate new access token
    const newAccessToken = await generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      sessionId: payload.sessionId
    });

    // Update cookies
    setAuthCookies(newAccessToken, refreshToken);

    return NextResponse.json({
      success: true,
      accessToken: newAccessToken
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
