// Theme Preferences API Route
// GET/POST /api/preferences/theme

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { withAuth, type AuthenticatedRequest } from '@/lib/auth/middleware';

// GET current theme preference
export async function GET(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const user = req.user;

      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      // Get user's theme preference
      const userData = await prisma.user.findUnique({
        where: { id: user.userId },
        select: {
          theme: true,
        }
      });

      if (!userData) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        theme: userData.theme
      });
    } catch (error) {
      console.error('Get theme preference error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}

// POST update theme preference
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

      const body = await request.json();
      const { theme } = body;

      // Validate theme value
      if (!theme || !['light', 'dark', 'system'].includes(theme)) {
        return NextResponse.json(
          { error: 'Invalid theme value. Must be "light", "dark", or "system"' },
          { status: 400 }
        );
      }

      // Update user's theme preference
      const updatedUser = await prisma.user.update({
        where: { id: user.userId },
        data: { theme },
        select: {
          id: true,
          theme: true,
        }
      });

      return NextResponse.json({
        success: true,
        theme: updatedUser.theme,
        message: 'Theme preference updated successfully'
      });
    } catch (error) {
      console.error('Update theme preference error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}
