// Submit Assignment
// POST /api/assignments/[id]/submit

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { withStudent, type AuthenticatedRequest } from '@/lib/auth/middleware';
import { z } from 'zod';

const submitAssignmentSchema = z.object({
  content: z.any(), // Flexible content structure (answers, files, etc.)
  attemptNumber: z.number().int().min(1).default(1)
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withStudent(request, async (req: AuthenticatedRequest) => {
    try {
      const user = req.user;
      const assignmentId = params.id;
      const body = await request.json();

      // Validate input
      const validation = submitAssignmentSchema.safeParse(body);
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

      // Get assignment and verify student is enrolled
      const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
        include: {
          class: {
            include: {
              enrollments: {
                where: {
                  studentId: user.userId,
                  status: 'active'
                }
              },
              teacher: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        }
      });

      if (!assignment) {
        return NextResponse.json(
          { error: 'Assignment not found' },
          { status: 404 }
        );
      }

      if (assignment.class.enrollments.length === 0) {
        return NextResponse.json(
          { error: 'Not enrolled in this class' },
          { status: 403 }
        );
      }

      // Check if assignment is past due date
      if (assignment.dueDate && new Date() > assignment.dueDate) {
        return NextResponse.json(
          { error: 'Assignment submission deadline has passed' },
          { status: 400 }
        );
      }

      // Check previous submissions
      const previousSubmissions = await prisma.submission.findMany({
        where: {
          assignmentId,
          studentId: user.userId
        },
        orderBy: { attemptNumber: 'desc' }
      });

      const attemptNumber = previousSubmissions.length > 0 
        ? previousSubmissions[0].attemptNumber + 1 
        : 1;

      // Create submission
      const submission = await prisma.submission.create({
        data: {
          assignmentId,
          studentId: user.userId,
          content: data.content,
          attemptNumber,
          status: assignment.autoGrade ? 'graded' : 'submitted',
          submittedAt: new Date()
        },
        include: {
          assignment: {
            select: {
              id: true,
              title: true,
              type: true,
              points: true,
              autoGrade: true
            }
          }
        }
      });

      // Auto-grade if enabled
      let gradedSubmission = submission;
      if (assignment.autoGrade) {
        // TODO: Implement auto-grading logic with AI
        // For now, just mark as graded with pending score
        gradedSubmission = await prisma.submission.update({
          where: { id: submission.id },
          data: {
            status: 'graded',
            score: null, // Will be calculated by auto-grader
            maxScore: assignment.points,
            gradedBy: 'ai',
            gradedAt: new Date()
          },
          include: {
            assignment: {
              select: {
                id: true,
                title: true,
                type: true,
                points: true
              }
            }
          }
        });
      }

      // Notify teacher of new submission
      await prisma.notification.create({
        data: {
          userId: assignment.class.teacher.id,
          type: 'submission',
          title: 'New Assignment Submission',
          message: `New submission for ${assignment.title}`,
          read: false
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Assignment submitted successfully',
        submission: gradedSubmission
      }, { status: 201 });
    } catch (error) {
      console.error('Submit assignment error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}
