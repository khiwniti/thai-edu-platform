'use client';

import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setLanguage(language === 'th' ? 'en' : 'th')}
      className="gap-2"
    >
      <Languages className="h-4 w-4" />
      {language === 'th' ? 'EN' : 'TH'}
    </Button>
  );
}
