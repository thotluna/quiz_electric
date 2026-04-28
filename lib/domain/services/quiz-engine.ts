import { QuestionEntity } from '../entities';

export class QuizEngine {
  public static calculateScore<T>(
    question: QuestionEntity<T>,
    selection: T
  ): number {
    return question.evaluate(selection);
  }

  public static isApto(score: number, totalQuestions: number): boolean {
    if (totalQuestions === 0) return false;
    const percentage = (score / totalQuestions) * 100;
    return percentage >= 80;
  }
}
