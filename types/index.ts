import { Question, QuestionType, User } from \"@/types\";

export interface ClientOption {
  id: number;
  respuesta: string;
  explicacion?: string;
}

export interface ClientQuestion {
  id: string;
  pregunta: string;
  opciones: ClientOption[];
  tipo: QuestionType;
}

export interface QuestionByTopic {
  id: string;
  itc: string;
  preguntas: Question[];
}

export type QuizMode = 'timed' | 'standard' | 'infinite';

export interface QuizConfig {
  mode: QuizMode;
  questionCount?: number;
  topicIds?: string[];
}

export interface UserAnswer {
  questionId: string;
  questionText: string;
  question?: Question;
  selectedOptionIds: number[];
  isCorrect: boolean;
  timeSpent: number;
  points: number;
  explicacion?: string;
}

export interface EvaluationResult {
  isCorrect: boolean;
  points: number;
  explicacion: string;
  fullQuestion: Question;
}
