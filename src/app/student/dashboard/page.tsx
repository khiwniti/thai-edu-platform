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
  teacher: {
    firstName: string;
    lastName: string;
    thaiName?: string;
  };
}

interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  classId: string;
  className: string;
  status: 'pending' | 'submitted' | 'graded';
  score?: number;
  maxScore?: number;
}

interface WeakArea {
  id: string;
  conceptName: string;
  subject: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  averageScore: number;
  attempts: number;
}

const navItems = [
  { title: 'แดชบอร์ด', href: '/student/dashboard', icon: 'home' as const },
  { title: 'คลาสเรียน', href: '/student/classes', icon: 'bookOpen' as const },
  { title: 'การบ้าน', href: '/student/assignments', icon: 'fileText' as const },
  { title: 'AI Tutor', href: '/student/tutor', icon: 'messageCircle' as const },
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<Class[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [weakAreas, setWeakAreas] = useState<WeakArea[]>([]);
  const [stats, setStats] = useState({
    averageScore: 0,
    completionRate: 0,
    totalAssignments: 0,
    pendingAssignments: 0
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
        setAssignments(data.recentAssignments || []);
        setWeakAreas(data.weakAreas || []);
        setStats({
          averageScore: data.overallProgress?.averageScore || 0,
          completionRate: data.overallProgress?.completionRate || 0,
          totalAssignments: data.overallProgress?.totalAssignments || 0,
          pendingAssignments: data.upcomingTasks?.length || 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'วิกฤต';
      case 'HIGH':
        return 'สูง';
      case 'MEDIUM':
        return 'ปานกลาง';
      case 'LOW':
        return 'ต่ำ';
      default:
        return severity;
    }
  };

  const getAssignmentStatusBadge = (assignment: Assignment) => {
    if (assignment.status === 'graded' && assignment.score !== undefined) {
      const percentage = (assignment.score / (assignment.maxScore || 100)) * 100;
      const variant = percentage >= 80 ? 'default' : percentage >= 60 ? 'secondary' : 'destructive';
      return (
        <Badge variant={variant}>
          คะแนน: {assignment.score}/{assignment.maxScore}
        </Badge>
      );
    } else if (assignment.status === 'submitted') {
      return <Badge variant="outline">ส่งแล้ว</Badge>;
    } else {
      return <Badge variant="destructive">ยังไม่ส่ง</Badge>;
    }
  };

  return (
    <ProtectedRoute allowedRoles={['STUDENT']}>
      <DashboardLayout navItems={navItems}>
        <div className="space-y-6">
          {/* Welcome Section */}
          <div>
            <h1 className="text-3xl font-bold">
              สวัสดี, {user?.thaiName || `${user?.firstName} ${user?.lastName}`}! 👋
            </h1>
            <p className="text-muted-foreground mt-2">
              ยินดีต้อนรับกลับสู่แพลตฟอร์มการเรียนรู้
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                    <div className="text-2xl font-bold">{stats.averageScore.toFixed(1)}%</div>
                    <Progress value={stats.averageScore} className="mt-2" />
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">อัตราการส่งงาน</CardTitle>
                <Icons.fileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stats.completionRate.toFixed(0)}%</div>
                    <Progress value={stats.completionRate} className="mt-2" />
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">งานทั้งหมด</CardTitle>
                <Icons.bookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold">{stats.totalAssignments}</div>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  จากคลาสเรียนทั้งหมด
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">งานค้างส่ง</CardTitle>
                <Icons.fileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold text-orange-600">
                    {stats.pendingAssignments}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  ต้องส่งในสัปดาห์นี้
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* My Classes */}
            <Card>
              <CardHeader>
                <CardTitle>คลาสเรียนของฉัน</CardTitle>
                <CardDescription>
                  คลาสเรียนที่คุณลงทะเบียนไว้
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <>
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </>
                ) : classes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Icons.bookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>ยังไม่มีคลาสเรียน</p>
                    <Link href="/student/classes">
                      <Button variant="link">เข้าร่วมคลาสเรียน</Button>
                    </Link>
                  </div>
                ) : (
                  <>
                    {classes.slice(0, 3).map((cls) => (
                      <Link key={cls.id} href={`/student/classes/${cls.id}`}>
                        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                          <div>
                            <h4 className="font-semibold">{cls.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {cls.subject} - ชั้น {cls.gradeLevel}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ครู: {cls.teacher.thaiName || `${cls.teacher.firstName} ${cls.teacher.lastName}`}
                            </p>
                          </div>
                          <Icons.bookOpen className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </Link>
                    ))}
                    {classes.length > 3 && (
                      <Link href="/student/classes">
                        <Button variant="outline" className="w-full">
                          ดูทั้งหมด ({classes.length})
                        </Button>
                      </Link>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Pending Assignments */}
            <Card>
              <CardHeader>
                <CardTitle>งานที่ต้องทำ</CardTitle>
                <CardDescription>
                  งานที่ยังไม่ได้ส่งหรือกำลังรอตรวจ
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <>
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </>
                ) : assignments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Icons.fileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>ไม่มีงานค้างส่ง</p>
                  </div>
                ) : (
                  <>
                    {assignments.slice(0, 3).map((assignment) => (
                      <Link key={assignment.id} href={`/student/assignments/${assignment.id}`}>
                        <div className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                          <div className="flex-1">
                            <h4 className="font-semibold">{assignment.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {assignment.className}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              กำหนดส่ง: {new Date(assignment.dueDate).toLocaleDateString('th-TH')}
                            </p>
                          </div>
                          <div>
                            {getAssignmentStatusBadge(assignment)}
                          </div>
                        </div>
                      </Link>
                    ))}
                    {assignments.length > 3 && (
                      <Link href="/student/assignments">
                        <Button variant="outline" className="w-full">
                          ดูทั้งหมด ({assignments.length})
                        </Button>
                      </Link>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Weak Areas */}
          <Card>
            <CardHeader>
              <CardTitle>จุดที่ต้องพัฒนา</CardTitle>
              <CardDescription>
                หัวข้อที่คุณควรฝึกฝนเพิ่มเติม
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : weakAreas.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Icons.barChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>ยังไม่มีข้อมูลจุดที่ต้องพัฒนา</p>
                  <p className="text-sm mt-2">ทำแบบทดสอบเพื่อให้ AI วิเคราะห์จุดที่ต้องพัฒนา</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {weakAreas.map((area) => (
                    <div key={area.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{area.conceptName}</h4>
                          <Badge className={getSeverityColor(area.severity)}>
                            {getSeverityLabel(area.severity)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {area.subject} • พยายาม {area.attempts} ครั้ง • คะแนนเฉลี่ย {area.averageScore.toFixed(0)}%
                        </p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/student/practice/${area.id}`}>
                          ฝึกฝน
                        </Link>
                      </Button>
                    </div>
                  ))}
                  <Link href="/student/progress">
                    <Button variant="outline" className="w-full">
                      ดูรายละเอียดเพิ่มเติม
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="cursor-pointer hover:bg-accent transition-colors" asChild>
              <Link href="/student/tutor">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icons.messageCircle className="h-5 w-5" />
                    AI Tutor
                  </CardTitle>
                  <CardDescription>
                    พูดคุยกับ AI Tutor เพื่อขอความช่วยเหลือ
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>

            <Card className="cursor-pointer hover:bg-accent transition-colors" asChild>
              <Link href="/student/practice">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icons.bookOpen className="h-5 w-5" />
                    ฝึกฝนทักษะ
                  </CardTitle>
                  <CardDescription>
                    แบบฝึกหัดที่แนะนำตามจุดที่ต้องพัฒนา
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>

            <Card className="cursor-pointer hover:bg-accent transition-colors" asChild>
              <Link href="/student/progress">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icons.barChart className="h-5 w-5" />
                    ความก้าวหน้า
                  </CardTitle>
                  <CardDescription>
                    ดูรายงานผลการเรียนแบบละเอียด
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
