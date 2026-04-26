import { QuestionByTopic, Question } from '@/types'
import db from "../data/db.json";

export const getDbAll = (): QuestionByTopic[] => {
  return db as unknown as QuestionByTopic[];
};

export const getTopics = async (): Promise<{ id: string; itc: string }[]> => {
  const dbAll = getDbAll();
  return dbAll.map((t) => ({ id: t.id, itc: t.itc }));
};

export const getQuestionsByTopic = async (topicId: string): Promise<Question[]> => {
  const dbAll = getDbAll();
  const topic = dbAll.find((t) => t.id === topicId);
  return topic ? topic.preguntas : [];
};

export const getAllQuestions = async (): Promise<Question[]> => {
  const dbAll = getDbAll();
  return dbAll.flatMap(t => t.preguntas);
};
