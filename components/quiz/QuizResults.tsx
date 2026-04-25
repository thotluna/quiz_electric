"use client";

import React from "react";
import { UserAnswer } from "@/types";

interface QuizResultsProps {
  userAnswers: UserAnswer[];
  timeElapsed: number;
  totalQuestions: number;
  score: number;
  isTimeOut?: boolean;
  onReset: () => void;
}

export const QuizResults = ({ userAnswers, timeElapsed, totalQuestions, score, isTimeOut, onReset }: QuizResultsProps): React.ReactElement => {
  const answeredCount = userAnswers.filter(a => a.selectedOptionIds.length > 0).length;
  const skippedCount = totalQuestions - answeredCount;
  const correctCount = userAnswers.filter((a) => a.isCorrect).length;
  const incorrectCount = answeredCount - correctCount;
  
  // Use the pre-calculated score from the store
  const rebtScore = Math.max(0, score).toFixed(2);
  
  // Normalized score (0 to 100) based on max possible points
  const normalizedScore = Math.max(0, (score / totalQuestions) * 100).toFixed(1);
  const passThreshold = totalQuestions * 0.8;
  const isPassed = score >= passThreshold;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };


  return (
    <div className="min-h-screen bg-surface-main pt-0 pb-12 md:pt-12 px-0 md:px-6">
      <div className="max-w-4xl mx-auto space-y-4 md:space-y-8">
        {/* Main Card */}
        <div className="bg-surface-card rounded-none md:rounded-[2.5rem] p-4 md:p-12 shadow-2xl border-x-0 border-y md:border border-foreground/5 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="hidden md:block absolute top-0 right-0 w-64 h-64 bg-accent-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="hidden md:block absolute bottom-0 left-0 w-64 h-64 bg-status-correct/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10 flex flex-col items-center text-center space-y-4 md:space-y-8">
            {/* Icon Header */}
            <div className={`inline-flex items-center justify-center w-20 h-20 md:w-32 md:h-32 rounded-2xl md:rounded-[2.5rem] transform rotate-12 transition-transform duration-500 ${isTimeOut ? 'bg-status-incorrect/10 text-status-incorrect' : 'bg-accent-primary/10 text-accent-primary'}`}>
              <span className="text-4xl md:text-6xl">{isTimeOut ? "⏰" : isPassed ? "🏆" : "📈"}</span>
            </div>

            <div className="space-y-2 md:space-y-4">
              <h2 className="text-2xl md:text-5xl font-black text-foreground tracking-tight">
                {isTimeOut ? "¡Se acabó el tiempo!" : "¡Simulacro Finalizado!"}
              </h2>
              
              <div className="flex flex-col items-center gap-2 md:gap-4">
                <p className="text-xs md:text-base text-foreground/50 max-w-md mx-auto font-medium leading-relaxed px-4 md:px-0">
                  {isTimeOut 
                    ? `Has respondido ${answeredCount} de ${totalQuestions} preguntas antes de que el reloj llegara a cero.`
                    : `Has completado el entrenamiento técnico con ${answeredCount} preguntas respondidas.`}
                </p>
                
                <div className="flex flex-col items-center gap-2">
                  <div className={`px-6 py-2 md:px-8 md:py-3 rounded-xl md:rounded-2xl border-2 font-black text-xl md:text-2xl tracking-tight uppercase shadow-sm transition-all duration-500 ${
                    isPassed 
                      ? "bg-status-correct/10 border-status-correct text-status-correct shadow-status-correct/10" 
                      : "bg-status-incorrect/10 border-status-incorrect text-status-incorrect shadow-status-incorrect/10"
                  }`}>
                    {isPassed ? "✓ APTO" : "✗ NO APTO"}
                  </div>
                  <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-foreground/20">
                    Mínimo requerido: {passThreshold.toFixed(2)} pts (80%)
                  </p>
                </div>
              </div>
            </div>

            {/* Performance Gauge */}
            <div className="flex flex-col items-center py-2 md:py-4 w-full max-w-sm">
              <div className="relative w-32 h-16 md:w-56 md:h-28 mb-6 md:mb-10">
                <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
                  <defs>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
                      <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                    </filter>
                  </defs>
                  <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="currentColor" strokeWidth="12" className="text-foreground/5" strokeLinecap="round" />
                  <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="var(--color-status-correct)" strokeWidth="12" strokeDasharray={`${(correctCount / totalQuestions) * 125.6} 125.6`} strokeLinecap="round" className="transition-all duration-1000 ease-out" style={{ filter: 'url(#glow)' }} />
                  <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="var(--color-status-incorrect)" strokeWidth="12" strokeDasharray={`${(incorrectCount / totalQuestions) * 125.6} 125.6`} strokeDashoffset={`-${(correctCount / totalQuestions) * 125.6}`} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                  <g className="transition-all duration-1000 ease-out origin-[50px_50px]" style={{ transform: `rotate(${(correctCount / totalQuestions) * 180 - 90}deg)` }}>
                    <line x1="50" y1="50" x2="50" y2="15" stroke="var(--color-foreground)" strokeWidth="2.5" strokeLinecap="round" className="opacity-80" />
                    <circle cx="50" cy="50" r="3" fill="var(--color-foreground)" />
                  </g>
                </svg>
              </div>

              <div className="flex flex-col items-center mb-6 md:mb-8">
                <span className="text-4xl md:text-6xl font-black text-foreground tabular-nums tracking-tighter drop-shadow-sm">
                  {normalizedScore}<span className="text-2xl md:text-3xl opacity-20 ml-2">/ 100</span>
                </span>
                <span className="text-[8px] md:text-[10px] font-bold text-foreground/30 uppercase tracking-widest mt-1">Puntaje REBT Normalizado</span>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center px-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-status-correct" />
                  <span className="text-[8px] md:text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Aciertos</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-status-incorrect" />
                  <span className="text-[8px] md:text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Errores</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-foreground/10" />
                  <span className="text-[8px] md:text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Omitidas</span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="w-full grid grid-cols-3 lg:grid-cols-6 gap-y-6 md:gap-4 py-6 md:py-8 border-y border-foreground/5">
              <div className="space-y-0.5">
                <p className="text-xl md:text-2xl font-black text-status-correct">{correctCount}</p>
                <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-foreground/40">Aciertos</p>
              </div>
              <div className="space-y-0.5 border-l border-foreground/5">
                <p className="text-xl md:text-2xl font-black text-status-incorrect">{incorrectCount}</p>
                <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-foreground/40">Fallos</p>
              </div>
              <div className="space-y-0.5 border-l border-foreground/5">
                <p className="text-xl md:text-2xl font-black text-foreground/40">{skippedCount}</p>
                <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-foreground/40">Omitidas</p>
              </div>
              <div className="space-y-0.5 md:border-l border-foreground/5 mt-0">
                <p className="text-xl md:text-2xl font-black text-foreground">{totalQuestions}</p>
                <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-foreground/40">Total</p>
              </div>
              <div className="space-y-0.5 border-l border-foreground/5 mt-0">
                <p className="text-xl md:text-2xl font-black text-accent-primary">{formatTime(timeElapsed)}</p>
                <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-foreground/40">Tiempo</p>
              </div>
              <div className="space-y-0.5 border-l border-foreground/5 mt-0">
                <p className="text-xl md:text-2xl font-black text-foreground">{rebtScore}</p>
                <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-foreground/40">Puntos</p>
              </div>
            </div>

            <button
              onClick={onReset}
              className="group relative flex items-center justify-center gap-2 md:gap-3 px-8 py-4 md:px-10 md:py-5 bg-accent-primary text-white rounded-xl md:rounded-2xl font-black text-base md:text-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-accent-primary/25 overflow-hidden w-[calc(100%-2rem)] md:w-auto mx-auto"
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative">Nuevo Simulacro</span>
              <svg className="w-4 h-4 md:w-5 md:h-5 relative group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>

        {/* Failed Questions Analysis */}
        {userAnswers.filter(a => a.selectedOptionIds.length > 0 && !a.isCorrect).length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-xl bg-status-incorrect/10 flex items-center justify-center text-status-incorrect">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Análisis de Errores</h3>
                <p className="text-xs text-foreground/40 font-medium uppercase tracking-wider">Revisa las preguntas en las que has fallado</p>
              </div>
            </div>

            <div className="space-y-4">
              {userAnswers
                .filter(a => a.selectedOptionIds.length > 0 && !a.isCorrect)
                .map((answer, index) => {
                  const correctOptions = answer.question.opciones.filter(o => o.es_correcta);
                  const selectedOptions = answer.question.opciones.filter(o => answer.selectedOptionIds.includes(o.id));

                  return (
                    <div 
                      key={answer.question.id} 
                      className="bg-surface-card rounded-2xl p-6 border border-foreground/5 shadow-lg space-y-4 hover:border-accent-primary/20 transition-colors"
                    >
                    <div className="flex justify-between items-start gap-4">
                      <span className="shrink-0 w-8 h-8 rounded-lg bg-foreground/5 flex items-center justify-center text-xs font-bold text-foreground/40">
                        {index + 1}
                      </span>
                      <p className="text-foreground font-bold leading-tight grow">
                        {answer.question.pregunta}
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="p-4 rounded-xl bg-status-incorrect/5 border border-status-incorrect/10 space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-status-incorrect opacity-70">Tu selección</p>
                        <div className="space-y-1">
                          {selectedOptions.map(o => (
                            <p key={o.id} className="text-sm font-bold text-status-incorrect">• {o.respuesta}</p>
                          ))}
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-status-correct/5 border border-status-correct/10 space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-status-correct opacity-70">Respuestas correctas</p>
                        <div className="space-y-1">
                          {correctOptions.map(o => (
                            <p key={o.id} className="text-sm font-bold text-status-correct">• {o.respuesta}</p>
                          ))}
                        </div>
                      </div>
                    </div>

                    {correctOptions.some(o => o.explicacion) && (
                      <div className="mt-4 p-4 rounded-xl bg-accent-primary/5 border border-accent-primary/10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-accent-primary opacity-70 mb-2">Explicación técnica</p>
                        <div className="space-y-3">
                          {correctOptions.filter(o => o.explicacion).map(o => (
                            <div key={o.id}>
                              {correctOptions.length > 1 && (
                                <p className="text-[10px] font-bold text-accent-primary/60 mb-1">{o.respuesta}</p>
                              )}
                              <p className="text-sm text-foreground/70 leading-relaxed font-medium">
                                {o.explicacion}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
