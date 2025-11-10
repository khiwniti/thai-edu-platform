# API Documentation

## Overview

This document describes the REST API endpoints for the Thai Education Platform. All endpoints use JSON for request and response bodies.

## Base URL

```
Development: http://localhost:3000/api
Production:  https://api.thai-edu-platform.com
```

## Authentication

Most endpoints require authentication using JWT tokens.

### Authentication Headers

```
Authorization: Bearer <jwt_token>
```

### Token Refresh

Access tokens expire after 15 minutes. Use the refresh endpoint to get a new token.

---

## API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "SecurePassword123!",
  "role": "student",
  "profile": {
    "firstName": "Somchai",
    "lastName": "Prasert",
    "thaiName": "สมชาย ประเสริฐ",
    "grade": 8,
    "school": "โรงเรียนสตรีวิทยา",
    "province": "กรุงเทพมหานคร"
  },
  "preferences": {
    "language": "th",
    "theme": "light"
  }
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_123456",
      "email": "student@example.com",
      "role": "student",
      "profile": { ... }
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc...",
      "expiresIn": 900
    }
  }
}
```

#### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "SecurePassword123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc...",
      "expiresIn": 900
    }
  }
}
```

---

### AI Tutor

#### Get Feedback on Answer
```http
POST /api/tutor/feedback
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "question": "What is 2 + 2?",
  "studentAnswer": "5",
  "correctAnswer": "4",
  "context": {
    "currentTopic": "Basic Addition",
    "studentLevel": 3,
    "learningStyle": "visual",
    "previousAttempts": 1,
    "weakAreas": ["addition", "mental-math"],
    "languagePreference": "th"
  },
  "language": "th"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "type": "incorrect",
    "message": "คำตอบของคุณยังไม่ถูกต้อง แต่ไม่เป็นไร! ลองคิดดูอีกครั้งนะ ถ้าเรามีแอปเปิ้ล 2 ลูก แล้วได้รับเพิ่มอีก 2 ลูก จะเป็นทั้งหมดกี่ลูก?",
    "reasoning": "Student provided incorrect answer (5 instead of 4) for basic addition problem",
    "nextSteps": [
      "ลองนับด้วยนิ้วของคุณ หรือวาดรูปแอปเปิ้ลออกมา",
      "เริ่มจาก 2 แล้วนับเพิ่มอีก 2",
      "ลองใช้สิ่งของรอบตัวช่วยนับ เช่น ปากกา หรือ ดินสอ"
    ],
    "alternativeExplanations": [
      "คิดว่าคุณมีเหรียญ 2 เหรียญในมือซ้าย และอีก 2 เหรียญในมือขวา รวมกันคุณมีทั้งหมดกี่เหรียญ?"
    ],
    "relatedConcepts": ["counting", "number-bonds", "visualization"]
  }
}
```

#### Generate Explanation
```http
POST /api/tutor/explanation
```

**Request Body:**
```json
{
  "topic": "Mathematics",
  "concept": "Fractions",
  "context": {
    "currentTopic": "Introduction to Fractions",
    "studentLevel": 5,
    "learningStyle": "visual",
    "previousAttempts": 0,
    "weakAreas": [],
    "languagePreference": "th"
  },
  "language": "th",
  "previousExplanations": []
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "explanation": "เศษส่วน คือการแบ่งสิ่งของออกเป็นส่วนเท่าๆ กัน ลองคิดถึงพิซซ่า 1 แผ่นที่ถูกหั่นเป็น 4 ชิ้นเท่าๆ กัน ถ้าคุณกินไป 1 ชิ้น คุณก็กินพิซซ่าไป 1/4 (หนึ่งส่วนสี่) ของทั้งหมด\n\nเลขด้านบน (เศษ) บอกว่าเราเอากี่ส่วน\nเลขด้านล่าง (ส่วน) บอกว่าแบ่งออกเป็นกี่ส่วนทั้งหมด\n\nตัวอย่างในชีวิตจริง: ถ้าคุณมีส้ม 8 ผล แล้วแบ่งให้เพื่อน 2 ผล คุณให้เพื่อนไป 2/8 (สองส่วนแปด) ของส้มทั้งหมด หรือเรียกอีกอย่างว่า 1/4 (หนึ่งส่วนสี่)"
  }
}
```

---

### Content Generation

