# 🚀 Quick Reference - Database Layer

## Start Development Environment

```bash
# 1. Start databases
docker-compose up -d postgres mongodb redis

# 2. Setup database schema
npm run db:generate
npm run db:push

# 3. Seed sample data
npm run db:seed

# 4. Start development server
npm run dev
```

## Database Access

| Service | URL | Credentials |
|---------|-----|-------------|
| **PostgreSQL** | `localhost:5432` | user: `thai_edu_user` / pass: `thai_edu_password` |
| **MongoDB** | `localhost:27017` | user: `thai_edu_user` / pass: `thai_edu_password` |
| **Redis** | `localhost:6379` | (no auth) |
| **Adminer (PG GUI)** | http://localhost:8080 | server: `postgres` |
| **Mongo Express** | http://localhost:8081 | user: `admin` / pass: `admin123` |
| **Prisma Studio** | http://localhost:5555 | Run: `npm run db:studio` |

## Test Accounts (After Seeding)

```bash
# Admin
admin@thai-edu.com / password123

# Teacher
teacher@thai-edu.com / password123

# Students
student1@thai-edu.com / password123
student2@thai-edu.com / password123
student3@thai-edu.com / password123
```

## Common Database Operations

### PostgreSQL (Prisma)

```typescript
import { prisma } from '@/lib/db/prisma';

// Create
await prisma.user.create({ data: {...} });

// Read
await prisma.user.findUnique({ where: { id } });
await prisma.user.findMany({ where: { role: 'STUDENT' } });

// Update
await prisma.user.update({ where: { id }, data: {...} });

// Delete
await prisma.user.delete({ where: { id } });

// Relations
await prisma.user.findUnique({
  where: { id },
  include: { enrollments: true }
});
```

### MongoDB (Mongoose)

```typescript
import { LearningPathModel } from '@/lib/db/models';

// Create
await LearningPathModel.create({...});

// Read
await LearningPathModel.findById(id);
await LearningPathModel.find({ studentId });

// Update
await LearningPathModel.findByIdAndUpdate(id, {...}, { new: true });

// Delete
await LearningPathModel.findByIdAndDelete(id);

// Custom methods
const path = await LearningPathModel.findById(id);
const progress = path.getProgress();
const nextNode = path.getNextNode();
```

## Database Commands Cheat Sheet

```bash
# Prisma
npm run db:generate        # Generate Prisma Client
npm run db:push           # Push schema (dev)
npm run db:migrate        # Create migration
npm run db:migrate:prod   # Deploy migrations (prod)
npm run db:studio         # Open Prisma Studio
npm run db:seed           # Seed database
npm run db:reset          # Reset (⚠️ deletes data)

# Docker
docker-compose up -d              # Start all services
docker-compose down               # Stop all services
docker-compose down -v            # Stop and remove volumes
docker-compose logs -f postgres   # View PostgreSQL logs
docker-compose logs -f mongodb    # View MongoDB logs
docker-compose ps                 # Check service status
docker-compose restart postgres   # Restart service
```

## Database Models Reference

### PostgreSQL Tables (12)
1. `users` - User accounts
2. `classes` - Classes
3. `class_enrollments` - Student enrollments
4. `assignments` - Homework/quizzes
5. `submissions` - Student work
6. `performance_metrics` - Learning progress
7. `weak_areas` - Struggling concepts
8. `teacher_support_requests` - Help requests
9. `content_reviews` - AI content review
10. `sessions` - User sessions
11. `notifications` - Notifications
12. `audit_logs` - Audit trail

### MongoDB Collections (4)
1. `learning_paths` - Personalized paths
2. `generated_content` - AI content
3. `tutor_sessions` - AI tutoring
4. `study_groups` - Collaboration

## Query Examples

