'use client'

import { useEffect, useState } from 'react'
import { QuizManager } from './QuizManager'
import { QuizResults } from './QuizResults'
import { useQuizStore } from '@/lib/store/quiz-store'
import { User } from '@supabase/supabase-js'
import { QuizSetup } from './QuizSetup'

interface Topic {
  id: string
  itc: string
}

interface QuizHomeProps {
  topics: Topic[]
  user: User
}

export const QuizHome = ({ topics, user }: QuizHomeProps) => {
  const config = useQuizStore((s) => s.config)
  const isFinished = useQuizStore((s) => s.isFinished)
  const userAnswers = useQuizStore((s) => s.userAnswers)
  const score = useQuizStore((s) => s.score)
  const timeElapsed = useQuizStore((s) => s.timeElapsed)
  const initialQuestions = useQuizStore((s) => s.initialQuestions)
  const isTimeOut = useQuizStore((s) => s.isTimeOut)
  const resetQuiz = useQuizStore((s) => s.resetQuiz)
  const startQuizAction = useQuizStore((s) => s.startQuiz)

  const [hasMounted, setHasMounted] = useState<boolean>(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  const isStarted: boolean = config !== null

  if (!hasMounted) return null

  return (
    <main className="flex flex-col w-full h-full  items-center justify-center relative z-10">
      {isFinished ? (
        <QuizResults
          userAnswers={userAnswers}
          timeElapsed={timeElapsed}
          totalQuestions={initialQuestions.length}
          score={score}
          isTimeOut={isTimeOut}
          onReset={resetQuiz}
        />
      ) : isStarted ? (
        <QuizManager topics={topics} userId={user.id} />
      ) : (
        <QuizSetup
          topics={topics}
          onStart={(config) => startQuizAction(config)}
        />
      )}
    </main>
  )
}
