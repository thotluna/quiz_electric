export type QuestionType = 'simple' | 'multiple';

export interface ClientOption {
  id: number;
  text: string;
}

export interface ClientQuestion {
  id: string;
  text: string;
  options: ClientOption[];
  type: QuestionType;
}

export interface EvaluationResult {
  isCorrect: boolean;
  points: number;
  explanation: string;
  correctIds: number[];
}
