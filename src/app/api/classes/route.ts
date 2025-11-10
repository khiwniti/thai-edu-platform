// Classes API Routes
// POST /api/classes - Create new class
// GET /api/classes - Get teacher's classes or student's enrolled classes

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { withAuth, withTeacher, type AuthenticatedRequest } from '@/lib/auth/middleware';
import { z } from 'zod';

const createClassSchema = z.object({
  name: z.string().min(1, 'Class name is required'),
  subject: z.string().min(1, 'Subject is required'),
  gradeLevel: z.number().int().min(1).max(12),
  description: z.string().optional()
});

// POST - Create new class (Teachers only)
export async function POST(request: NextRequest) {
  return withTeacher(request, async (req: AuthenticatedRequest) => {
    try {
      const user = req.user;
      const body = await request.json();

      // Validate input
      const validation = createClassSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: validation.error.errors
          },
          { status: 400 }
        );
      }

      const data = validation.data;

      // Generate unique enrollment code
      const enrollmentCode = generateEnrollmentCode();

      // Create class
      const newClass = await prisma.class.create({
        data: {
          name: data.name,
          subject: data.subject,
          gradeLevel: data.gradeLevel,
          description: data.description,
          teacherId: user.userId,
          enrollmentCode,
          status: 'active'
        },
        include: {
          teacher: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              thaiName: true,
              email: true
            }
          },
          _count: {
            select: { enrollments: true }
          }
        }
      });

      return NextResponse.json({
        success: true,
        class: newClass
      }, { status: 201 });
    } catch (error) {
      console.error('Create class error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}

// GET - Get classes (role-dependent)
export async function GET(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const user = req.user;

      if (user.role === 'TEACHER' || user.role === 'ADMIN') {
        // Get classes taught by this teacher
        const classes = await prisma.class.findMany({
          where: { teacherId: user.userId },
          include: {
            _count: {
              select: { 
                enrollments: true,
                assignments: true
              }
            },
            enrollments: {
              take: 5,
              include: {
                student: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    thaiName: true
                  }
                }
              },
              orderBy: { enrolledAt: 'desc' }
            }
          },
          orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({
          success: true,
          classes
        });
      } else if (user.role === 'STUDENT') {
        // Get classes enrolled by this student
        const enrollments = await prisma.classEnrollment.findMany({
          where: { 
            studentId: user.userId,
            status: 'active'
          },
          include: {
            class: {
              include: {
                teacher: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    thaiName: true
                  }
                },
                _count: {
                  select: { assignments: true }
                }
              }
            }
          },
          orderBy: { enrolledAt: 'desc' }
        });

        const classes = enrollments.map(e => e.class);

        return NextResponse.json({
          success: true,
          classes
        });
      }

      return NextResponse.json(
        { error: 'Invalid user role' },
        { status: 403 }
      );
    } catch (error) {
      console.error('Get classes error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}

// Helper function to generate enrollment code
function generateEnrollmentCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
