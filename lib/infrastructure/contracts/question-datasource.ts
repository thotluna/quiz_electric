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
  topicId?: string;
  excludeIds?: string[];
  limit?: number;
}

/**
 * Contrato técnico para la extracción de datos con capacidades de filtrado.
 */
export interface IQuestionDataSource {
  fetchById(id: string): Promise<QuestionDTO | null>;
  fetchByIds(ids: string[]): Promise<QuestionDTO[]>;
  fetchByTopic(topicId: string): Promise<QuestionDTO[]>;
  fetchAll(filter?: QuestionFilter): Promise<QuestionDTO[]>;
}
