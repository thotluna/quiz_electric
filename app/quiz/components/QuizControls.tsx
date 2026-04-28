"use client";

import { useQuizStore } from "@/lib/store/quiz-store";
import { useState, useEffect } from "react";
import type { ReactElement } from "react";

export const QuizControls = (): ReactElement => {
  const isShowingResult = useQuizStore((s) => s.isShowingResult);
  const isEvaluating = useQuizStore((s) => s.isEvaluating);
  const selectedOptionIds = useQuizStore((s) => s.selectedOptionIds);
  const evaluateCurrentAnswer = useQuizStore((s) => s.evaluateCurrentAnswer);
  const nextQuestion = useQuizStore((s) => s.nextQuestion);
  const currentIndex = useQuizStore((s) => s.currentIndex);
  const questionsCount = useQuizStore((s) => s.questions.length);

  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isShowingResult) {
      setTimeLeft(3);
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            nextQuestion();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isShowingResult, nextQuestion]);

  return (
    <div className="mt-8 flex flex-col items-center gap-4">
      {!isShowingResult ? (
        <button
          disabled={selectedOptionIds.length === 0 || isEvaluating}
          onClick={evaluateCurrentAnswer}
          className="group relative flex items-center justify-center gap-3 px-10 py-4 bg-accent-primary text-white rounded-2xl font-black text-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:scale-100 shadow-xl shadow-accent-primary/25 overflow-hidden w-full md:w-auto"
        >
          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <span className="relative">
            {isEvaluating ? "Evaluando..." : "Evaluar Respuesta"}
          </span>
          <svg className="w-5 h-5 relative group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      ) : (
        <div className="flex flex-col items-center gap-3 w-full">
          <button
            onClick={nextQuestion}
            className="group relative flex items-center justify-center gap-3 px-10 py-4 bg-foreground text-background rounded-2xl font-black text-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-foreground/10 overflow-hidden w-full md:w-auto"
          >
            <div className="absolute inset-0 bg-background/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="relative">Siguiente Pregunta</span>
            <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-background/20 text-[10px]">
              {timeLeft}
            </div>
          </button>
          <div className="w-full md:w-64 h-1 bg-foreground/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-primary transition-all duration-1000 ease-linear"
              style={{ width: `${(timeLeft / 3) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
