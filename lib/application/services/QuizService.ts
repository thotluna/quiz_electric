import { IQuestionRepository } from "@/lib/domain/repositories/IQuestionRepository";
import { IUserStatsRepository } from "@/lib/domain/repositories/IUserStatsRepository";
import { Question, ClientQuestion } from "@/lib/domain/entities/Question";
import { EvaluationResult } from "@/lib/domain/types";


export class QuizService {
  constructor(
    private questionRepo: IQuestionRepository,
    private statsRepo: IUserStatsRepository
  ) {}

  async getQuestions(
    topicIds: string[],
    limit: number = 20,
    userId: string | null = null,
    offset: number = 0
  ): Promise<ClientQuestion[]> {
    let excludedIds: string[] = [];

    if (userId) {
      excludedIds = await this.statsRepo.getCorrectQuestionIds(userId, 1000);
    }

    const questions = await this.questionRepo.getByFilter({
      topicIds,
      excludedIds,
      limit,
      offset
    });

    return questions.map(this.mapToClientQuestion);
  }

  async evaluateAnswer(
    questionId: string,
    selectedOptionIds: string[]
  ): Promise<EvaluationResult> {
    const question = await this.questionRepo.getById(questionId);

    if (!question) {
      throw new Error("Question not found");
    }

    const correctOptions = question.opciones.filter(opt => opt.es_correcta);
    const correctIds = correctOptions.map(opt => opt.id);

    const isCorrect = selectedOptionIds.length === correctIds.length &&
      selectedOptionIds.every(id => correctIds.includes(id));

    const score = isCorrect ? 1 : -0.25;

    const selectedExplanations = question.opciones
      .filter(opt => selectedOptionIds.includes(opt.id) && opt.explicacion)
      .map(opt => opt.explicacion)
      .join(" ");

    const explanation = selectedExplanations || question.explicacion_general || "Sin explicación disponible.";

    return {
      questionId,
      isCorrect,
      score,
      explanation,
      correctIds
    };
  }

  private mapToClientQuestion(question: Question): ClientQuestion {
    return {
      ...question,
      opciones: question.opciones.map(opt => ({
        id: opt.id,
        texto: opt.texto
      }))
    };
  }
}
