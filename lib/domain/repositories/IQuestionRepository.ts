import { Question } from "../entities/Question";

export interface QuestionFilter {
  topicIds?: string[];
  excludedIds?: string[];
  limit?: number;
  offset?: number;
}

export interface IQuestionRepository {
  getById(id: string): Promise<Question | null>;
  getByFilter(filter: QuestionFilter): Promise<Question[]>;
  getTotalCount(filter: QuestionFilter): Promise<number>;
  getAllTopics(): Promise<{ id: string; itc: string; count: number }[]>;
}
