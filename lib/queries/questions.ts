import { QuestionByTopic, Question } from '@/types'
import db from "../data/db.json";

type MockWindow = typeof window & {
  __MOCK_QUESTIONS__?: QuestionByTopic[];
};

export const getDbAll = (): QuestionByTopic[] => {
  // Check browser mock (E2E Playwright)
  if (typeof window !== "undefined" && (window as MockWindow).__MOCK_QUESTIONS__) {
    return (window as MockWindow).__MOCK_QUESTIONS__!;
  }
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
