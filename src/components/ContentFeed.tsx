'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { LearningContent } from '@/types';
import { PlayCircle, FileText, Gamepad2, Clock } from 'lucide-react';

interface ContentFeedProps {
  contents: LearningContent[];
}

const getContentIcon = (type: LearningContent['type']) => {
  switch (type) {
    case 'video':
      return <PlayCircle className="h-5 w-5" />;
    case 'text':
      return <FileText className="h-5 w-5" />;
    case 'interactive':
      return <Gamepad2 className="h-5 w-5" />;
  }
};

const getContentTypeLabel = (type: LearningContent['type'], language: 'th' | 'en') => {
  const labels = {
    video: { th: 'วิดีโอ', en: 'Video' },
    text: { th: 'บทความ', en: 'Article' },
    interactive: { th: 'แบบฝึกหัด', en: 'Interactive' }
  };
  return labels[type][language];
};

export default function ContentFeed({ contents }: ContentFeedProps) {
  const { language, t } = useLanguage();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t('content.recommended')}</h2>
        <p className="text-muted-foreground mt-1">
          {language === 'th' ? 'เนื้อหาที่คัดสรรมาเพื่อคุณโดยเฉพาะ' : 'Content curated specifically for you'}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {contents.map((content) => (
          <Card key={content.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video relative bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
              <img 
                src={content.thumbnail} 
                alt={content.title[language]}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3">
                <Badge variant="secondary" className="gap-1">
                  {getContentIcon(content.type)}
                  {getContentTypeLabel(content.type, language)}
                </Badge>
              </div>
            </div>
            <CardHeader>
              <CardTitle className="line-clamp-2">{content.title[language]}</CardTitle>
              <CardDescription className="line-clamp-2">
                {content.description[language]}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{content.duration} {t('content.minutes')}</span>
              </div>
              
              <div className="p-3 rounded-lg bg-accent/50 border border-accent">
                <div className="text-xs font-medium text-muted-foreground mb-1">
                  {t('content.whyRecommended')}
                </div>
                <div className="text-sm">{content.reason[language]}</div>
              </div>

              <Button className="w-full">
                {language === 'th' ? 'เริ่มเรียน' : 'Start Learning'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
