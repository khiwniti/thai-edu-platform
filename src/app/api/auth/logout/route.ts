// Logout API Route
// POST /api/auth/logout

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { clearAuthCookies } from '@/lib/auth/jwt';
import { withAuth, type AuthenticatedRequest } from '@/lib/auth/middleware';

export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const user = req.user;

      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      // Delete session from database
      if (user.sessionId) {
        await prisma.session.delete({
          where: { sessionToken: user.sessionId }
        }).catch(() => {
          // Session might already be deleted, ignore error
        });
      }

      // Clear cookies
      clearAuthCookies();

      return NextResponse.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Logout error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}
