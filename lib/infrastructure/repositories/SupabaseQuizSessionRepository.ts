import { createClient } from "@/lib/supabase/server";
import { IQuizSessionRepository } from "@/lib/domain/repositories/IQuizSessionRepository";
import { QuizSession } from "@/lib/domain/entities/QuizSession";
import { QuizSessionMapper } from "../mappers/QuizSessionMapper";

export class SupabaseQuizSessionRepository implements IQuizSessionRepository {
  async save(session: Omit<QuizSession, "id" | "finishedAt">): Promise<void> {
    const supabase = await createClient();
    const persistenceData = QuizSessionMapper.toPersistence(session);
    await supabase.from("quiz_sessions").insert(persistenceData);
  }

  async getRecentByUserId(userId: string, limit: number): Promise<QuizSession[]> {
    const supabase = await createClient();
    const { data } = await supabase
      .from("quiz_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("finished_at", { ascending: false })
      .limit(limit);

    return (data || []).map(QuizSessionMapper.toDomain);
  }
}
