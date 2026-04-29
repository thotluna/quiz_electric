import { useQuizConfigStore } from "@/lib/store/quiz-config-store";
import { useQuizStore } from "@/lib/store/quiz-store";
import { useEffect, useState } from "react";

export function useStatQuiz() {
  const mode = useQuizConfigStore((s) => s.mode);
  const isFinished = useQuizStore((s) => s.isFinished);
  const finishQuiz = useQuizStore((s) => s.finishQuiz);
  const totalQuestions = useQuizStore((s) => s.initialQuestions.length);
  const correctAnswers = useQuizStore((s) => s.score);
  const [timeLeft, setTimeLeft] = useState(180);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(1);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (mode === 'timed' && !isFinished) {
      timer = setInterval(() => {
        setTimeLeft(prev => Math.max(0, prev - 1));
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    } else if (mode !== 'timed' && !isFinished) {
      timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }

    if (mode === 'timed' && timeLeft === 0 && !isFinished) {
      finishQuiz();
    }

    return () => clearInterval(timer);
  }, [timeLeft, isFinished, mode]);

  return {
    timeLeft,
    timeElapsed,
    totalQuestions,
    currentQuestion,
    correctAnswers,
  };
}