// Thai Education Platform - MongoDB Initialization
// This script runs when the MongoDB container starts for the first time

db = db.getSiblingDB('thai_edu');

// Create collections with validation
db.createCollection('learning_paths', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['studentId', 'subject', 'nodes', 'currentNodeId'],
      properties: {
        studentId: {
          bsonType: 'string',
          description: 'Student ID is required'
        },
        subject: {
          bsonType: 'string',
          description: 'Subject is required'
        },
        nodes: {
          bsonType: 'array',
          description: 'Learning nodes array is required'
        },
        currentNodeId: {
          bsonType: 'string',
          description: 'Current node ID is required'
        }
      }
    }
  }
});

db.createCollection('generated_content', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['type', 'content', 'metadata', 'confidence'],
      properties: {
        type: {
          enum: ['lesson_plan', 'question', 'explanation', 'summary', 'assessment', 'practice_exercise'],
          description: 'Content type is required'
        },
        confidence: {
          bsonType: 'number',
          minimum: 0,
          maximum: 1,
          description: 'Confidence score must be between 0 and 1'
        }
      }
    }
  }
});

db.createCollection('tutor_sessions');
db.createCollection('study_groups');

// Create indexes
db.learning_paths.createIndex({ studentId: 1, subject: 1 });
db.learning_paths.createIndex({ 'weakAreas.severity': 1 });

db.generated_content.createIndex({ type: 1, 'metadata.language': 1 });
db.generated_content.createIndex({ reviewStatus: 1, createdAt: -1 });
db.generated_content.createIndex({ 'metadata.tags': 1 });

db.tutor_sessions.createIndex({ studentId: 1, startedAt: -1 });
db.tutor_sessions.createIndex({ conceptId: 1 });
db.tutor_sessions.createIndex({ escalated: 1, endedAt: 1 });

db.study_groups.createIndex({ subject: 1, 'settings.isPublic': 1 });
db.study_groups.createIndex({ 'members.userId': 1 });

print('✅ Thai Education Platform MongoDB initialized successfully');
