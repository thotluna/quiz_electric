"use client";

import { useRouter } from "next/navigation";
import { useQuizStore } from "@/lib/store/quiz-store";
import type { ReactElement } from "react";

export const AbandonButton = (): ReactElement => {
  const router = useRouter();
  const finishQuiz = useQuizStore((s) => s.finishQuiz);
  const discardSavedQuiz = useQuizStore((s) => s.discardSavedQuiz);

  const handleAbandon = async () => {
    if (confirm("¿Estás seguro de que quieres abandonar el simulacro? Se guardarán las estadísticas actuales.")) {
      await finishQuiz();
      discardSavedQuiz();
      router.push("/");
    }
  };

  return (
    <button
      onClick={handleAbandon}
      className="px-3 py-1.5 rounded-lg border border-foreground/10 hover:bg-foreground/5 text-foreground/50 hover:text-foreground text-[10px] font-bold uppercase tracking-wider transition-all"
    >
      Abandonar
    </button>
  );
};
