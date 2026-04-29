'use client'
import { ConfigQuiz, useConfigQuiz } from "@/hooks/useConfigQuiz";

export default function QuizInitializer(configQuiz: ConfigQuiz) {

  useConfigQuiz(configQuiz)
  return null
}