# Database Setup Guide

This guide covers setting up and managing the database layer for the Thai Education Platform.

## Overview

The platform uses a **polyglot persistence** strategy with three database systems:

- **PostgreSQL** - Relational data (users, classes, assignments)
- **MongoDB** - Document storage (learning paths, AI content)
- **Redis** - Caching and session management

## Quick Start with Docker

### 1. Start All Databases

```bash
# Start all services
docker-compose up -d postgres mongodb redis

# Verify all containers are running
docker-compose ps
```

### 2. Initialize Prisma (PostgreSQL)

```bash
# Generate Prisma client
npm run db:generate

# Create database schema
npm run db:push

# Or run migrations (recommended for production)
npm run db:migrate

# Seed with sample data
npm run db:seed
```

### 3. Verify MongoDB

```bash
# MongoDB will auto-initialize with init.js script
# Check MongoDB Express at http://localhost:8081
# Username: admin, Password: admin123
```

### 4. Verify PostgreSQL

```bash
# Open Adminer at http://localhost:8080
# System: PostgreSQL
# Server: postgres
# Username: thai_edu_user
# Password: thai_edu_password
# Database: thai_edu
```

## Database Schemas

### PostgreSQL Schema (Prisma)

Located at: `prisma/schema.prisma`

**Key Tables:**
- `users` - User accounts and profiles
- `classes` - Class management
- `class_enrollments` - Student-class relationships
- `assignments` - Homework and quizzes
- `submissions` - Student work submissions
- `performance_metrics` - Learning progress tracking
- `weak_areas` - Struggling concepts
- `teacher_support_requests` - Student help requests
- `content_reviews` - Human-in-the-loop AI review
- `sessions` - User session management
- `notifications` - User notifications
- `audit_logs` - System audit trail

### MongoDB Collections (Mongoose)

Located at: `src/lib/db/models/`

**Collections:**
- `learning_paths` - Personalized learning journeys
- `generated_content` - AI-generated educational content
- `tutor_sessions` - AI tutor conversation history
- `study_groups` - Collaborative learning groups

## Prisma Commands

### Development

```bash
# Generate Prisma Client (run after schema changes)
npm run db:generate

# Push schema changes to database (development only)
npm run db:push

# Create a new migration
npm run db:migrate

# View database in Prisma Studio
npm run db:studio  # Opens at http://localhost:5555
```

### Production

```bash
# Deploy migrations
npm run db:migrate:prod

# Generate client for production
npm run db:generate
```

### Database Reset

```bash
# WARNING: This will delete all data!
npm run db:reset

# Manual reset
npx prisma migrate reset
```

## Seeding Data

### Run Seed Script

```bash
npm run db:seed
```

### Sample Accounts Created

After seeding, you can login with:

**Admin:**
- Email: `admin@thai-edu.com`
- Password: `password123`

**Teacher:**
- Email: `teacher@thai-edu.com`
- Password: `password123`

**Students:**
- Email: `student1@thai-edu.com`, `student2@thai-edu.com`, `student3@thai-edu.com`
- Password: `password123`

### Seed Data Includes

- 1 Admin user
- 1 Teacher user
- 3 Student users
- 2 Classes (Math, Science)
- Class enrollments
- Sample assignments
- Performance metrics
- Weak areas

## MongoDB Operations

### Connect to MongoDB

```typescript
import { connectMongoDB } from '@/lib/db/mongodb';

// Establish connection
await connectMongoDB();
```

### Using Models

```typescript
import { LearningPathModel } from '@/lib/db/models';

// Create a learning path
const learningPath = await LearningPathModel.create({
  studentId: 'user123',
  subject: 'Mathematics',
  nodes: [...],
  currentNodeId: 'node1',
  weakAreas: []
});

// Find learning paths
const paths = await LearningPathModel.find({
  studentId: 'user123'
});

// Update progress
const updated = await LearningPathModel.findByIdAndUpdate(
  pathId,
  { currentNodeId: 'node2' },
  { new: true }
);
```

## PostgreSQL Operations

### Using Prisma Client

```typescript
import { prisma } from '@/lib/db/prisma';

// Create a user
const user = await prisma.user.create({
  data: {
    email: 'new@example.com',
    password: hashedPassword,
    role: 'STUDENT',
    firstName: 'John',
    lastName: 'Doe'
  }
});

// Find users with relations
const users = await prisma.user.findMany({
  where: { role: 'STUDENT' },
  include: {
    enrollments: {
      include: {
        class: true
      }
    }
  }
});

// Update user
await prisma.user.update({
  where: { id: userId },
  data: { lastLogin: new Date() }
});

// Complex queries
const classPerformance = await prisma.performanceMetric.groupBy({
  by: ['studentId'],
  where: { subject: 'Mathematics' },
  _avg: { masteryLevel: true }
});
```

