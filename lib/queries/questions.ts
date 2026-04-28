import { ClientQuestion, Question, ClientOption } from \"@/types\";
import db from \"../data/db.json\";

const getDbAll = () => (db as any).temas;

/**
 * Mappers to strip sensitive data from questions
 */
export const toClientQuestion = (q: Question): ClientQuestion => ({
  id: q.id,
  pregunta: q.pregunta,
  tipo: q.tipo,
  opciones: q.opciones.map((o): ClientOption => ({
    id: o.id,
    respuesta: o.respuesta
  }))
});

export const getQuestionsByTopic = async (
  topicIds: string[],
  mode: string = \"standard\",
  userId?: string
): Promise<ClientQuestion[]> => {
  const dbAll = getDbAll();
  let filtered: Question[] = [];

  if (topicIds.length === 0) {
    filtered = dbAll.flatMap((t: any) => t.preguntas);
  } else {
    filtered = dbAll
      .filter((t: any) => topicIds.includes(t.id))
      .flatMap((t: any) => t.preguntas);
  }

  // Shuffle logic
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);

  // Mode limits
  let finalQuestions = shuffled;
  if (mode === \"timed\") {
    finalQuestions = shuffled.slice(0, 10);
  } else if (mode === \"standard\") {
    finalQuestions = shuffled.slice(0, 50);
  }

  return finalQuestions.map(toClientQuestion);
};

export const getAllQuestions = async (): Promise<ClientQuestion[]> => {
  const dbAll = getDbAll();
  const questions = dbAll.flatMap((t: any) => t.preguntas);
  return questions.map(toClientQuestion);
};

export const getQuestionById = (id: string): Question | undefined => {
  const dbAll = getDbAll();
  return dbAll.flatMap((t: any) => t.preguntas).find((q: any) => q.id === id);
};
