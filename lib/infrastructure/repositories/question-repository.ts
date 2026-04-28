import { IQuestionRepository, AnyQuestionEntity } from '@/lib/domain/repositories';
import { IQuestionDataSource } from '../contracts/question-datasource';
import { QuestionMapper } from '../mappers/question-mapper';

export class QuestionRepository implements IQuestionRepository {
  constructor(private dataSource: IQuestionDataSource) { }

  public async getById(id: string): Promise<AnyQuestionEntity | null> {
    const raw = await this.dataSource.fetchById(id);
    return raw ? QuestionMapper.toDomain(raw) : null;
  }

  public async getByTopic(topicId: string): Promise<AnyQuestionEntity[]> {
    const raws = await this.dataSource.fetchByTopic(topicId);
    return QuestionMapper.toDomainList(raws);
  }

  public async getAll(): Promise<AnyQuestionEntity[]> {
    const raws = await this.dataSource.fetchAll();
    return QuestionMapper.toDomainList(raws);
  }

  public async getExcluded(ids: string[], limit?: number): Promise<AnyQuestionEntity[]> {
    const raws = await this.dataSource.fetchAll({ excludeIds: ids, limit });
    return QuestionMapper.toDomainList(raws);
  }
}
