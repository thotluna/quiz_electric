import { IQuestionDataSource, QuestionDTO, QuestionFilter, OptionDTO } from '../contracts/question-datasource';
import db from '@/lib/data/db.json';

interface RawQuestion {
  id: string | number;
  pregunta: string;
  opciones: OptionDTO[];
  tipo: string;
}

interface RawTopic {
  id: string;
  itc: string;
  preguntas: RawQuestion[];
}

export class JsonQuestionDataSource implements IQuestionDataSource {
  private readonly questions: QuestionDTO[];

  constructor() {
    this.questions = this.parseJsonData();
  }

  private parseJsonData(): QuestionDTO[] {
    const topics = db satisfies RawTopic[];

    return topics.flatMap(topic =>
      topic.preguntas.map(question => ({
        id: String(question.id),
        pregunta: question.pregunta,
        opciones: question.opciones,
        tipo: question.tipo as 'simple' | 'multiple',
        itc: topic.itc
      }))
    );
  }

  public async fetchById(id: string): Promise<QuestionDTO | null> {
    return this.questions.find(q => q.id === id) ?? null;
  }

  public async fetchAll(filter?: QuestionFilter): Promise<QuestionDTO[]> {
    let result = [...this.questions];

    if (filter?.topicIds && filter.topicIds.length > 0) {
      const topicSet = new Set(filter.topicIds);
      result = result.filter(q => q.itc && topicSet.has(q.itc));
    }

    if (filter?.excludeIds && filter.excludeIds.length > 0) {
      const excludeSet = new Set(filter.excludeIds);
      result = result.filter(q => !excludeSet.has(q.id));
    }

    // Solo barajamos si NO hay offset (o si se quiere explícitamente), 
    // para mantener consistencia en paginación si se usara offset secuencial.
    if (!filter?.offset) {
      result.sort(() => Math.random() - 0.5);
    }

    const start = filter?.offset ?? 0;
    const end = filter?.limit ? start + filter.limit : undefined;

    return result.slice(start, end);
  }
}
