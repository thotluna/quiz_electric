"use client";

import React, { useEffect, useState } from "react";
import { useQuizStore } from "@/lib/store/quiz-store";
import { Quiz } from "./Quiz";
import { QuizSetup } from "./QuizSetup";
import { ResumeModal } from "./ResumeModal";

interface QuizManagerProps {
  topics: { id: string; itc: string }[];
  userId: string;
}

export const QuizManager = ({ topics, userId }: QuizManagerProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  
  const config = useQuizStore((s) => s.config);
  const isFinished = useQuizStore((s) => s.isFinished);
  const setUserId = useQuizStore((s) => s.setUserId);
  const hasActiveSession = useQuizStore((s) => s.hasActiveSession);
  const resetQuiz = useQuizStore((s) => s.resetQuiz);

  useEffect(() => {
    // Rehidratar el store al montar
    useQuizStore.persist.rehydrate();
    setIsHydrated(true);
    setUserId(userId);

    if (window.location.search.includes("test_session=true")) {
      useQuizStore.getState().setTestMode(true);
    }
  }, [userId, setUserId]);

  useEffect(() => {
    if (isHydrated && hasActiveSession()) {
      setShowResumeModal(true);
    }
  }, [isHydrated, hasActiveSession]);

  if (!isHydrated) return null;

  return (
    <>
      {!config ? (
        <QuizSetup topics={topics} />
      ) : (
        <Quiz />
      )}

      {showResumeModal && (
        <ResumeModal
          onConfirm={() => setShowResumeModal(false)}
          onCancel={() => {
            resetQuiz();
            setShowResumeModal(false);
          }}
        />
      )}
    </>
  );
};
