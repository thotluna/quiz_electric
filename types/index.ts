import { ClientQuestion, ClientOption, QuestionType } from "@/lib/domain/entities/Question";

export type { ClientQuestion, ClientOption, QuestionType };

export type QuizMode = 'timed' | 'standard' | 'infinite';

export interface QuizConfig {
  mode: QuizMode;
  topicIds: string[];
}

export interface UserAnswer {
  question: ClientQuestion;
  selectedOptionIds: string[];
  isCorrect: boolean;
  points: number;
  timeSpent: number;
  explanation?: string;
  correctIds?: string[];
}
