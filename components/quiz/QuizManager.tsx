"use client";

import React, { useEffect, useState, useRef } from "react";
import { useQuizStore } from "@/lib/store/quiz-store";
import { Quiz } from "./Quiz";
import { QuizSetup } from "./QuizSetup";
import { ResumeModal } from "./ResumeModal";
import { QuizConfig, Question, UserAnswer } from "@/types";

interface QuizManagerProps {
  topics: { id: string; itc: string }[];
  userId: string;
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

export const QuizManager = ({ topics, userId }: QuizManagerProps) => {
  const [resumeResolved, setResumeResolved] = useState<boolean>(false);
  const [shouldShowResume, setShouldShowResume] = useState<boolean>(false);
  const [hasSavedSession, setHasSavedSession] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const hasCheckedInitialSession = useRef<boolean>(false);

  const config = useQuizStore((s) => s.config);
  const startQuiz = useQuizStore((s) => s.startQuiz);
  const resumeQuiz = useQuizStore((s) => s.resumeQuiz);
  const discardSavedQuiz = useQuizStore((s) => s.discardSavedQuiz);
  const hasActiveSession = useQuizStore((s) => s.hasActiveSession);
  const isLoading = useQuizStore((s) => s.isLoading);
  const setUserId = useQuizStore((s) => s.setUserId);

  useEffect(() => {
    setUserId(userId);

    const persisted = readPersistedSession();
    const hasSession = persisted !== null
      && !persisted.isFinished
      && persisted.questions.length > 0
      && persisted.userAnswers.length > 0; // Only resume if there's actual progress

    setHasSavedSession(hasSession);
    setShouldShowResume(hasSession);
    setIsReady(true);
  }, [userId, setUserId]);

  const showResumeModal = isReady && !resumeResolved && hasSavedSession;

  const handleStart = (quizConfig: QuizConfig): void => {
    startQuiz(quizConfig);
  };

  const handleResume = (): void => {
    resumeQuiz();
    setResumeResolved(true);
    setShouldShowResume(false);
  };

  const handleDiscard = (): void => {
    discardSavedQuiz();
    setResumeResolved(true);
    setShouldShowResume(false);
  };

  // The modal only shows if we detected an existing session on mount AND it hasn't been resolved
  if (shouldShowResume && !resumeResolved) {
    return (
      <>
        <QuizSetup topics={topics} onStart={handleStart} />
        <ResumeModal onResume={handleResume} onDiscard={handleDiscard} />
      </>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <div className="w-12 h-12 border-4 border-accent-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-foreground/50 font-medium animate-pulse">Preparando simulacro...</p>
      </div>
    );
  }

  if (!config) {
    return <QuizSetup topics={topics} onStart={handleStart} />;
  }

  return <Quiz />;
};
