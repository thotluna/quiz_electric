import { QuestionStat } from "../entities/QuestionStat";

export interface IUserStatsRepository {
  getStatsByUserId(userId: string): Promise<QuestionStat[]>;
  getCorrectQuestionIds(userId: string, maxTime?: number): Promise<string[]>;
  recordAnswer(params: {
    userId: string;
    questionId: string;
    isCorrect: boolean;
    timeSpent: number;
  }): Promise<void>;
}
