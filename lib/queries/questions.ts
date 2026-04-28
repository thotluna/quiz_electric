import { QuestionByTopic, Question, QuestionCompocat, QuizMode, ClientQuestion } from '@/types'
import db from "../data/db.json";
import { createClient } from '../supabase/server';

export const getDbAll = (): QuestionByTopic[] => {
  return db as unknown as QuestionByTopic[];
};

export const getTopics = async (): Promise<{ id: string; itc: string }[]> => {
  const dbAll = getDbAll();
  return dbAll.map((t) => ({ id: t.id, itc: t.itc }));
};

export const getAllQuestions = (): ClientQuestion[] => {
  const dbAll = getDbAll();
  return dbAll.flatMap(t => t.preguntas).map(toClientQuestion);
};

export const toClientQuestion = (q: Question): ClientQuestion => ({
  id: q.id,
  pregunta: q.pregunta,
  tipo: q.tipo,
  opciones: q.opciones.map(o => ({ id: o.id, respuesta: o.respuesta }))
});

export const getQuestionsByTopic = async (topicId: string[], mode: QuizMode, userId?: string): Promise<ClientQuestion[]> => {
  const dbAll = getDbAll();

  const filteredTopics = topicId.length === 0
    ? dbAll
    : dbAll.filter((t) => topicId.includes(t.id));

  const data = filteredTopics.flatMap(t =>
    t.preguntas.map(p => ({ ...p, itc: t.itc }))
  );

  const count = mode === 'timed' ? 10 : mode === 'standard' ? 50 : data.length;
  const shuffled = [...data].sort(() => Math.random() - 0.5);

  if (mode === 'infinite') {
    return shuffled;
  }

  let q: QuestionCompocat[] = shuffled;

  if (userId) {
    const ids = await getFastCorrectAnswersIds(userId);
    q = shuffled.filter((p) => !ids.includes(p.id));
  }

  return q.slice(0, count).map(toClientQuestion);
};

export const getFastCorrectAnswersIds = async (userId: string): Promise<string[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_question_stats')
    .select('question_id')
    .eq('user_id', userId)
    .gt('times_correct', 0)
    .lt('min_correct_time', 1);

  if (error || !data) {
    return [];
  }

  const results = data as { question_id: string }[];
  return results.map((row) => row.question_id);
};

export const getQuestionById = (id: string) => {
  const dbAll = getDbAll();
  return dbAll.flatMap(t => t.preguntas).find(q => q.id === id);
};
