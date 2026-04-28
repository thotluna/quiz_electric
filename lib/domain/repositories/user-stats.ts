export interface QuestionStat {
  questionId: string;
  timesAnswered: number;
  timesCorrect: number;
  minCorrectTime: number;
  maxCorrectTime: number;
}

export interface IUserStatsRepository {
  getStatsByUser(userId: string, questionIds: string[]): Promise<QuestionStat[]>;
  getFastCorrectIds(userId: string, thresholdSeconds: number): Promise<string[]>;
}
