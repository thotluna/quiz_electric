import { IQuestionRepository, QuestionFilter } from "@/lib/domain/repositories/IQuestionRepository";
import { Question } from "@/lib/domain/entities/Question";
import fs from "fs";
import path from "path";

interface RawQuestion {
  id: string | number;
  pregunta: string;
  opciones: Array<{
    id: string | number;
    texto?: string;
    respuesta?: string;
    es_correcta: boolean;
    explicacion?: string;
  }>;
  tipo: string;
  explicacion_general?: string;
  articulo?: string;
  itc?: string;
}

interface RawTopic {
  id: string;
  itc: string;
  preguntas: RawQuestion[];
}

export class JsonQuestionRepository implements IQuestionRepository {
  private topics: RawTopic[] = [];

  constructor(initialData?: { temas: RawTopic[] }) {
    if (initialData?.temas) {
      this.topics = initialData.temas;
    } else {
      this.loadAllData();
    }
  }

  private loadAllData(): void {
    const dataPath = path.join(process.cwd(), "lib/data");

    if (!fs.existsSync(dataPath)) {
      return;
    }

    const files = fs.readdirSync(dataPath).filter(f => f.endsWith(".json"));

    for (const file of files) {
      const filePath = path.join(dataPath, file);
      const content = fs.readFileSync(filePath, "utf-8");
      const json = JSON.parse(content);

      // Caso 1: Formato legacy (Objeto con propiedad 'temas')
      if (json.temas && Array.isArray(json.temas)) {
        this.topics.push(...(json.temas as RawTopic[]));
      }
      // Caso 2: Array de objetos
      else if (Array.isArray(json)) {
        // ¿Es un array de Temas (objetos con 'preguntas') o un array de Preguntas?
        const isTopicArray = json.length > 0 && json[0].preguntas && Array.isArray(json[0].preguntas);

        if (isTopicArray) {
          this.topics.push(...(json as RawTopic[]));
        } else {
          // Es un array de preguntas (formato nuevo como itc-bt-03.json)
          const itcName = file.replace(".json", "").toUpperCase();
          this.topics.push({
            id: itcName.toLowerCase(),
            itc: itcName,
            preguntas: json as RawQuestion[]
          });
        }
      }
    }
  }

  async getById(id: string): Promise<Question | null> {
    for (const topic of this.topics) {
      const found = topic.preguntas.find(p => p.id.toString() === id);
      if (found) {
        return this.mapToDomain(found, topic.itc);
      }
    }
    return null;
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
      itc: raw.itc || itc,
      articulo: raw.articulo,
      opciones: (raw.opciones || []).map(opt => ({
        id: opt.id.toString(),
        texto: opt.texto || opt.respuesta || "",
        es_correcta: opt.es_correcta,
        explicacion: opt.explicacion
      }))
    };
  }
}
