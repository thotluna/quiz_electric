"use client";

import { ClientQuestion } from "@/types";
import { useQuizStore } from "@/lib/store/quiz-store";

interface QuestionCardProps {
  question?: ClientQuestion;
  questionNumber?: number;
  totalQuestions?: number;
}

export const QuestionCard = ({ 
  question: propsQuestion, 
  questionNumber: propsNumber, 
  totalQuestions: propsTotal 
}: QuestionCardProps) => {
  const storeQuestion = useQuizStore((s) => s.questions[0]);
  const storeIndex = useQuizStore((s) => s.currentIndex);
  const storeTotal = useQuizStore((s) => s.questions.length);

  const question = propsQuestion ?? storeQuestion;
  const questionNumber = (propsNumber ?? storeIndex) + 1;
  const totalQuestions = propsTotal ?? storeTotal;

  if (!question) return null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-[10px] font-black text-accent-primary uppercase tracking-[0.2em]">
          Pregunta {questionNumber}
        </span>
      </div>
      <h2 className="text-lg md:text-xl font-bold text-foreground leading-tight md:leading-snug">
        {question.pregunta}
      </h2>
      {totalQuestions && (
        <div className="mt-4 h-1 w-full bg-foreground/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent-primary transition-all duration-700 ease-out"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
};
