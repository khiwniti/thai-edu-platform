// Get Class by ID and Update Class
// GET /api/classes/[id]
// PUT /api/classes/[id]
// DELETE /api/classes/[id]

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { withAuth, withTeacher, type AuthenticatedRequest } from '@/lib/auth/middleware';
import { z } from 'zod';

const updateClassSchema = z.object({
  name: z.string().min(1).optional(),
  subject: z.string().min(1).optional(),
  gradeLevel: z.number().int().min(1).max(12).optional(),
  description: z.string().optional(),
  status: z.enum(['active', 'archived']).optional()
});

// GET - Get class by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const user = req.user;
      const classId = params.id;

      // Get class with full details
      const classData = await prisma.class.findUnique({
        where: { id: classId },
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
          enrollments: {
            include: {
              student: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  thaiName: true,
                  email: true,
                  grade: true
                }
              }
            },
            orderBy: { enrolledAt: 'desc' }
          },
          assignments: {
            include: {
              _count: {
                select: { submissions: true }
              }
            },
            orderBy: { createdAt: 'desc' }
          },
          _count: {
            select: {
              enrollments: true,
              assignments: true
            }
          }
        }
      });

      if (!classData) {
        return NextResponse.json(
          { error: 'Class not found' },
          { status: 404 }
        );
      }

      // Check access permissions
      if (user.role === 'STUDENT') {
        const enrollment = await prisma.classEnrollment.findFirst({
          where: {
            classId: classId,
            studentId: user.userId,
            status: 'active'
          }
        });

        if (!enrollment) {
          return NextResponse.json(
            { error: 'Not enrolled in this class' },
            { status: 403 }
          );
        }
      } else if (user.role === 'TEACHER' && classData.teacherId !== user.userId) {
        return NextResponse.json(
          { error: 'Not authorized to view this class' },
          { status: 403 }
        );
      }

      return NextResponse.json({
        success: true,
        class: classData
      });
    } catch (error) {
      console.error('Get class error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}

// PUT - Update class (Teacher only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withTeacher(request, async (req: AuthenticatedRequest) => {
    try {
      const user = req.user;
      const classId = params.id;
      const body = await request.json();

      // Validate input
      const validation = updateClassSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: validation.error.errors
          },
          { status: 400 }
        );
      }

      // Check if class exists and belongs to teacher
      const existingClass = await prisma.class.findUnique({
        where: { id: classId }
      });

      if (!existingClass) {
        return NextResponse.json(
          { error: 'Class not found' },
          { status: 404 }
        );
      }

      if (existingClass.teacherId !== user.userId && user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Not authorized to update this class' },
          { status: 403 }
        );
      }

      // Update class
      const updatedClass = await prisma.class.update({
        where: { id: classId },
        data: validation.data,
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
            select: { enrollments: true }
          }
        }
      });

      return NextResponse.json({
        success: true,
        class: updatedClass
      });
    } catch (error) {
      console.error('Update class error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}

// DELETE - Archive class (Teacher only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withTeacher(request, async (req: AuthenticatedRequest) => {
    try {
      const user = req.user;
      const classId = params.id;

      // Check if class exists and belongs to teacher
      const existingClass = await prisma.class.findUnique({
        where: { id: classId }
      });

      if (!existingClass) {
        return NextResponse.json(
          { error: 'Class not found' },
          { status: 404 }
        );
      }

      if (existingClass.teacherId !== user.userId && user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Not authorized to delete this class' },
          { status: 403 }
        );
      }

      // Archive class instead of deleting
      const archivedClass = await prisma.class.update({
        where: { id: classId },
        data: { status: 'archived' }
      });

      return NextResponse.json({
        success: true,
        message: 'Class archived successfully',
        class: archivedClass
      });
    } catch (error) {
      console.error('Delete class error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}
