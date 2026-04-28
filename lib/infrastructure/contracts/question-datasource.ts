export interface OptionDTO {
  id: number;
  respuesta: string;
  es_correcta: boolean;
  explicacion: string;
}

export interface QuestionDTO {
  id: string;
  pregunta: string;
  opciones: OptionDTO[];
  tipo: 'simple' | 'multiple';
  itc?: string;
}

export interface QuestionFilter {
  topicIds?: string[];
  excludeIds?: string[];
  limit?: number;
  offset?: number;
}

export interface IQuestionDataSource {
  fetchById(id: string): Promise<QuestionDTO | null>;
  fetchAll(filter?: QuestionFilter): Promise<QuestionDTO[]>;
}
