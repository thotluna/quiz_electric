"use client";

import React from 'react';
import { UserGlobalStats, TopicStat, QuizSession } from '@/lib/queries/user-stats';

interface StatsDashboardProps {
  stats: {
    global: UserGlobalStats;
    topics: TopicStat[];
    sessions?: QuizSession[];
  };
  onClose: () => void;
}

export const StatsDashboard = ({ stats, onClose }: StatsDashboardProps) => {
  const { global, topics } = stats;

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 animate-in fade-in duration-500">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-blue-400">
              Mi Progreso
            </h1>
            <p className="text-foreground/40 font-bold text-xs uppercase tracking-widest">
              Estadísticas detalladas de aprendizaje
            </p>
          </div>
          <button 
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-foreground/60 font-bold text-sm transition-all border border-foreground/5"
          >
            Volver
          </button>
        </div>

        {/* Global Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            label="Total Respondidas" 
            value={global.totalAnswered.toString()} 
            icon="📊" 
            subValue={`${global.totalCorrect} correctas`}
          />
          <StatCard 
            label="Precisión Media" 
            value={`${Math.round(global.accuracy)}%`} 
            icon="🎯" 
            color={global.accuracy > 80 ? 'text-status-correct' : global.accuracy > 50 ? 'text-accent-primary' : 'text-status-incorrect'}
            subValue={global.accuracy > 80 ? 'Excelente nivel' : 'Sigue practicando'}
          />
          <StatCard 
            label="Temas Dominados" 
            value={topics.filter(t => t.accuracy >= 80).length.toString()} 
            icon="🏆" 
            subValue={`De ${topics.length} temas intentados`}
          />
        </div>

        {/* Topics Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="bg-surface-card border border-foreground/5 rounded-3xl p-8 space-y-6 shadow-xl backdrop-blur-md">
            <h2 className="text-xl font-black tracking-tight flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-accent-primary/10 text-accent-primary flex items-center justify-center text-sm">ITC</span>
              Rendimiento por Sección
            </h2>
            
            <div className="space-y-6">
              {topics.map((topic) => (
                <div key={topic.topic} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="font-bold text-sm text-foreground/80">{topic.topic}</span>
                    <span className="text-xs font-black text-foreground/40 uppercase">
                      {topic.correct}/{topic.answered} · {Math.round(topic.accuracy)}%
                    </span>
                  </div>
                  <div className="h-3 bg-foreground/5 rounded-full overflow-hidden border border-foreground/5">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        topic.accuracy > 80 ? 'bg-status-correct' : topic.accuracy > 50 ? 'bg-accent-primary' : 'bg-status-incorrect'
                      }`}
                      style={{ width: `${topic.accuracy}%` }}
                    />
                  </div>
                </div>
              ))}
              {topics.length === 0 && (
                <p className="text-center py-10 text-foreground/30 font-medium">Aún no hay datos por tema.</p>
              )}
            </div>
          </section>

          <section className="space-y-6">
             <div className="bg-accent-primary/5 border border-accent-primary/20 rounded-3xl p-8 space-y-4">
                <h3 className="text-lg font-black text-accent-primary flex items-center gap-2">
                  <span>⚡</span> Recomendación IA
                </h3>
                <p className="text-sm leading-relaxed text-foreground/70">
                  {global.accuracy < 70 
                    ? "Tu precisión global está por debajo del objetivo de certificación. Te recomendamos enfocarte en simulacros de 50 preguntas para mejorar la resistencia mental."
                    : "¡Vas por buen camino! Estás cerca del nivel de aprobado oficial (80%). Prueba el modo contra reloj para mejorar tu agilidad."
                  }
                </p>
             </div>

             <div className="bg-surface-card border border-foreground/5 rounded-3xl p-8 shadow-sm">
                <h3 className="text-lg font-black flex items-center gap-2 mb-4">
                  <span>📅</span> Actividad Reciente
                </h3>
                <div className="space-y-4">
                  {stats.sessions && stats.sessions.length > 0 ? (
                    <div className="space-y-3">
                      {stats.sessions.map((session) => (
                        <div key={session.id} className="flex items-center justify-between p-3 rounded-xl bg-foreground/5 border border-foreground/5 hover:border-accent-primary/20 transition-all">
                          <div className="space-y-0.5">
                            <p className="text-xs font-black text-foreground">
                              {session.mode === 'timed' ? '⏱️' : session.mode === 'standard' ? '📝' : '♾️'} {session.itc_filter || 'Reglamento Completo'}
                            </p>
                            <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-tighter">
                              {new Date(session.created_at).toLocaleDateString()} · {Math.floor(session.time_elapsed / 60)}m {session.time_elapsed % 60}s
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-black ${(session.score / session.total_questions) >= 0.8 ? 'text-status-correct' : 'text-status-incorrect'}`}>
                              {session.score.toFixed(1)}/{session.total_questions}
                            </p>
                            <p className="text-[9px] font-black opacity-30 uppercase tracking-widest">Puntos</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-foreground/30 font-bold uppercase tracking-widest text-center py-8">
                      No hay historial de tests todavía.
                    </p>
                  )}
                </div>
             </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, subValue, color = 'text-foreground' }: { 
  label: string, 
  value: string, 
  icon: string, 
  subValue: string,
  color?: string 
}) => (
  <div className="bg-surface-card border border-foreground/5 rounded-3xl p-6 shadow-lg hover:shadow-accent-primary/5 transition-all group overflow-hidden relative">
    <div className="absolute -right-4 -top-4 text-6xl opacity-[0.03] group-hover:scale-110 transition-transform duration-700 select-none">
      {icon}
    </div>
    <div className="relative z-10 space-y-1">
      <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className={`text-4xl font-black tracking-tighter ${color}`}>{value}</span>
      </div>
      <p className="text-xs font-bold text-foreground/40">{subValue}</p>
    </div>
  </div>
);
