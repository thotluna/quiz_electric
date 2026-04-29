import { useQuizStore2 } from "@/lib/store/quiz-store2";
import { ClientQuestion, QuizMode } from "@/types";
import { useEffect } from "react";

export interface ConfigQuiz {
  mode: QuizMode
  topicIds: string[]
  questions: ClientQuestion[]
}

export function useConfigQuiz({ mode, topicIds, questions }: ConfigQuiz) {
  const initQuiz = useQuizStore2((state) => state.initQuiz)

  useEffect(() => {
    initQuiz({ mode, topicIds }, questions)
  }, [mode, topicIds, questions])

}