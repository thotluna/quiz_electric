export interface QuestionStat {
  readonly userId: string;
  readonly questionId: string;
  readonly timesAnswered: number;
  readonly timesCorrect: number;
  readonly minCorrectTime: number;
  readonly maxCorrectTime: number;
  readonly lastAnsweredAt: Date;
}
