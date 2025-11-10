'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { StudentProfile, MasteryLevel } from '@/types';
import { AlertCircle, TrendingUp, Target } from 'lucide-react';

interface DashboardProps {
  profile: StudentProfile;
}

const getMasteryColor = (level: MasteryLevel) => {
  switch (level) {
    case 'needs-improvement':
      return 'bg-red-500';
    case 'developing':
      return 'bg-yellow-500';
    case 'mastered':
      return 'bg-green-500';
  }
};

const getMasteryBadgeVariant = (level: MasteryLevel): "destructive" | "default" | "secondary" => {
  switch (level) {
    case 'needs-improvement':
      return 'destructive';
    case 'developing':
      return 'default';
    case 'mastered':
      return 'secondary';
  }
};

export default function Dashboard({ profile }: DashboardProps) {
  const { language, t } = useLanguage();

  const needsImprovement = profile.weakAreas.filter(a => a.masteryLevel === 'needs-improvement');
  const developing = profile.weakAreas.filter(a => a.masteryLevel === 'developing');
  const mastered = profile.weakAreas.filter(a => a.masteryLevel === 'mastered');

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">{t('dashboard.welcome')}, {profile.name}!</h1>
        <p className="text-muted-foreground mt-1">
          {language === 'th' ? 'มาเรียนรู้และพัฒนาทักษะของคุณกันเถอะ' : "Let's learn and improve your skills"}
        </p>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {t('dashboard.overallProgress')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{language === 'th' ? 'ความคืบหน้าโดยรวม' : 'Overall Progress'}</span>
              <span className="font-medium">{profile.overallProgress}%</span>
            </div>
            <Progress value={profile.overallProgress} className="h-3" />
            <div className="grid grid-cols-3 gap-4 mt-4 text-center">
              <div>
                <div className="text-2xl font-bold text-red-500">{needsImprovement.length}</div>
                <div className="text-xs text-muted-foreground">{t('mastery.needsImprovement')}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-500">{developing.length}</div>
                <div className="text-xs text-muted-foreground">{t('mastery.developing')}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-500">{mastered.length}</div>
                <div className="text-xs text-muted-foreground">{t('mastery.mastered')}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Focus Today */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {t('dashboard.focusToday')}
          </CardTitle>
          <CardDescription>
            {language === 'th' ? 'หัวข้อที่แนะนำให้เรียนวันนี้' : 'Recommended topics for today'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {profile.focusToday.map((topic, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-accent">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="font-medium">{topic}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weak Areas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {t('dashboard.weakAreas')}
          </CardTitle>
          <CardDescription>
            {language === 'th' ? 'จุดที่ต้องให้ความสนใจเป็นพิเศษ' : 'Areas that need special attention'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {profile.weakAreas
              .filter(area => area.masteryLevel !== 'mastered')
              .sort((a, b) => a.score - b.score)
              .slice(0, 5)
              .map((area) => (
                <div key={area.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{area.topic}</div>
                      <div className="text-sm text-muted-foreground">{area.subTopic}</div>
                    </div>
                    <Badge variant={getMasteryBadgeVariant(area.masteryLevel)}>
                      {t(`mastery.${area.masteryLevel === 'needs-improvement' ? 'needsImprovement' : area.masteryLevel}`)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={area.score} className="h-2 flex-1" />
                    <span className="text-sm font-medium w-12 text-right">{area.score}%</span>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
