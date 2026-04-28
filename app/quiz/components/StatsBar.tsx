"use client";

import { useQuizStore } from "@/lib/store/quiz-store";
import type { ReactElement } from "react";

export const StatsBar = (): ReactElement => {
  const timer = useQuizStore((s) => s.timer);
  const userAnswers = useQuizStore((s) => s.userAnswers);
  const questionsCount = useQuizStore((s) => s.questions.length);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const correctCount = userAnswers.filter(a => a.isCorrect).length;
  const totalAnswered = userAnswers.length;

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      <div className="bg-surface-card border border-foreground/5 p-3 rounded-xl flex flex-col items-center justify-center space-y-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-foreground/30">Tiempo</span>
        <span className="text-lg font-black text-foreground font-mono">{formatTime(timer)}</span>
      </div>
      <div className="bg-surface-card border border-foreground/5 p-3 rounded-xl flex flex-col items-center justify-center space-y-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-foreground/30">Progreso</span>
        <span className="text-lg font-black text-foreground">{totalAnswered}/{questionsCount}</span>
      </div>
      <div className="bg-surface-card border border-foreground/5 p-3 rounded-xl flex flex-col items-center justify-center space-y-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-foreground/30">Aciertos</span>
        <span className="text-lg font-black text-status-correct">{correctCount}</span>
      </div>
    </div>
  );
};
