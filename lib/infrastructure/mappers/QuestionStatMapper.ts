import { QuestionStat } from "@/lib/domain/entities/QuestionStat";

export class QuestionStatMapper {
  static toDomain(raw: any): QuestionStat {
    return {
      userId: raw.user_id,
      questionId: raw.question_id,
      timesAnswered: raw.times_answered || 0,
      timesCorrect: raw.times_correct || 0,
      minCorrectTime: raw.min_correct_time || 0,
      maxCorrectTime: raw.max_correct_time || 0,
      lastAnsweredAt: new Date(raw.last_answered_at)
    };
  }

  static toPersistence(domain: Partial<QuestionStat>) {
    return {
      user_id: domain.userId,
      question_id: domain.questionId,
      times_answered: domain.timesAnswered,
      times_correct: domain.timesCorrect,
      min_correct_time: domain.minCorrectTime,
      max_correct_time: domain.maxCorrectTime,
      last_answered_at: domain.lastAnsweredAt?.toISOString()
    };
  }
}
