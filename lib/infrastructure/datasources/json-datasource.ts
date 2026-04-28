import { IQuestionDataSource, QuestionDTO, QuestionFilter } from '../contracts/question-datasource';
import db from '@/lib/data/db.json';

interface RawTopic {
  id: string;
  itc: string;
  preguntas: QuestionDTO[];
}

export class JsonQuestionDataSource implements IQuestionDataSource {
  private readonly questions: QuestionDTO[] = (db as unknown as RawTopic[]).flatMap((topic: RawTopic) => 
    topic.preguntas.map((q: QuestionDTO) => ({
      ...q,
      itc: topic.itc
    }))
  );

  public async fetchById(id: string): Promise<QuestionDTO | null> {
    return this.questions.find(q => q.id === id) ?? null;
  }

  public async fetchByIds(ids: string[]): Promise<QuestionDTO[]> {
    return this.questions.filter(q => ids.includes(q.id));
  }

  public async fetchByTopic(topicId: string): Promise<QuestionDTO[]> {
    return this.questions.filter(q => q.itc === topicId);
  }

  public async fetchAll(filter?: QuestionFilter): Promise<QuestionDTO[]> {
    let result = [...this.questions];

    if (filter?.topicId) {
      result = result.filter(q => q.itc === filter.topicId);
    }

    if (filter?.excludeIds && filter.excludeIds.length > 0) {
      const excludeSet = new Set(filter.excludeIds);
      result = result.filter(q => !excludeSet.has(q.id));
    }

    if (filter?.limit) {
      result = result.slice(0, filter.limit);
    }

    return result;
  }
}
