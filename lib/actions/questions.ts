"use server";

import { getQuestionsByTopic as getQuestionsByTopicQuery, getAllQuestions as getAllQuestionsQuery } from "@/lib/queries/questions";
import { ClientQuestion, QuizMode } from "@/types";

export async function getQuestionsByTopicAction(
  topicIds: string[],
  mode: QuizMode,
  userId?: string
): Promise<ClientQuestion[]> {
  return getQuestionsByTopicQuery(topicIds, mode, userId);
}

export async function getAllQuestionsAction(): Promise<ClientQuestion[]> {
  return getAllQuestionsQuery();
}
