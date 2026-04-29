import { describe, it, expect } from "vitest";
import { UserMapper } from "../UserMapper";
import { QuizSessionMapper } from "../QuizSessionMapper";
import { QuestionStatMapper } from "../QuestionStatMapper";
import { QuizMode } from "@/types";

describe("Mappers", () => {
  describe("UserMapper", () => {
    it("should map raw user to domain entity", () => {
      const raw = {
        id: "user-1",
        email: "test@test.com",
        nombre: "Test User",
        avatar_url: "http://avatar.com",
        creado_en: "2024-01-01T00:00:00Z"
      };

      const domain = UserMapper.toDomain(raw);

      expect(domain.id).toBe(raw.id);
      expect(domain.avatarUrl).toBe(raw.avatar_url);
      expect(domain.creadoEn).toBeInstanceOf(Date);
    });
  });

  describe("QuizSessionMapper", () => {
    it("should map domain to persistence format", () => {
      const domain = {
        userId: "user-1",
        mode: "timed" as QuizMode,
        score: 10,
        totalQuestions: 20,
        timeElapsed: 120,
        itcFilter: "ITC-BT-01"
      };

      const raw = QuizSessionMapper.toPersistence(domain);

      expect(raw.user_id).toBe(domain.userId);
      expect(raw.total_questions).toBe(domain.totalQuestions);
      expect(raw.itc_filter).toBe(domain.itcFilter);
    });
  });

  describe("QuestionStatMapper", () => {
    it("should correctly map min and max times", () => {
      const raw = {
        user_id: "u1",
        question_id: "q1",
        times_answered: 5,
        times_correct: 3,
        min_correct_time: 500,
        max_correct_time: 2000,
        last_answered_at: "2024-01-01T00:00:00Z"
      };

      const domain = QuestionStatMapper.toDomain(raw);

      expect(domain.minCorrectTime).toBe(500);
      expect(domain.maxCorrectTime).toBe(2000);
    });
  });
});
