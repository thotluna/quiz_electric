import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseUserStatsRepository } from '../repositories/supabase-stats-repository';

// Mock de Supabase Client
const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  gt: vi.fn().mockReturnThis(),
  lt: vi.fn().mockReturnThis(),
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

describe('SupabaseUserStatsRepository', () => {
  let repository: SupabaseUserStatsRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new SupabaseUserStatsRepository();
  });

  it('should fetch fast correct IDs from Supabase', async () => {
    const mockData = [
      { question_id: 'q1' },
      { question_id: 'q2' }
    ];

    (mockSupabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      lt: vi.fn().mockResolvedValue({ data: mockData, error: null }),
    });

    const ids = await repository.getFastCorrectIds('user-123', 2);
    
    expect(ids).toEqual(['q1', 'q2']);
    expect(mockSupabase.from).toHaveBeenCalledWith('user_question_stats');
  });

  it('should return empty array on Supabase error', async () => {
    (mockSupabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      lt: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB Error' } }),
    });

    const ids = await repository.getFastCorrectIds('user-123', 2);
    expect(ids).toEqual([]);
  });
});
