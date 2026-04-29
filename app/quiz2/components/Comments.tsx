'use client'
import { useQuizStore2 } from "@/lib/store/quiz-store2";
import { useEffect, useState } from "react";

export default function Comments() {
  const currentQuestion = useQuizStore2(state => state.currentQuestion);
  const awnsers = useQuizStore2(state => state.answers);
  const isCorrectAnswer = useQuizStore2(state => state.isCorrectAnswer);

  const [comment, setComment] = useState<string | null>(null);

  useEffect(() => {
    const answer = awnsers.find(a => a.questionId === currentQuestion?.id);
    setComment(answer?.explanation ?? null);
  }, [currentQuestion, awnsers]);

  if (!comment) return null;

  const isCorrect = isCorrectAnswer === true;

  return (
    <section className="px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <article className={`
        p-4 rounded-xl border-2 shadow-lg backdrop-blur-md transition-colors duration-500
        ${isCorrect 
          ? 'border-blue-500/30 bg-blue-500/10 text-blue-100/90' 
          : 'border-red-500/30 bg-red-500/10 text-red-100/90'}
      `}>
        <div className="flex gap-3">
          <span className="text-xl">{isCorrect ? '💡' : '❌'}</span>
          <div className="text-sm leading-relaxed">
            <span className={`
              font-bold block mb-1 uppercase tracking-wider text-xs
              ${isCorrect ? 'text-blue-400' : 'text-red-400'}
            `}>
              {isCorrect ? '¡Correcto!' : 'Incorrecto'}
            </span>
            {comment}
          </div>
        </div>
      </article>
    </section>
  );
}