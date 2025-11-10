'use client';

import { useState } from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { StudentProfile } from '@/types';
import { generateMockProfile, generateMockContent } from '@/lib/mockData';
import LanguageToggle from '@/components/LanguageToggle';
import Assessment from '@/components/Assessment';
import Dashboard from '@/components/Dashboard';
import ContentFeed from '@/components/ContentFeed';
import AITutor from '@/components/AITutor';
import WeaknessProfile from '@/components/WeaknessProfile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { BookOpen, LayoutDashboard, Library, MessageSquare, BarChart3 } from 'lucide-react';

function AppContent() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleAssessmentComplete = (answers: Record<string, number>) => {
    const newProfile = generateMockProfile(answers);
    setProfile(newProfile);
    setActiveTab('dashboard');
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Thai Education Platform</h1>
                <p className="text-sm text-muted-foreground">แพลตฟอร์มการศึกษาไทย</p>
              </div>
            </div>
            <LanguageToggle />
          </div>

          <div className="max-w-3xl mx-auto">
            <Card className="p-8">
              <Assessment onComplete={handleAssessmentComplete} />
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const mockContent = generateMockContent();
  const weakAreaTopics = profile.weakAreas
    .filter(a => a.masteryLevel !== 'mastered')
    .map(a => a.subTopic);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="border-b bg-white dark:bg-gray-950 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Thai Education Platform</h1>
              </div>
            </div>
            <LanguageToggle />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="dashboard" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="gap-2">
              <Library className="h-4 w-4" />
              <span className="hidden sm:inline">Content</span>
            </TabsTrigger>
            <TabsTrigger value="tutor" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Tutor</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="assessment" className="gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Assessment</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <Dashboard profile={profile} />
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <ContentFeed contents={mockContent} />
          </TabsContent>

          <TabsContent value="tutor" className="h-[calc(100vh-180px)]">
            <AITutor weakAreas={weakAreaTopics} />
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <WeaknessProfile weakAreas={profile.weakAreas} />
          </TabsContent>

          <TabsContent value="assessment" className="space-y-6">
            <div className="max-w-3xl mx-auto">
              <Card className="p-8">
                <Assessment onComplete={handleAssessmentComplete} />
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}