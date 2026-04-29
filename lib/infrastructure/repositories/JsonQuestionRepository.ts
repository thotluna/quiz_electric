import { IQuestionRepository, QuestionFilter } from "@/lib/domain/repositories/IQuestionRepository";
import { Question } from "@/lib/domain/entities/Question";
import db from "../../data/db.json";

interface RawQuestion {
  id: string | number;
  pregunta: string;
  opciones: any[];
  tipo: string;
  explicacion_general?: string;
  articulo?: string;
}

interface RawTopic {
  id: string;
  itc: string;
  preguntas: RawQuestion[];
}

export class JsonQuestionRepository implements IQuestionRepository {
  private readonly topics: RawTopic[];

  constructor(customData?: any) {
    const data = customData || db;
    this.topics = (data.temas || []) as RawTopic[];
  }

  async getById(id: string): Promise<Question | null> {
    const allQuestions = this.topics.flatMap(t => 
      t.preguntas.map(p => this.mapToDomain(p, t.itc))
    );
    return allQuestions.find(q => q.id === id) || null;
  }

  async getByFilter(filter: QuestionFilter): Promise<Question[]> {
    let questions = this.topics
      .filter(t => !filter.topicIds || filter.topicIds.length === 0 || filter.topicIds.includes(t.id))
      .flatMap(t => t.preguntas.map(p => this.mapToDomain(p, t.itc)));

    if (filter.excludedIds && filter.excludedIds.length > 0) {
      questions = questions.filter(q => !filter.excludedIds?.includes(q.id));
    }

    const start = filter.offset || 0;
    const end = filter.limit ? start + filter.limit : undefined;

    return questions.slice(start, end);
  }

  async getTotalCount(filter: QuestionFilter): Promise<number> {
    const questions = await this.getByFilter({ ...filter, limit: undefined, offset: 0 });
    return questions.length;
  }

  async getAllTopics(): Promise<{ id: string; itc: string; count: number }[]> {
    return this.topics.map(t => ({
      id: t.id,
      itc: t.itc,
      count: t.preguntas.length
    }));
  }

  private mapToDomain(raw: RawQuestion, itc: string): Question {
    return {
      id: raw.id.toString(),
      pregunta: raw.pregunta,
      tipo: raw.tipo as any,
      explicacion_general: raw.explicacion_general,
      itc,
      articulo: raw.articulo,
      opciones: (raw.opciones || []).map(opt => ({
        id: opt.id.toString(),
        texto: opt.texto,
        es_correcta: opt.es_correcta,
        explicacion: opt.explicacion
      }))
    };
  }
}
