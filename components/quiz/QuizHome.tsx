"use client";

import { useState } from "react";
import { QuizManager } from "./QuizManager";
import UserMenu from "@/components/auth/UserMenu";
import { StatsDashboard } from "./StatsDashboard";
import { getUserStatsAction } from "@/lib/actions/user-stats";
import { UserGlobalStats, TopicStat } from "@/lib/queries/user-stats";

interface QuizHomeProps {
  user: any;
  topics: { id: string; itc: string }[];
}

export const QuizHome = ({ user, topics }: QuizHomeProps) => {
  const [view, setView] = useState<'quiz' | 'dashboard'>('quiz');
  const [stats, setStats] = useState<{ global: UserGlobalStats; topics: TopicStat[] } | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const handleOpenDashboard = async () => {
    setIsLoadingStats(true);
    setView('dashboard');
    const result = await getUserStatsAction();
    if (result.success && result.stats) {
      setStats(result.stats);
    }
    setIsLoadingStats(false);
  };

  if (view === 'dashboard') {
    if (isLoadingStats || !stats) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-20 space-y-4">
          <div className="w-12 h-12 border-4 border-accent-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-foreground/50 font-medium animate-pulse text-xs uppercase tracking-widest">Cargando tus estadísticas...</p>
        </div>
      );
    }
    return <StatsDashboard stats={stats} onClose={() => setView('quiz')} />;
  }

  return (
    <main className="min-h-screen py-6 px-4 md:py-10 bg-gradient-to-br from-background to-surface-card/50 animate-in fade-in duration-700">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left space-y-1">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
              Quiz <span className="text-accent-primary uppercase italic">Electric</span>
            </h1>
            <p className="text-foreground/50 text-sm md:text-base font-medium">
              Simulador avanzado de normativas eléctricas.
            </p>
          </div>
          
          <UserMenu user={user} onOpenDashboard={handleOpenDashboard} />
        </header>

        <section className="animate-in fade-in zoom-in-95 duration-700 delay-150">
          <QuizManager topics={topics} userId={user.id} />
        </section>
      </div>
    </main>
  );
};
