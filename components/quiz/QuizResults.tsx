\"use client\";

import React from 'react';
import { useQuizStore } from '@/lib/store/quiz-store';
import { useRouter } from 'next/navigation';

export const QuizResults = () => {
  const userAnswers = useQuizStore((s) => s.userAnswers);
  const config = useQuizStore((s) => s.config);
  const discardSavedQuiz = useQuizStore((s) => s.discardSavedQuiz);
  const router = useRouter();

  const correctCount = userAnswers.filter((a) => a.isCorrect).length;
  const totalQuestions = userAnswers.length;
  const score = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

  const handleRestart = () => {
    discardSavedQuiz();
    router.push('/');
  };

  return (
    <div className=\"max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in duration-700\">
      <div className=\"text-center space-y-4\">
        <h1 className=\"text-4xl md:text-6xl font-black text-foreground tracking-tighter\">
          Simulacro Finalizado
        </h1>
        <p className=\"text-foreground/50 font-medium uppercase tracking-widest text-sm\">
          Resultados del modo {config?.mode}
        </p>
      </div>

      <div className=\"grid grid-cols-1 md:grid-cols-3 gap-6\">
        <div className=\"bg-surface-card rounded-3xl p-8 border border-foreground/5 shadow-xl flex flex-col items-center justify-center space-y-2\">
          <span className=\"text-[10px] font-black uppercase tracking-widest text-foreground/30\">Puntuaci\u00f3n</span>
          <span className=\"text-5xl font-black text-accent-primary\">{score.toFixed(0)}%</span>
        </div>
        <div className=\"bg-surface-card rounded-3xl p-8 border border-foreground/5 shadow-xl flex flex-col items-center justify-center space-y-2\">
          <span className=\"text-[10px] font-black uppercase tracking-widest text-foreground/30\">Correctas</span>
          <span className=\"text-5xl font-black text-status-correct\">{correctCount}</span>
        </div>
        <div className=\"bg-surface-card rounded-3xl p-8 border border-foreground/5 shadow-xl flex flex-col items-center justify-center space-y-2\">
          <span className=\"text-[10px] font-black uppercase tracking-widest text-foreground/30\">Total</span>
          <span className=\"text-5xl font-black text-foreground\">{totalQuestions}</span>
        </div>
      </div>

      <div className=\"flex justify-center pt-8\">
        <button
          onClick={handleRestart}
          className=\"group relative flex items-center justify-center gap-3 px-12 py-5 bg-accent-primary text-white rounded-2xl font-black text-xl transition-all hover:scale-[1.05] active:scale-[0.95] shadow-2xl shadow-accent-primary/30 overflow-hidden\"
        >
          <div className=\"absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300\" />
          <span className=\"relative\">Nuevo Simulacro</span>
        </button>
      </div>

      {/* Analysis Section */}
      <div className=\"space-y-6 pt-12\">
        <h3 className=\"text-2xl font-bold text-foreground px-2\">An\u00e1lisis Detallado</h3>
        <div className=\"grid gap-4\">
          {userAnswers.map((answer, i) => (
            <div key={answer.questionId} className=\"bg-surface-card rounded-2xl p-6 border border-foreground/5 flex flex-col md:flex-row gap-6\">
              <div className=\"shrink-0 w-12 h-12 rounded-xl bg-foreground/5 flex items-center justify-center font-black text-foreground/20\">
                {i + 1}
              </div>
              <div className=\"space-y-4 flex-1\">
                <div className=\"flex flex-wrap gap-2\">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${answer.isCorrect ? 'bg-status-correct/10 text-status-correct' : 'bg-status-incorrect/10 text-status-incorrect'}`}>
                    {answer.isCorrect ? 'Correcta' : 'Incorrecta'}
                  </span>
                  <span className=\"px-2 py-1 rounded-md bg-foreground/5 text-foreground/40 text-[10px] font-black uppercase tracking-wider\">
                    {answer.timeSpent}s
                  </span>
                </div>
                <p className=\"font-bold text-lg text-foreground\">{answer.questionText}</p>
                {answer.explicacion && (
                  <div className=\"p-4 rounded-xl bg-accent-primary/5 border border-accent-primary/10 text-sm text-foreground/60 font-medium\">
                    {answer.explicacion}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
