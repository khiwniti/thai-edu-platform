// Assignments API
// POST /api/assignments - Create assignment (Teacher)
// GET /api/assignments?classId=xxx - Get assignments for a class

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { withAuth, withTeacher, type AuthenticatedRequest } from '@/lib/auth/middleware';
import { z } from 'zod';

const createAssignmentSchema = z.object({
  classId: z.string().uuid(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  type: z.enum(['practice', 'quiz', 'project', 'homework']),
  dueDate: z.string().datetime().optional(),
  points: z.number().int().min(0).optional(),
  autoGrade: z.boolean().default(false),
  content: z.any().optional() // Flexible content structure
});

// POST - Create assignment (Teacher only)
export async function POST(request: NextRequest) {
  return withTeacher(request, async (req: AuthenticatedRequest) => {
    try {
      const user = req.user;
      const body = await request.json();

      // Validate input
      const validation = createAssignmentSchema.safeParse(body);
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

      // Verify teacher owns the class
      const classData = await prisma.class.findUnique({
        where: { id: data.classId },
        include: {
          enrollments: {
            where: { status: 'active' },
            select: { studentId: true }
          }
        }
      });

      if (!classData) {
        return NextResponse.json(
          { error: 'Class not found' },
          { status: 404 }
        );
      }

      if (classData.teacherId !== user.userId && user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Not authorized to create assignments for this class' },
          { status: 403 }
        );
      }

      // Create assignment
      const assignment = await prisma.assignment.create({
        data: {
          classId: data.classId,
          title: data.title,
          description: data.description,
          type: data.type,
          dueDate: data.dueDate ? new Date(data.dueDate) : null,
          points: data.points ?? 100,
          autoGrade: data.autoGrade,
          content: data.content || {}
        },
        include: {
          class: {
            select: {
              id: true,
              name: true,
              subject: true
            }
          },
          _count: {
            select: { submissions: true }
          }
        }
      });

      // Create notifications for all enrolled students
      const studentIds = classData.enrollments.map(e => e.studentId);
      if (studentIds.length > 0) {
        await prisma.notification.createMany({
          data: studentIds.map(studentId => ({
            userId: studentId,
            type: 'assignment',
            title: 'New Assignment',
            message: `New assignment in ${classData.name}: ${data.title}`,
            read: false
          }))
        });
      }

      return NextResponse.json({
        success: true,
        assignment
      }, { status: 201 });
    } catch (error) {
      console.error('Create assignment error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}

// GET - Get assignments
export async function GET(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const user = req.user;
      const { searchParams } = new URL(request.url);
      const classId = searchParams.get('classId');

      if (!classId) {
        return NextResponse.json(
          { error: 'classId parameter is required' },
          { status: 400 }
        );
      }

      // Verify access to class
      if (user.role === 'STUDENT') {
        const enrollment = await prisma.classEnrollment.findFirst({
          where: {
            classId,
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

        // Get assignments with student's submissions
        const assignments = await prisma.assignment.findMany({
          where: { classId },
          include: {
            submissions: {
              where: { studentId: user.userId },
              orderBy: { submittedAt: 'desc' }
            },
            _count: {
              select: { submissions: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({
          success: true,
          assignments
        });
      } else if (user.role === 'TEACHER' || user.role === 'ADMIN') {
        const classData = await prisma.class.findUnique({
          where: { id: classId }
        });

        if (!classData) {
          return NextResponse.json(
            { error: 'Class not found' },
            { status: 404 }
          );
        }

        if (user.role === 'TEACHER' && classData.teacherId !== user.userId) {
          return NextResponse.json(
            { error: 'Not authorized to view this class' },
            { status: 403 }
          );
        }

        // Get assignments with submission counts
        const assignments = await prisma.assignment.findMany({
          where: { classId },
          include: {
            _count: {
              select: { submissions: true }
            },
            submissions: {
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
              orderBy: { submittedAt: 'desc' },
              take: 5
            }
          },
          orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({
          success: true,
          assignments
        });
      }

      return NextResponse.json(
        { error: 'Invalid user role' },
        { status: 403 }
      );
    } catch (error) {
      console.error('Get assignments error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}
