"use client";

interface QuizControlsProps {
  onNext: () => void;
  onSkip: () => void;
  hasSelected: boolean;
  isShowingResult: boolean;
  isAutoAdvancing: boolean;
  isCorrect?: boolean;
  isLastQuestion: boolean;
  explanation?: string;
  onFinish?: () => void;
  showFinish?: boolean;
}

export const QuizControls = ({
  onNext,
  onSkip,
  hasSelected,
  isShowingResult,
  isAutoAdvancing,
  isCorrect,
  isLastQuestion,
  explanation,
  onFinish,
  showFinish,
}: QuizControlsProps) => {
  return (
    <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-foreground/5">
      {isShowingResult && (
        <div className={`p-3 rounded-xl mb-1 flex items-start gap-3 animate-in fade-in zoom-in duration-300 border-2 ${
          isCorrect 
            ? "bg-status-correct/10 border-status-correct/20 text-status-correct" 
            : "bg-status-incorrect/10 border-status-incorrect/20 text-status-incorrect"
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
            isCorrect ? "bg-status-correct text-white" : "bg-status-incorrect text-white"
          }`}>
            <span className="text-xs">{isCorrect ? "✓" : "✕"}</span>
          </div>
          <div className="space-y-0.5">
            <p className="font-bold text-base leading-none">
              {isCorrect ? "Correcto" : "Incorrecto"}
            </p>
            <p className="text-xs opacity-90 leading-tight font-medium">
              {explanation}
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-4">
        {!isShowingResult && (
          <button
            id="btn-skip"
            data-testid="btn-skip"
            onClick={onSkip}
            className="flex-1 py-3.5 px-4 rounded-xl font-black bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-white/40 transition-all uppercase text-[10px] tracking-[0.2em] active:scale-95"
          >
            Saltar
          </button>
        )}

        {showFinish && (
          <button
            id="btn-finish"
            data-testid="btn-finish"
            onClick={onFinish}
            className="flex-1 py-3.5 px-4 rounded-xl font-black bg-red-600 text-white hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 uppercase text-[10px] tracking-[0.2em]"
          >
            Terminar
          </button>
        )}
        
        <button
          id="btn-next"
          data-testid="btn-next"
          onClick={onNext}
          disabled={!hasSelected && !isShowingResult}
          className={`
            relative overflow-hidden flex-1 py-3.5 px-4 rounded-xl font-black transition-all duration-300 active:scale-[0.95] uppercase text-[10px] tracking-[0.2em]
            ${
              !hasSelected && !isShowingResult
                ? "bg-slate-100 dark:bg-white/5 text-slate-300 dark:text-white/10 cursor-not-allowed"
                : isShowingResult
                  ? "bg-slate-900 text-white shadow-xl shadow-slate-900/40 border border-slate-900"
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-600/30 border border-blue-600"
            }
          `}
        >
          {/* Animated Progress Bar for Auto-advance */}
          {isAutoAdvancing && (
            <div 
              className="absolute bottom-0 left-0 h-1 bg-white/40 animate-shrink" 
            />
          )}
          
          <span className="relative z-10">
            {!hasSelected && !isShowingResult
              ? "Confirmar" 
              : !isShowingResult 
                ? "Evaluar" 
                : isAutoAdvancing 
                  ? (isLastQuestion ? "Fin..." : "Próxima") 
                  : (isLastQuestion ? "Finalizar" : "Siguiente")}
          </span>
        </button>
      </div>
    </div>
  );
};
