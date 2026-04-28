"use client";

import { useRouter } from "next/navigation";
import { useQuizStore } from "@/lib/store/quiz-store";

export const AbandonButton = () => {
  const router = useRouter();
  const resetQuiz = useQuizStore((s) => s.resetQuiz);

  const handleAbandon = () => {
    if (confirm("¿Estás seguro de que quieres abandonar el simulacro?")) {
      resetQuiz();
      router.push("/");
    }
  };

  return (
    <button
      onClick={handleAbandon}
      className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest hover:text-accent-primary transition-colors"
    >
      ← Abandonar
    </button>
  );
};
