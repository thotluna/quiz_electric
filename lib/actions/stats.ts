\"use server\";

import { createClient } from \"@/lib/supabase/server\";
import { UserAnswer } from \"@/types\";

export async function saveQuizStatsAction(
  userId: string,
  answers: UserAnswer[]
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // Prepare batch insert for stats
  const statsToInsert = answers.map(answer => ({
    user_id: userId,
    question_id: answer.questionId,
    is_correct: answer.isCorrect,
    time_spent: answer.timeSpent,
    points: answer.points,
    created_at: new Date().toISOString()
  }));

  const { error } = await supabase
    .from('user_question_stats')
    .insert(statsToInsert);

  if (error) {
    console.error(\"Error saving quiz stats:\", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
