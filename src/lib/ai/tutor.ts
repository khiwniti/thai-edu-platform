/**
 * AI Tutor Service
 * Provides personalized tutoring, feedback, and guidance
 */

import { aiService } from './index';
import type {
  TutorSession,
  TutorMessage,
  SessionContext,
  Feedback,
  Language,
} from '@/types';

export interface TutorFeedbackRequest {
  question: string;
  studentAnswer: string;
  correctAnswer: string;
  context: SessionContext;
  language: Language;
}

export interface TutorExplanationRequest {
  topic: string;
  concept: string;
  context: SessionContext;
  language: Language;
  previousExplanations?: string[];
}

/**
 * AI Tutor Service Class
 */
export class AITutorService {
  /**
   * Generate personalized feedback on student's answer
   */
  async generateFeedback(request: TutorFeedbackRequest): Promise<Feedback> {
    const { question, studentAnswer, correctAnswer, context, language } = request;

    const prompt = this.buildFeedbackPrompt(
      question,
      studentAnswer,
      correctAnswer,
      context,
      language
    );

    try {
      const result = await aiService.generateJSON<Feedback>(prompt, {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['correct', 'incorrect', 'partial', 'hint', 'explanation'] },
          message: { type: 'string' },
          reasoning: { type: 'string' },
          nextSteps: { type: 'array', items: { type: 'string' } },
          alternativeExplanations: { type: 'array', items: { type: 'string' } },
          relatedConcepts: { type: 'array', items: { type: 'string' } },
        },
        required: ['type', 'message', 'reasoning', 'nextSteps'],
      });

