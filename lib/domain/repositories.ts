import { QuestionEntity } from './entities';


export type AnyQuestionEntity = QuestionEntity<number> | QuestionEntity<number[]>;


export interface IQuestionRepository {
  getById(id: string): Promise<AnyQuestionEntity | null>;
  getByTopic(topicId: string): Promise<AnyQuestionEntity[]>;
  getAll(): Promise<AnyQuestionEntity[]>;
  getExcluded(ids: string[], limit?: number): Promise<AnyQuestionEntity[]>;
}
