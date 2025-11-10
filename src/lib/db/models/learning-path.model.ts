// Learning Path Model - MongoDB
import mongoose, { Schema, Document, Model } from 'mongoose';
import type { LearningPath, LearningNode, WeakArea } from '@/types';

export interface ILearningPath extends Omit<LearningPath, 'id'>, Document {
  _id: string;
}

const WeakAreaSchema = new Schema<WeakArea>({
  conceptId: { type: String, required: true },
  conceptName: { type: String, required: true },
  severity: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'],
    required: true 
  },
  identifiedAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 },
  averageScore: { type: Number, required: true },
  prerequisiteGaps: [{ type: String }],
  recommendedContent: [{ type: String }]
}, { _id: false });

const LearningNodeSchema = new Schema<LearningNode>({
  id: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['concept', 'practice', 'assessment', 'review'],
    required: true 
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  content: { type: Schema.Types.Mixed, required: true },
  prerequisites: [{ type: String }],
  difficulty: { type: Number, required: true, min: 1, max: 10 },
  estimatedTime: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['locked', 'available', 'in_progress', 'completed', 'mastered'],
    default: 'locked'
  },
  masteryScore: { type: Number, min: 0, max: 1 },
  completedAt: { type: Date }
}, { _id: false });

const CurriculumStandardSchema = new Schema({
  standardId: { type: String, required: true },
  standardCode: { type: String, required: true },
  standardName: { type: String, required: true },
  description: { type: String },
  gradeLevel: { type: Number },
  subject: { type: String }
}, { _id: false });

const LearningPathSchema = new Schema<ILearningPath>({
  studentId: { 
    type: String, 
    required: true,
    index: true 
  },
  subject: { 
    type: String, 
    required: true,
    index: true 
  },
  curriculumAlignment: [CurriculumStandardSchema],
  nodes: [LearningNodeSchema],
  currentNodeId: { type: String, required: true },
  weakAreas: [WeakAreaSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  collection: 'learning_paths'
});

// Indexes
LearningPathSchema.index({ studentId: 1, subject: 1 });
LearningPathSchema.index({ 'weakAreas.severity': 1 });

// Methods
LearningPathSchema.methods.getProgress = function(): number {
  const completed = this.nodes.filter((n: LearningNode) => 
    n.status === 'completed' || n.status === 'mastered'
  ).length;
  return (completed / this.nodes.length) * 100;
};

LearningPathSchema.methods.getNextNode = function(): LearningNode | null {
  return this.nodes.find((n: LearningNode) => n.status === 'available') || null;
};

export const LearningPathModel: Model<ILearningPath> = 
  mongoose.models.LearningPath || 
  mongoose.model<ILearningPath>('LearningPath', LearningPathSchema);

export default LearningPathModel;
