'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { WeakArea, MasteryLevel } from '@/types';
import { TrendingDown, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface WeaknessProfileProps {
  weakAreas: WeakArea[];
}

const getMasteryIcon = (level: MasteryLevel) => {
  switch (level) {
    case 'needs-improvement':
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case 'developing':
      return <TrendingDown className="h-4 w-4 text-yellow-500" />;
    case 'mastered':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  }
};

export default function WeaknessProfile({ weakAreas }: WeaknessProfileProps) {
  const { language, t } = useLanguage();

  const groupedByTopic = weakAreas.reduce((acc, area) => {
    if (!acc[area.topic]) {
      acc[area.topic] = [];
    }
    acc[area.topic].push(area);
    return acc;
  }, {} as Record<string, WeakArea[]>);

  const needsImprovement = weakAreas.filter(a => a.masteryLevel === 'needs-improvement');
  const developing = weakAreas.filter(a => a.masteryLevel === 'developing');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t('profile.weaknessProfile')}</h2>
        <p className="text-muted-foreground mt-1">
          {language === 'th' ? 'วิเคราะห์จุดอ่อนและความก้าวหน้าของคุณ' : 'Analyze your weaknesses and progress'}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('mastery.needsImprovement')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">{needsImprovement.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {language === 'th' ? 'หัวข้อที่ต้องเร่งพัฒนา' : 'Topics requiring urgent attention'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('mastery.developing')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-500">{developing.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {language === 'th' ? 'หัวข้อที่กำลังพัฒนา' : 'Topics in progress'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {language === 'th' ? 'คะแนนเฉลี่ย' : 'Average Score'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.round(weakAreas.reduce((sum, a) => sum + a.score, 0) / weakAreas.length)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {language === 'th' ? 'ทุกหัวข้อ' : 'Across all topics'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <Tabs defaultValue={Object.keys(groupedByTopic)[0]} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          {Object.keys(groupedByTopic).map((topic) => (
            <TabsTrigger key={topic} value={topic}>
              {topic}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(groupedByTopic).map(([topic, areas]) => (
          <TabsContent key={topic} value={topic} className="space-y-4">
            {areas.map((area) => (
              <Card key={area.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{area.subTopic}</CardTitle>
                      <CardDescription>
                        {language === 'th' ? 'ครั้งล่าสุด' : 'Last attempt'}: {new Date(area.lastAttempt).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US')}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getMasteryIcon(area.masteryLevel)}
                      <Badge variant={area.masteryLevel === 'needs-improvement' ? 'destructive' : 'default'}>
                        {area.score}%
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{language === 'th' ? 'ระดับความเชี่ยวชาญ' : 'Mastery Level'}</span>
                      <span className="font-medium">{area.score}%</span>
                    </div>
                    <Progress value={area.score} className="h-2" />
                  </div>

                  {area.prerequisiteGaps && area.prerequisiteGaps.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">
                        {language === 'th' ? 'ความรู้พื้นฐานที่ขาด' : 'Missing Prerequisites'}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {area.prerequisiteGaps.map((gap, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {gap}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
