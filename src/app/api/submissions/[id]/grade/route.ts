// Grade Submission
// POST /api/submissions/[id]/grade

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { withTeacher, type AuthenticatedRequest } from '@/lib/auth/middleware';
import { z } from 'zod';

const gradeSubmissionSchema = z.object({
  score: z.number().min(0),
  maxScore: z.number().min(0),
  feedback: z.string().optional(),
  rubricScores: z.array(z.object({
    criteriaId: z.string(),
    score: z.number(),
    feedback: z.string().optional()
  })).optional()
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withTeacher(request, async (req: AuthenticatedRequest) => {
    try {
      const user = req.user;
      const submissionId = params.id;
      const body = await request.json();

      // Validate input
      const validation = gradeSubmissionSchema.safeParse(body);
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

      // Get submission and verify teacher owns the class
      const submission = await prisma.submission.findUnique({
        where: { id: submissionId },
        include: {
          assignment: {
            include: {
              class: {
                select: {
                  teacherId: true,
                  name: true
                }
              }
            }
          },
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              thaiName: true,
              email: true
            }
          }
        }
      });

      if (!submission) {
        return NextResponse.json(
          { error: 'Submission not found' },
          { status: 404 }
        );
      }

      if (submission.assignment.class.teacherId !== user.userId && user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Not authorized to grade this submission' },
          { status: 403 }
        );
      }

      // Calculate percentage
      const percentage = (data.score / data.maxScore) * 100;

      // Update submission with grade
      const gradedSubmission = await prisma.submission.update({
        where: { id: submissionId },
        data: {
          score: data.score,
          maxScore: data.maxScore,
          feedback: data.feedback,
          rubricScores: data.rubricScores || [],
          gradedBy: 'teacher',
          gradedAt: new Date(),
          status: 'graded'
        },
        include: {
          assignment: {
            select: {
              id: true,
              title: true,
              type: true,
              points: true
            }
          },
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              thaiName: true
            }
          }
        }
      });

      // Update performance metrics
      await prisma.performanceMetric.upsert({
        where: {
          studentId_conceptId: {
            studentId: submission.studentId,
            conceptId: submission.assignment.id // Using assignment as concept
          }
        },
        create: {
          studentId: submission.studentId,
          conceptId: submission.assignment.id,
          subject: submission.assignment.class.name,
          masteryLevel: percentage / 100,
          attempts: 1,
          averageScore: data.score,
          timeSpent: 0, // TODO: Track actual time
          lastPracticed: new Date()
        },
        update: {
          attempts: { increment: 1 },
          averageScore: {
            // Calculate running average
            increment: (data.score / (submission.attemptNumber || 1))
          },
          masteryLevel: percentage / 100,
          lastPracticed: new Date()
        }
      });

      // Identify weak areas if score is low
      if (percentage < 60) {
        await prisma.weakArea.upsert({
          where: {
            studentId_conceptId: {
              studentId: submission.studentId,
              conceptId: submission.assignment.id
            }
          },
          create: {
            studentId: submission.studentId,
            conceptId: submission.assignment.id,
            conceptName: submission.assignment.title,
            severity: percentage < 40 ? 'high' : 'medium',
            attempts: 1,
            averageScore: data.score,
            status: 'active'
          },
          update: {
            attempts: { increment: 1 },
            averageScore: data.score,
            severity: percentage < 40 ? 'high' : 'medium'
          }
        });
      }

      // Notify student of grade
      await prisma.notification.create({
        data: {
          userId: submission.studentId,
          type: 'grade',
          title: 'Assignment Graded',
          message: `Your submission for "${submission.assignment.title}" has been graded`,
          read: false
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Submission graded successfully',
        submission: gradedSubmission,
        percentage: Math.round(percentage * 10) / 10
      });
    } catch (error) {
      console.error('Grade submission error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}
