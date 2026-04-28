import { describe, it, expect, beforeEach } from 'vitest';
import { QuestionRepository } from '../repositories/question-repository';
import { JsonQuestionDataSource } from '../datasources/json-datasource';
import { SimpleQuestion } from '@/lib/domain/entities';

describe('QuestionRepository Integration', () => {
  let repository: QuestionRepository;

  beforeEach(() => {
    const dataSource = new JsonQuestionDataSource();
    repository = new QuestionRepository(dataSource);
  });

  it('should fetch a real question from db.json by ID', async () => {
    const question = await repository.getById('ITC-BT-01-01');
    
    expect(question).toBeDefined();
    expect(question?.id).toBe('ITC-BT-01-01');
    expect(question?.text).toContain('Aislamiento de un cable');
    expect(question).toBeInstanceOf(SimpleQuestion);
  });

  it('should fetch questions by topic (ITC)', async () => {
    const questions = await repository.getByTopic('ITC-BT-01');
    
    expect(questions.length).toBeGreaterThan(0);
    expect(questions[0].id).toContain('ITC-BT-01');
  });

  it('should support excluding IDs', async () => {
    const excludeId = 'ITC-BT-01-01';
    const limit = 5;
    const questions = await repository.getExcluded([excludeId], limit);
    
    expect(questions.length).toBeLessThanOrEqual(limit);
    expect(questions.find(q => q.id === excludeId)).toBeUndefined();
  });
});