#### Generate Questions
```http
POST /api/content/questions
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "type": "question",
  "topic": "Photosynthesis",
  "gradeLevel": 7,
  "subject": "Science",
  "difficulty": 5,
  "learningObjectives": [
    "Understand the process of photosynthesis",
    "Identify inputs and outputs of photosynthesis"
  ],
  "curriculumStandards": ["วท 2.1"],
  "language": "th"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "id": "q_abc123",
        "type": "multiple_choice",
        "question": "สิ่งมีชีวิตใดสามารถสร้างอาหารได้เอง?",
        "questionLocalized": {
          "th": "สิ่งมีชีวิตใดสามารถสร้างอาหารได้เอง?",
          "en": "Which organism can produce its own food?"
        },
        "options": ["พืช", "สัตว์", "เชื้อรา", "แบคทีเรีย"],
        "optionsLocalized": {
          "th": ["พืช", "สัตว์", "เชื้อรา", "แบคทีเรีย"],
          "en": ["Plants", "Animals", "Fungi", "Bacteria"]
        },
        "correctAnswer": "0",
        "explanation": "พืชสามารถสร้างอาหารได้เองผ่านกระบวนการสังเคราะห์ด้วยแสง โดยใช้แสงอาทิตย์ น้ำ และคาร์บอนไดออกไซด์",
        "explanationLocalized": {
          "th": "พืชสามารถสร้างอาหารได้เองผ่านกระบวนการสังเคราะห์ด้วยแสง",
          "en": "Plants can produce their own food through photosynthesis"
        },
        "difficulty": 5,
        "conceptId": "Science-Photosynthesis",
        "bloomsLevel": "understand",
        "estimatedTime": 2,
        "topic": "Photosynthesis"
      }
    ],
    "count": 5,
    "generatedAt": "2025-11-10T10:30:00Z"
  }
}
```

#### Generate Lesson Plan
```http
POST /api/content/lesson-plan
```

**Request Body:**
```json
{
  "type": "lesson_plan",
  "topic": "Thai Poetry",
  "gradeLevel": 9,
  "subject": "Thai Language",
  "learningObjectives": [
    "Understand structure of Thai poetry",
    "Analyze literary devices in poetry",
    "Appreciate Thai literary heritage"
  ],
  "language": "th"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "lp_xyz789",
    "title": "กลอนสุภาพ: ความงามของวรรณกรรมไทย",
    "subject": "Thai Language",
    "gradeLevel": 9,
    "duration": 60,
    "learningObjectives": [
      "เข้าใจโครงสร้างและลักษณะของกลอนสุภาพ",
      "วิเคราะห์อุปลักษณ์และสำนวนโวหารในกลอน",
      "เห็นคุณค่าของวรรณกรรมไทย"
    ],
    "curriculumAlignment": [
      {
        "standardId": "th-9-1",
        "standardCode": "ท 1.1",
        "standardName": "การอ่านและวิเคราะห์",
        "description": "วิเคราะห์วรรณกรรมไทย",
        "gradeLevel": 9,
        "subject": "Thai Language"
      }
    ],
    "materials": [
      "ตัวอย่างกลอนสุภาพ",
      "กระดาษ A4",
      "ดินสอสี",
      "โปรเจคเตอร์"
    ],
    "activities": [
      {
        "id": "act_1",
        "title": "แนะนำกลอนสุภาพ",
        "description": "ครูแนะนำประวัติและความสำคัญของกลอนสุภาพ",
        "duration": 10,
        "type": "warmup",
        "materials": ["โปรเจคเตอร์", "สไลด์นำเสนอ"],
        "instructions": [
          "ครูถามนักเรียนเกี่ยวกับประสบการณ์การอ่านกลอน",
          "แสดงตัวอย่างกลอนสุภาพที่โด่งดัง",
          "อธิบายความเป็นมาและความสำคัญ"
        ]
      }
      // ... more activities
    ],
    "assessmentIdeas": [
      "ให้นักเรียนแต่งกลอนสุภาพ 1 บท",
      "วิเคราะห์อุปลักษณ์ในกลอนที่ให้มา",
      "นำเสนอการตีความกลอนหน้าชั้นเรียน"
    ],
    "differentiation": [
      {
        "type": "process",
        "description": "ให้นักเรียนที่ต้องการความช่วยเหลือทำงานเป็นกลุ่ม",
        "targetStudents": "struggling"
      }
    ],
    "culturalContext": [
      "กลอนสุภาพเป็นมรดกทางวัฒนธรรมไทย",
      "ใช้ในพิธีการและโอกาสสำคัญ",
      "สะท้อนความคิดและค่านิยมของสังคมไทย"
    ]
  }
}
```

