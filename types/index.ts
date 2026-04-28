export type QuestionType = "simple" | "multiple";

export interface Option {
  id: number;
  respuesta: string;
  es_correcta: boolean;
  explicacion: string;
}

export interface Question {
  id: string;
  pregunta: string;
  opciones: Option[];
  tipo: QuestionType;
}

export interface QuestionCompocat extends Question {
  itc: string;
}

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

export type QuizMode = "timed" | "standard" | "infinite";

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

// Minimal User interface to satisfy imports if needed
export interface User {
  id: string;
  email?: string;
}
