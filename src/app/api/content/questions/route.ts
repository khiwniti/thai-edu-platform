/**
 * Content Generation API Route
 * POST /api/content/questions - Generate questions
 */

import { NextRequest, NextResponse } from 'next/server';
import { contentGenerator } from '@/lib/ai/content-generator';
import type { ContentGenerationRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: ContentGenerationRequest = await request.json();

    // Validate request
    if (!body.topic || !body.gradeLevel || !body.subject) {
      return NextResponse.json(
        { error: 'Missing required fields: topic, gradeLevel, subject' },
        { status: 400 }
      );
    }

    // Generate questions
    const questions = await contentGenerator.generateQuestions(body);

    return NextResponse.json({
      success: true,
      data: {
        questions,
        count: questions.length,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Question generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate questions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
