\"use client\";

import { useRouter } from \"next/navigation\";
import { useQuizStore } from \"@/lib/store/quiz-store\";

export const AbandonButton = (): JSX.Element => {
  const router = useRouter();
  const finishQuiz = useQuizStore((s) => s.finishQuiz);
  const discardSavedQuiz = useQuizStore((s) => s.discardSavedQuiz);

  const handleAbandon = async () => {
    if (confirm(\"\u00bfEst\u00e1s seguro de que quieres abandonar el simulacro? Se guardar\u00e1n las estad\u00edsticas actuales.\")) {
      await finishQuiz();
      discardSavedQuiz();
      router.push(\"/\");
    }
  };

  return (
    <button
      onClick={handleAbandon}
      className=\"px-3 py-1.5 rounded-lg border border-foreground/10 hover:bg-foreground/5 text-foreground/50 hover:text-foreground text-[10px] font-bold uppercase tracking-wider transition-all\"
    >
      Abandonar
    </button>
  );
};
