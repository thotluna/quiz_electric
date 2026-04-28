import { describe, it, expect } from 'vitest';
import { SimpleQuestion, MultipleQuestion, OptionEntity } from '../entities';
import { QuizEngine } from '../services/quiz-engine';

describe('Quiz Domain - Unit Tests', () => {
  const options = [
    new OptionEntity(1, 'Opción A', true, 'Expl A'),
    new OptionEntity(2, 'Opción B', false, 'Expl B'),
    new OptionEntity(3, 'Opción C', false, 'Expl C'),
    new OptionEntity(4, 'Opción D', true, 'Expl D'),
  ];

  describe('SimpleQuestion', () => {
    const question = new SimpleQuestion('Q1', 'Pregunta Simple', options.slice(0, 3), 'topic1');

    it('should return 1 point for the correct answer', () => {
      const score = question.evaluate(1);
      expect(score).toBe(1);
    });

    it('should return -0.25 points for an incorrect answer', () => {
      const score = question.evaluate(2);
      expect(score).toBe(-0.25);
    });

    it('should handle non-existent option as incorrect', () => {
      const score = question.evaluate(99);
      expect(score).toBe(-0.25);
    });
  });

  describe('MultipleQuestion', () => {
    // Q2 tiene Opción A (1) y Opción D (4) como correctas
    const question = new MultipleQuestion('Q2', 'Pregunta Multiple', options, 'topic1');

    it('should return 1 point for selecting all correct answers', () => {
      const score = question.evaluate([1, 4]);
      expect(score).toBe(1);
    });

    it('should return 0.5 points for selecting only one of two correct answers', () => {
      const score = question.evaluate([1]);
      expect(score).toBe(0.5);
    });

    it('should penalize selecting an incorrect answer alongside a correct one', () => {
      // 1 correcta (+0.5) + 1 incorrecta (-0.125 ya que hay 2 incorrectas totales en este set)
      // total incorrectas = 2 (B y C). Penalización = 0.25 / 2 = 0.125
      // 0.5 - 0.125 = 0.375
      const score = question.evaluate([1, 2]);
      expect(score).toBe(0.375);
    });

    it('should not go below -0.25 points', () => {
      const score = question.evaluate([2, 3]);
      expect(score).toBe(-0.25);
    });

    it('should return 0 for empty selection', () => {
      const score = question.evaluate([]);
      expect(score).toBe(0);
    });
  });

  describe('QuizEngine', () => {
    it('should calculate "Apto" correctly at the 80% threshold', () => {
      expect(QuizEngine.isApto(8, 10)).toBe(true);
      expect(QuizEngine.isApto(7.9, 10)).toBe(false);
      expect(QuizEngine.isApto(80, 100)).toBe(true);
    });

    it('should handle zero questions gracefully', () => {
      expect(QuizEngine.isApto(0, 0)).toBe(false);
    });
  });
});
