"use client";

import { memo } from "react";
import { useQuizStore } from "@/lib/store/quiz-store";

interface StatsBarProps {
  timeElapsed?: number;
  correctAnswers?: number;
  currentQuestion?: number;
  totalQuestions?: number;
  isCountdown?: boolean;
}

export const StatsBar = memo(({
  timeElapsed: propsTime,
  correctAnswers: propsCorrect,
  currentQuestion: propsCurrent,
  totalQuestions: propsTotal,
  isCountdown: propsIsCountdown,
}: StatsBarProps) => {
  const storeTime = useQuizStore((s) => s.timeElapsed);
  const storeScore = useQuizStore((s) => s.score);
  const storeIndex = useQuizStore((s) => s.currentIndex);
  const storeTotal = useQuizStore((s) => s.questions.length);
  const mode = useQuizStore((s) => s.config?.mode);

  const timeElapsed = propsTime ?? storeTime;
  const correctAnswers = propsCorrect ?? storeScore;
  const currentQuestion = (propsCurrent ?? storeIndex) + 1;
  const totalQuestions = propsTotal ?? storeTotal;
  const isCountdown = propsIsCountdown ?? (mode === 'timed');
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const isLowTime = isCountdown && timeElapsed < 30;

  return (
    <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4 p-2 md:p-3 bg-surface-card border border-foreground/5 rounded-xl shadow-sm">
      <div className="flex items-center gap-2 md:gap-3 justify-center md:justify-start">
        <div className={`flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-lg shrink-0 shadow-inner transition-colors ${
          isLowTime ? "bg-status-incorrect/20 text-status-incorrect animate-pulse" : "bg-accent-primary/10 text-accent-primary"
        }`}>
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="hidden md:block text-[9px] font-bold uppercase tracking-widest text-foreground/40 leading-none mb-1">
            {isCountdown ? "Restante" : "Tiempo"}
          </p>
          <p className={`text-xs md:text-sm font-black tabular-nums leading-none transition-colors ${
            isLowTime ? "text-status-incorrect" : "text-foreground"
          }`}>
            {formatTime(timeElapsed)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3 justify-center md:justify-start border-x border-foreground/5">
        <div className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-lg bg-status-correct/10 text-status-correct shrink-0 shadow-inner">
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="hidden md:block text-[9px] font-bold uppercase tracking-widest text-foreground/40 leading-none mb-1">Puntos</p>
          <p className="text-xs md:text-sm font-black tabular-nums text-status-correct leading-none">
            {correctAnswers.toFixed(1)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3 justify-center md:justify-start">
        <div className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-lg bg-accent-primary/5 text-foreground/60 shrink-0 shadow-inner">
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 12h.01M7 17h.01M10 7h10M10 12h10M10 17h10" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="hidden md:block text-[9px] font-bold uppercase tracking-widest text-foreground/40 leading-none mb-1">Progreso</p>
          <p className="text-xs md:text-sm font-black tabular-nums text-foreground leading-none">
            {currentQuestion}
            {totalQuestions && (
              <span className="text-foreground/30 font-medium">/{totalQuestions}</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
});

StatsBar.displayName = "StatsBar";
