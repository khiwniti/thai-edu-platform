// ============================================================================
// Core Types
// ============================================================================

export type Language = 'th' | 'en';
export type UserRole = 'student' | 'teacher' | 'admin';
export type MasteryLevel = 'needs-improvement' | 'developing' | 'mastered';

// ============================================================================
// User Management Types
// ============================================================================

export interface User {
  id: string;
  email: string;
  phone?: string;
  role: UserRole;
  profile: UserProfile;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  isActive: boolean;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  thaiName?: string;
  school?: string;
  grade?: number;
  subjects?: string[];
  avatar?: string;
  province?: string;
}

export interface UserPreferences {
  language: Language;
  learningStyle?: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  theme: 'light' | 'dark' | 'auto';
  notifications: NotificationSettings;
  accessibility: AccessibilitySettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  frequency: 'realtime' | 'daily' | 'weekly';
}

export interface AccessibilitySettings {
  fontSize: number;
  highContrast: boolean;
  ttsEnabled: boolean;
  sttEnabled: boolean;
  keyboardNavigation: boolean;
}

// ============================================================================
// Learning Path Types
// ============================================================================

export interface LearningPath {
  id: string;
  studentId: string;
  subject: string;
  curriculumAlignment: CurriculumStandard[];
  nodes: LearningNode[];
  currentNodeId: string;
  weakAreas: WeakArea[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LearningNode {
  id: string;
  type: 'concept' | 'practice' | 'assessment' | 'review';
  title: string;
  description: string;
  content: Content;
  prerequisites: string[];
  difficulty: number;
  estimatedTime: number;
  status: 'locked' | 'available' | 'in_progress' | 'completed' | 'mastered';
  masteryScore?: number;
}

export interface Content {
  id: string;
  type: 'video' | 'text' | 'interactive' | 'question' | 'explanation';
  title: Record<Language, string>;
  description: Record<Language, string>;
  body: any;
  metadata: ContentMetadata;
}

export interface ContentMetadata {
  generatedBy: 'ai' | 'teacher' | 'hybrid';
  aiModel?: string;
  confidence: number;
  culturalRelevance: number;
  curriculumAlignment: CurriculumStandard[];
  tags: string[];
  language: Language;
  duration?: number;
  thumbnail?: string;
}

export interface CurriculumStandard {
  standardId: string;
  standardCode: string;
  standardName: string;
  description: string;
  gradeLevel: number;
  subject: string;
}

export interface WeakArea {
  id: string;
  conceptId: string;
  conceptName: string;
  topic: string;
  subTopic?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  identifiedAt: Date;
  attempts: number;
  averageScore: number;
  masteryLevel: MasteryLevel;
  prerequisiteGaps: string[];
  recommendedContent: string[];
  lastAttempt?: Date;
}

export interface MasteryAssessment {
  id: string;
  studentId: string;
  conceptId: string;
  questions: Question[];
  score: number;
  masteryLevel: number;
  completedAt: Date;
  feedback: AssessmentFeedback;
}

export interface AssessmentFeedback {
  overall: string;
  strengths: string[];
  improvements: string[];
  nextSteps: string[];
}

// ============================================================================
// AI Tutor Types
// ============================================================================

export interface TutorSession {
  id: string;
  studentId: string;
  conceptId: string;
  messages: TutorMessage[];
  context: SessionContext;
  startedAt: Date;
  endedAt?: Date;
  escalated?: boolean;
  escalationReason?: string;
}

export interface TutorMessage {
  id: string;
  role: 'student' | 'tutor' | 'system';
  content: string;
  contentType: 'text' | 'image' | 'audio' | 'code';
  timestamp: Date;
  feedback?: Feedback;
  confidence?: number;
}

export interface Feedback {
  type: 'correct' | 'incorrect' | 'partial' | 'hint' | 'explanation';
  message: string;
  reasoning: string;
  nextSteps: string[];
  alternativeExplanations?: string[];
  relatedConcepts?: string[];
}

export interface SessionContext {
  currentTopic: string;
  studentLevel: number;
  learningStyle?: string;
  previousAttempts: number;
  weakAreas: string[];
  languagePreference: Language;
}

export interface EscalationRequest {
  id: string;
  sessionId: string;
  studentId: string;
  reason: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  context: SessionContext;
  assignedTeacherId?: string;
  status: 'pending' | 'assigned' | 'resolved';
  createdAt: Date;
}

// ============================================================================
// Content Generation Types
// ============================================================================

export interface ContentGenerationRequest {
  type: 'lesson_plan' | 'question' | 'explanation' | 'summary' | 'assessment';
  topic: string;
  gradeLevel: number;
  subject: string;
  difficulty?: number;
  learningObjectives?: string[];
  curriculumStandards?: string[];
  language: Language;
  additionalContext?: string;
}

export interface GeneratedContent {
  id: string;
  type: string;
  content: any;
  metadata: ContentMetadata;
  reviewStatus: 'pending' | 'approved' | 'rejected' | 'needs_revision';
  reviewedBy?: string;
  reviewNotes?: string;
  confidence: number;
  createdAt: Date;
}

export interface LessonPlan {
  id: string;
  title: string;
  subject: string;
  gradeLevel: number;
  duration: number;
  learningObjectives: string[];
  curriculumAlignment: CurriculumStandard[];
  materials: string[];
  activities: Activity[];
  assessmentIdeas: string[];
  differentiation: DifferentiationStrategy[];
  culturalContext: string[];
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  duration: number;
  type: 'warmup' | 'instruction' | 'practice' | 'assessment' | 'closing';
  materials: string[];
  instructions: string[];
}

export interface DifferentiationStrategy {
  type: 'content' | 'process' | 'product' | 'environment';
  description: string;
  targetStudents: 'struggling' | 'on-level' | 'advanced' | 'all';
}

export interface Question {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'fill_blank' | 'matching';
  question: string;
  questionLocalized: Record<Language, string>;
  options?: string[];
  optionsLocalized?: Record<Language, string[]>;
  correctAnswer: string | string[];
  explanation: string;
  explanationLocalized: Record<Language, string>;
  difficulty: number;
  conceptId: string;
  bloomsLevel: string;
  estimatedTime: number;
  topic: string;
  subTopic?: string;
}

// ============================================================================
// Recommendation Types
// ============================================================================

export interface RecommendationRequest {
  studentId: string;
  context: 'daily_practice' | 'weak_area_focus' | 'review' | 'challenge';
  limit: number;
  filters?: RecommendationFilters;
}

export interface RecommendationFilters {
  subjects?: string[];
  contentTypes?: string[];
  difficulty?: { min: number; max: number };
  duration?: { min: number; max: number };
  excludeCompleted?: boolean;
}

export interface Recommendation {
  contentId: string;
  contentType: string;
  title: string;
  description: string;
  reason: string;
  relevanceScore: number;
  predictedEffectiveness: number;
  targetWeakAreas: string[];
  estimatedTime: number;
  difficulty: number;
}

export interface WeaknessProfile {
  studentId: string;
  weakAreas: WeakAreaDetail[];
  patterns: LearningPattern[];
  recommendations: string[];
  lastUpdated: Date;
}

export interface WeakAreaDetail {
  conceptId: string;
  conceptName: string;
  severity: number;
  trend: 'improving' | 'stable' | 'declining';
  firstIdentified: Date;
  lastAttempt: Date;
  totalAttempts: number;
  averageScore: number;
  prerequisiteIssues: string[];
  effectiveStrategies: string[];
}

export interface LearningPattern {
  type: 'time_of_day' | 'content_format' | 'difficulty_preference' | 'topic_affinity';
  description: string;
  confidence: number;
  actionableInsight: string;
}

// ============================================================================
// Analytics Types
// ============================================================================

export interface StudentDashboard {
  studentId: string;
  overallProgress: ProgressSummary;
  currentLearningPath: LearningPathSummary;
  strengths: ConceptSummary[];
  weaknesses: ConceptSummary[];
  recentActivity: ActivityLog[];
  upcomingTasks: Task[];
  achievements: Achievement[];
  recommendations: Recommendation[];
}

export interface TeacherDashboard {
  teacherId: string;
  classes: ClassSummary[];
  overallPerformance: PerformanceSummary;
  commonMisconceptions: Misconception[];
  studentsAtRisk: StudentRiskProfile[];
  recentActivity: ActivityLog[];
  pendingReviews: number;
  insights: TeacherInsight[];
}

export interface ProgressSummary {
  averageScore: number;
  completionRate: number;
  engagementLevel: number;
  masteryRate: number;
  timeSpent: number;
  trend: 'improving' | 'stable' | 'declining';
}

export interface LearningPathSummary {
  id: string;
  subject: string;
  progress: number;
  currentNode: string;
  estimatedCompletion: Date;
}

export interface ConceptSummary {
  conceptId: string;
  conceptName: string;
  score: number;
  masteryLevel: MasteryLevel;
  trend: 'improving' | 'stable' | 'declining';
}

export interface ActivityLog {
  id: string;
  type: string;
  description: string;
  timestamp: Date;
  metadata?: any;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  category: string;
}

export interface PerformanceSummary {
  averageScore: number;
  completionRate: number;
  engagementLevel: number;
  masteryRate: number;
  timeSpent: number;
  trend: 'improving' | 'stable' | 'declining';
}

export interface ClassSummary {
  id: string;
  name: string;
  subject: string;
  studentCount: number;
  averageScore: number;
  completionRate: number;
}

export interface Misconception {
  id: string;
  conceptId: string;
  conceptName: string;
  description: string;
  frequency: number;
  affectedStudents: number;
  suggestedInterventions: string[];
}

export interface StudentRiskProfile {
  studentId: string;
  studentName: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: string[];
  recommendedInterventions: string[];
  lastActive: Date;
}

export interface TeacherInsight {
  type: 'performance' | 'engagement' | 'misconception' | 'recommendation';
  title: string;
  description: string;
  actionable: boolean;
  suggestedActions: string[];
  priority: number;
  affectedStudents?: number;
}

// ============================================================================
// Collaboration Types
// ============================================================================

export interface StudyGroup {
  id: string;
  name: string;
  subject: string;
  members: GroupMember[];
  moderatorId?: string;
  activities: CollaborativeActivity[];
  settings: GroupSettings;
  createdAt: Date;
}

export interface GroupMember {
  userId: string;
  role: 'member' | 'moderator' | 'mentor';
  joinedAt: Date;
  contributionScore: number;
  strengths: string[];
}

export interface CollaborativeActivity {
  id: string;
  type: 'discussion' | 'problem_solving' | 'peer_review' | 'study_session';
  topic: string;
  participants: string[];
  content: any;
  moderationFlags: ModerationFlag[];
  startedAt: Date;
  endedAt?: Date;
}

export interface GroupSettings {
  isPublic: boolean;
  maxMembers: number;
  requireApproval: boolean;
  allowedGradeLevels: number[];
}

export interface ModerationFlag {
  id: string;
  type: 'inappropriate_content' | 'misconception' | 'bullying' | 'spam';
  severity: 'low' | 'medium' | 'high';
  content: string;
  flaggedBy: 'ai' | 'user';
  reviewStatus: 'pending' | 'reviewed' | 'actioned';
  action?: string;
}

export interface TeacherSupportRequest {
  id: string;
  studentId: string;
  subject: string;
  topic: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  preferredLanguage: Language;
  location?: string;
  assignedTeacherId?: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed';
  createdAt: Date;
  scheduledAt?: Date;
}

// ============================================================================
// Classroom Management Types
// ============================================================================

export interface Class {
  id: string;
  name: string;
  subject: string;
  gradeLevel: number;
  teacherId: string;
  students: string[];
  enrollmentCode: string;
  schedule?: ClassSchedule;
  curriculum: CurriculumStandard[];
  status: 'active' | 'archived';
  createdAt: Date;
}

export interface ClassSchedule {
  days: string[];
  startTime: string;
  endTime: string;
  timezone: string;
  room?: string;
}

export interface Assignment {
  id: string;
  classId: string;
  title: string;
  description: string;
  type: 'practice' | 'quiz' | 'project' | 'homework';
  content: AssignmentContent;
  dueDate: Date;
  points: number;
  assignedTo: string[];
  submissions: Submission[];
  gradingSettings: GradingSettings;
  createdAt: Date;
}

export interface AssignmentContent {
  questions?: Question[];
  instructions?: string;
  resources?: string[];
  rubric?: Rubric;
}

export interface Rubric {
  criteria: RubricCriterion[];
  totalPoints: number;
}

export interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  points: number;
  levels: RubricLevel[];
}

export interface RubricLevel {
  level: number;
  description: string;
  points: number;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  content: any;
  submittedAt: Date;
  status: 'submitted' | 'graded' | 'returned';
  grade?: Grade;
  feedback?: string;
  attempts: number;
}

export interface Grade {
  score: number;
  maxScore: number;
  percentage: number;
  letterGrade?: string;
  gradedBy: 'ai' | 'teacher' | 'hybrid';
  gradedAt: Date;
  rubric?: RubricScore[];
}

export interface RubricScore {
  criterionId: string;
  score: number;
  feedback: string;
}

export interface GradingSettings {
  autoGrade: boolean;
  allowMultipleAttempts: boolean;
  maxAttempts?: number;
  showCorrectAnswers: boolean;
  showAnswersAfter?: Date;
  rubric?: Rubric;
}

// ============================================================================
// Chat & Communication Types
// ============================================================================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: any;
}

export interface AssessmentQuestion {
  id: string;
  question: Record<Language, string>;
  options: Record<Language, string[]>;
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
  title: Record<Language, string>;
  description: Record<Language, string>;
  type: 'video' | 'text' | 'interactive';
  topic: string;
  subTopic: string;
  duration: number;
  thumbnail: string;
  reason: Record<Language, string>;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: APIError;
  metadata?: ResponseMetadata;
}

export interface APIError {
  code: string;
  message: string;
  details?: any;
}

export interface ResponseMetadata {
  timestamp: Date;
  requestId: string;
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}