---

### Learning Paths

#### Generate Learning Path
```http
POST /api/learning-paths
```

**Request Body:**
```json
{
  "studentId": "usr_123456",
  "subject": "Mathematics",
  "gradeLevel": 8,
  "weakAreas": [
    {
      "conceptId": "math-algebra-01",
      "conceptName": "Linear Equations",
      "severity": "high",
      "averageScore": 45
    }
  ],
  "learningStyle": "visual"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "lp_def456",
    "studentId": "usr_123456",
    "subject": "Mathematics",
    "curriculumAlignment": [ ... ],
    "nodes": [
      {
        "id": "node_1",
        "type": "concept",
        "title": "Introduction to Variables",
        "description": "Learn what variables are and how to use them",
        "status": "available",
        "difficulty": 3,
        "estimatedTime": 15,
        "prerequisites": []
      },
      {
        "id": "node_2",
        "type": "practice",
        "title": "Practice: Simple Equations",
        "description": "Solve basic equations",
        "status": "locked",
        "difficulty": 4,
        "estimatedTime": 20,
        "prerequisites": ["node_1"]
      }
    ],
    "currentNodeId": "node_1",
    "weakAreas": [ ... ],
    "createdAt": "2025-11-10T10:00:00Z"
  }
}
```

#### Get Learning Path
```http
GET /api/learning-paths/:studentId
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "learningPaths": [
      {
        "id": "lp_def456",
        "subject": "Mathematics",
        "progress": 35,
        "currentNode": "node_3",
        "totalNodes": 12,
        "completedNodes": 4,
        "estimatedCompletion": "2025-12-01T00:00:00Z"
      }
    ]
  }
}
```

---

### Analytics

#### Get Student Dashboard
```http
GET /api/analytics/dashboard/student/:id
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "studentId": "usr_123456",
    "overallProgress": {
      "averageScore": 78,
      "completionRate": 85,
      "engagementLevel": 92,
      "masteryRate": 65,
      "timeSpent": 7200,
      "trend": "improving"
    },
    "currentLearningPath": {
      "id": "lp_def456",
      "subject": "Mathematics",
      "progress": 35,
      "currentNode": "Practice: Linear Equations",
      "estimatedCompletion": "2025-12-01T00:00:00Z"
    },
    "strengths": [
      {
        "conceptId": "math-geometry-01",
        "conceptName": "Angles and Triangles",
        "score": 92,
        "masteryLevel": "mastered",
        "trend": "stable"
      }
    ],
    "weaknesses": [
      {
        "conceptId": "math-algebra-01",
        "conceptName": "Linear Equations",
        "score": 45,
        "masteryLevel": "needs-improvement",
        "trend": "improving"
      }
    ],
    "recentActivity": [ ... ],
    "upcomingTasks": [ ... ],
    "achievements": [ ... ],
    "recommendations": [ ... ]
  }
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... }
  },
  "metadata": {
    "timestamp": "2025-11-10T10:00:00Z",
    "requestId": "req_abc123"
  }
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `AUTH_ERROR` | 401 | Authentication failed |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `AI_SERVICE_ERROR` | 500 | AI generation failed |
| `DATABASE_ERROR` | 500 | Database operation failed |
| `INTERNAL_ERROR` | 500 | Internal server error |

## Rate Limiting

Rate limits are applied per user/IP address:

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| General API | 100 requests | 15 minutes |
| AI Generation | 10 requests | 1 minute |
| Authentication | 5 requests | 15 minutes |

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699610400
```

## Pagination

List endpoints support pagination using query parameters:

```http
GET /api/classes?page=2&limit=20
```

**Response includes pagination metadata:**
```json
{
  "success": true,
  "data": [ ... ],
  "metadata": {
    "pagination": {
      "page": 2,
      "limit": 20,
      "total": 150,
      "hasMore": true
    }
  }
}
```

## Filtering & Sorting

Use query parameters for filtering and sorting:

```http
GET /api/content/questions?subject=Math&gradeLevel=8&sort=-createdAt
```

## Webhooks

For real-time updates, subscribe to webhooks:

```http
POST /api/webhooks/subscribe
```

**Request Body:**
```json
{
  "url": "https://your-app.com/webhook",
  "events": ["assignment.submitted", "content.reviewed"]
}
```

## SDK & Libraries

Official SDKs available for:
- JavaScript/TypeScript
- Python
- iOS (Swift)
- Android (Kotlin)

---

For more details, see the [Architecture Guide](./architecture.md).
