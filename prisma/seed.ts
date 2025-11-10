// Database Seed Script - Thai Education Platform
// Run with: npm run db:seed

import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data (development only!)
  if (process.env.NODE_ENV === 'development') {
    console.log('🗑️  Clearing existing data...');
    await prisma.submission.deleteMany();
    await prisma.assignment.deleteMany();
    await prisma.classEnrollment.deleteMany();
    await prisma.class.deleteMany();
    await prisma.performanceMetric.deleteMany();
    await prisma.weakArea.deleteMany();
    await prisma.teacherSupportRequest.deleteMany();
    await prisma.contentReview.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.session.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.user.deleteMany();
  }

  // Hash password
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@thai-edu.com',
      password: hashedPassword,
      role: UserRole.ADMIN,
      firstName: 'Admin',
      lastName: 'User',
      thaiName: 'ผู้ดูแลระบบ',
      isActive: true
    }
  });
  console.log('✅ Created admin user');

  // Create teacher user
  const teacher = await prisma.user.create({
    data: {
      email: 'teacher@thai-edu.com',
      password: hashedPassword,
      role: UserRole.TEACHER,
      firstName: 'Somchai',
      lastName: 'Prasert',
      thaiName: 'สมชาย ประเสริฐ',
      school: 'โรงเรียนสตรีวิทยา',
      province: 'กรุงเทพมหานคร',
      isActive: true
    }
  });
  console.log('✅ Created teacher user');

  // Create student users
  const students = await Promise.all([
    prisma.user.create({
      data: {
        email: 'student1@thai-edu.com',
        password: hashedPassword,
        role: UserRole.STUDENT,
        firstName: 'Nong',
        lastName: 'Kaewmala',
        thaiName: 'น้อง แก้วมาลา',
        grade: 8,
        school: 'โรงเรียนสตรีวิทยา',
        province: 'กรุงเทพมหานคร',
        learningStyle: 'visual',
        isActive: true
      }
    }),
    prisma.user.create({
      data: {
        email: 'student2@thai-edu.com',
        password: hashedPassword,
        role: UserRole.STUDENT,
        firstName: 'Lek',
        lastName: 'Siriporn',
        thaiName: 'เล็ก ศิริพร',
        grade: 8,
        school: 'โรงเรียนสตรีวิทยา',
        province: 'กรุงเทพมหานคร',
        learningStyle: 'kinesthetic',
        isActive: true
      }
    }),
    prisma.user.create({
      data: {
        email: 'student3@thai-edu.com',
        password: hashedPassword,
        role: UserRole.STUDENT,
        firstName: 'Mai',
        lastName: 'Sutthirat',
        thaiName: 'ใหม่ สุทธิรัตน์',
        grade: 9,
        school: 'โรงเรียนสตรีวิทยา',
        province: 'กรุงเทพมหานคร',
        learningStyle: 'auditory',
        isActive: true
      }
    })
  ]);
  console.log('✅ Created student users');

  // Create classes
  const mathClass = await prisma.class.create({
    data: {
      name: 'คณิตศาสตร์ ม.2/1',
      subject: 'Mathematics',
      gradeLevel: 8,
      teacherId: teacher.id,
      enrollmentCode: 'MATH801',
      status: 'active'
    }
  });

  const scienceClass = await prisma.class.create({
    data: {
      name: 'วิทยาศาสตร์ ม.3/1',
      subject: 'Science',
      gradeLevel: 9,
      teacherId: teacher.id,
      enrollmentCode: 'SCI901',
      status: 'active'
    }
  });
  console.log('✅ Created classes');

  // Enroll students
  await Promise.all([
    prisma.classEnrollment.create({
      data: {
        classId: mathClass.id,
        studentId: students[0].id,
        status: 'active'
      }
    }),
    prisma.classEnrollment.create({
      data: {
        classId: mathClass.id,
        studentId: students[1].id,
        status: 'active'
      }
    }),
    prisma.classEnrollment.create({
      data: {
        classId: scienceClass.id,
        studentId: students[2].id,
        status: 'active'
      }
    })
  ]);
  console.log('✅ Enrolled students in classes');

  // Create assignments
  const assignment1 = await prisma.assignment.create({
    data: {
      classId: mathClass.id,
      title: 'แบบฝึกหัดเรื่องสมการเชิงเส้น',
      description: 'ทำแบบฝึกหัดท้ายบทเรื่องสมการเชิงเส้น',
      type: 'homework',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      points: 100,
      autoGrade: false,
      allowMultipleAttempts: true,
      maxAttempts: 3,
      showCorrectAnswers: true
    }
  });

  const assignment2 = await prisma.assignment.create({
    data: {
      classId: mathClass.id,
      title: 'แบบทดสอบกลางภาค',
      description: 'แบบทดสอบกลางภาคเทอม 1',
      type: 'quiz',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      points: 100,
      autoGrade: true,
      allowMultipleAttempts: false,
      showCorrectAnswers: false
    }
  });
  console.log('✅ Created assignments');

  // Create sample performance metrics
  await Promise.all([
    prisma.performanceMetric.create({
      data: {
        studentId: students[0].id,
        conceptId: 'math-algebra-01',
        subject: 'Mathematics',
        masteryLevel: 0.45,
        attempts: 5,
        averageScore: 45.5,
        timeSpent: 1800 // 30 minutes
      }
    }),
    prisma.performanceMetric.create({
      data: {
        studentId: students[0].id,
        conceptId: 'math-geometry-01',
        subject: 'Mathematics',
        masteryLevel: 0.85,
        attempts: 3,
        averageScore: 85.0,
        timeSpent: 900 // 15 minutes
      }
    })
  ]);
  console.log('✅ Created performance metrics');

  // Create weak areas
  await prisma.weakArea.create({
    data: {
      studentId: students[0].id,
      conceptId: 'math-algebra-01',
      conceptName: 'Linear Equations',
      severity: 'high',
      attempts: 5,
      averageScore: 45.5,
      status: 'active'
    }
  });
  console.log('✅ Created weak areas');

  console.log('✨ Seeding completed!');
  console.log('\n📧 Login credentials:');
  console.log('Admin: admin@thai-edu.com / password123');
  console.log('Teacher: teacher@thai-edu.com / password123');
  console.log('Student: student1@thai-edu.com / password123');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
