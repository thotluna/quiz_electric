'use server'

import { createClient } from '@/lib/supabase/server'
import { UserAnswer, QuizConfig } from '@/types'
import { cookies } from 'next/headers'
import { SupabaseClient } from '@supabase/supabase-js'

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

interface SaveResultsResponse {
  success: boolean;
  count?: number;
  error?: string;
}

export async function saveQuizResults(
  answers: UserAnswer[],
  config?: QuizConfig,
  score?: number,
  timeElapsed?: number
): Promise<SaveResultsResponse> {
  if (!answers || answers.length === 0) {
    return { success: true, count: 0 };
  }

  const supabase = await createClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();
  const cookieStore = await cookies();

  let user = supabaseUser;
  if (!user && process.env.NODE_ENV === 'development' && cookieStore.get('test_session')) {
    user = { id: 'test-user-123', email: 'test@example.com' } as never;
  }

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    console.log(`--- Saving Batch: ${answers.length} answers for user ${user.id} ---`);

    let savedCount = 0;
    for (const answer of answers) {
      // Si la pregunta fue omitida, no incrementamos estadísticas de respuesta
      if (answer.selectedOptionIds.length === 0) {
        savedCount++; // La contamos como procesada
        continue;
      }

      const { error: globalErr } = await upsertGlobalStats(supabase, answer);
      const { error: userErr } = await upsertUserStats(supabase, user.id, answer);

      if (!globalErr && !userErr) {
        savedCount++;
      } else {
        console.error(`Error saving question ${answer.question.id}:`, globalErr || userErr);
      }
    }

    if (config && score !== undefined && timeElapsed !== undefined) {
      const { error: sessionErr } = await saveQuizSession(supabase, user.id, config, score, timeElapsed, answers.length);
      if (sessionErr) {
        console.error('Error saving session:', sessionErr);
      }
    }

    console.log(`Successfully saved ${savedCount}/${answers.length} results`);
    return { success: true, count: savedCount };
  } catch (error) {
    console.error('Fatal error in saveQuizResults:', error);
    return { success: false, error: 'Internal server error' };
  }
}

export async function getUserStats(): Promise<UserStats> {
  const supabase = await createClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();
  const cookieStore = await cookies();

  let user = supabaseUser;
  if (!user && process.env.NODE_ENV === 'development' && cookieStore.get('test_session')) {
    user = { id: 'test-user-123', email: 'test@example.com' } as never;
  }

  if (!user) {
    throw new Error("Not authenticated");
  }

  // Global stats from user_question_stats
  const { data: qStats } = await supabase
    .from('user_question_stats')
    .select('times_answered, times_correct')
    .eq('user_id', user.id);

  const global: GlobalStats = {
    totalAnswered: qStats?.reduce((acc, curr) => acc + (curr.times_answered || 0), 0) || 0,
    totalCorrect: qStats?.reduce((acc, curr) => acc + (curr.times_correct || 0), 0) || 0,
    accuracy: 0
  };
  global.accuracy = global.totalAnswered > 0 ? Math.round((global.totalCorrect / global.totalAnswered) * 100) : 0;

  // Topic stats (mocking for now as we need a join or separate query)
  const topics: TopicStats[] = [];

  // Recent sessions
  const { data: sessions } = await supabase
    .from('quiz_sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10);

  return {
    global,
    topics,
    sessions: sessions || []
  };
}

export async function getUserStatsForQuestions(questionIds: string[]) {
  const supabase = await createClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();
  const cookieStore = await cookies();

  let user = supabaseUser;
  if (!user && process.env.NODE_ENV === 'development' && cookieStore.get('test_session')) {
    user = { id: 'test-user-123', email: 'test@example.com' } as never;
  }

  if (!user) return [];

  const { data, error } = await supabase
    .from('user_question_stats')
    .select('question_id, times_answered, times_correct')
    .eq('user_id', user.id)
    .in('question_id', questionIds);

  if (error) {
    console.error('Error fetching user stats:', error);
    return [];
  }

  return data || [];
}

async function upsertGlobalStats(supabase: SupabaseClient, answer: UserAnswer) {
  const { data: existing } = await supabase
    .from('questions')
    .select('*')
    .eq('id', answer.question.id)
    .single();

  if (!existing) {
    return supabase.from('questions').insert({
      id: answer.question.id,
      times_answered: 1,
      times_correct: answer.isCorrect ? 1 : 0,
      avg_correct_time: answer.isCorrect ? answer.timeSpent : 0
    });
  } else {
    const isCorrect = answer.isCorrect;
    const newTimesCorrect = (existing.times_correct || 0) + (isCorrect ? 1 : 0);
    let newAvgTime = existing.avg_correct_time || 0;

    if (isCorrect) {
      const currentTimesCorrect = existing.times_correct || 0;
      const totalTime = (newAvgTime * currentTimesCorrect) + answer.timeSpent;
      newAvgTime = Math.round(totalTime / newTimesCorrect);
    }

    return supabase.from('questions').update({
      times_answered: (existing.times_answered || 0) + 1,
      times_correct: newTimesCorrect,
      avg_correct_time: newAvgTime
    }).eq('id', answer.question.id);
  }
}

async function upsertUserStats(supabase: SupabaseClient, userId: string, answer: UserAnswer) {
  const { data: existing } = await supabase
    .from('user_question_stats')
    .select('*')
    .eq('user_id', userId)
    .eq('question_id', answer.question.id)
    .single();

  if (!existing) {
    return supabase.from('user_question_stats').insert({
      user_id: userId,
      question_id: answer.question.id,
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

    return supabase.from('user_question_stats').update({
      times_answered: (existing.times_answered || 0) + 1,
      times_correct: (existing.times_correct || 0) + (isCorrect ? 1 : 0),
      min_correct_time: newMin,
      max_correct_time: newMax,
      last_answered_at: new Date().toISOString()
    }).eq('user_id', userId).eq('question_id', answer.question.id);
  }
}


async function saveQuizSession(
  supabase: SupabaseClient,
  userId: string,
  config: QuizConfig,
  score: number,
  timeElapsed: number,
  totalQuestions: number
) {
  return supabase.from('quiz_sessions').insert({
    user_id: userId,
    mode: config.mode,
    score: score,
    total_questions: totalQuestions,
    time_elapsed: timeElapsed,
    itc_filter: config.topicIds?.[0] || 'all'
  });
}
