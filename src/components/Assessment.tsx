'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { AssessmentQuestion } from '@/types';
import { Loader2 } from 'lucide-react';

const mockQuestions: AssessmentQuestion[] = [
  {
    id: '1',
    question: {
      th: 'ข้อใดคือผลลัพธ์ของ 15 × 8?',
      en: 'What is the result of 15 × 8?'
    },
    options: {
      th: ['100', '120', '130', '140'],
      en: ['100', '120', '130', '140']
    },
    correctAnswer: 1,
    topic: 'Mathematics',
    subTopic: 'Multiplication',
    difficulty: 'easy'
  },
  {
    id: '2',
    question: {
      th: 'ถ้า x + 5 = 12 แล้ว x เท่ากับเท่าไร?',
      en: 'If x + 5 = 12, what is x?'
    },
    options: {
      th: ['5', '6', '7', '8'],
      en: ['5', '6', '7', '8']
    },
    correctAnswer: 2,
    topic: 'Mathematics',
    subTopic: 'Algebra',
    difficulty: 'medium'
  },
  {
    id: '3',
    question: {
      th: 'ข้อใดคือคำนิยามของ "Photosynthesis"?',
      en: 'What is the definition of "Photosynthesis"?'
    },
    options: {
      th: [
        'กระบวนการที่พืชสร้างอาหารจากแสงอาทิตย์',
        'กระบวนการหายใจของพืช',
        'กระบวนการดูดน้ำของพืช',
        'กระบวนการเจริญเติบโตของพืช'
      ],
      en: [
        'Process where plants make food from sunlight',
        'Process of plant respiration',
        'Process of water absorption in plants',
        'Process of plant growth'
      ]
    },
    correctAnswer: 0,
    topic: 'Science',
    subTopic: 'Biology',
    difficulty: 'medium'
  },
  {
    id: '4',
    question: {
      th: 'ประโยคใดใช้ไวยากรณ์ที่ถูกต้อง?',
      en: 'Which sentence uses correct grammar?'
    },
    options: {
      th: [
        'She go to school everyday',
        'She goes to school everyday',
        'She going to school everyday',
        'She gone to school everyday'
      ],
      en: [
        'She go to school everyday',
        'She goes to school everyday',
        'She going to school everyday',
        'She gone to school everyday'
      ]
    },
    correctAnswer: 1,
    topic: 'English',
    subTopic: 'Grammar',
    difficulty: 'easy'
  },
  {
    id: '5',
    question: {
      th: 'พื้นที่ของสี่เหลี่ยมผืนผ้าที่มีความยาว 8 ซม. และความกว้าง 5 ซม. คือเท่าไร?',
      en: 'What is the area of a rectangle with length 8 cm and width 5 cm?'
    },
    options: {
      th: ['13 ตร.ซม.', '26 ตร.ซม.', '40 ตร.ซม.', '45 ตร.ซม.'],
      en: ['13 cm²', '26 cm²', '40 cm²', '45 cm²']
    },
    correctAnswer: 2,
    topic: 'Mathematics',
    subTopic: 'Geometry',
    difficulty: 'medium'
  }
];

interface AssessmentProps {
  onComplete: (answers: Record<string, number>) => void;
}

export default function Assessment({ onComplete }: AssessmentProps) {
  const { language, t } = useLanguage();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const question = mockQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / mockQuestions.length) * 100;

  const handleNext = () => {
    if (selectedAnswer !== null) {
      setAnswers({ ...answers, [question.id]: selectedAnswer });
      
      if (currentQuestion < mockQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        // Last question - submit
        setIsAnalyzing(true);
        setTimeout(() => {
          onComplete({ ...answers, [question.id]: selectedAnswer });
        }, 2000);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(answers[mockQuestions[currentQuestion - 1].id] ?? null);
    }
  };

  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg font-medium">{t('assessment.analyzing')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{language === 'th' ? 'คำถาม' : 'Question'} {currentQuestion + 1} {language === 'th' ? 'จาก' : 'of'} {mockQuestions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{question.question[language]}</CardTitle>
          <CardDescription>
            {question.topic} - {question.subTopic}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selectedAnswer?.toString()} onValueChange={(val) => setSelectedAnswer(parseInt(val))}>
            <div className="space-y-3">
              {question.options[language].map((option, index) => (
                <div key={index} className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-accent transition-colors">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-base">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
        >
          {t('assessment.previous')}
        </Button>
        <Button
          onClick={handleNext}
          disabled={selectedAnswer === null}
        >
          {currentQuestion === mockQuestions.length - 1 ? t('assessment.submit') : t('assessment.next')}
        </Button>
      </div>
    </div>
  );
}
