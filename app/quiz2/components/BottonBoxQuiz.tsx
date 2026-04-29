'use client'

import { useQuizStore2 } from "@/lib/store/quiz-store2";
import { EyeOffIcon } from "lucide-react";

export default function BottonBoxQuiz() {
  const next = useQuizStore2(state => state.nextQuestion);
  const omit = useQuizStore2(state => state.omitQuestion);
  const evaluateQuestion = useQuizStore2(state => state.evaluateAnswer);
  const finish = useQuizStore2(state => state.finishQuiz);
  const hasNext = useQuizStore2(state => state.hasNext);
  const nextDisable = useQuizStore2(state => state.nextDisable);
  const selectedOptionIds = useQuizStore2(state => state.selectedOptionIds);

  const canNext = selectedOptionIds.length > 0 && !nextDisable;

  const handleNext = async () => {
    await evaluateQuestion();
    setTimeout(() => {
      next();
    }, 3000);
  }

  return (
    <section className="flex w-full justify-between items-center px-4 py-1 gap-3">
      <button 
        className={`
          w-full border border-amber-300 bg-transparent px-3 py-2 rounded-md shadow-sm transition-all
          disabled:opacity-30 disabled:cursor-not-allowed disabled:grayscale disabled:border-white/20
          hover:bg-amber-300/10 active:scale-95
        `}
        onClick={omit}
        disabled={nextDisable}
      >
        <div className="flex justify-center items-center gap-2">
          <EyeOffIcon className="size-5 text-amber-300" />
          Omitir
        </div>
      </button>
      <button 
        className={`
          w-full border border-sky-300 bg-transparent px-3 py-2 rounded-md shadow-sm transition-all
          disabled:opacity-30 disabled:cursor-not-allowed disabled:grayscale disabled:border-white/20
          hover:bg-sky-300/10 active:scale-95
        `}
        onClick={handleNext} 
        disabled={!canNext || !hasNext}
      >
        <div className="flex justify-center items-center gap-2">
          <EyeOffIcon className="size-5 text-sky-300" />
          Siguiente
        </div>
      </button>
      <button className="w-full hidden border bg-transparent px-3 py-2 rounded-md shadow-sm" onClick={finish} disabled={hasNext} > Terminar </button>
    </section>
  );
}