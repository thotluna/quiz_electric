import { QuizMode } from "@/types";

export interface QuizSession {
  readonly id: string;
  readonly userId: string;
  readonly mode: QuizMode;
  readonly score: number;
  readonly totalQuestions: number;
  readonly timeElapsed: number;
  readonly itcFilter: string | null;
  readonly finishedAt: Date;
}
