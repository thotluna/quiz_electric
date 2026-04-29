"use client";

import React from "react";

interface QuizControlsProps {
  onNext: () => void;
  onSkip: () => void;
  onFinish: () => void;
  showFinish: boolean;
  hasSelected: boolean;
  isShowingResult: boolean;
  isAutoAdvancing: boolean;
  isCorrect?: boolean;
  isLastQuestion: boolean;
  explanation?: string;
}

export const QuizControls = ({
  onNext,
  onSkip,
  onFinish,
  showFinish,
  hasSelected,
  isShowingResult,
  isAutoAdvancing,
  isCorrect,
  isLastQuestion,
  explanation
}: QuizControlsProps) => {
  return (
    <div className="mt-8 flex flex-col items-center gap-4">
      {isShowingResult && explanation && (
        <div className="w-full p-4 rounded-xl bg-accent-primary/5 border border-accent-primary/10 animate-in fade-in slide-in-from-top-2 duration-300 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-accent-primary">Explicación Técnica</span>
          </div>
          <p className="text-sm text-foreground/70 font-medium leading-relaxed italic">
            {explanation}
          </p>
        </div>
      )}

      <div className="flex w-full gap-3">
        {!isShowingResult ? (
          <>
            <button
              onClick={onSkip}
              className="flex-1 py-4 bg-foreground/5 text-foreground/40 font-black rounded-2xl transition-all hover:bg-foreground/10 hover:text-foreground active:scale-95 uppercase text-xs tracking-widest"
            >
              Omitir
            </button>
            <button
              disabled={!hasSelected}
              onClick={onNext}
              className="flex-2 group relative flex items-center justify-center gap-3 py-4 bg-accent-primary text-white rounded-2xl font-black text-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:grayscale shadow-xl shadow-accent-primary/25 overflow-hidden"
            >
              <span className="relative">RESPONDER</span>
              <svg className="w-5 h-5 relative group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </>
        ) : (
          <button
            onClick={isLastQuestion ? onFinish : onNext}
            className={`w-full py-4 font-black rounded-2xl transition-all active:scale-95 shadow-xl text-lg uppercase tracking-tight
              ${isLastQuestion
                ? 'bg-status-correct text-white shadow-status-correct/25'
                : 'bg-foreground text-background shadow-foreground/10'
              }
            `}
          >
            {isLastQuestion ? 'FINALIZAR' : 'CONTINUAR'}
          </button>
        )}
      </div>
    </div>
  );
};
