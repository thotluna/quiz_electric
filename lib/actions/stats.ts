"use server";

import { createClient } from "@/lib/supabase/server";
import { UserAnswer, QuizConfig } from "@/types";
import { cookies } from "next/headers";

export interface GlobalStats {
  totalAnswered: number;
  totalCorrect: number;
  accuracy: number;
}

export interface TopicStats {
  topicId: string;
  totalAnswered: number;
  totalCorrect: number;
  accuracy: number;
}

export interface UserStats {
  global: GlobalStats;
  topics: TopicStats[];
  sessions: {
    id: string;
    created_at: string;
    score: number;
    total_questions: number;
    mode: string;
    time_elapsed: number;
    itc_filter: string;
  }[];
}

export async function getUserStats(): Promise<UserStats> {
  const supabase = await createClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();
  const cookieStore = await cookies();

  let user = supabaseUser;
  if (!user && process.env.NODE_ENV === "development" && cookieStore.get("test_session")) {
    user = { id: "test-user-123", email: "test@example.com" } as any;
  }

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data: qStats } = await supabase
    .from("user_question_stats")
    .select("times_answered, times_correct")
    .eq("user_id", user.id);

  const global: GlobalStats = {
    totalAnswered: qStats?.reduce((acc, curr) => acc + (curr.times_answered || 0), 0) || 0,
    totalCorrect: qStats?.reduce((acc, curr) => acc + (curr.times_correct || 0), 0) || 0,
    accuracy: 0
  };
  global.accuracy = global.totalAnswered > 0 ? Math.round((global.totalCorrect / global.totalAnswered) * 100) : 0;

  const topics: TopicStats[] = [];

  const { data: sessions } = await supabase
    .from("quiz_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  return {
    global,
    topics,
    sessions: sessions || []
  };
}

export async function saveQuizStatsAction(
  userId: string,
  answers: UserAnswer[],
  config: QuizConfig,
  score: number,
  timeElapsed: number
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  try {
    for (const answer of answers) {
      if (answer.selectedOptionIds.length === 0) continue;

      // Upsert user question stats
      const { data: existing } = await supabase
        .from("user_question_stats")
        .select("*")
        .eq("user_id", userId)
        .eq("question_id", answer.questionId)
        .single();

      if (!existing) {
        await supabase.from("user_question_stats").insert({
          user_id: userId,
          question_id: answer.questionId,
          times_answered: 1,
          times_correct: answer.isCorrect ? 1 : 0,
          min_correct_time: answer.isCorrect ? answer.timeSpent : 0,
          max_correct_time: answer.isCorrect ? answer.timeSpent : 0,
          last_answered_at: new Date().toISOString()
        });
      } else {
        const isCorrect = answer.isCorrect;
        const currentMin = existing.min_correct_time || 0;
        const currentMax = existing.max_correct_time || 0;

        const newMin = isCorrect ? (currentMin === 0 ? answer.timeSpent : Math.min(currentMin, answer.timeSpent)) : currentMin;
        const newMax = isCorrect ? Math.max(currentMax, answer.timeSpent) : currentMax;

        await supabase.from("user_question_stats").update({
          times_answered: (existing.times_answered || 0) + 1,
          times_correct: (existing.times_correct || 0) + (isCorrect ? 1 : 0),
          min_correct_time: newMin,
          max_correct_time: newMax,
          last_answered_at: new Date().toISOString()
        }).eq("user_id", userId).eq("question_id", answer.questionId);
      }
    }

    // Save session
    await supabase.from("quiz_sessions").insert({
      user_id: userId,
      mode: config.mode,
      score: score,
      total_questions: answers.length,
      time_elapsed: timeElapsed,
      itc_filter: config.topicIds?.[0] || "all"
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error saving stats:", error);
    return { success: false, error: error.message };
  }
}
