'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/ui/icons';
import { ThemeSwitcher } from '@/components/theme-switcher';
import Link from 'next/link';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Redirect authenticated users to their dashboard
      if (user.role === 'STUDENT') {
        router.push('/student/dashboard');
      } else if (user.role === 'TEACHER') {
        router.push('/teacher/dashboard');
      } else if (user.role === 'ADMIN') {
        router.push('/admin/dashboard');
      }
    }
  }, [user, loading, router]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  // Show landing page for non-authenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header with Theme Switcher */}
      <header className="container mx-auto px-4 py-4">
        <div className="flex justify-end">
          <ThemeSwitcher />
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
              <Icons.graduationCap className="h-10 w-10 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Thai Education Platform
          </h1>
          
          <p className="text-3xl text-gray-700 mb-8 font-sarabun">
            แพลตฟอร์มการศึกษาไทยที่ขับเคลื่อนด้วย AI
          </p>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            ระบบการเรียนรู้ที่ปรับเหมาะกับแต่ละคน พร้อมครู AI ที่คอยช่วยเหลือตลอด 24 ชั่วโมง
            ออกแบบมาเพื่อหลักสูตรและวัฒนธรรมไทยโดยเฉพาะ
          </p>

          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild className="text-lg px-8">
              <Link href="/register">
                เริ่มต้นใช้งานฟรี
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8">
              <Link href="/login">
                เข้าสู่ระบบ
              </Link>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                <Icons.bookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>การเรียนรู้ส่วนบุคคล</CardTitle>
              <CardDescription>
                AI วิเคราะห์จุดอ่อนและสร้างเส้นทางการเรียนรู้ที่เหมาะกับคุณโดยเฉพาะ
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                <Icons.messageCircle className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>AI Tutor 24/7</CardTitle>
              <CardDescription>
                ครู AI ที่พร้อมตอบคำถาม อธิบายแนวคิด และให้คำแนะนำตลอดเวลา
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                <Icons.barChart className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>ติดตามความก้าวหน้า</CardTitle>
              <CardDescription>
                รายงานแบบละเอียดช่วยให้คุณเห็นความก้าวหน้าและจุดที่ต้องพัฒนา
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* For Teachers Section */}
        <div className="mt-24 bg-white rounded-2xl p-12 shadow-lg">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">สำหรับครูผู้สอน</h2>
              <p className="text-lg text-muted-foreground mb-6">
                จัดการคลาสเรียน มอบหมายงาน และติดตามความก้าวหน้าของนักเรียนได้อย่างง่ายดาย
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <Icons.bookOpen className="h-5 w-5 text-blue-600 mt-1" />
                  <span>สร้างและจัดการคลาสเรียนได้ง่าย</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icons.fileText className="h-5 w-5 text-blue-600 mt-1" />
                  <span>AI ช่วยสร้างเนื้อหาและข้อสอบ</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icons.barChart className="h-5 w-5 text-blue-600 mt-1" />
                  <span>รายงานวิเคราะห์แบบละเอียด</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icons.users className="h-5 w-5 text-blue-600 mt-1" />
                  <span>ระบุนักเรียนที่ต้องการความช่วยเหลือ</span>
                </li>
              </ul>
              <Button size="lg" asChild>
                <Link href="/register">
                  สมัครสมาชิกสำหรับครู
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-4xl">100K+</CardTitle>
                  <CardDescription>นักเรียนทั่วประเทศไทย</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-4xl">5K+</CardTitle>
                  <CardDescription>ครูผู้สอน</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-4xl">24/7</CardTitle>
                  <CardDescription>AI Tutor พร้อมช่วยเหลือ</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-4xl">95%</CardTitle>
                  <CardDescription>อัตราความพึงพอใจ</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold mb-4">พร้อมเริ่มต้นแล้วหรือยัง?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            สมัครฟรีวันนี้ ไม่ต้องใช้บัตรเครดิต
          </p>
          <Button size="lg" asChild className="text-lg px-12">
            <Link href="/register">
              สมัครสมาชิกเลย
            </Link>
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t mt-24 py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Icons.graduationCap className="h-6 w-6 text-primary" />
              <span className="font-semibold">Thai Education Platform</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 Thai Education Platform. สงวนลิขสิทธิ์.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
