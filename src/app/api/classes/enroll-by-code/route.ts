// Enroll by Code
// POST /api/classes/enroll-by-code

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { withStudent, type AuthenticatedRequest } from '@/lib/auth/middleware';
import { z } from 'zod';

const enrollByCodeSchema = z.object({
  enrollmentCode: z.string().length(6, 'Enrollment code must be 6 characters')
});

export async function POST(request: NextRequest) {
  return withStudent(request, async (req: AuthenticatedRequest) => {
    try {
      const user = req.user;
      const body = await request.json();

      // Validate input
      const validation = enrollByCodeSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: validation.error.errors
          },
          { status: 400 }
        );
      }

      const { enrollmentCode } = validation.data;

      // Find class by enrollment code
      const classData = await prisma.class.findUnique({
        where: { enrollmentCode: enrollmentCode.toUpperCase() },
        include: {
          teacher: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              thaiName: true
            }
          }
        }
      });

      if (!classData) {
        return NextResponse.json(
          { error: 'Invalid enrollment code' },
          { status: 404 }
        );
      }

      if (classData.status !== 'active') {
        return NextResponse.json(
          { error: 'Class is not accepting enrollments' },
          { status: 400 }
        );
      }

      // Check if already enrolled
      const existingEnrollment = await prisma.classEnrollment.findFirst({
        where: {
          classId: classData.id,
          studentId: user.userId
        }
      });

      if (existingEnrollment) {
        if (existingEnrollment.status === 'active') {
          return NextResponse.json(
            { error: 'Already enrolled in this class' },
            { status: 409 }
          );
        } else {
          // Reactivate enrollment
          const reactivated = await prisma.classEnrollment.update({
            where: { id: existingEnrollment.id },
            data: { status: 'active' },
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
                  }
                }
              }
            }
          });

          return NextResponse.json({
            success: true,
            message: 'Re-enrolled in class',
            enrollment: reactivated
          });
        }
      }

      // Create new enrollment
      const enrollment = await prisma.classEnrollment.create({
        data: {
          classId: classData.id,
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
              }
            }
          }
        }
      });

      // Create notification for teacher
      await prisma.notification.create({
        data: {
          userId: classData.teacherId,
          type: 'enrollment',
          title: 'New Student Enrolled',
          message: `A new student has enrolled in your class: ${classData.name}`,
          read: false
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Successfully enrolled in class',
        enrollment
      }, { status: 201 });
    } catch (error) {
      console.error('Enroll by code error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}
