'use server'

import { createClient } from '@/lib/supabase/server'
import { UserAnswer, QuizConfig } from '@/types'
import { cookies } from 'next/headers'
import { SupabaseClient } from '@supabase/supabase-js'

/**
 * Calculates user stats based on answer history
 */
async function calculateStats(supabase: SupabaseClient, userId: string) {
  // Get all unique answers for the user
  const { data: answers } = await supabase
    .from('user_answers')
    .select('question_id, is_correct, topic')
    .eq('user_id', userId)

  if (!answers || answers.length === 0) return null

  const totalAnswered = answers.length
  const totalCorrect = answers.filter(a => a.is_correct).length
  const accuracy = (totalCorrect / totalAnswered) * 100

  // Group by topic
  const topicStats = answers.reduce((acc: any, curr) => {
    if (!acc[curr.topic]) {
      acc[curr.topic] = { topic: curr.topic, answered: 0, correct: 0 }
    }
    acc[curr.topic].answered++
    if (curr.is_correct) acc[curr.topic].correct++
    return acc
  }, {})

  const topics = Object.values(topicStats).map((t: any) => ({
    ...t,
    accuracy: (t.correct / t.answered) * 100
  }))

  return {
    global: { totalAnswered, totalCorrect, accuracy },
    topics
  }
}

export async function saveQuizResultsAction(results: UserAnswer[], config: QuizConfig) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'User not authenticated' }

  // 1. Save individual answers
  const answersToInsert = results.map(r => ({
    user_id: user.id,
    question_id: r.questionId,
    selected_option_id: r.selectedOptionId,
    is_correct: r.isCorrect,
    topic: r.topic,
    points: r.points
  }))

  const { error: answersError } = await supabase
    .from('user_answers')
    .insert(answersToInsert)

  if (answersError) return { error: answersError.message }

  // 2. Save session summary
  const totalPoints = results.reduce((sum, r) => sum + r.points, 0)
  const { error: sessionError } = await supabase
    .from('quiz_sessions')
    .insert({
      user_id: user.id,
      score: totalPoints,
      total_questions: results.length,
      mode: config.mode,
      time_elapsed: config.timeLimit - (config.timeLeft || 0),
      itc_filter: config.itcFilter
    })

  if (sessionError) console.error('Error saving session:', sessionError)

  // 3. Recalculate stats
  const stats = await calculateStats(supabase, user.id)
  
  return { success: true, stats }
}

export async function getUserStatsAction() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Get global stats and topics
  const stats = await calculateStats(supabase, user.id)
  
  // Get recent sessions
  const { data: sessions } = await supabase
    .from('quiz_sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  return {
    global: stats?.global || { totalAnswered: 0, totalCorrect: 0, accuracy: 0 },
    topics: stats?.topics || [],
    sessions: sessions || []
  }
}
