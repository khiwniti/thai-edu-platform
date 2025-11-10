/**
 * Content Generator Service
 * Generates educational content (lessons, questions, assessments, etc.)
 */

import { aiService } from './index';
import type {
  ContentGenerationRequest,
  Question,
  LessonPlan,
  Language,
  CurriculumStandard,
} from '@/types';

/**
 * Content Generator Service Class
 */
export class ContentGeneratorService {
  /**
   * Generate multiple-choice questions
   */
  async generateQuestions(
    request: ContentGenerationRequest
  ): Promise<Question[]> {
    const prompt = this.buildQuestionPrompt(request);

    try {
      const result = await aiService.generateJSON<{ questions: Question[] }>(prompt, {
        type: 'object',
        properties: {
          questions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                question: { type: 'string' },
                questionLocalized: { type: 'object' },
                options: { type: 'array' },
                optionsLocalized: { type: 'object' },
                correctAnswer: { type: 'string' },
                explanation: { type: 'string' },
                explanationLocalized: { type: 'object' },
                difficulty: { type: 'number' },
                topic: { type: 'string' },
              },
            },
          },
        },
      });

      return result.questions.map((q, index) => ({
        id: crypto.randomUUID(),
        type: 'multiple_choice',
        conceptId: `${request.subject}-${request.topic}`,
        bloomsLevel: request.difficulty ? this.getBloomsLevel(request.difficulty) : 'understand',
        estimatedTime: 2, // minutes
        subTopic: request.topic,
        ...q,
      }));
    } catch (error) {
      console.error('Question generation error:', error);
      throw error;
    }
  }

  /**
   * Generate a comprehensive lesson plan
   */
  async generateLessonPlan(
    request: ContentGenerationRequest
  ): Promise<LessonPlan> {
    const prompt = this.buildLessonPlanPrompt(request);

    try {
      const result = await aiService.generateJSON<LessonPlan>(prompt, undefined, {
        maxOutputTokens: 4096,
        temperature: 0.8,
      });

      return {
        id: crypto.randomUUID(),
        ...result,
      };
    } catch (error) {
      console.error('Lesson plan generation error:', error);
      throw error;
    }
  }

  /**
   * Generate concept explanation
   */
  async generateExplanation(
    topic: string,
    concept: string,
    gradeLevel: number,
    language: Language = 'th'
  ): Promise<string> {
    const prompt = `You are an experienced Thai educator. Explain the concept of "${concept}" in ${topic} for Grade ${gradeLevel} students.

Language: ${language === 'th' ? 'Thai (ภาษาไทย)' : 'English'}

Provide a clear, engaging explanation that:
1. Starts with a simple definition
2. Uses concrete examples from Thai daily life
3. Includes an analogy or metaphor
4. Explains why this concept is important
5. Connects to real-world applications in Thailand

Keep it concise (200-300 words) and age-appropriate.`;

    try {
      const result = await aiService.generate(prompt, {
        temperature: 0.7,
        maxOutputTokens: 1000,
      });

      return result.text;
    } catch (error) {
      console.error('Explanation generation error:', error);
      throw error;
    }
  }

  /**
   * Generate practice exercises
   */
  async generatePracticeExercises(
    request: ContentGenerationRequest,
    count: number = 5
  ): Promise<Question[]> {
    const modifiedRequest = {
      ...request,
      additionalContext: `Generate ${count} practice exercises of varying difficulty (easy to hard)`,
    };

    return this.generateQuestions(modifiedRequest);
  }

  /**
   * Generate assessment (quiz/test)
   */
  async generateAssessment(
    request: ContentGenerationRequest,
    questionCount: number = 10
  ): Promise<{
    title: string;
    description: string;
    questions: Question[];
    duration: number;
    totalPoints: number;
  }> {
    const questions = await this.generateQuestions({
      ...request,
      type: 'assessment',
      additionalContext: `Generate ${questionCount} assessment questions covering all key concepts`,
    });

    const title = request.language === 'th'
      ? `แบบทดสอบ ${request.topic} (ชั้นประถมศึกษาปีที่ ${request.gradeLevel})`
      : `${request.topic} Assessment (Grade ${request.gradeLevel})`;

    const description = request.language === 'th'
      ? `แบบทดสอบวัดความเข้าใจในเรื่อง ${request.topic} มี ${questionCount} ข้อ`
      : `Assessment to measure understanding of ${request.topic} with ${questionCount} questions`;

    return {
      title,
      description,
      questions: questions.slice(0, questionCount),
      duration: questionCount * 2, // 2 minutes per question
      totalPoints: questionCount * 10, // 10 points per question
    };
  }

  /**
   * Build question generation prompt
   */
  private buildQuestionPrompt(request: ContentGenerationRequest): string {
    const {
      topic,
      gradeLevel,
      subject,
      difficulty,
      learningObjectives,
      curriculumStandards,
      language,
    } = request;

    const languageInstructions = language === 'th'
      ? 'Generate questions in Thai language with English translations'
      : 'Generate questions in English with Thai translations';

    return `You are an expert Thai education content creator. Generate 5 high-quality multiple-choice questions about ${topic} in ${subject} for Grade ${gradeLevel} students.

${languageInstructions}

Topic: ${topic}
Grade Level: ${gradeLevel}
Subject: ${subject}
Difficulty: ${difficulty ? `${difficulty}/10` : 'Varied (easy to hard)'}
${learningObjectives ? `Learning Objectives:\n${learningObjectives.map(obj => `- ${obj}`).join('\n')}` : ''}
${curriculumStandards ? `Curriculum Standards:\n${curriculumStandards.join(', ')}` : ''}

Requirements for each question:
1. Clear, unambiguous question text
2. Four answer options (A, B, C, D)
3. Only one correct answer
4. Plausible distractors (wrong answers that students might choose)
5. Explanation of why the correct answer is right
6. Use Thai cultural context and examples where appropriate
7. Age-appropriate language and scenarios
8. Questions should test understanding, not just memorization

Provide response in this JSON format:
{
  "questions": [
    {
      "question": "Question text in primary language",
      "questionLocalized": {
        "th": "คำถามเป็นภาษาไทย",
        "en": "Question in English"
      },
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "optionsLocalized": {
        "th": ["ตัวเลือก A", "ตัวเลือก B", "ตัวเลือก C", "ตัวเลือก D"],
        "en": ["Option A", "Option B", "Option C", "Option D"]
      },
      "correctAnswer": "0",
      "explanation": "Explanation of correct answer",
      "explanationLocalized": {
        "th": "คำอธิบายเป็นภาษาไทย",
        "en": "Explanation in English"
      },
      "difficulty": 5,
      "topic": "${topic}"
    }
  ]
}`;
  }

  /**
   * Build lesson plan generation prompt
   */
  private buildLessonPlanPrompt(request: ContentGenerationRequest): string {
    const {
      topic,
      gradeLevel,
      subject,
      learningObjectives,
      curriculumStandards,
      language,
    } = request;

    return `You are an experienced Thai education curriculum designer. Create a comprehensive lesson plan for teaching ${topic} in ${subject} to Grade ${gradeLevel} students.

Topic: ${topic}
Grade Level: ${gradeLevel}
Subject: ${subject}
Language: ${language === 'th' ? 'Thai' : 'English'}
${learningObjectives ? `Learning Objectives:\n${learningObjectives.map(obj => `- ${obj}`).join('\n')}` : ''}
${curriculumStandards ? `Curriculum Standards: ${curriculumStandards.join(', ')}` : ''}

Create a detailed lesson plan following Thai education best practices that includes:

1. Title and overview
2. Clear learning objectives aligned with Thai curriculum
3. Required materials and resources
4. Step-by-step activities:
   - Warm-up/Introduction (5-10 min)
   - Main instruction/Modeling (15-20 min)
   - Guided practice (15-20 min)
   - Independent practice (10-15 min)
   - Closing/Assessment (5-10 min)
5. Differentiation strategies for struggling, on-level, and advanced students
6. Assessment ideas to check understanding
7. Thai cultural context and relevant examples
8. Estimated duration for each activity

Format the response as JSON with these fields:
{
  "title": "Lesson title",
  "subject": "${subject}",
  "gradeLevel": ${gradeLevel},
  "duration": 60,
  "learningObjectives": ["Objective 1", "Objective 2"],
  "curriculumAlignment": [],
  "materials": ["Material 1", "Material 2"],
  "activities": [
    {
      "title": "Activity name",
      "description": "What students will do",
      "duration": 10,
      "type": "warmup",
      "materials": [],
      "instructions": ["Step 1", "Step 2"]
    }
  ],
  "assessmentIdeas": ["Assessment idea 1"],
  "differentiation": [
    {
      "type": "content",
      "description": "How to differentiate",
      "targetStudents": "struggling"
    }
  ],
  "culturalContext": ["Thai example 1", "Thai example 2"]
}`;
  }

  /**
   * Map difficulty to Bloom's Taxonomy level
   */
  private getBloomsLevel(difficulty: number): string {
    if (difficulty <= 3) return 'remember';
    if (difficulty <= 5) return 'understand';
    if (difficulty <= 7) return 'apply';
    if (difficulty <= 9) return 'analyze';
    return 'evaluate';
  }
}

// Export singleton instance
export const contentGenerator = new ContentGeneratorService();
