"use client";

import { useEffect, useRef } from "react";
import { useQuizStore } from "@/lib/store/quiz-store";
import { ClientQuestion, QuizConfig } from "@/types";

interface QuizInitializationProps {
  questions: ClientQuestion[];
  config: QuizConfig;
}

export function QuizInitialization({ questions, config }: QuizInitializationProps) {
  const initQuiz = useQuizStore((state) => state.initQuiz);
  const initialized = useRef<boolean>(false);

  useEffect(() => {
    if (!initialized.current) {
      initQuiz(config, questions);
      initialized.current = true;
    }
  }, [questions, config, initQuiz]);

  return null;
}