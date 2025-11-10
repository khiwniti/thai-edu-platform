// Get Current User API Route
// GET /api/auth/me

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { withAuth, type AuthenticatedRequest } from '@/lib/auth/middleware';

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

      // Get full user data
      const fullUser = await prisma.user.findUnique({
        where: { id: user.userId },
        select: {
          id: true,
          email: true,
          role: true,
          firstName: true,
          lastName: true,
          thaiName: true,
          grade: true,
          school: true,
          province: true,
          learningStyle: true,
          isActive: true,
          createdAt: true,
          lastLogin: true,
          // Include related data based on role
          ...(user.role === 'STUDENT' && {
            enrollments: {
              include: {
                class: {
                  select: {
                    id: true,
                    name: true,
                    subject: true,
                    gradeLevel: true
                  }
                }
              }
            },
            performanceMetrics: {
              take: 10,
              orderBy: { updatedAt: 'desc' }
            },
            weakAreas: {
              where: { status: 'active' },
              orderBy: { identifiedAt: 'desc' }
            }
          }),
          ...(user.role === 'TEACHER' && {
            classes: {
              select: {
                id: true,
                name: true,
                subject: true,
                gradeLevel: true,
                enrollmentCode: true,
                _count: {
                  select: { enrollments: true }
                }
              }
            }
          })
        }
      });

      if (!fullUser) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        user: fullUser
      });
    } catch (error) {
      console.error('Get user error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}
