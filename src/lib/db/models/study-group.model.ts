// Study Group Model - MongoDB
import mongoose, { Schema, Document, Model } from 'mongoose';
import type { StudyGroup, GroupMember, CollaborativeActivity, ModerationFlag } from '@/types';

export interface IStudyGroup extends Omit<StudyGroup, 'id'>, Document {
  _id: string;
}

const GroupMemberSchema = new Schema<GroupMember>({
  userId: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['member', 'moderator', 'mentor'],
    default: 'member'
  },
  joinedAt: { type: Date, default: Date.now },
  contributionScore: { type: Number, default: 0 },
  strengths: [{ type: String }]
}, { _id: false });

const ModerationFlagSchema = new Schema<ModerationFlag>({
  id: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['inappropriate_content', 'misconception', 'bullying', 'spam'],
    required: true 
  },
  severity: { 
    type: String, 
    enum: ['low', 'medium', 'high'],
    required: true 
  },
  content: { type: String, required: true },
  flaggedBy: { 
    type: String, 
    enum: ['ai', 'user'],
    required: true 
  },
  reviewStatus: { 
    type: String, 
    enum: ['pending', 'reviewed', 'actioned'],
    default: 'pending'
  },
  action: { type: String }
}, { _id: false });

const CollaborativeActivitySchema = new Schema<CollaborativeActivity>({
  id: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['discussion', 'problem_solving', 'peer_review', 'study_session'],
    required: true 
  },
  topic: { type: String, required: true },
  participants: [{ type: String }],
  content: { type: Schema.Types.Mixed },
  moderationFlags: [ModerationFlagSchema],
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date }
}, { _id: false });

const GroupSettingsSchema = new Schema({
  isPublic: { type: Boolean, default: false },
  maxMembers: { type: Number, default: 10 },
  requireApproval: { type: Boolean, default: true },
  allowedGradeLevels: [{ type: Number }]
}, { _id: false });

const StudyGroupSchema = new Schema<IStudyGroup>({
  name: { 
    type: String, 
    required: true,
    index: true 
  },
  subject: { 
    type: String, 
    required: true,
    index: true 
  },
  members: [GroupMemberSchema],
  moderatorId: { type: String },
  activities: [CollaborativeActivitySchema],
  settings: { 
    type: GroupSettingsSchema, 
    default: {} 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  collection: 'study_groups'
});

// Indexes
StudyGroupSchema.index({ subject: 1, 'settings.isPublic': 1 });
StudyGroupSchema.index({ 'members.userId': 1 });
StudyGroupSchema.index({ createdAt: -1 });

// Methods
StudyGroupSchema.methods.addMember = function(userId: string, role: string = 'member') {
  if (this.members.some((m: GroupMember) => m.userId === userId)) {
    throw new Error('User already in group');
  }
  
  if (this.members.length >= this.settings.maxMembers) {
    throw new Error('Group is full');
  }
  
  this.members.push({
    userId,
    role,
    joinedAt: new Date(),
    contributionScore: 0,
    strengths: []
  });
  
  return this.save();
};

StudyGroupSchema.methods.removeMember = function(userId: string) {
  this.members = this.members.filter((m: GroupMember) => m.userId !== userId);
  return this.save();
};

StudyGroupSchema.methods.addActivity = function(activity: Omit<CollaborativeActivity, 'id' | 'startedAt'>) {
  this.activities.push({
    ...activity,
    id: new mongoose.Types.ObjectId().toString(),
    startedAt: new Date()
  });
  return this.save();
};

export const StudyGroupModel: Model<IStudyGroup> = 
  mongoose.models.StudyGroup || 
  mongoose.model<IStudyGroup>('StudyGroup', StudyGroupSchema);

export default StudyGroupModel;
