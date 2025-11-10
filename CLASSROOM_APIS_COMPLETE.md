# 📚 Classroom Management APIs - Complete Guide

## Overview

This document covers all classroom management APIs including classes, assignments, submissions, and grading functionality.

## 📋 Table of Contents

1. [Classes API](#classes-api)
2. [Enrollment API](#enrollment-api)
3. [Assignments API](#assignments-api)
4. [Submissions API](#submissions-api)
5. [Grading API](#grading-api)
6. [Analytics Dashboard API](#analytics-dashboard-api)
7. [Complete Examples](#complete-examples)

---

## Classes API

### Create Class

**Endpoint:** `POST /api/classes`  
**Authentication:** Teacher only  
**Description:** Create a new class with an automatically generated enrollment code

**Request Body:**
```json
{
  "name": "Mathematics Grade 8",
  "subject": "Mathematics",
  "gradeLevel": 8,
  "description": "Advanced mathematics for grade 8 students"
}
```

**Response:**
```json
{
  "success": true,
  "class": {
    "id": "class-uuid",
    "name": "Mathematics Grade 8",
    "subject": "Mathematics",
    "gradeLevel": 8,
    "description": "Advanced mathematics for grade 8 students",
    "teacherId": "teacher-uuid",
    "enrollmentCode": "ABC123",
    "status": "active",
    "createdAt": "2025-01-10T10:00:00Z",
    "teacher": {
      "id": "teacher-uuid",
      "firstName": "Somchai",
      "lastName": "Prasert",
      "thaiName": "สมชาย ประเสริฐ",
      "email": "teacher@thai-edu.com"
    },
    "_count": {
      "enrollments": 0
    }
  }
}
```

---

### Get Classes

**Endpoint:** `GET /api/classes`  
**Authentication:** Required (Student/Teacher/Admin)  
**Description:** Get classes (teacher's classes or student's enrolled classes)

**Response (Teacher):**
```json
{
  "success": true,
  "classes": [
    {
      "id": "class-uuid",
      "name": "Mathematics Grade 8",
      "subject": "Mathematics",
      "gradeLevel": 8,
      "description": "Advanced mathematics",
      "enrollmentCode": "ABC123",
      "status": "active",
      "_count": {
        "enrollments": 25,
        "assignments": 10
      },
      "enrollments": [
        {
          "student": {
            "id": "student-uuid",
            "firstName": "Nong",
            "lastName": "Kaewmala",
            "thaiName": "น้อง แก้วมาลา"
          },
          "enrolledAt": "2025-01-05T10:00:00Z"
        }
      ]
    }
  ]
}
```

**Response (Student):**
```json
{
  "success": true,
  "classes": [
    {
      "id": "class-uuid",
      "name": "Mathematics Grade 8",
      "subject": "Mathematics",
      "gradeLevel": 8,
      "teacher": {
        "id": "teacher-uuid",
        "firstName": "Somchai",
        "lastName": "Prasert",
        "thaiName": "สมชาย ประเสริฐ"
      },
      "_count": {
        "assignments": 10
      }
    }
  ]
}
```

---

### Get Class by ID

**Endpoint:** `GET /api/classes/[id]`  
**Authentication:** Required  
**Description:** Get detailed information about a specific class

**Response:**
```json
{
  "success": true,
  "class": {
    "id": "class-uuid",
    "name": "Mathematics Grade 8",
    "subject": "Mathematics",
    "gradeLevel": 8,
    "description": "Advanced mathematics",
    "enrollmentCode": "ABC123",
    "status": "active",
    "teacher": {
      "id": "teacher-uuid",
      "firstName": "Somchai",
      "lastName": "Prasert",
      "thaiName": "สมชาย ประเสริฐ",
      "email": "teacher@thai-edu.com"
    },
    "enrollments": [
      {
        "id": "enrollment-uuid",
        "enrolledAt": "2025-01-05T10:00:00Z",
        "student": {
          "id": "student-uuid",
          "firstName": "Nong",
          "lastName": "Kaewmala",
          "thaiName": "น้อง แก้วมาลา",
          "email": "nong@example.com",
          "grade": 8
        }
      }
    ],
    "assignments": [
      {
        "id": "assignment-uuid",
        "title": "Algebra Quiz",
        "type": "quiz",
        "dueDate": "2025-01-15T23:59:59Z",
        "_count": {
          "submissions": 15
        }
      }
    ],
    "_count": {
      "enrollments": 25,
      "assignments": 10
    }
  }
}
```

---

### Update Class

**Endpoint:** `PUT /api/classes/[id]`  
**Authentication:** Teacher only (must own the class)  
**Description:** Update class information

**Request Body:**
```json
{
  "name": "Advanced Mathematics Grade 8",
  "description": "Updated description",
  "status": "active"
}
```

**Response:**
```json
{
  "success": true,
  "class": {
    "id": "class-uuid",
    "name": "Advanced Mathematics Grade 8",
    "description": "Updated description",
    "status": "active",
    "teacher": { ... },
    "_count": { ... }
  }
}
```

---

### Archive Class

**Endpoint:** `DELETE /api/classes/[id]`  
**Authentication:** Teacher only (must own the class)  
**Description:** Archive a class (soft delete)

**Response:**
```json
{
  "success": true,
  "message": "Class archived successfully",
  "class": {
    "id": "class-uuid",
    "status": "archived"
  }
}
```

---

## Enrollment API

### Enroll by Class ID

**Endpoint:** `POST /api/classes/[id]/enroll`  
**Authentication:** Student only  
**Description:** Enroll in a class by its ID

**Response:**
```json
{
  "success": true,
  "message": "Successfully enrolled in class",
  "enrollment": {
    "id": "enrollment-uuid",
    "classId": "class-uuid",
    "studentId": "student-uuid",
    "status": "active",
    "enrolledAt": "2025-01-10T10:00:00Z",
    "class": {
      "id": "class-uuid",
      "name": "Mathematics Grade 8",
      "subject": "Mathematics",
      "gradeLevel": 8,
      "teacher": {
        "id": "teacher-uuid",
        "firstName": "Somchai",
        "lastName": "Prasert",
        "thaiName": "สมชาย ประเสริฐ"
      }
    }
  }
}
```

---

### Enroll by Code

**Endpoint:** `POST /api/classes/enroll-by-code`  
**Authentication:** Student only  
**Description:** Enroll in a class using the 6-character enrollment code

**Request Body:**
```json
{
  "enrollmentCode": "ABC123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully enrolled in class",
  "enrollment": {
    "id": "enrollment-uuid",
    "class": {
      "id": "class-uuid",
      "name": "Mathematics Grade 8",
      "enrollmentCode": "ABC123",
      "teacher": { ... }
    }
  }
}
```

---

## Assignments API

### Create Assignment

**Endpoint:** `POST /api/assignments`  
**Authentication:** Teacher only  
**Description:** Create a new assignment for a class

**Request Body:**
```json
{
  "classId": "class-uuid",
  "title": "Algebra Quiz - Chapter 3",
  "description": "Complete all questions on quadratic equations",
  "type": "quiz",
  "dueDate": "2025-01-15T23:59:59Z",
  "points": 100,
  "autoGrade": false,
  "content": {
    "questions": [
      {
        "id": "q1",
        "question": "Solve: x^2 + 5x + 6 = 0",
        "type": "short_answer",
        "points": 10
      }
    ]
  }
}
```

**Response:**
```json
{
  "success": true,
  "assignment": {
    "id": "assignment-uuid",
    "classId": "class-uuid",
    "title": "Algebra Quiz - Chapter 3",
    "description": "Complete all questions on quadratic equations",
    "type": "quiz",
    "dueDate": "2025-01-15T23:59:59Z",
    "points": 100,
    "autoGrade": false,
    "content": { ... },
    "createdAt": "2025-01-10T10:00:00Z",
    "class": {
      "id": "class-uuid",
      "name": "Mathematics Grade 8",
      "subject": "Mathematics"
    },
    "_count": {
      "submissions": 0
    }
  }
}
```

**Note:** Creating an assignment automatically notifies all enrolled students.

---

### Get Assignments

**Endpoint:** `GET /api/assignments?classId={classId}`  
**Authentication:** Required  
**Description:** Get assignments for a class (with student's submissions for students)

**Response (Student):**
```json
{
  "success": true,
  "assignments": [
    {
      "id": "assignment-uuid",
      "title": "Algebra Quiz - Chapter 3",
      "description": "Complete all questions",
      "type": "quiz",
      "dueDate": "2025-01-15T23:59:59Z",
      "points": 100,
      "createdAt": "2025-01-10T10:00:00Z",
      "submissions": [
        {
          "id": "submission-uuid",
          "status": "graded",
          "score": 85,
          "submittedAt": "2025-01-12T14:30:00Z"
        }
      ],
      "_count": {
        "submissions": 1
      }
    }
  ]
}
```

**Response (Teacher):**
```json
{
  "success": true,
  "assignments": [
    {
      "id": "assignment-uuid",
      "title": "Algebra Quiz - Chapter 3",
      "type": "quiz",
      "dueDate": "2025-01-15T23:59:59Z",
      "points": 100,
      "_count": {
        "submissions": 18
      },
      "submissions": [
        {
          "id": "submission-uuid",
          "status": "submitted",
          "submittedAt": "2025-01-12T14:30:00Z",
          "student": {
            "id": "student-uuid",
            "firstName": "Nong",
            "lastName": "Kaewmala",
            "thaiName": "น้อง แก้วมาลา"
          }
        }
      ]
    }
  ]
}
```

---

## Submissions API

### Submit Assignment

**Endpoint:** `POST /api/assignments/[id]/submit`  
**Authentication:** Student only  
**Description:** Submit an assignment

**Request Body:**
```json
{
  "content": {
    "answers": [
      {
        "questionId": "q1",
        "answer": "x = -2 or x = -3"
      },
      {
        "questionId": "q2",
        "answer": "y = 5"
      }
    ]
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Assignment submitted successfully",
  "submission": {
    "id": "submission-uuid",
    "assignmentId": "assignment-uuid",
    "studentId": "student-uuid",
    "content": { ... },
    "attemptNumber": 1,
    "status": "submitted",
    "submittedAt": "2025-01-12T14:30:00Z",
    "assignment": {
      "id": "assignment-uuid",
      "title": "Algebra Quiz - Chapter 3",
      "type": "quiz",
      "points": 100,
      "autoGrade": false
    }
  }
}
```

**Notes:**
- Multiple submissions allowed (attempt number auto-increments)
- Cannot submit after due date
- Teacher is automatically notified
- Auto-grading happens if enabled

---

## Grading API

### Grade Submission

**Endpoint:** `POST /api/submissions/[id]/grade`  
**Authentication:** Teacher only  
**Description:** Grade a student's submission

**Request Body:**
```json
{
  "score": 85,
  "maxScore": 100,
  "feedback": "Good work! You got most of the algebra correct. Review factoring methods for question 3.",
  "rubricScores": [
    {
      "criteriaId": "accuracy",
      "score": 40,
      "feedback": "Most answers are correct"
    },
    {
      "criteriaId": "work_shown",
      "score": 30,
      "feedback": "Good work shown"
    },
    {
      "criteriaId": "organization",
      "score": 15,
      "feedback": "Well organized"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Submission graded successfully",
  "submission": {
    "id": "submission-uuid",
    "score": 85,
    "maxScore": 100,
    "feedback": "Good work! You got most of the algebra correct...",
    "rubricScores": [ ... ],
    "gradedBy": "teacher",
    "gradedAt": "2025-01-13T10:00:00Z",
    "status": "graded",
    "assignment": {
      "id": "assignment-uuid",
      "title": "Algebra Quiz - Chapter 3",
      "type": "quiz",
      "points": 100
    },
    "student": {
      "id": "student-uuid",
      "firstName": "Nong",
      "lastName": "Kaewmala",
      "thaiName": "น้อง แก้วมาลา"
    }
  },
  "percentage": 85.0
}
```

**Automatic Actions:**
- Student is notified of grade
- Performance metrics are updated
- Weak areas are identified (if score < 60%)
- Mastery level is calculated

---

## Analytics Dashboard API

### Get Dashboard

**Endpoint:** `GET /api/analytics/dashboard`  
**Authentication:** Required  
**Description:** Get role-specific dashboard data

### Student Dashboard Response

```json
{
  "success": true,
  "dashboard": {
    "overview": {
      "totalClasses": 4,
      "averageScore": 82.5,
      "completionRate": 85.7,
      "totalSubmissions": 28
    },
    "classes": [
      {
        "id": "class-uuid",
        "name": "Mathematics Grade 8",
        "subject": "Mathematics",
        "teacher": {
          "firstName": "Somchai",
          "lastName": "Prasert",
          "thaiName": "สมชาย ประเสริฐ"
        }
      }
    ],
    "recentSubmissions": [
      {
        "id": "submission-uuid",
        "status": "graded",
        "score": 85,
        "submittedAt": "2025-01-12T14:30:00Z",
        "assignment": {
          "title": "Algebra Quiz",
          "type": "quiz",
          "points": 100
        }
      }
    ],
    "weakAreas": [
      {
        "conceptId": "algebra-factoring",
        "conceptName": "Algebraic Factoring",
        "severity": "medium",
        "attempts": 3,
        "averageScore": 55
      }
    ],
    "upcomingAssignments": [
      {
        "id": "assignment-uuid",
        "title": "Geometry Homework",
        "dueDate": "2025-01-16T23:59:59Z",
        "class": {
          "name": "Mathematics Grade 8"
        },
        "submissions": []
      }
    ],
    "performanceMetrics": [
      {
        "conceptId": "algebra-basics",
        "masteryLevel": 0.85,
        "attempts": 5,
        "averageScore": 85,
        "lastPracticed": "2025-01-12T14:30:00Z"
      }
    ],
    "notifications": [
      {
        "id": "notification-uuid",
        "type": "grade",
        "title": "Assignment Graded",
        "message": "Your submission has been graded",
        "createdAt": "2025-01-13T10:00:00Z",
        "read": false
      }
    ]
  }
}
```

### Teacher Dashboard Response

```json
{
  "success": true,
  "dashboard": {
    "overview": {
      "totalClasses": 3,
      "totalStudents": 75,
      "pendingGrading": 12,
      "recentlyGraded": 25
    },
    "classes": [
      {
        "id": "class-uuid",
        "name": "Mathematics Grade 8",
        "subject": "Mathematics",
        "gradeLevel": 8,
        "status": "active",
        "_count": {
          "enrollments": 25,
          "assignments": 10
        }
      }
    ],
    "classPerformance": [
      {
        "classId": "class-uuid",
        "className": "Mathematics Grade 8",
        "studentCount": 25,
        "averageScore": 78.5
      }
    ],
    "pendingSubmissions": [
      {
        "id": "submission-uuid",
        "submittedAt": "2025-01-12T14:30:00Z",
        "student": {
          "firstName": "Nong",
          "lastName": "Kaewmala",
          "thaiName": "น้อง แก้วมาลา"
        },
        "assignment": {
          "title": "Algebra Quiz",
          "type": "quiz"
        }
      }
    ],
    "recentActivity": [
      {
        "student": {
          "firstName": "Somchai",
          "lastName": "Prasert"
        },
        "assignment": {
          "title": "Geometry Homework"
        },
        "score": 92,
        "gradedAt": "2025-01-13T09:00:00Z"
      }
    ],
    "notifications": [ ... ]
  }
}
```

### Admin Dashboard Response

```json
{
  "success": true,
  "dashboard": {
    "overview": {
      "totalUsers": 1250,
      "totalClasses": 45,
      "activeClasses": 42,
      "totalSubmissions": 5420,
      "studentCount": 1150,
      "teacherCount": 95
    },
    "recentClasses": [
      {
        "id": "class-uuid",
        "name": "Mathematics Grade 8",
        "subject": "Mathematics",
        "createdAt": "2025-01-10T10:00:00Z",
        "teacher": {
          "firstName": "Somchai",
          "lastName": "Prasert"
        },
        "_count": {
          "enrollments": 25
        }
      }
    ]
  }
}
```

---

## Complete Examples

### Example 1: Teacher Creates Class and Assignment

```bash
# 1. Create class
curl -X POST http://localhost:3000/api/classes \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=..." \
  -d '{
    "name": "Mathematics Grade 8",
    "subject": "Mathematics",
    "gradeLevel": 8,
    "description": "Advanced mathematics"
  }'

# Response: { "class": { "id": "class-123", "enrollmentCode": "ABC123", ... } }

# 2. Create assignment
curl -X POST http://localhost:3000/api/assignments \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=..." \
  -d '{
    "classId": "class-123",
    "title": "Algebra Quiz",
    "type": "quiz",
    "dueDate": "2025-01-15T23:59:59Z",
    "points": 100,
    "content": {
      "questions": [...]
    }
  }'
```

### Example 2: Student Enrolls and Submits Assignment

```bash
# 1. Enroll with code
curl -X POST http://localhost:3000/api/classes/enroll-by-code \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=..." \
  -d '{"enrollmentCode": "ABC123"}'

# 2. Get class assignments
curl -X GET "http://localhost:3000/api/assignments?classId=class-123" \
  -H "Cookie: accessToken=..."

# 3. Submit assignment
curl -X POST http://localhost:3000/api/assignments/assignment-123/submit \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=..." \
  -d '{
    "content": {
      "answers": [
        {"questionId": "q1", "answer": "x = -2 or x = -3"}
      ]
    }
  }'
```

### Example 3: Teacher Grades Submission

```bash
# 1. Get pending submissions
curl -X GET http://localhost:3000/api/analytics/dashboard \
  -H "Cookie: accessToken=..."

# 2. Grade submission
curl -X POST http://localhost:3000/api/submissions/submission-123/grade \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=..." \
  -d '{
    "score": 85,
    "maxScore": 100,
    "feedback": "Good work! Review factoring methods."
  }'
```

### Example 4: Student Views Dashboard

```bash
curl -X GET http://localhost:3000/api/analytics/dashboard \
  -H "Cookie: accessToken=..."

# Response includes:
# - Overall statistics
# - Enrolled classes
# - Recent submissions
# - Weak areas
# - Upcoming assignments
# - Performance metrics
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": [  // Optional, for validation errors
    {
      "field": "fieldName",
      "message": "Validation error message"
    }
  ]
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (e.g., already enrolled)
- `500` - Internal Server Error

---

## Summary

### API Endpoints Created (11 endpoints)

1. `POST /api/classes` - Create class
2. `GET /api/classes` - Get classes
3. `GET /api/classes/[id]` - Get class by ID
4. `PUT /api/classes/[id]` - Update class
5. `DELETE /api/classes/[id]` - Archive class
6. `POST /api/classes/[id]/enroll` - Enroll by ID
7. `POST /api/classes/enroll-by-code` - Enroll by code
8. `POST /api/assignments` - Create assignment
9. `GET /api/assignments` - Get assignments
10. `POST /api/assignments/[id]/submit` - Submit assignment
11. `POST /api/submissions/[id]/grade` - Grade submission
12. `GET /api/analytics/dashboard` - Get dashboard data

### Features

✅ **Class Management**
- Create, read, update, archive classes
- Automatic enrollment code generation
- Access control based on roles

✅ **Enrollment**
- Enroll by class ID or enrollment code
- Automatic notifications
- Re-enrollment support

✅ **Assignments**
- Create and manage assignments
- Due date tracking
- Flexible content structure
- Auto-grade support

✅ **Submissions**
- Multiple attempt support
- Submission validation
- Automatic notifications

✅ **Grading**
- Manual grading with feedback
- Rubric support
- Automatic performance tracking
- Weak area identification

✅ **Analytics**
- Role-specific dashboards
- Performance metrics
- Weak area tracking
- Upcoming assignments
- Notification system

### Next Steps

These APIs provide the core classroom management functionality. Next steps could include:

1. **Learning Path APIs** - Personalized learning journeys
2. **Recommendation Engine** - Smart content recommendations  
3. **Real-time Collaboration** - WebSocket-based features
4. **Frontend Integration** - React components for these APIs
