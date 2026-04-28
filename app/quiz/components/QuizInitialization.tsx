\"use client\";

import { useEffect } from \"react\";
import { useQuizStore } from \"@/lib/store/quiz-store\";
import { ClientQuestion, QuizConfig } from \"@/types\";

interface QuizInitializationProps {
  questions: ClientQuestion[];
  config: QuizConfig;
}

export const QuizInitialization = ({ questions, config }: QuizInitializationProps) => {
  const initQuiz = useQuizStore((s) => s.initQuiz);
  const tick = useQuizStore((s) => s.tick);

  useEffect(() => {
    initQuiz(config, questions);
  }, [initQuiz, config, questions]);

  useEffect(() => {
    const interval = setInterval(() => {
      tick();
    }, 1000);
    return () => clearInterval(interval);
  }, [tick]);

  return null;
};
