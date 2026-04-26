"use client";

import React, { useEffect, useState, useRef } from "react";
import { useQuizStore } from "@/lib/store/quiz-store";
import { Quiz } from "./Quiz";
import { ResumeModal } from "./ResumeModal";
import { QuizConfig, Question, UserAnswer, QuizMode } from "@/types";

interface QuizManagerProps {
  userId: string;
  initialQuestions?: Question[];
  mode?: QuizMode;
  topicIds?: string[];
}

interface PersistedState {
  config: QuizConfig | null;
  questions: Question[];
  userAnswers: UserAnswer[];
  isFinished: boolean;
}

const STORAGE_KEY = "quiz-electric-session";

const readPersistedSession = (): PersistedState | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: PersistedState };
    if (!parsed.state?.config) return null;
    return parsed.state;
  } catch {
    return null;
  }
};

export const QuizManager = ({ userId, initialQuestions, mode, topicIds }: QuizManagerProps) => {
  const [resumeResolved, setResumeResolved] = useState<boolean>(false);
  const [shouldShowResume, setShouldShowResume] = useState<boolean>(false);
  const [hasSavedSession, setHasSavedSession] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  
  const config = useQuizStore((s) => s.config);
  const initQuiz = useQuizStore((s) => s.initQuiz);
  const resumeQuiz = useQuizStore((s) => s.resumeQuiz);
  const discardSavedQuiz = useQuizStore((s) => s.discardSavedQuiz);
  const isLoading = useQuizStore((s) => s.isLoading);
  const setUserId = useQuizStore((s) => s.setUserId);

  useEffect(() => {
    setUserId(userId);

    const persisted = readPersistedSession();
    const hasSession = persisted !== null 
      && !persisted.isFinished 
      && persisted.questions.length > 0
      && persisted.userAnswers.length > 0;
    
    // If we have initial data from server AND no session to resume, init now
    if (initialQuestions && mode && !hasSession) {
      initQuiz({ mode, topicIds }, initialQuestions);
    }

    setHasSavedSession(hasSession);
    setShouldShowResume(hasSession);
    setIsReady(true);
  }, [userId, setUserId, initialQuestions, mode, topicIds, initQuiz]);

  const handleResume = (): void => {
    resumeQuiz();
    setResumeResolved(true);
    setShouldShowResume(false);
  };

  const handleDiscard = (): void => {
    discardSavedQuiz();
    if (initialQuestions && mode) {
      initQuiz({ mode, topicIds }, initialQuestions);
    }
    setResumeResolved(true);
    setShouldShowResume(false);
  };

  if (shouldShowResume && !resumeResolved) {
    return <ResumeModal onResume={handleResume} onDiscard={handleDiscard} />;
  }

  if (isLoading || !isReady) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-foreground/50 font-medium animate-pulse">Preparando simulacro...</p>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="text-center p-10">
        <p className="text-foreground/50">No hay una configuración activa.</p>
      </div>
    );
  }

  return <Quiz />;
};
