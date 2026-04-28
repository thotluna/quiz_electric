'use server';

import { QuestionRepository } from '@/lib/infrastructure/repositories/question-repository';
import { JsonQuestionDataSource } from '@/lib/infrastructure/datasources/json-datasource';
import { SupabaseUserStatsRepository } from '@/lib/infrastructure/repositories/supabase-stats-repository';
import { AnyQuestionEntity } from '@/lib/domain/repositories';
import { EvaluationResult } from '@/lib/domain/types';
import { SimpleQuestion, MultipleQuestion } from '@/lib/domain/entities';
import { ClientQuestion } from '@/types';

const questionRepo = new QuestionRepository(new JsonQuestionDataSource());
const statsRepo = new SupabaseUserStatsRepository();

function mapToClientQuestion(question: AnyQuestionEntity): ClientQuestion {
  return {
    id: question.id,
    pregunta: question.text,
    tipo: question instanceof SimpleQuestion ? 'simple' : 'multiple',
    opciones: question.options.map(o => ({
      id: o.id,
      respuesta: o.text
    }))
  };
}

export async function getQuizQuestionsAction(
  topicIds: string[],
  limit: number = 10,
  userId: string | null = null
): Promise<ClientQuestion[]> {
  let excludeIds: string[] = [];

  if (userId) {
    excludeIds = await statsRepo.getFastCorrectIds(userId, 2);
  }

  const questions = await questionRepo.getAll({
    topicIds,
    excludeIds,
    limit
  });

  return questions.map(mapToClientQuestion);
}

export async function evaluateAnswerAction(
  questionId: string,
  selection: number | number[],
  _timeSpent?: number // Mantenemos el parámetro por compatibilidad con el store aunque no lo usemos aquí
): Promise<EvaluationResult> {
  const question = await questionRepo.getById(questionId);

  if (!question) {
    throw new Error(`Question with ID ${questionId} not found`);
  }

  let points = 0;

  if (question instanceof SimpleQuestion && typeof selection === 'number') {
    points = question.evaluate(selection);
  } else if (question instanceof SimpleQuestion && Array.isArray(selection)) {
     // Fallback para selección única enviada como array
     points = question.evaluate(selection[0]);
  } else if (question instanceof MultipleQuestion && Array.isArray(selection)) {
    points = question.evaluate(selection);
  } else {
    throw new Error('Type mismatch: The selection format does not match the question type');
  }

  const isCorrect = points > 0;
  const selectedOptions = Array.isArray(selection) ? selection : [selection];
  
  const explanation = question.options
    .filter(opt => selectedOptions.includes(opt.id))
    .map(opt => opt.explanation)
    .join(' ');

  const correctIds = question.getCorrectOptions().map(o => o.id);

  return {
    questionId,
    isCorrect,
    points,
    explanation,
    correctIds
  };
}
