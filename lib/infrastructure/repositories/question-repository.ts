import { IQuestionRepository, AnyQuestionEntity, QuestionFilter } from '@/lib/domain/repositories';
import { IQuestionDataSource } from '../contracts/question-datasource';
import { QuestionMapper } from '../mappers/question-mapper';

export class QuestionRepository implements IQuestionRepository {
  constructor(private dataSource: IQuestionDataSource) { }

  public async getById(id: string): Promise<AnyQuestionEntity | null> {
    const raw = await this.dataSource.fetchById(id);
    return raw ? QuestionMapper.toDomain(raw) : null;
  }

  public async getAll(filter?: QuestionFilter): Promise<AnyQuestionEntity[]> {
    const raws = await this.dataSource.fetchAll(filter);
    return QuestionMapper.toDomainList(raws);
  }
}
