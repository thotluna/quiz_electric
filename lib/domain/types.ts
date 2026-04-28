export type QuestionType = 'simple' | 'multiple';

export interface EvaluationResult {
  questionId: string;
  isCorrect: boolean;
  points: number;
  explanation: string;
  correctIds: number[];
}
