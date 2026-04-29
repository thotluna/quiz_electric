"use server";

import { JsonQuestionRepository } from "@/lib/infrastructure/repositories/JsonQuestionRepository";
import { SupabaseUserStatsRepository } from "@/lib/infrastructure/repositories/SupabaseUserStatsRepository";
import { QuizService, EvaluationResult } from "../services/QuizService";
import { ClientQuestion } from "@/lib/domain/entities/Question";

// Instancias lazy para evitar problemas en tests y asegurar que se crean en el server
const getService = () => {
  const questionRepo = new JsonQuestionRepository();
  const statsRepo = new SupabaseUserStatsRepository();
  return new QuizService(questionRepo, statsRepo);
};

export async function getQuizQuestionsAction(
  topicIds: string[],
  limit: number = 20,
  userId: string | null = null,
  offset: number = 0
): Promise<ClientQuestion[]> {
  return getService().getQuestions(topicIds, limit, userId, offset);
}

export async function evaluateAnswerAction(
  questionId: string,
  selectedOptionIds: string[]
): Promise<EvaluationResult> {
  return getService().evaluateAnswer(questionId, selectedOptionIds);
}
