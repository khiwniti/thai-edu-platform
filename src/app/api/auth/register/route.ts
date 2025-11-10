// Register API Route
// POST /api/auth/register

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { hashPassword, validatePasswordStrength } from '@/lib/auth/password';
import { generateAccessToken, generateRefreshToken, setAuthCookies } from '@/lib/auth/jwt';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  thaiName: z.string().optional(),
  role: z.enum(['STUDENT', 'TEACHER']).default('STUDENT'),
  grade: z.number().int().min(1).max(12).optional(),
  school: z.string().optional(),
  province: z.string().optional(),
  learningStyle: z.enum(['visual', 'auditory', 'kinesthetic', 'reading']).optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = registerSchema.safeParse(body);
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

    // Validate password strength
    const passwordStrength = validatePasswordStrength(data.password);
    if (!passwordStrength.isValid) {
      return NextResponse.json(
        {
          error: 'Weak password',
          details: passwordStrength.errors
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        thaiName: data.thaiName,
        role: data.role,
        grade: data.grade,
        school: data.school,
        province: data.province,
        learningStyle: data.learningStyle,
        isActive: true
      }
    });

    // Create session
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    });

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      sessionId: session.sessionToken
    };

    const accessToken = await generateAccessToken(tokenPayload);
    const refreshToken = await generateRefreshToken(tokenPayload);

    // Set cookies
    setAuthCookies(accessToken, refreshToken);

    // Create welcome notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'welcome',
        title: data.role === 'STUDENT' ? 'ยินดีต้อนรับสู่แพลตฟอร์มการศึกษา!' : 'Welcome to the Education Platform!',
        message: data.role === 'STUDENT' 
          ? 'เริ่มต้นการเรียนรู้ของคุณวันนี้ด้วย AI Tutor ส่วนตัว'
          : 'Start teaching and inspiring students today!',
        read: false
      }
    });

    // Return user data (without sensitive info)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        thaiName: user.thaiName,
        grade: user.grade,
        school: user.school,
        province: user.province
      },
      accessToken,
      refreshToken
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
