'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '@/types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<string, Record<Language, string>> = {
  // Navigation
  'nav.dashboard': { th: 'แดชบอร์ด', en: 'Dashboard' },
  'nav.assessment': { th: 'การประเมิน', en: 'Assessment' },
  'nav.content': { th: 'เนื้อหา', en: 'Content' },
  'nav.tutor': { th: 'ติวเตอร์', en: 'Tutor' },
  
  // Assessment
  'assessment.title': { th: 'การประเมินความรู้', en: 'Diagnostic Assessment' },
  'assessment.subtitle': { th: 'ช่วยเราเข้าใจจุดแข็งและจุดอ่อนของคุณ', en: 'Help us understand your strengths and weaknesses' },
  'assessment.start': { th: 'เริ่มการประเมิน', en: 'Start Assessment' },
  'assessment.next': { th: 'ถัดไป', en: 'Next' },
  'assessment.previous': { th: 'ก่อนหน้า', en: 'Previous' },
  'assessment.submit': { th: 'ส่งคำตอบ', en: 'Submit' },
  'assessment.analyzing': { th: 'กำลังวิเคราะห์คำตอบของคุณ...', en: 'Analyzing your responses...' },
  
  // Dashboard
  'dashboard.welcome': { th: 'ยินดีต้อนรับ', en: 'Welcome' },
  'dashboard.progress': { th: 'ความคืบหน้า', en: 'Progress' },
  'dashboard.weakAreas': { th: 'จุดที่ต้องพัฒนา', en: 'Areas to Improve' },
  'dashboard.focusToday': { th: 'โฟกัสวันนี้', en: 'Focus Today' },
  'dashboard.overallProgress': { th: 'ความคืบหน้าโดยรวม', en: 'Overall Progress' },
  
  // Mastery Levels
  'mastery.needsImprovement': { th: 'ต้องพัฒนา', en: 'Needs Improvement' },
  'mastery.developing': { th: 'กำลังพัฒนา', en: 'Developing' },
  'mastery.mastered': { th: 'เชี่ยวชาญแล้ว', en: 'Mastered' },
  
  // Content
  'content.recommended': { th: 'แนะนำสำหรับคุณ', en: 'Recommended for You' },
  'content.video': { th: 'วิดีโอ', en: 'Video' },
  'content.text': { th: 'บทความ', en: 'Article' },
  'content.interactive': { th: 'แบบฝึกหัด', en: 'Interactive' },
  'content.minutes': { th: 'นาที', en: 'minutes' },
  'content.whyRecommended': { th: 'ทำไมถึงแนะนำ', en: 'Why recommended' },
  
  // Tutor
  'tutor.title': { th: 'ติวเตอร์ AI', en: 'AI Tutor' },
  'tutor.placeholder': { th: 'พิมพ์คำถามของคุณ...', en: 'Type your question...' },
  'tutor.send': { th: 'ส่ง', en: 'Send' },
  
  // Profile
  'profile.weaknessProfile': { th: 'โปรไฟล์จุดอ่อน', en: 'Weakness Profile' },
  'profile.detailedView': { th: 'ดูรายละเอียด', en: 'Detailed View' },
  
  // Common
  'common.loading': { th: 'กำลังโหลด...', en: 'Loading...' },
  'common.error': { th: 'เกิดข้อผิดพลาด', en: 'Error' },
  'common.retry': { th: 'ลองอีกครั้ง', en: 'Retry' },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('th');

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
