export type QuestionType = "multiple" | "simple";

export interface Option {
  readonly id: string;
  readonly texto: string;
  readonly es_correcta?: boolean;
  readonly explicacion?: string;
}

export interface ClientOption {
  readonly id: string;
  readonly texto: string;
}

export interface Question {
  readonly id: string;
  readonly pregunta: string;
  readonly opciones: Option[];
  readonly tipo: QuestionType;
  readonly explicacion_general?: string;
  readonly itc?: string;
  readonly articulo?: string;
}

/**
 * Versión de la pregunta segura para el cliente (sin campos sensibles)
 */
export type ClientQuestion = Omit<Question, "opciones"> & {
  readonly opciones: ClientOption[];
};
