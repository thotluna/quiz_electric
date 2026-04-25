import { createClient } from '@/lib/supabase/server';

export interface UserGlobalStats {
  totalAnswered: number;
  totalCorrect: number;
  accuracy: number;
  totalTimeSeconds: number;
}

export interface TopicStat {
  topic: string;
  answered: number;
  correct: number;
  accuracy: number;
}

export interface QuizSession {
  id: string;
  created_at: string;
  mode: string;
  score: number;
  total_questions: number;
  time_elapsed: number;
  itc_filter: string | null;
}

export async function getUserStats() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: stats, error } = await supabase
    .from('user_question_stats')
    .select('*')
    .eq('user_id', user.id);

  if (error || !stats) return null;

  // 1. Calcular globales
  const totalAnswered = stats.reduce((acc, s) => acc + s.times_answered, 0);
  const totalCorrect = stats.reduce((acc, s) => acc + s.times_correct, 0);
  const accuracy = totalAnswered > 0 ? (totalCorrect / totalAnswered) * 100 : 0;
  
  // Nota: No tenemos un campo total_time por usuario, pero podemos estimar o usar el promedio global
  // Por ahora lo dejamos en 0 o calculamos basándonos en min/max si fuera necesario
  const totalTimeSeconds = 0; 

  // 2. Agrupar por ITC (basado en el prefijo del question_id: ITC-BT-01-XX)
  const topicMap: Record<string, { answered: number, correct: number }> = {};
  
  stats.forEach(s => {
    const parts = s.question_id.split('-');
    const itc = parts.length >= 3 ? `${parts[1]}-${parts[2]}` : 'General';
    
    if (!topicMap[itc]) {
      topicMap[itc] = { answered: 0, correct: 0 };
    }
    
    topicMap[itc].answered += s.times_answered;
    topicMap[itc].correct += s.times_correct;
  });

  const topicStats: TopicStat[] = Object.entries(topicMap).map(([topic, data]) => ({
    topic,
    answered: data.answered,
    correct: data.correct,
    accuracy: (data.correct / data.answered) * 100
  })).sort((a, b) => b.answered - a.answered);

  return {
    global: {
      totalAnswered,
      totalCorrect,
      accuracy,
      totalTimeSeconds
    },
    topics: topicStats,
    raw: stats
  };
}

export async function getUserSessions(): Promise<QuizSession[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('quiz_sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching sessions:', error);
    return [];
  }

  return data as QuizSession[];
}
