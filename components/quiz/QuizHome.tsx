'use client'

import { useState } from 'react'
import UserMenu from '@/components/auth/UserMenu'
import { useQuizStore } from '@/lib/store/quiz-store'
import { User } from '@supabase/supabase-js'
import { getUserStats, UserStats } from '@/lib/actions/stats'
import { QuizManager } from './QuizManager'
import { StatsDashboard } from './StatsDashboard'

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
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-blue-500">
              Quiz Electric
            </h1>
            <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-[0.2em]">
              Preparación REBT · Nivel Profesional
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {!isStarted && (
              <button
                onClick={handleShowStats}
                disabled={loadingStats}
                className="px-5 py-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-foreground/60 font-bold text-sm transition-all border border-foreground/5 disabled:opacity-50"
              >
                {loadingStats ? 'Cargando...' : 'Estadísticas'}
              </button>
            )}
            <UserMenu user={user} />
          </div>
        </header>

        <main className="relative">
          <QuizManager topics={topics} userId={user.id} />
        </main>

        <footer className="pt-12 text-center text-[10px] font-bold text-foreground/10 uppercase tracking-[0.3em]">
          Powered by Thot Luna · 2025
        </footer>
      </div>
    </div>
  )
}
