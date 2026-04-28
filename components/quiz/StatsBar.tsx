"use client";

import React from "react";

interface StatsBarProps {
  timeElapsed: number;
  correctAnswers: number;
  currentQuestion: number;
  totalQuestions: number;
  isCountdown?: boolean;
}

export const StatsBar = ({
  timeElapsed,
  correctAnswers,
  currentQuestion,
  totalQuestions,
  isCountdown = false
}: StatsBarProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(Math.abs(seconds) / 60);
    const secs = Math.abs(seconds) % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      <div className="bg-surface-card border border-foreground/5 p-3 rounded-xl flex flex-col items-center justify-center space-y-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-foreground/30">
          {isCountdown ? 'Restante' : 'Tiempo'}
        </span>
        <span className={`text-lg font-black font-mono ${isCountdown && timeElapsed < 30 ? 'text-status-incorrect animate-pulse' : 'text-foreground'}`}>
          {formatTime(timeElapsed)}
        </span>
      </div>
      <div className="bg-surface-card border border-foreground/5 p-3 rounded-xl flex flex-col items-center justify-center space-y-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-foreground/30">Pregunta</span>
        <span className="text-lg font-black text-foreground">{currentQuestion}/{totalQuestions}</span>
      </div>
      <div className="bg-surface-card border border-foreground/5 p-3 rounded-xl flex flex-col items-center justify-center space-y-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-foreground/30">Aciertos</span>
        <span className="text-lg font-black text-status-correct">{correctAnswers}</span>
      </div>
    </div>
  );
};
