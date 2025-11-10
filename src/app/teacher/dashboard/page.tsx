'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Icons } from '@/components/ui/icons';
import Link from 'next/link';

interface Class {
  id: string;
  name: string;
  subject: string;
  gradeLevel: number;
  studentCount: number;
  averageScore?: number;
}

interface PendingSubmission {
  id: string;
  assignmentTitle: string;
  studentName: string;
  submittedAt: string;
  classId: string;
  className: string;
}

const navItems = [
  { title: 'แดชบอร์ด', href: '/teacher/dashboard', icon: 'home' as const },
  { title: 'คลาสเรียน', href: '/teacher/classes', icon: 'bookOpen' as const },
  { title: 'งานที่มอบหมาย', href: '/teacher/assignments', icon: 'fileText' as const },
  { title: 'นักเรียน', href: '/teacher/students', icon: 'users' as const },
  { title: 'รายงาน', href: '/teacher/reports', icon: 'barChart' as const },
];

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<Class[]>([]);
  const [pendingSubmissions, setPendingSubmissions] = useState<PendingSubmission[]>([]);
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    pendingGrading: 0,
    averageClassPerformance: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/analytics/dashboard', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setClasses(data.classes || []);
        setPendingSubmissions(data.pendingGrading || []);
        setStats({
          totalClasses: data.classes?.length || 0,
          totalStudents: data.totalStudents || 0,
          pendingGrading: data.pendingGrading?.length || 0,
          averageClassPerformance: data.overallPerformance?.averageScore || 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['TEACHER']}>
      <DashboardLayout navItems={navItems}>
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">
                สวัสดี, {user?.thaiName || `${user?.firstName} ${user?.lastName}`}! 👋
              </h1>
              <p className="text-muted-foreground mt-2">
                ภาพรวมการสอนของคุณวันนี้
              </p>
            </div>
            <Button asChild>
              <Link href="/teacher/classes/new">
                <Icons.bookOpen className="mr-2 h-4 w-4" />
                สร้างคลาสใหม่
              </Link>
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">คลาสเรียน</CardTitle>
                <Icons.bookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold">{stats.totalClasses}</div>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  คลาสที่กำลังสอน
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">นักเรียนทั้งหมด</CardTitle>
                <Icons.users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold">{stats.totalStudents}</div>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  จากทุกคลาสเรียน
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">งานรอตรวจ</CardTitle>
                <Icons.fileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold text-orange-600">
                    {stats.pendingGrading}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  ต้องตรวจให้เสร็จ
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">คะแนนเฉลี่ย</CardTitle>
                <Icons.barChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {stats.averageClassPerformance.toFixed(1)}%
                    </div>
                    <Progress value={stats.averageClassPerformance} className="mt-2" />
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* My Classes */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>คลาสเรียนของฉัน</CardTitle>
                    <CardDescription>
                      คลาสที่คุณกำลังสอน
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/teacher/classes">ดูทั้งหมด</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <>
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </>
                ) : classes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Icons.bookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>ยังไม่มีคลาสเรียน</p>
                    <Link href="/teacher/classes/new">
                      <Button variant="link">สร้างคลาสเรียนแรก</Button>
                    </Link>
                  </div>
                ) : (
                  <>
                    {classes.slice(0, 3).map((cls) => (
                      <Link key={cls.id} href={`/teacher/classes/${cls.id}`}>
                        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                          <div className="flex-1">
                            <h4 className="font-semibold">{cls.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {cls.subject} - ชั้น {cls.gradeLevel}
                            </p>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Icons.users className="h-3 w-3" />
                                {cls.studentCount} คน
                              </span>
                              {cls.averageScore !== undefined && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Icons.barChart className="h-3 w-3" />
                                  เฉลี่ย {cls.averageScore.toFixed(0)}%
                                </span>
                              )}
                            </div>
                          </div>
                          <Icons.bookOpen className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </Link>
                    ))}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Pending Grading */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>งานรอตรวจ</CardTitle>
                    <CardDescription>
                      งานที่นักเรียนส่งมาแล้ว
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/teacher/grading">ดูทั้งหมด</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <>
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </>
                ) : pendingSubmissions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Icons.fileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>ไม่มีงานรอตรวจ</p>
                  </div>
                ) : (
                  <>
                    {pendingSubmissions.slice(0, 3).map((submission) => (
                      <Link 
                        key={submission.id} 
                        href={`/teacher/submissions/${submission.id}`}
                      >
                        <div className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                          <div className="flex-1">
                            <h4 className="font-semibold">{submission.assignmentTitle}</h4>
                            <p className="text-sm text-muted-foreground">
                              {submission.studentName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ส่งเมื่อ: {new Date(submission.submittedAt).toLocaleDateString('th-TH')}
                            </p>
                          </div>
                          <Badge variant="outline">รอตรวจ</Badge>
                        </div>
                      </Link>
                    ))}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="cursor-pointer hover:bg-accent transition-colors" asChild>
              <Link href="/teacher/classes/new">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Icons.bookOpen className="h-5 w-5" />
                    สร้างคลาสใหม่
                  </CardTitle>
                  <CardDescription className="text-xs">
                    เพิ่มคลาสเรียนใหม่
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>

            <Card className="cursor-pointer hover:bg-accent transition-colors" asChild>
              <Link href="/teacher/assignments/new">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Icons.fileText className="h-5 w-5" />
                    สร้างงาน
                  </CardTitle>
                  <CardDescription className="text-xs">
                    มอบหมายงานใหม่
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>

            <Card className="cursor-pointer hover:bg-accent transition-colors" asChild>
              <Link href="/teacher/grading">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Icons.barChart className="h-5 w-5" />
                    ตรวจงาน
                  </CardTitle>
                  <CardDescription className="text-xs">
                    ตรวจและให้คะแนน
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>

            <Card className="cursor-pointer hover:bg-accent transition-colors" asChild>
              <Link href="/teacher/reports">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Icons.barChart className="h-5 w-5" />
                    รายงาน
                  </CardTitle>
                  <CardDescription className="text-xs">
                    วิเคราะห์ผลการเรียน
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
