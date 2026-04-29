import { QuizSession } from "@/lib/domain/entities/QuizSession";
import { QuizMode } from "@/types";

export class QuizSessionMapper {
  static toDomain(raw: any): QuizSession {
    return {
      id: raw.id,
      userId: raw.user_id,
      mode: raw.mode as QuizMode,
      score: raw.score,
      totalQuestions: raw.total_questions,
      timeElapsed: raw.time_elapsed,
      itcFilter: raw.itc_filter,
      finishedAt: new Date(raw.finished_at)
    };
  }

  static toPersistence(domain: Omit<QuizSession, "id" | "finishedAt">) {
    return {
      user_id: domain.userId,
      mode: domain.mode,
      score: domain.score,
      total_questions: domain.totalQuestions,
      time_elapsed: domain.timeElapsed,
      itc_filter: domain.itcFilter
    };
  }
}
