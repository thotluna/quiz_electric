export interface UserGlobalStats {
  totalAnswered: number;
  totalCorrect: number;
  accuracy: number;
}

export interface TopicStat {
  topic: string;
  answered: number;
  correct: number;
  accuracy: number;
}

export interface QuizSession {
  id: string;
  created_at: string;
  score: number;
  total_questions: number;
  mode: 'standard' | 'timed' | 'simulacrum';
  time_elapsed: number;
  itc_filter?: string;
}

export interface UserStats {
  global: UserGlobalStats;
  topics: TopicStat[];
  sessions?: QuizSession[];
}
