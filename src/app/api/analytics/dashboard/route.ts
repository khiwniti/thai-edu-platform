// Dashboard Analytics API
// GET /api/analytics/dashboard - Get dashboard data for current user

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { withAuth, type AuthenticatedRequest } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const user = req.user;

      if (user.role === 'STUDENT') {
        return await getStudentDashboard(user.userId);
      } else if (user.role === 'TEACHER') {
        return await getTeacherDashboard(user.userId);
      } else if (user.role === 'ADMIN') {
        return await getAdminDashboard();
      }

      return NextResponse.json(
        { error: 'Invalid user role' },
        { status: 403 }
      );
    } catch (error) {
      console.error('Dashboard error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}

async function getStudentDashboard(studentId: string) {
  // Get enrolled classes
  const enrollments = await prisma.classEnrollment.findMany({
    where: { 
      studentId,
      status: 'active'
    },
    include: {
      class: {
        include: {
          teacher: {
            select: {
              firstName: true,
              lastName: true,
              thaiName: true
            }
          }
        }
      }
    }
  });

  // Get recent submissions
  const recentSubmissions = await prisma.submission.findMany({
    where: { studentId },
    include: {
      assignment: {
        select: {
          title: true,
          type: true,
          points: true
        }
      }
    },
    orderBy: { submittedAt: 'desc' },
    take: 10
  });

  // Get performance metrics
  const performanceMetrics = await prisma.performanceMetric.findMany({
    where: { studentId },
    orderBy: { lastPracticed: 'desc' }
  });

  // Calculate overall statistics
  const gradedSubmissions = recentSubmissions.filter(s => s.status === 'graded' && s.score !== null);
  const averageScore = gradedSubmissions.length > 0
    ? gradedSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) / gradedSubmissions.length
    : 0;

  const completionRate = recentSubmissions.length > 0
    ? (gradedSubmissions.length / recentSubmissions.length) * 100
    : 0;

  // Get weak areas
  const weakAreas = await prisma.weakArea.findMany({
    where: { 
      studentId,
      status: 'active'
    },
    orderBy: { severity: 'desc' },
    take: 5
  });

  // Get upcoming assignments
  const upcomingAssignments = await prisma.assignment.findMany({
    where: {
      classId: {
        in: enrollments.map(e => e.classId)
      },
      dueDate: {
        gte: new Date()
      }
    },
    include: {
      class: {
        select: {
          name: true
        }
      },
      submissions: {
        where: { studentId },
        select: { id: true, status: true }
      }
    },
    orderBy: { dueDate: 'asc' },
    take: 10
  });

  // Get recent notifications
  const notifications = await prisma.notification.findMany({
    where: { userId: studentId },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  return NextResponse.json({
    success: true,
    dashboard: {
      overview: {
        totalClasses: enrollments.length,
        averageScore: Math.round(averageScore * 10) / 10,
        completionRate: Math.round(completionRate * 10) / 10,
        totalSubmissions: recentSubmissions.length
      },
      classes: enrollments.map(e => e.class),
      recentSubmissions: recentSubmissions.slice(0, 5),
      weakAreas,
      upcomingAssignments,
      performanceMetrics: performanceMetrics.slice(0, 10),
      notifications: notifications.filter(n => !n.read).slice(0, 5)
    }
  });
}

async function getTeacherDashboard(teacherId: string) {
  // Get teacher's classes
  const classes = await prisma.class.findMany({
    where: { 
      teacherId,
      status: 'active'
    },
    include: {
      _count: {
        select: {
          enrollments: true,
          assignments: true
        }
      }
    }
  });

  // Get total student count
  const totalStudents = await prisma.classEnrollment.count({
    where: {
      classId: {
        in: classes.map(c => c.id)
      },
      status: 'active'
    }
  });

  // Get pending submissions to grade
  const pendingSubmissions = await prisma.submission.findMany({
    where: {
      assignment: {
        classId: {
          in: classes.map(c => c.id)
        }
      },
      status: 'submitted'
    },
    include: {
      student: {
        select: {
          firstName: true,
          lastName: true,
          thaiName: true
        }
      },
      assignment: {
        select: {
          title: true,
          type: true
        }
      }
    },
    orderBy: { submittedAt: 'desc' }
  });

  // Get recent graded submissions
  const recentGraded = await prisma.submission.findMany({
    where: {
      assignment: {
        classId: {
          in: classes.map(c => c.id)
        }
      },
      status: 'graded',
      gradedAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
      }
    },
    include: {
      student: {
        select: {
          firstName: true,
          lastName: true
        }
      },
      assignment: {
        select: {
          title: true
        }
      }
    }
  });

  // Calculate average class performance
  const classPerformance = await Promise.all(
    classes.map(async (cls) => {
      const submissions = await prisma.submission.findMany({
        where: {
          assignment: { classId: cls.id },
          status: 'graded',
          score: { not: null }
        }
      });

      const avgScore = submissions.length > 0
        ? submissions.reduce((sum, s) => sum + (s.score || 0), 0) / submissions.length
        : 0;

      return {
        classId: cls.id,
        className: cls.name,
        studentCount: cls._count.enrollments,
        averageScore: Math.round(avgScore * 10) / 10
      };
    })
  );

  // Get notifications
  const notifications = await prisma.notification.findMany({
    where: { userId: teacherId },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  return NextResponse.json({
    success: true,
    dashboard: {
      overview: {
        totalClasses: classes.length,
        totalStudents,
        pendingGrading: pendingSubmissions.length,
        recentlyGraded: recentGraded.length
      },
      classes,
      classPerformance,
      pendingSubmissions: pendingSubmissions.slice(0, 10),
      recentActivity: recentGraded.slice(0, 10),
      notifications: notifications.filter(n => !n.read).slice(0, 5)
    }
  });
}

async function getAdminDashboard() {
  // Get platform-wide statistics
  const [totalUsers, totalClasses, totalSubmissions, activeClasses] = await Promise.all([
    prisma.user.count(),
    prisma.class.count(),
    prisma.submission.count(),
    prisma.class.count({ where: { status: 'active' } })
  ]);

  const [studentCount, teacherCount] = await Promise.all([
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.user.count({ where: { role: 'TEACHER' } })
  ]);

  // Get recent activity
  const recentClasses = await prisma.class.findMany({
    include: {
      teacher: {
        select: {
          firstName: true,
          lastName: true
        }
      },
      _count: {
        select: { enrollments: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  return NextResponse.json({
    success: true,
    dashboard: {
      overview: {
        totalUsers,
        totalClasses,
        activeClasses,
        totalSubmissions,
        studentCount,
        teacherCount
      },
      recentClasses
    }
  });
}
