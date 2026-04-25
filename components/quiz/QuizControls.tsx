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

      <div className="flex gap-2">
        {!isShowingResult && (
          <button
            id="btn-skip"
            data-testid="btn-skip"
            onClick={onSkip}
            className="flex-1 py-3 px-6 rounded-xl font-bold bg-foreground/5 hover:bg-foreground/10 text-foreground/40 transition-all border border-foreground/5"
          >
            Saltar
          </button>
        )}

        {showFinish && (
          <button
            id="btn-finish"
            data-testid="btn-finish"
            onClick={onFinish}
            className="flex-1 py-3 px-4 rounded-xl font-bold bg-status-incorrect/10 text-status-incorrect hover:bg-status-incorrect/20 transition-all border border-status-incorrect/20"
          >
            Finalizar
          </button>
        )}
        
        <button
          id="btn-next"
          data-testid="btn-next"
          onClick={onNext}
          disabled={!hasSelected && !isShowingResult}
          className={`
            relative overflow-hidden flex-[2] py-3 px-6 rounded-xl font-bold transition-all duration-300 active:scale-[0.98]
            ${
              !hasSelected && !isShowingResult
                ? "bg-foreground/10 text-foreground/30 cursor-not-allowed"
                : isShowingResult
                  ? "bg-foreground text-background shadow-lg"
                  : "bg-accent-primary text-white hover:bg-accent-primary/90 shadow-md hover:shadow-lg"
            }
          `}
        >
          {/* Animated Progress Bar for Auto-advance */}
          {isAutoAdvancing && (
            <div 
              className="absolute bottom-0 left-0 h-1 bg-accent-primary/40 animate-shrink" 
            />
          )}
          
          <span className="relative z-10">
            {!hasSelected && !isShowingResult
              ? "Selecciona una opción" 
              : !isShowingResult 
                ? "Comprobar y Continuar" 
                : isAutoAdvancing 
                  ? (isLastQuestion ? "Finalizando..." : "Siguiente Pregunta (3s)") 
                  : (isLastQuestion ? "Finalizar Quiz" : "Siguiente Pregunta")}
          </span>
        </button>
      </div>
    </div>
  );
};
