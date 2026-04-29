'use client'

import { useStatQuiz } from "@/hooks/useStatQuiz";

export default function StatQuiz() {
  const { timeLeft, totalQuestions, currentQuestion, correctAnswers } = useStatQuiz();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(Math.abs(seconds) / 60);
    const secs = Math.abs(seconds) % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <section className="flex w-full justify-between items-center p-4 ">
      <article className="w-full flex flex-col items-center justify-center gap-1 rounded-l-lg border-2 border-white/10 p-4">
        <span className="text-white/50 text-xs font-black">TIEMPO</span>
        <span className="text-white text-xs font-black">{formatTime(timeLeft)}</span>
      </article>
      <article className="w-full flex flex-col items-center justify-center gap-1 border-2 border-white/10 p-4">
        <span className="text-white/50 text-xs font-black">PREGUNTA</span>
        <span className="text-white text-xs font-black">{currentQuestion}/{totalQuestions}</span>
      </article>
      <article className="w-full flex flex-col items-center justify-center gap-1 rounded-r-lg border-2 border-white/10 p-4">
        <span className="text-white/50 text-xs font-black">ACIERTOS</span>
        <span className="text-white text-xs font-black">{correctAnswers}</span>
      </article>
    </section>
  );
}