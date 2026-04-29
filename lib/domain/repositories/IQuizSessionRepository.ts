import { QuizSession } from "../entities/QuizSession";

export interface IQuizSessionRepository {
  save(session: Omit<QuizSession, "id" | "finishedAt">): Promise<void>;
  getRecentByUserId(userId: string, limit: number): Promise<QuizSession[]>;
}
