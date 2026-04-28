import { createClient } from '@/lib/supabase/server';
import { IUserStatsRepository, QuestionStat } from '@/lib/domain/repositories';

export class SupabaseUserStatsRepository implements IUserStatsRepository {
  public async getStatsByUser(userId: string, questionIds: string[]): Promise<QuestionStat[]> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('user_question_stats')
      .select('question_id, times_answered, times_correct, min_correct_time, max_correct_time')
      .eq('user_id', userId)
      .in('question_id', questionIds);

    if (error) {
      console.error('Error fetching user stats from Supabase:', error);
      return [];
    }

    return (data || []).map(item => ({
      questionId: item.question_id,
      timesAnswered: item.times_answered,
      timesCorrect: item.times_correct,
      minCorrectTime: item.min_correct_time || 0,
      maxCorrectTime: item.max_correct_time || 0,
    }));
  }

  public async getFastCorrectIds(userId: string, thresholdSeconds: number): Promise<string[]> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('user_question_stats')
      .select('question_id')
      .eq('user_id', userId)
      .gt('times_correct', 0)
      .lt('min_correct_time', thresholdSeconds);

    if (error) {
      console.error('Error fetching fast correct IDs from Supabase:', error);
      return [];
    }

    return (data || []).map(item => item.question_id);
  }
}
