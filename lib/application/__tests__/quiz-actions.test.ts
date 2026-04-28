import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getQuizQuestionsAction } from '../actions/quiz-actions';
import { QuestionRepository } from '@/lib/infrastructure/repositories/question-repository';
import { SupabaseUserStatsRepository } from '@/lib/infrastructure/repositories/supabase-stats-repository';

// Mock de repositorios
vi.mock('@/lib/infrastructure/repositories/question-repository');
vi.mock('@/lib/infrastructure/repositories/supabase-stats-repository');

describe('Quiz Actions Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should flow correctly: get fast correct IDs and then filter questions', async () => {
    const mockExcludedIds = ['q-dominada-1'];
    const mockQuestions = [
      { id: 'q-nueva-1', text: 'P1', options: [], getCorrectOptions: () => [] }
    ];

    // Mock implementation for statsRepo
    (SupabaseUserStatsRepository.prototype.getFastCorrectIds as any).mockResolvedValue(mockExcludedIds);
    
    // Mock implementation for questionRepo
    (QuestionRepository.prototype.getAll as any).mockResolvedValue(mockQuestions);

    const result = await getQuizQuestionsAction(['topic1'], 5, 'user123');

    expect(SupabaseUserStatsRepository.prototype.getFastCorrectIds).toHaveBeenCalledWith('user123', 2);
    expect(QuestionRepository.prototype.getAll).toHaveBeenCalledWith({
      topicIds: ['topic1'],
      excludeIds: mockExcludedIds,
      limit: 5
    });
    
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('q-nueva-1');
  });

  it('should not call statsRepo if userId is missing', async () => {
    (QuestionRepository.prototype.getAll as any).mockResolvedValue([]);

    await getQuizQuestionsAction(['topic1'], 5, null);

    expect(SupabaseUserStatsRepository.prototype.getFastCorrectIds).not.toHaveBeenCalled();
    expect(QuestionRepository.prototype.getAll).toHaveBeenCalledWith({
      topicIds: ['topic1'],
      excludeIds: [],
      limit: 5
    });
  });
});
