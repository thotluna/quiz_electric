"use server";

import { getQuestionsByTopic as getQuestionsQuery, getTopics as getTopicsQuery, getAllQuestions as getAllQuestionsQuery } from "@/lib/queries/questions";
import { QuizMode, ClientQuestion } from "@/types";

export async function getQuestionsByTopicAction(topicIds: string[], mode: QuizMode, userId?: string): Promise<ClientQuestion[]> {
  return getQuestionsQuery(topicIds, mode, userId);
}

export async function getTopicsAction() {
  return getTopicsQuery();
}

export async function getAllQuestionsAction(): Promise<ClientQuestion[]> {
  return getAllQuestionsQuery();
}
