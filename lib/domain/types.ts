export type QuestionType = 'simple' | 'multiple';

export interface EvaluationResult {
  questionId: string;
  isCorrect: boolean;
  score: number;
  explanation: string;
  correctIds: string[];
}
