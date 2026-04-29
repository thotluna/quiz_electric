import { describe, it, expect, vi } from "vitest";
import { QuizService } from "../QuizService";
import { IQuestionRepository } from "@/lib/domain/repositories/IQuestionRepository";
import { IUserStatsRepository } from "@/lib/domain/repositories/IUserStatsRepository";

describe("QuizService", () => {
  const mockQuestionRepo = {
    getById: vi.fn().mockImplementation(async (id: string) => {
      if (id === "q-simple") {
        return {
          id: "q-simple",
          tipo: "simple",
          opciones: [
            { id: "opt-1", texto: "Correcta", es_correcta: true },
            { id: "opt-2", texto: "Incorrecta", es_correcta: false }
          ]
        };
      }
      return null;
    }),
    getByFilter: vi.fn().mockResolvedValue([]),
    getTotalCount: vi.fn().mockResolvedValue(0)
  } as unknown as IQuestionRepository;

  const mockStatsRepo = {
    getCorrectQuestionIds: vi.fn().mockResolvedValue(["q-excluded"])
  } as unknown as IUserStatsRepository;

  const service = new QuizService(mockQuestionRepo, mockStatsRepo);

  describe("evaluateAnswer", () => {
    it("should score +1 for a correct simple question", async () => {
      const result = await service.evaluateAnswer("q-simple", ["opt-1"]);
      expect(result.isCorrect).toBe(true);
      expect(result.score).toBe(1);
    });

    it("should score -0.25 for an incorrect simple question", async () => {
      const result = await service.evaluateAnswer("q-simple", ["opt-2"]);
      expect(result.isCorrect).toBe(false);
      expect(result.score).toBe(-0.25);
    });

    it("should score -0.25 if no options are selected", async () => {
      const result = await service.evaluateAnswer("q-simple", []);
      expect(result.isCorrect).toBe(false);
      expect(result.score).toBe(-0.25);
    });

    it("should throw error if question does not exist", async () => {
      await expect(service.evaluateAnswer("non-existent", ["opt-1"]))
        .rejects.toThrow("Question not found");
    });
  });

  describe("getQuestions", () => {
    it("should call getByFilter with excluded IDs if userId is provided", async () => {
      await service.getQuestions(["topic1"], 10, "user123");
      expect(mockStatsRepo.getCorrectQuestionIds).toHaveBeenCalledWith("user123", 1000);
      expect(mockQuestionRepo.getByFilter).toHaveBeenCalledWith(expect.objectContaining({
        excludedIds: ["q-excluded"]
      }));
    });
  });
});
