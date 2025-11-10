import { StudentProfile, WeakArea, LearningContent } from '@/types';

export function generateMockProfile(answers: Record<string, number>): StudentProfile {
  const weakAreas: WeakArea[] = [
    {
      id: '1',
      topic: 'Mathematics',
      subTopic: 'Algebra',
      masteryLevel: 'needs-improvement',
      score: 35,
      lastAttempt: new Date(),
      prerequisiteGaps: ['Basic equations', 'Variable manipulation']
    },
    {
      id: '2',
      topic: 'Mathematics',
      subTopic: 'Geometry',
      masteryLevel: 'developing',
      score: 60,
      lastAttempt: new Date(),
      prerequisiteGaps: ['Area formulas']
    },
    {
      id: '3',
      topic: 'Mathematics',
      subTopic: 'Multiplication',
      masteryLevel: 'mastered',
      score: 85,
      lastAttempt: new Date()
    },
    {
      id: '4',
      topic: 'Science',
      subTopic: 'Biology',
      masteryLevel: 'developing',
      score: 55,
      lastAttempt: new Date(),
      prerequisiteGaps: ['Cell structure', 'Plant anatomy']
    },
    {
      id: '5',
      topic: 'English',
      subTopic: 'Grammar',
      masteryLevel: 'mastered',
      score: 90,
      lastAttempt: new Date()
    },
    {
      id: '6',
      topic: 'Science',
      subTopic: 'Physics',
      masteryLevel: 'needs-improvement',
      score: 40,
      lastAttempt: new Date(),
      prerequisiteGaps: ['Newton\'s laws', 'Force and motion']
    }
  ];

  return {
    id: '1',
    name: 'นักเรียน',
    weakAreas,
    completedAssessment: true,
    overallProgress: 60,
    focusToday: [
      'Algebra - Basic equations',
      'Physics - Newton\'s laws',
      'Biology - Photosynthesis'
    ]
  };
}

export function generateMockContent(): LearningContent[] {
  return [
    {
      id: '1',
      title: {
        th: 'พื้นฐานสมการพีชคณิต',
        en: 'Algebra Basics: Solving Equations'
      },
      description: {
        th: 'เรียนรู้วิธีแก้สมการพีชคณิตเบื้องต้นอย่างง่ายดาย',
        en: 'Learn how to solve basic algebraic equations step by step'
      },
      type: 'video',
      topic: 'Mathematics',
      subTopic: 'Algebra',
      duration: 15,
      thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&q=80',
      reason: {
        th: 'คุณได้คะแนนต่ำในหัวข้อนี้ วิดีโอนี้จะช่วยสร้างพื้นฐานที่แข็งแกร่ง',
        en: 'You scored low in this topic. This video will help build a strong foundation'
      }
    },
    {
      id: '2',
      title: {
        th: 'การสังเคราะห์แสงในพืช',
        en: 'Photosynthesis in Plants'
      },
      description: {
        th: 'ทำความเข้าใจกระบวนการสังเคราะห์แสงและความสำคัญต่อชีวิต',
        en: 'Understand the process of photosynthesis and its importance to life'
      },
      type: 'interactive',
      topic: 'Science',
      subTopic: 'Biology',
      duration: 20,
      thumbnail: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400&q=80',
      reason: {
        th: 'เนื้อหานี้เชื่อมโยงกับจุดอ่อนของคุณในวิชาชีววิทยา',
        en: 'This content relates to your weak areas in Biology'
      }
    },
    {
      id: '3',
      title: {
        th: 'กฎการเคลื่อนที่ของนิวตัน',
        en: "Newton's Laws of Motion"
      },
      description: {
        th: 'เรียนรู้กฎการเคลื่อนที่ทั้ง 3 ข้อของนิวตันพร้อมตัวอย่าง',
        en: "Learn all three of Newton's laws with practical examples"
      },
      type: 'video',
      topic: 'Science',
      subTopic: 'Physics',
      duration: 18,
      thumbnail: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400&q=80',
      reason: {
        th: 'หัวข้อนี้เป็นพื้นฐานสำคัญที่คุณต้องเสริมสร้าง',
        en: 'This is a fundamental topic you need to strengthen'
      }
    },
    {
      id: '4',
      title: {
        th: 'การคำนวณพื้นที่รูปเรขาคณิต',
        en: 'Calculating Areas of Geometric Shapes'
      },
      description: {
        th: 'ฝึกฝนการคำนวณพื้นที่รูปต่างๆ ด้วยแบบฝึกหัดเชิงโต้ตอบ',
        en: 'Practice calculating areas of various shapes with interactive exercises'
      },
      type: 'interactive',
      topic: 'Mathematics',
      subTopic: 'Geometry',
      duration: 25,
      thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&q=80',
      reason: {
        th: 'คุณกำลังพัฒนาในหัวข้อนี้ แบบฝึกหัดจะช่วยเสริมความเข้าใจ',
        en: "You're developing in this topic. Practice will reinforce your understanding"
      }
    },
    {
      id: '5',
      title: {
        th: 'โครงสร้างเซลล์และหน้าที่',
        en: 'Cell Structure and Function'
      },
      description: {
        th: 'ศึกษาส่วนประกอบของเซลล์และหน้าที่ของแต่ละส่วน',
        en: 'Study cell components and their individual functions'
      },
      type: 'text',
      topic: 'Science',
      subTopic: 'Biology',
      duration: 12,
      thumbnail: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=400&q=80',
      reason: {
        th: 'ความรู้พื้นฐานนี้จำเป็นสำหรับการเข้าใจชีววิทยาขั้นสูง',
        en: 'This foundational knowledge is essential for advanced biology'
      }
    },
    {
      id: '6',
      title: {
        th: 'ไวยากรณ์ภาษาอังกฤษขั้นสูง',
        en: 'Advanced English Grammar'
      },
      description: {
        th: 'เสริมทักษะไวยากรณ์ภาษาอังกฤษให้แข็งแกร่งยิ่งขึ้น',
        en: 'Strengthen your English grammar skills further'
      },
      type: 'text',
      topic: 'English',
      subTopic: 'Grammar',
      duration: 10,
      thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=80',
      reason: {
        th: 'คุณทำได้ดีในหัวข้อนี้ เนื้อหานี้จะช่วยพัฒนาต่อยอด',
        en: "You're doing well in this topic. This will help you advance further"
      }
    }
  ];
}
