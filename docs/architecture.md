# Architecture Guide

## System Overview

The Thai Education Platform is a microservices-based architecture designed for scalability, reliability, and maintainability. This document outlines the key architectural decisions and component interactions.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Web Browser  │  │  Mobile PWA  │  │ Offline Mode │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Next.js    │  │     Auth     │  │ Rate Limiter │          │
│  │  API Routes  │  │ Middleware   │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                             │
          ┌──────────────────┼──────────────────┐
          ▼                  ▼                  ▼
┌──────────────────┐ ┌──────────────┐ ┌──────────────────┐
│  User Service    │ │Learning Svc  │ │  Content Service │
│  - Auth          │ │- Paths       │ │  - Generation    │
│  - Profiles      │ │- Progress    │ │  - Storage       │
│  - Preferences   │ │- Assessment  │ │  - Review        │
└──────────────────┘ └──────────────┘ └──────────────────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       AI/ML Layer                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  AI Tutor    │  │   Content    │  │Recommendation│          │
│  │   Engine     │  │  Generator   │  │    Engine    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         │                  │                  │                  │
│         └──────────────────┼──────────────────┘                  │
│                            ▼                                     │
│              ┌──────────────────────────┐                        │
│              │   Google AI (Gemini)     │                        │
│              └──────────────────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
                             │
          ┌──────────────────┼──────────────────┐
          ▼                  ▼                  ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  PostgreSQL  │   │   MongoDB    │   │    Redis     │
│  (Relations) │   │  (Documents) │   │   (Cache)    │
└──────────────┘   └──────────────┘   └──────────────┘
```

## Component Details

### 1. Frontend Layer (Next.js 14+)

**Technology Stack:**
- Next.js 14 with App Router
- React 18 with Server Components
- TypeScript for type safety
- TailwindCSS + Radix UI for styling
- Zustand for client state management
- React Query for server state
- PWA for offline support

**Key Features:**
- Server-Side Rendering (SSR) for SEO and performance
- Static Site Generation (SSG) for content pages
- API Routes for backend integration
- Progressive Web App capabilities
- Responsive design for all devices

**File Structure:**
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (login, register)
│   ├── (dashboard)/       # Dashboard pages
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # UI primitives
│   └── features/         # Feature components
├── lib/                  # Utilities and services
│   ├── ai/              # AI services
│   ├── db/              # Database clients
│   └── utils/           # Helper functions
└── types/               # TypeScript types
```

### 2. AI/ML Services

**AI Service Layer** (`src/lib/ai/index.ts`):
- Central interface for all AI operations
- Google Gemini integration
- Response caching
- Error handling and fallbacks
- Token usage tracking

**AI Tutor Service** (`src/lib/ai/tutor.ts`):
- Personalized feedback generation
- Concept explanations
- Conversation management
- Escalation detection
- Thai cultural context integration

**Content Generator** (`src/lib/ai/content-generator.ts`):
- Question generation
- Lesson plan creation
- Assessment building
- Thai curriculum alignment
- Cultural appropriateness checking

### 3. Database Layer

**PostgreSQL** - Relational Data:
- User accounts and authentication
- Class enrollment and management
- Assignments and submissions
- Performance metrics
- Audit logs

**MongoDB** - Document Storage:
- Learning paths (flexible schema)
- Generated content (AI outputs)
- Tutor sessions (conversation history)
- User preferences
- Study groups

**Redis** - Caching:
- Session storage
- API response cache
- Rate limiting
- Real-time features
- Job queues

### 4. Authentication & Authorization

**JWT-Based Authentication:**
```typescript
interface AuthToken {
  userId: string;
  role: 'student' | 'teacher' | 'admin';
  sessionId: string;
  exp: number;
}
```

**Role-Based Access Control (RBAC):**
```typescript
enum Permission {
  VIEW_OWN_PROGRESS,
  SUBMIT_ASSIGNMENTS,
  CREATE_ASSIGNMENTS,
  GRADE_SUBMISSIONS,
  MANAGE_USERS,
  // ... more permissions
}

const rolePermissions = {
  student: [Permission.VIEW_OWN_PROGRESS, ...],
  teacher: [Permission.VIEW_CLASS_DATA, ...],
  admin: [...all permissions]
};
```

### 5. API Design

**RESTful API Endpoints:**

```
Authentication:
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
POST   /api/auth/reset-password

AI Tutor:
POST   /api/tutor/feedback
POST   /api/tutor/explanation
POST   /api/tutor/session
GET    /api/tutor/session/:id

Content Generation:
POST   /api/content/questions
POST   /api/content/lesson-plan
POST   /api/content/assessment
GET    /api/content/:id
PUT    /api/content/:id/review

Learning Paths:
POST   /api/learning-paths
GET    /api/learning-paths/:studentId
PUT    /api/learning-paths/:id/progress
GET    /api/learning-paths/:id/weak-areas

Classes & Assignments:
POST   /api/classes
GET    /api/classes/:id
POST   /api/classes/:id/assignments
POST   /api/assignments/:id/submit
PUT    /api/submissions/:id/grade

Analytics:
GET    /api/analytics/student/:id
GET    /api/analytics/teacher/:id
GET    /api/analytics/class/:id
```

