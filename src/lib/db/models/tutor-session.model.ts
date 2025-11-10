// Tutor Session Model - MongoDB
import mongoose, { Schema, Document, Model } from 'mongoose';
import type { TutorSession, TutorMessage, SessionContext, Feedback } from '@/types';

export interface ITutorSession extends Omit<TutorSession, 'id'>, Document {
  _id: string;
}

const FeedbackSchema = new Schema<Feedback>({
  type: { 
    type: String, 
    enum: ['correct', 'incorrect', 'partial', 'hint', 'explanation'],
    required: true 
  },
  message: { type: String, required: true },
  reasoning: { type: String, required: true },
  nextSteps: [{ type: String }],
  alternativeExplanations: [{ type: String }],
  relatedConcepts: [{ type: String }]
}, { _id: false });

const TutorMessageSchema = new Schema<TutorMessage>({
  id: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['student', 'tutor', 'system'],
    required: true 
  },
  content: { type: String, required: true },
  contentType: { 
    type: String, 
    enum: ['text', 'image', 'audio', 'code'],
    default: 'text'
  },
  timestamp: { type: Date, default: Date.now },
  feedback: { type: FeedbackSchema },
  confidence: { type: Number, min: 0, max: 1 }
}, { _id: false });

const SessionContextSchema = new Schema<SessionContext>({
  currentTopic: { type: String, required: true },
  studentLevel: { type: Number, required: true },
  learningStyle: { type: String },
  previousAttempts: { type: Number, default: 0 },
  weakAreas: [{ type: String }],
  languagePreference: { 
    type: String, 
    enum: ['th', 'en'],
    default: 'th'
  }
}, { _id: false });

const TutorSessionSchema = new Schema<ITutorSession>({
  studentId: { 
    type: String, 
    required: true,
    index: true 
  },
  conceptId: { 
    type: String, 
    required: true,
    index: true 
  },
  messages: [TutorMessageSchema],
  context: { 
    type: SessionContextSchema, 
    required: true 
  },
  escalated: { 
    type: Boolean, 
    default: false,
    index: true
  },
  escalationReason: { type: String },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date }
}, {
  timestamps: true,
  collection: 'tutor_sessions'
});

// Indexes
TutorSessionSchema.index({ studentId: 1, startedAt: -1 });
TutorSessionSchema.index({ conceptId: 1 });
TutorSessionSchema.index({ escalated: 1, endedAt: 1 });

// Methods
TutorSessionSchema.methods.addMessage = function(message: Omit<TutorMessage, 'id' | 'timestamp'>) {
  this.messages.push({
    ...message,
    id: new mongoose.Types.ObjectId().toString(),
    timestamp: new Date()
  });
  return this.save();
};

TutorSessionSchema.methods.getDuration = function(): number | null {
  if (!this.endedAt) return null;
  return this.endedAt.getTime() - this.startedAt.getTime();
};

TutorSessionSchema.methods.getMessageCount = function(): number {
  return this.messages.length;
};

export const TutorSessionModel: Model<ITutorSession> = 
  mongoose.models.TutorSession || 
  mongoose.model<ITutorSession>('TutorSession', TutorSessionSchema);

export default TutorSessionModel;
