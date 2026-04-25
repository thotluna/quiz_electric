export type QuestionType = 'simple' | 'multiple';

export interface Question {
  id: string;
  pregunta: string;
  opciones: Option[];
  tipo: QuestionType;
}

export interface Option {
  id: number;
  respuesta: string;
  es_correcta: boolean;
  explicacion: string;
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
  question: Question;
  selectedOptionIds: number[];
  isCorrect: boolean;
  timeSpent: number;
}
