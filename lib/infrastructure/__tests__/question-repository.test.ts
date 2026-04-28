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

  it('should fetch questions using getAll with topic filter', async () => {
    const questions = await repository.getAll({ topicIds: ['ITC-BT-01'] });
    
    expect(questions.length).toBeGreaterThan(0);
  });

  it('should support excluding IDs and limiting results', async () => {
    const excludeId = 'ITC-BT-01-01';
    const limit = 5;
    const questions = await repository.getAll({ 
      excludeIds: [excludeId], 
      limit 
    });
    
    expect(questions.length).toBeLessThanOrEqual(limit);
    expect(questions.find(q => q.id === excludeId)).toBeUndefined();
  });

  it('should support pagination via offset', async () => {
    const limit = 2;
    const firstPage = await repository.getAll({ limit, offset: 0 });
    const secondPage = await repository.getAll({ limit, offset: 2 });
    
    expect(firstPage.length).toBe(limit);
    expect(secondPage.length).toBe(limit);
    expect(firstPage[0].id).not.toBe(secondPage[0].id);
  });
});
