import { IQuestionRepository } from "@/lib/domain/repositories/IQuestionRepository";
import { IUserStatsRepository } from "@/lib/domain/repositories/IUserStatsRepository";
import { IUserRepository } from "@/lib/domain/repositories/IUserRepository";
import { IQuizSessionRepository } from "@/lib/domain/repositories/IQuizSessionRepository";

import { JsonQuestionRepository } from "../repositories/JsonQuestionRepository";
import { SupabaseUserStatsRepository } from "../repositories/SupabaseUserStatsRepository";
import { SupabaseUserRepository } from "../repositories/SupabaseUserRepository";
import { SupabaseQuizSessionRepository } from "../repositories/SupabaseQuizSessionRepository";

export class RepositoryFactory {
  static getQuestionRepository(): IQuestionRepository {
    return new JsonQuestionRepository();
  }

  static getUserStatsRepository(): IUserStatsRepository {
    return new SupabaseUserStatsRepository();
  }

  static getUserRepository(): IUserRepository {
    return new SupabaseUserRepository();
  }

  static getQuizSessionRepository(): IQuizSessionRepository {
    return new SupabaseQuizSessionRepository();
  }
}
