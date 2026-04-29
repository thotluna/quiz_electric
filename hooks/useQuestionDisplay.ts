import { useQuizStore2 } from "@/lib/store/quiz-store2";

export function useQuestionDisplay() {
  const currentQuestion = useQuizStore2((state) => state.currentQuestion)
  const isCorrectAnswer = useQuizStore2((state) => state.isCorrectAnswer)
  const selectOption = useQuizStore2((state) => state.selectOption)
  const selectedOptionIds = useQuizStore2((state) => state.selectedOptionIds)

  return {
    currentQuestion,
    isCorrectAnswer,
    selectOption,
    selectedOptionIds
  }


}