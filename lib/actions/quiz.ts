"use server";

import { getQuestionById } from "@/lib/queries/questions";
import { EvaluationResult } from "@/types";

export async function evaluateAnswerAction(
  questionId: string,
  selectedOptionIds: number[]
): Promise<EvaluationResult> {
  const serverQuestion = await getQuestionById(questionId);

  if (!serverQuestion) {
    throw new Error("Question not found");
  }

  let points = 0;
  let isCorrect = false;

  if (serverQuestion.tipo === 'multiple') {
    const correctOptions = serverQuestion.opciones.filter(o => o.es_correcta);
    const totalCorrect = correctOptions.length;
    const totalIncorrect = serverQuestion.opciones.length - totalCorrect;

    // Avoid division by zero
    const posPointsPerOption = totalCorrect > 0 ? 1 / totalCorrect : 0;
    const negPointsPerOption = totalIncorrect > 0 ? 0.25 / totalIncorrect : 0;

    let partialScore = 0;
    selectedOptionIds.forEach(id => {
      const opt = serverQuestion.opciones.find(o => o.id === id);
      if (opt?.es_correcta) {
        partialScore += posPointsPerOption;
      } else {
        partialScore -= negPointsPerOption;
      }
    });

    points = Math.max(-0.25, partialScore);
    isCorrect = Math.abs(partialScore - 1) < 0.01;
  } else {
    const selectedId = selectedOptionIds[0];
    const selectedOption = serverQuestion.opciones.find(o => o.id === selectedId);
    isCorrect = !!selectedOption?.es_correcta;
    points = isCorrect ? 1 : -0.25;
  }

  // Get explanation for the first selected option or the correct one if none selected
  const selectedId = selectedOptionIds[0];
  const selectedOption = serverQuestion.opciones.find(o => o.id === selectedId);
  const correctOption = serverQuestion.opciones.find(o => o.es_correcta);
  const explicacion = selectedOption?.explicacion || correctOption?.explicacion || "";

  return {
    isCorrect,
    points,
    explicacion,
    fullQuestion: serverQuestion
  };
}
