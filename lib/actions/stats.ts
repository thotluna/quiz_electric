"use server";

import { UserAnswer, QuizConfig } from "@/types";

import { QuestionStat } from "@/lib/domain/entities/QuestionStat";
import { RepositoryFactory } from "../infrastructure/factories/RepositoryFactory";

// Repositorios obtenidos vía Factory
const userStatsRepo = RepositoryFactory.getUserStatsRepository();
const sessionRepo = RepositoryFactory.getQuizSessionRepository();
const userRepo = RepositoryFactory.getUserRepository();

export interface GlobalStats {
  totalAnswered: number;
  totalCorrect: number;
  accuracy: number;
}

export async function saveQuizSessionAction(config: QuizConfig, answers: UserAnswer[]): Promise<{ success: boolean }> {
  const user = await userRepo.getCurrentUser();
  if (!user) return { success: false };

  const totalScore = answers.reduce((acc, curr) => acc + curr.points, 0);
  const timeElapsed = answers.reduce((acc, curr) => acc + curr.timeSpent, 0);

  // 1. Guardar sesión
  await sessionRepo.save({
    userId: user.id,
    mode: config.mode,
    score: totalScore,
    totalQuestions: answers.length,
    timeElapsed,
    itcFilter: config.topicIds.join(",")
  });

  // 2. Actualizar estadísticas de preguntas
  for (const answer of answers) {
    await userStatsRepo.recordAnswer({
      userId: user.id,
      questionId: answer.question.id,
      isCorrect: answer.isCorrect,
      timeSpent: answer.timeSpent
    });
  }

  return { success: true };
}

export async function getUserStatsAction(): Promise<GlobalStats> {
  const user = await userRepo.getCurrentUser();
  if (!user) return { totalAnswered: 0, totalCorrect: 0, accuracy: 0 };

  const stats = await userStatsRepo.getStatsByUserId(user.id);

  const totalAnswered = stats.reduce((acc: number, s: QuestionStat) => acc + s.timesAnswered, 0);
  const totalCorrect = stats.reduce((acc: number, s: QuestionStat) => acc + s.timesCorrect, 0);
  const accuracy = totalAnswered > 0 ? (totalCorrect / totalAnswered) * 100 : 0;

  return {
    totalAnswered,
    totalCorrect,
    accuracy
  };
}
