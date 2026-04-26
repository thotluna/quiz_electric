'use client';

import { useEffect } from 'react';
import { useQuizConfigStore } from '@/lib/store/quiz-config-store';

interface QuizConfigSyncProps {
  userId: string;
}

export function QuizConfigSync({ userId }: QuizConfigSyncProps) {
  const setUserId = useQuizConfigStore((s) => s.setUserId);

  useEffect(() => {
    setUserId(userId);
  }, [userId, setUserId]);

  return null;
}
