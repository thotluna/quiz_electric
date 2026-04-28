"use server";

import { getQuestionById } from "@/lib/queries/questions";
import { EvaluationResult } from "@/types";

export async function evaluateAnswerAction(
  questionId: string,
  selectedOptionIds: number[]
): Promise<EvaluationResult> {
  const question = getQuestionById(questionId);

  if (!question) {
    throw new Error("Question not found");
  }

  const correctOptions = question.opciones.filter(o => o.es_correcta);
  const correctOptionIds = correctOptions.map(o => o.id);

  // Simple evaluation: all selected must be correct, and all correct must be selected
  const isCorrect = selectedOptionIds.length === correctOptionIds.length &&
    selectedOptionIds.every(id => correctOptionIds.includes(id));

  // Scoring logic (+1 / -0.25)
  const points = isCorrect ? 1 : -0.25;

  // Build combined explanation
  const explicacion = correctOptions.map(o => o.explicacion).filter(Boolean).join("\\n\\n");

  return {
    isCorrect,
    points,
    explicacion,
    fullQuestion: question
  };
}