### Find Student with All Data
```typescript
const student = await prisma.user.findUnique({
  where: { id: studentId },
  include: {
    enrollments: {
      include: { class: true }
    },
    submissions: {
      include: { assignment: true }
    },
    performanceMetrics: true,
    weakAreas: true
  }
});
```

### Get Student Learning Path
```typescript
const path = await LearningPathModel.findOne({
  studentId,
  subject: 'Mathematics'
});
const progress = path.getProgress();
```

### Get Class Performance Summary
```typescript
const performance = await prisma.performanceMetric.groupBy({
  by: ['studentId'],
  where: { subject: 'Mathematics' },
  _avg: {
    masteryLevel: true,
    averageScore: true
  }
});
```

### Create AI Tutor Session
```typescript
const session = await TutorSessionModel.create({
  studentId,
  conceptId: 'math-algebra-01',
  messages: [],
  context: {
    currentTopic: 'Linear Equations',
    studentLevel: 8,
    languagePreference: 'th'
  }
});

await session.addMessage({
  role: 'student',
  content: 'ฉันไม่เข้าใจสมการเชิงเส้น',
  contentType: 'text'
});
```

## Troubleshooting

### Problem: Prisma Client not found
```bash
npm run db:generate
```

### Problem: Cannot connect to database
```bash
# Check if containers are running
docker-compose ps

# Restart databases
docker-compose restart postgres mongodb
```

### Problem: Migration failed
```bash
# Check migration status
npx prisma migrate status

# Reset (⚠️ development only)
npm run db:reset
```

### Problem: MongoDB authentication failed
```bash
# Check .env.local has correct URI with authSource
MONGODB_URI="mongodb://thai_edu_user:thai_edu_password@localhost:27017/thai_edu?authSource=admin"
```

## Environment Variables

```bash
# Required in .env.local
DATABASE_URL="postgresql://thai_edu_user:thai_edu_password@localhost:5432/thai_edu"
MONGODB_URI="mongodb://thai_edu_user:thai_edu_password@localhost:27017/thai_edu?authSource=admin"
REDIS_URL="redis://localhost:6379"
GOOGLE_AI_API_KEY="your_key"
JWT_SECRET="your_secret"
```

## Import Paths

```typescript
// Prisma
import { prisma } from '@/lib/db/prisma';
import { User, UserRole } from '@prisma/client';

// MongoDB
import { connectMongoDB } from '@/lib/db/mongodb';
import { 
  LearningPathModel,
  GeneratedContentModel,
  TutorSessionModel,
  StudyGroupModel
} from '@/lib/db/models';

// Types
import type {
  User,
  LearningPath,
  TutorSession,
  GeneratedContent
} from '@/types';
```

## Useful SQL Queries (via Adminer)

```sql
-- Find all students in a class
SELECT u.* FROM users u
JOIN class_enrollments ce ON u.id = ce.student_id
WHERE ce.class_id = 'class-uuid';

-- Get student performance summary
SELECT 
  concept_id,
  AVG(mastery_level) as avg_mastery,
  COUNT(*) as attempts
FROM performance_metrics
WHERE student_id = 'student-uuid'
GROUP BY concept_id;

-- Find weak areas needing attention
SELECT * FROM weak_areas
WHERE severity IN ('high', 'critical')
  AND status = 'active'
ORDER BY identified_at DESC;
```

## Performance Tips

1. **Use Select/Projection** - Fetch only needed fields
2. **Use Indexes** - All frequently queried fields are indexed
3. **Use Connection Pooling** - Already configured
4. **Cache Frequent Queries** - Use Redis for hot data
5. **Batch Operations** - Use `createMany`, `updateMany`

## Documentation Links

- [Complete Database Guide](./docs/database.md)
- [Architecture Overview](./docs/architecture.md)
- [API Reference](./docs/api.md)
- [Prisma Docs](https://www.prisma.io/docs)
- [Mongoose Docs](https://mongoosejs.com/docs)

---

**Remember:** Always seed the database after `db:push` or `db:reset`!
