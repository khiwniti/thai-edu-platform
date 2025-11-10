/**
 * AI Tutor Feedback API Route
 * POST /api/tutor/feedback - Get feedback on student answer
 */

import { NextRequest, NextResponse } from 'next/server';
import { aiTutorService, type TutorFeedbackRequest } from '@/lib/ai/tutor';

export async function POST(request: NextRequest) {
  try {
    const body: TutorFeedbackRequest = await request.json();

    // Validate request
    if (!body.question || !body.studentAnswer || !body.context) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate feedback
    const feedback = await aiTutorService.generateFeedback(body);

    return NextResponse.json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    console.error('Tutor feedback error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate feedback',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
