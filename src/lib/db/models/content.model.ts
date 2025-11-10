// Generated Content Model - MongoDB
import mongoose, { Schema, Document, Model } from 'mongoose';
import type { GeneratedContent, ContentMetadata } from '@/types';

export interface IGeneratedContent extends Omit<GeneratedContent, 'id'>, Document {
  _id: string;
}

const ContentMetadataSchema = new Schema<ContentMetadata>({
  generatedBy: { 
    type: String, 
    enum: ['ai', 'teacher', 'hybrid'],
    required: true 
  },
  aiModel: { type: String },
  confidence: { type: Number, required: true, min: 0, max: 1 },
  culturalRelevance: { type: Number, min: 0, max: 1 },
  curriculumAlignment: [{ 
    type: Schema.Types.Mixed 
  }],
  tags: [{ type: String }],
  language: { 
    type: String, 
    enum: ['th', 'en'],
    required: true 
  }
}, { _id: false });

const GeneratedContentSchema = new Schema<IGeneratedContent>({
  type: { 
    type: String, 
    required: true,
    index: true,
    enum: [
      'lesson_plan', 
      'question', 
      'explanation', 
      'summary', 
      'assessment',
      'practice_exercise'
    ]
  },
  content: { 
    type: Schema.Types.Mixed, 
    required: true 
  },
  metadata: { 
    type: ContentMetadataSchema, 
    required: true 
  },
  reviewStatus: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'needs_revision'],
    default: 'pending',
    index: true
  },
  reviewedBy: { type: String },
  reviewNotes: { type: String },
  confidence: { 
    type: Number, 
    required: true,
    min: 0,
    max: 1
  },
  usageCount: { 
    type: Number, 
    default: 0 
  },
  effectivenessScore: { 
    type: Number, 
    min: 0,
    max: 1
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  collection: 'generated_content'
});

// Indexes
GeneratedContentSchema.index({ type: 1, 'metadata.language': 1 });
GeneratedContentSchema.index({ reviewStatus: 1, createdAt: -1 });
GeneratedContentSchema.index({ 'metadata.tags': 1 });
GeneratedContentSchema.index({ confidence: -1 });

// Methods
GeneratedContentSchema.methods.incrementUsage = function() {
  this.usageCount++;
  return this.save();
};

GeneratedContentSchema.methods.updateEffectiveness = function(score: number) {
  if (this.effectivenessScore) {
    // Weighted average: 70% previous, 30% new
    this.effectivenessScore = (this.effectivenessScore * 0.7) + (score * 0.3);
  } else {
    this.effectivenessScore = score;
  }
  return this.save();
};

export const GeneratedContentModel: Model<IGeneratedContent> = 
  mongoose.models.GeneratedContent || 
  mongoose.model<IGeneratedContent>('GeneratedContent', GeneratedContentSchema);

export default GeneratedContentModel;