**API Response Format:**
```typescript
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    requestId: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
    };
  };
}
```

### 6. Caching Strategy

**Multi-Layer Caching:**

1. **Browser Cache** (Service Worker):
   - Static assets: 7 days
   - API responses: 5 minutes
   - Offline content: Persistent

2. **CDN Cache** (CloudFlare):
   - Images/videos: 24 hours
   - Static content: 1 hour
   - API responses: 5 minutes

3. **Redis Cache**:
   - User sessions: 1 hour
   - User profiles: 30 minutes
   - Learning paths: 1 hour
   - AI responses: 24 hours
   - Recommendations: 30 minutes

### 7. Error Handling

**Error Hierarchy:**
```typescript
class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message);
  }
}

class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super('VALIDATION_ERROR', message, 400, details);
  }
}

class AuthenticationError extends AppError {
  constructor(message: string) {
    super('AUTH_ERROR', message, 401);
  }
}

class AIServiceError extends AppError {
  constructor(message: string, details?: any) {
    super('AI_SERVICE_ERROR', message, 500, details);
  }
}
```

### 8. Security Measures

**Data Protection:**
- AES-256 encryption at rest
- TLS 1.3 for data in transit
- Field-level encryption for sensitive data
- PDPA-compliant data handling

**Authentication Security:**
- JWT with short expiration (15 min)
- Refresh tokens (7 days)
- HTTP-only secure cookies
- CSRF protection
- Rate limiting

**API Security:**
- Input validation (Zod schemas)
- SQL injection prevention (Prisma ORM)
- XSS protection
- CORS configuration
- API rate limiting

### 9. Monitoring & Logging

**Observability Stack:**
```
Metrics:    Prometheus + Grafana
Logging:    Winston + ELK Stack
Tracing:    OpenTelemetry + Jaeger
APM:        Custom metrics collection
Alerting:   PagerDuty + Slack
```

**Key Metrics:**
- Response time (p50, p95, p99)
- Error rate
- AI generation time
- Cache hit rate
- Database query time
- Concurrent users

### 10. Scalability Considerations

**Horizontal Scaling:**
- Stateless API servers
- Load balancer (Nginx/AWS ALB)
- Database read replicas
- Redis cluster for caching
- CDN for static assets

**Performance Optimization:**
- Database indexing
- Query optimization
- Connection pooling
- Batch operations
- Lazy loading
- Code splitting

### 11. Thai Language Support

**Internationalization (i18n):**
- next-intl for translation management
- Thai and English language support
- RTL text support (if needed)
- Date/time localization
- Number formatting

**Thai Cultural Context:**
- Curriculum alignment with Thai standards
- Thai-specific examples and scenarios
- Buddhist calendar support
- Thai holiday recognition
- Regional content adaptation

### 12. Offline Support

**PWA Features:**
- Service worker for offline caching
- Background sync for submissions
- Indexed DB for local storage
- Offline-first architecture
- Sync conflict resolution

**Cached Content:**
- Learning modules
- Practice exercises
- User progress
- Study materials
- UI assets

## Deployment Architecture

**Production Environment:**
```
┌─────────────────┐
│   CloudFlare    │  CDN + DDoS Protection
│      CDN        │
└────────┬────────┘
         │
┌────────▼────────┐
│  Load Balancer  │  AWS ALB / Nginx
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼──┐  ┌──▼───┐
│ App1 │  │ App2 │  Next.js Servers (Auto-scaling)
└───┬──┘  └──┬───┘
    │        │
    └────┬───┘
         │
    ┌────▼────────────────┐
    │   Database Cluster  │
    │  - PostgreSQL (RDS) │
    │  - MongoDB (Atlas)  │
    │  - Redis (Elasticache)│
    └─────────────────────┘
```

## Best Practices

1. **Code Organization:**
   - Feature-based structure
   - Separation of concerns
   - DRY principles
   - SOLID principles

2. **Testing:**
   - Unit tests for business logic
   - Integration tests for APIs
   - E2E tests for critical flows
   - AI output testing

3. **Documentation:**
   - API documentation (OpenAPI)
   - Code comments for complex logic
   - Architecture diagrams
   - Deployment guides

4. **Version Control:**
   - Git flow branching strategy
   - Semantic versioning
   - Conventional commits
   - PR review process

5. **CI/CD:**
   - Automated testing
   - Linting and formatting
   - Security scanning
   - Automated deployment

## Future Enhancements

1. **GraphQL API** - More flexible data querying
2. **WebSocket** - Real-time collaboration
3. **Machine Learning** - Custom Thai language models
4. **Mobile Apps** - Native iOS/Android apps
5. **Voice Interface** - Speech-to-text for Thai
6. **Blockchain** - Credential verification
7. **Microservices** - Split into independent services

## Conclusion

This architecture is designed to scale with the platform's growth while maintaining security, performance, and cultural relevance for Thai education. The modular design allows for independent scaling and updating of components as needs evolve.