## Database Migrations

### Creating Migrations

```bash
# After modifying prisma/schema.prisma
npm run db:migrate

# Name your migration descriptively
# Example: add_user_preferences_table
```

### Migration Files

Located at: `prisma/migrations/`

Each migration contains:
- `migration.sql` - SQL to apply changes
- Timestamp prefix for ordering

### Applying Migrations

**Development:**
```bash
npm run db:migrate
```

**Production:**
```bash
npm run db:migrate:prod
```

## Backup and Restore

### PostgreSQL Backup

```bash
# Backup
docker exec thai-edu-postgres pg_dump -U thai_edu_user thai_edu > backup.sql

# Restore
docker exec -i thai-edu-postgres psql -U thai_edu_user thai_edu < backup.sql
```

### MongoDB Backup

```bash
# Backup
docker exec thai-edu-mongodb mongodump --username=thai_edu_user --password=thai_edu_password --authenticationDatabase=admin --db=thai_edu --out=/backup

# Restore
docker exec thai-edu-mongodb mongorestore --username=thai_edu_user --password=thai_edu_password --authenticationDatabase=admin --db=thai_edu /backup/thai_edu
```

## Indexes and Performance

### PostgreSQL Indexes

Key indexes defined in schema:
```prisma
@@index([email])
@@index([role])
@@index([classId])
@@index([studentId])
@@index([assignmentId])
```

### MongoDB Indexes

Key indexes created in init script:
```javascript
db.learning_paths.createIndex({ studentId: 1, subject: 1 });
db.generated_content.createIndex({ type: 1, 'metadata.language': 1 });
db.tutor_sessions.createIndex({ studentId: 1, startedAt: -1 });
```

### Query Optimization

**Use Prisma Select:**
```typescript
// Only fetch needed fields
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: {
    id: true,
    email: true,
    firstName: true,
    // Don't fetch password
  }
});
```

**Use MongoDB Projections:**
```typescript
// Exclude large fields
const paths = await LearningPathModel.find(
  { studentId: userId },
  { 'nodes.content': 0 } // Exclude content
);
```

## Connection Pooling

### PostgreSQL (Prisma)

Configured in `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### MongoDB (Mongoose)

Configured in `src/lib/db/mongodb.ts`:
```typescript
{
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
}
```

## Environment Variables

Required in `.env.local`:

```bash
# PostgreSQL
DATABASE_URL="postgresql://thai_edu_user:thai_edu_password@localhost:5432/thai_edu"

# MongoDB
MONGODB_URI="mongodb://thai_edu_user:thai_edu_password@localhost:27017/thai_edu"

# Redis
REDIS_URL="redis://localhost:6379"
```

## Troubleshooting

### Prisma Issues

**Problem:** "Prisma Client not generated"
```bash
npm run db:generate
```

**Problem:** Migration failed
```bash
# Check migration status
npx prisma migrate status

# Reset if needed (WARNING: deletes data)
npx prisma migrate reset
```

### MongoDB Issues

**Problem:** Connection refused
```bash
# Check if MongoDB is running
docker-compose ps mongodb

# View logs
docker-compose logs mongodb
```

**Problem:** Authentication failed
```bash
# Verify credentials in .env.local
# Restart MongoDB container
docker-compose restart mongodb
```

### PostgreSQL Issues

**Problem:** Cannot connect
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# View logs
docker-compose logs postgres
```

**Problem:** Database doesn't exist
```bash
# Recreate database
docker-compose down postgres
docker-compose up -d postgres
npm run db:push
```

## Production Considerations

### Security

1. **Strong Passwords**: Use strong passwords in production
2. **SSL/TLS**: Enable SSL for database connections
3. **Network Security**: Use private networks, firewalls
4. **Least Privilege**: Grant minimal required permissions

### Monitoring

1. **Connection Pool Monitoring**: Track active connections
2. **Query Performance**: Monitor slow queries
3. **Storage**: Track database size and growth
4. **Backups**: Automated daily backups

### Scaling

1. **Read Replicas**: For PostgreSQL read scaling
2. **Sharding**: For MongoDB horizontal scaling
3. **Redis Cluster**: For distributed caching
4. **Connection Pooling**: PgBouncer for PostgreSQL

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Mongoose Documentation](https://mongoosejs.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com)

---

For more information, see the [Architecture Guide](./architecture.md).