      return result;
    } catch (error) {
      console.error('Feedback generation error:', error);
      // Fallback feedback
      return {
        type: 'explanation',
        message: language === 'th' 
          ? 'ขออภัย ระบบไม่สามารถประเมินคำตอบได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง'
          : 'Sorry, the system cannot evaluate your answer at this time. Please try again.',
        reasoning: 'System error occurred',
        nextSteps: [
          language === 'th'
            ? 'ลองตอบคำถามอีกครั้ง'
            : 'Try answering the question again'
        ],
      };
    }
  }

  /**
   * Generate alternative explanation for a concept
   */
  async generateExplanation(request: TutorExplanationRequest): Promise<string> {
    const { topic, concept, context, language, previousExplanations } = request;

    const prompt = this.buildExplanationPrompt(
      topic,
      concept,
      context,
      language,
      previousExplanations
    );

    try {
      const result = await aiService.generate(prompt, {
        temperature: 0.8,
        maxOutputTokens: 1000,
      });

      return result.text;
    } catch (error) {
      console.error('Explanation generation error:', error);
      return language === 'th'
        ? 'ขออภัย ไม่สามารถสร้างคำอธิบายได้ในขณะนี้'
        : 'Sorry, unable to generate explanation at this time.';
    }
  }

  /**
   * Continue a tutoring conversation
   */
  async continueConversation(
    session: TutorSession,
    userMessage: string
  ): Promise<TutorMessage> {
    const messages = session.messages.map(msg => ({
      role: msg.role === 'student' ? 'user' as const : 'model' as const,
      parts: msg.content,
    }));

    messages.push({
      role: 'user',
      parts: userMessage,
    });

    try {
      const result = await aiService.chat(messages, {
        temperature: 0.7,
        maxOutputTokens: 500,
      });

      return {
        id: crypto.randomUUID(),
        role: 'tutor',
        content: result.text,
        contentType: 'text',
        timestamp: new Date(),
        confidence: 0.8,
      };
    } catch (error) {
      console.error('Conversation error:', error);
      throw error;
    }
  }

  /**
   * Detect if student needs escalation to human teacher
   */
  async shouldEscalate(session: TutorSession): Promise<{
    should: boolean;
    reason?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
  }> {
    // Simple heuristics for escalation
    const messageCount = session.messages.length;
    const studentMessages = session.messages.filter(m => m.role === 'student');
    
    // Escalate if:
    // 1. Too many messages without resolution (> 20)
    if (messageCount > 20) {
      return {
        should: true,
        reason: 'Extended conversation without resolution',
        priority: 'medium',
      };
    }

    // 2. Low confidence in recent responses
    const recentTutorMessages = session.messages
      .filter(m => m.role === 'tutor')
      .slice(-3);
    const avgConfidence = recentTutorMessages.reduce(
      (sum, m) => sum + (m.confidence || 0),
      0
    ) / recentTutorMessages.length;

    if (avgConfidence < 0.5) {
      return {
        should: true,
        reason: 'Low confidence in AI responses',
        priority: 'high',
      };
    }

    // 3. Repeated similar questions (indicates confusion)
    if (studentMessages.length >= 3) {
      const lastThree = studentMessages.slice(-3);
      // Simple similarity check (could be enhanced with embeddings)
      const similarities = lastThree.map((msg, i) => 
        lastThree.slice(i + 1).some(otherMsg => 
          this.calculateSimilarity(msg.content, otherMsg.content) > 0.7
        )
      );
      
      if (similarities.filter(Boolean).length >= 2) {
        return {
          should: true,
          reason: 'Student appears confused, repeating similar questions',
          priority: 'high',
        };
      }
    }

    return { should: false };
  }

  /**
   * Build feedback prompt with Thai cultural context
   */
  private buildFeedbackPrompt(
    question: string,
    studentAnswer: string,
    correctAnswer: string,
    context: SessionContext,
    language: Language
  ): string {
    const languageInstructions = language === 'th'
      ? 'ตอบเป็นภาษาไทย ใช้น้ำเสียงที่อบอุ่นและให้กำลังใจ'
      : 'Respond in English with an encouraging and supportive tone';

    const culturalContext = language === 'th'
      ? '\n- ใช้ตัวอย่างที่เกี่ยวข้องกับวัฒนธรรมไทย เช่น อาหารไทย สถานที่ท่องเที่ยว เทศกาลไทย\n- ใช้คำที่สุภาพและเหมาะสมกับวัยของนักเรียน'
      : '\n- Use examples relevant to Thai culture when appropriate\n- Keep language age-appropriate';

    return `You are a supportive Thai tutor helping a Grade ${context.studentLevel} student.

Student Question: ${question}
Student Answer: ${studentAnswer}
Correct Answer: ${correctAnswer}

Student's Weak Areas: ${context.weakAreas.join(', ') || 'None identified yet'}
Learning Style: ${context.learningStyle || 'Unknown'}
Previous Attempts on this topic: ${context.previousAttempts}

${languageInstructions}

Provide feedback that:
1. Acknowledges what the student got right (if anything)
2. Gently explains misconceptions without revealing the complete answer
3. Provides a hint or guiding question to help them think through the problem
4. Uses culturally relevant examples from Thailand where appropriate
5. Encourages the student to try again${culturalContext}

Keep your response under 150 words and maintain an encouraging, supportive tone.
Format your response as JSON with these fields: type, message, reasoning, nextSteps, alternativeExplanations, relatedConcepts`;
  }

  /**
   * Build explanation prompt
   */
  private buildExplanationPrompt(
    topic: string,
    concept: string,
    context: SessionContext,
    language: Language,
    previousExplanations?: string[]
  ): string {
    const languageInstructions = language === 'th'
      ? 'อธิบายเป็นภาษาไทยอย่างชัดเจน'
      : 'Explain clearly in English';

    const previousExplanationsText = previousExplanations && previousExplanations.length > 0
      ? `\n\nThe student has already seen these explanations, so provide a DIFFERENT approach:\n${previousExplanations.map((exp, i) => `${i + 1}. ${exp}`).join('\n')}`
      : '';

    return `You are a Thai tutor explaining ${topic}: ${concept} to a Grade ${context.studentLevel} student.

Learning Style: ${context.learningStyle || 'Unknown'}
${languageInstructions}${previousExplanationsText}

Provide a clear, concise explanation that:
1. Breaks down the concept into simple parts
2. Uses concrete examples relevant to Thai culture and daily life
3. Matches the student's learning style (${context.learningStyle || 'general'})
4. Includes a simple analogy or visual description
5. Keeps language age-appropriate and encouraging

Keep your explanation under 200 words.`;
  }

  /**
   * Calculate simple text similarity (could be enhanced with embeddings)
   */
  private calculateSimilarity(text1: string, text2: string): number {
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    const intersection = words1.filter(word => words2.includes(word));
    return intersection.length / Math.max(words1.length, words2.length);
  }
}

// Export singleton instance
export const aiTutorService = new AITutorService();
