import { createClient } from "@/lib/supabase/server";
import { IUserStatsRepository } from "@/lib/domain/repositories/IUserStatsRepository";
import { QuestionStat } from "@/lib/domain/entities/QuestionStat";
import { QuestionStatMapper } from "../mappers/QuestionStatMapper";

export class SupabaseUserStatsRepository implements IUserStatsRepository {
  async getStatsByUserId(userId: string): Promise<QuestionStat[]> {
    const supabase = await createClient();
    const { data } = await supabase
      .from("user_question_stats")
      .select("*")
      .eq("user_id", userId);

    return (data || []).map(QuestionStatMapper.toDomain);
  }

  async getCorrectQuestionIds(userId: string, maxTime?: number): Promise<string[]> {
    const supabase = await createClient();
    let query = supabase
      .from("user_question_stats")
      .select("question_id")
      .eq("user_id", userId)
      .gt("times_correct", 0);

    if (maxTime !== undefined) {
      query = query.lte("min_correct_time", maxTime);
    }

    const { data } = await query;
    return (data || []).map((row) => row.question_id);
  }

  async recordAnswer(params: {
    userId: string;
    questionId: string;
    isCorrect: boolean;
    timeSpent: number;
  }): Promise<void> {
    const supabase = await createClient();
    
    const { data: existing } = await supabase
      .from("user_question_stats")
      .select("*")
      .eq("user_id", params.userId)
      .eq("question_id", params.questionId)
      .single();

    if (!existing) {
      await supabase.from("user_question_stats").insert({
        user_id: params.userId,
        question_id: params.questionId,
        times_answered: 1,
        times_correct: params.isCorrect ? 1 : 0,
        min_correct_time: params.isCorrect ? params.timeSpent : null,
        max_correct_time: params.isCorrect ? params.timeSpent : null,
        last_answered_at: new Date().toISOString()
      });
    } else {
      const updates: any = {
        times_answered: (existing.times_answered || 0) + 1,
        times_correct: params.isCorrect ? (existing.times_correct || 0) + 1 : existing.times_correct,
        last_answered_at: new Date().toISOString()
      };

      if (params.isCorrect) {
        updates.min_correct_time = existing.min_correct_time === null 
          ? params.timeSpent 
          : Math.min(existing.min_correct_time, params.timeSpent);
        
        updates.max_correct_time = existing.max_correct_time === null 
          ? params.timeSpent 
          : Math.max(existing.max_correct_time, params.timeSpent);
      }

      await supabase.from("user_question_stats")
        .update(updates)
        .eq("user_id", params.userId)
        .eq("question_id", params.questionId);
    }
  }
}
