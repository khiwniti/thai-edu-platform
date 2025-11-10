export type Language = 'th' | 'en';

export type MasteryLevel = 'needs-improvement' | 'developing' | 'mastered';

export interface WeakArea {
  id: string;
  topic: string;
  subTopic: string;
  masteryLevel: MasteryLevel;
  score: number;
  lastAttempt: Date;
  prerequisiteGaps?: string[];
}

export interface AssessmentQuestion {
  id: string;
  question: {
    th: string;
    en: string;
  };
  options: {
    th: string[];
    en: string[];
  };
  correctAnswer: number;
  topic: string;
  subTopic: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface StudentProfile {
  id: string;
  name: string;
  weakAreas: WeakArea[];
  completedAssessment: boolean;
  overallProgress: number;
  focusToday: string[];
}

export interface LearningContent {
  id: string;
  title: {
    th: string;
    en: string;
  };
  description: {
    th: string;
    en: string;
  };
  type: 'video' | 'text' | 'interactive';
  topic: string;
  subTopic: string;
  duration: number;
  thumbnail: string;
  reason: {
    th: string;
    en: string;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
