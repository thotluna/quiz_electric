"use client";

import { useQuizStore } from "@/lib/store/quiz-store";

interface QuizControlsProps {
  hasSelected?: boolean;
  isShowingResult?: boolean;
  isAutoAdvancing?: boolean;
  isCorrect?: boolean;
  isLastQuestion?: boolean;
  explanation?: string;
  onNext?: () => void;
  onSkip?: () => void;
  onFinish?: () => void;
  showFinish?: boolean;
  isEvaluating?: boolean;
}

export const QuizControls = ({
  hasSelected: propsHasSelected,
  isShowingResult: propsIsShowingResult,
  isAutoAdvancing: propsIsAutoAdvancing,
  isCorrect: propsIsCorrect,
  isLastQuestion: propsIsLastQuestion,
  explanation: propsExplanation,
  onNext: propsOnNext,
  onSkip: propsOnSkip,
  onFinish: propsOnFinish,
  showFinish = true,
  isEvaluating: propsIsEvaluating,
}: QuizControlsProps) => {
  const storeSelectedIds = useQuizStore((s) => s.selectedOptionIds);
  const storeIsShowingResult = useQuizStore((s) => s.isShowingResult);
  const storeIsAutoAdvancing = useQuizStore((s) => s.isAutoAdvancing);
  const storeQuestions = useQuizStore((s) => s.questions);
  const storeUserAnswers = useQuizStore((s) => s.userAnswers);
  const storeIsEvaluating = useQuizStore((s) => s.isEvaluating);
  const storeConfig = useQuizStore((s) => s.config);
  
  const evaluateAnswer = useQuizStore((s) => s.evaluateAnswer);
  const advance = useQuizStore((s) => s.advance);
  const skipQuestion = useQuizStore((s) => s.skipQuestion);
  const finishQuiz = useQuizStore((s) => s.finishQuiz);

  const currentQuestionId = storeQuestions[0]?.id;
  const currentAnswer = storeUserAnswers.find(a => a.questionId === currentQuestionId);

  const hasSelected = propsHasSelected ?? storeSelectedIds.length > 0;
  const isShowingResult = propsIsShowingResult ?? storeIsShowingResult;
  const isAutoAdvancing = propsIsAutoAdvancing ?? storeIsAutoAdvancing;
  const isCorrect = propsIsCorrect ?? currentAnswer?.isCorrect;
  const isEvaluating = propsIsEvaluating ?? storeIsEvaluating;
  const explanation = propsExplanation ?? currentAnswer?.explicacion;
  const isLastQuestion = propsIsLastQuestion ?? (storeConfig?.mode !== 'infinite' && storeQuestions.length === 1);

  const onNext = propsOnNext ?? (isShowingResult ? advance : evaluateAnswer);
  const onSkip = propsOnSkip ?? skipQuestion;
  const onFinish = propsOnFinish ?? finishQuiz;

  return (
    <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-foreground/5">
      {isShowingResult && explanation && (
        <div className={`p-3 rounded-xl mb-1 flex items-start gap-3 animate-in fade-in zoom-in duration-300 border-2 ${isCorrect
          ? "bg-status-correct/10 border-status-correct/20 text-status-correct"
          : "bg-status-incorrect/10 border-status-incorrect/20 text-status-incorrect"
          }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${isCorrect ? "bg-status-correct text-white" : "bg-status-incorrect text-white"
            }`}>
            {isCorrect ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-0.5">
              {isCorrect ? "Correcto" : "Incorrecto"}
            </p>
            <p className="text-xs font-bold leading-relaxed">{explanation}</p>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {!isShowingResult && (
          <button
            id="btn-skip"
            data-testid="btn-skip"
            onClick={onSkip}
            disabled={isEvaluating}
            className="flex-1 py-3.5 px-4 rounded-xl font-bold transition-all duration-300 active:scale-[0.95] text-[10px] uppercase tracking-widest border border-foreground/5 text-foreground/40 hover:text-foreground/60 hover:bg-foreground/5 disabled:opacity-50"
          >
            Saltar
          </button>
        )}

        <button
          id="btn-next"
          data-testid="btn-next"
          onClick={onNext}
          disabled={(!hasSelected && !isShowingResult) || isEvaluating}
          className={`
            relative overflow-hidden flex-1 py-3.5 px-4 rounded-xl font-black transition-all duration-300 active:scale-[0.95] uppercase text-[10px] tracking-[0.2em]
            ${!hasSelected && !isShowingResult
              ? "bg-foreground/5 text-foreground/20 cursor-not-allowed"
              : isShowingResult
                ? isCorrect
                  ? "bg-status-correct text-white shadow-lg shadow-status-correct/25 hover:shadow-status-correct/40"
                  : "bg-status-incorrect text-white shadow-lg shadow-status-incorrect/25 hover:shadow-status-incorrect/40"
                : "bg-accent-primary text-white shadow-lg shadow-accent-primary/25 hover:shadow-accent-primary/40"
            }
          `}
        >
          {isEvaluating && (
            <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          )}

          <span className="relative z-10">
            {isEvaluating
              ? "Evaluando..."
              : !hasSelected && !isShowingResult
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
