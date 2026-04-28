export type QuestionType = 'simple' | 'multiple';

export interface ClientOption {
  id: number;
  respuesta: string;
}

export interface ClientQuestion {
  id: string;
  pregunta: string;
  opciones: ClientOption[];
  tipo: QuestionType;
}

export type QuizMode = 'timed' | 'standard' | 'infinite';

export interface QuizConfig {
  mode: QuizMode;
  questionCount?: number;
  topicIds?: string[];
}

export interface UserAnswer {
  question: ClientQuestion;
  selectedOptionIds: number[];
  isCorrect: boolean;
  points: number;
  timeSpent: number;
  explanation?: string;
  correctIds?: number[];
}
