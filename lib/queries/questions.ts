import db from "../data/db.json";

interface RawQuestion {
  id: string | number;
  pregunta: string;
  opciones: any[]; // Mantengo any aquí temporalmente solo para el mapeo legacy si es necesario, 
                   // pero intentaré evitarlo.
  tipo: string;
}

interface RawTopic {
  id: string;
  itc: string;
  preguntas: RawQuestion[];
}

export const getTopics = async (): Promise<{ id: string; itc: string }[]> => {
  const topics = db as unknown as RawTopic[];
  return topics.map((t) => ({ id: t.id, itc: t.itc }));
};

// Estos métodos parecen no usarse según el grep, pero los mantengo tipados mínimamente para no romper nada
export const getQuestionsByTopic = async (topicId: string): Promise<RawQuestion[]> => {
  const topics = db as unknown as RawTopic[];
  const topic = topics.find((t) => t.id === topicId);
  return topic ? topic.preguntas : [];
};

export const getAllQuestions = async (): Promise<RawQuestion[]> => {
  const topics = db as unknown as RawTopic[];
  return topics.flatMap(t => t.preguntas);
};
