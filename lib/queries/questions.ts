import { ClientQuestion, Question, ClientOption, QuizMode } from "@/types";
import db from "../data/db.json";
import { createClient } from "../supabase/server";

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

export const getTopics = async (): Promise<{ id: string; itc: string }[]> => {
  const dbAll = getDbAll();
  return dbAll.map((t: any) => ({ id: t.id, itc: t.itc }));
};

export const getFastCorrectAnswersIds = async (userId: string): Promise<string[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_question_stats")
    .select("question_id")
    .eq("user_id", userId)
    .gt("times_correct", 0)
    .lt("min_correct_time", 1);

  if (error || !data) {
    return [];
  }

  return data.map((row) => row.question_id);
};

export const getQuestionsByTopic = async (
  topicIds: string[],
  mode: QuizMode = "standard",
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

  // Filter fast correct answers if userId is provided
  if (userId) {
    const fastIds = await getFastCorrectAnswersIds(userId);
    filtered = filtered.filter((q) => !fastIds.includes(q.id));
  }

  // Shuffle logic
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);

  // Mode limits
  let finalQuestions = shuffled;
  if (mode === "timed") {
    finalQuestions = shuffled.slice(0, 10);
  } else if (mode === "standard") {
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
