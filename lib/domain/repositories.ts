import { QuestionEntity } from './entities';
import { QuestionStat } from './repositories/user-stats';

export type AnyQuestionEntity = QuestionEntity<number> | QuestionEntity<number[]>;

export interface QuestionFilter {
  topicIds?: string[];
  excludeIds?: string[];
  limit?: number;
  offset?: number;
}

export interface IQuestionRepository {
  getById(id: string): Promise<AnyQuestionEntity | null>;
  getAll(filter?: QuestionFilter): Promise<AnyQuestionEntity[]>;
}

export * from './repositories/user-stats';
