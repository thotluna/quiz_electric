'use client'

import { useState } from 'react'
import { QuizManager } from './QuizManager'
import { QuizResults } from './QuizResults'
import { StatsDashboard } from './StatsDashboard'
import UserMenu from '@/components/auth/UserMenu'
import { useQuizStore } from '@/lib/store/quiz-store'
import { User } from '@supabase/supabase-js'
import { getUserStats, UserStats } from '@/lib/actions/stats'
import { QuizSetup } from './QuizSetup'
import { QuizConfig } from '@/types'

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

  const [showStats, setShowStats] = useState(false)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(false)

  const isStarted = config !== null

  const handleShowStats = async () => {
    setLoadingStats(true)
    try {
      const data = await getUserStats()
      setStats(data)
      setShowStats(true)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  if (showStats && stats) {
    return <StatsDashboard stats={stats} onClose={() => setShowStats(false)} />
  }

  return (
    <div className="min-h-screen flex flex-col text-foreground p-2 md:p-4 max-w-5xl mx-auto w-full">
      <header className="grid grid-cols-3 md:flex md:justify-between items-center border-b border-border pb-4 relative">
        {/* Left Area: Stats */}
        <div className="flex justify-start">
          <button
            onClick={handleShowStats}
            className="text-[9px] font-black text-foreground/40 hover:text-primary transition-colors uppercase tracking-widest px-2 py-1.5 rounded-lg hover:bg-primary/5 border border-transparent hover:border-primary/10"
          >
            Estadísticas
          </button>
        </div>

        {/* Center Area: Logo */}
        <div className="flex flex-col items-center text-center">
          <h1 className="text-xl md:text-2xl font-black tracking-tighter uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400 drop-shadow-[0_0_10px_var(--neon-color)] leading-none">
            Quiz Electric
          </h1>
          <p className="hidden md:block text-[8px] font-bold text-foreground/30 uppercase tracking-[0.2em] mt-0.5">
            REBT · Nivel Profesional
          </p>
        </div>

        {/* Right Area: Profile */}
        <div className="flex justify-end">
          <UserMenu user={user} />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 py-4 md:py-6 relative z-10 overflow-y-auto">
        <div className="w-full max-w-5xl mx-auto">
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
        </div>
      </main>

      <footer className="py-4 border-t border-border">
        <p className="text-[8px] font-bold text-center text-foreground/20 uppercase tracking-[0.3em]">
          Powered by Thot Luna · 2026
        </p>
      </footer>
    </div>
  )
}
