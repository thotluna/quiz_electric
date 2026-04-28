\"use client\";

import { useQuizStore } from \"@/lib/store/quiz-store\";

export const QuestionCard = (): JSX.Element | null => {
  const currentIndex = useQuizStore((s) => s.currentIndex);
  const questions = useQuizStore((s) => s.questions);
  const isShowingResult = useQuizStore((s) => s.isShowingResult);
  const lastEvaluation = useQuizStore((s) => s.lastEvaluation);

  const currentQuestion = questions[currentIndex];

  if (!currentQuestion) return null;

  return (
    <div className=\"space-y-4\">
      <div className=\"space-y-2\">
        <div className=\"flex items-center gap-2\">
          <span className=\"px-2 py-0.5 rounded-md bg-foreground/5 text-foreground/40 text-[10px] font-black uppercase tracking-wider\">
            Pregunta {currentIndex + 1} de {questions.length}
          </span>
          <span className=\"px-2 py-0.5 rounded-md bg-accent-primary/10 text-accent-primary text-[10px] font-black uppercase tracking-wider\">
            {currentQuestion.tipo === \"multiple\" ? \"Selecci\u00f3n M\u00faltiple\" : \"Selecci\u00f3n \u00danica\"}
          </span>
        </div>
        <h2 className=\"text-xl md:text-2xl font-bold text-foreground leading-tight\">
          {currentQuestion.pregunta}
        </h2>
      </div>

      {isShowingResult && lastEvaluation?.explicacion && (
        <div className=\"p-4 rounded-xl bg-accent-primary/5 border border-accent-primary/10 animate-in fade-in slide-in-from-top-2 duration-300\">
          <div className=\"flex items-center gap-2 mb-2\">
            <svg className=\"w-4 h-4 text-accent-primary\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\">
              <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z\" />
            </svg>
            <span className=\"text-[10px] font-black uppercase tracking-widest text-accent-primary\">Explicaci\u00f3n T\u00e9cnica</span>
          </div>
          <p className=\"text-sm text-foreground/70 font-medium leading-relaxed\">
            {lastEvaluation.explicacion}
          </p>
        </div>
      )}
    </div>
  );
};
