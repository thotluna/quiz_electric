"use client";

import { GlobalStats } from '@/lib/actions/stats';
import { useRouter } from 'next/navigation';
import type { ReactElement } from "react";

interface StatsDashboardProps {
  stats: GlobalStats;
}

export const StatsDashboard = ({ stats }: StatsDashboardProps): ReactElement => {
  const router = useRouter();

  return (
    <div className="h-full text-foreground py-2 animate-in fade-in duration-500">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter uppercase italic text-transparent bg-clip-text bg-linear-to-r from-accent-primary to-blue-400">
              Mi Progreso
            </h1>
            <p className="text-foreground/40 font-bold text-xs uppercase tracking-widest">
              Estadísticas detalladas de aprendizaje
            </p>
          </div>
          <button
            className="px-6 py-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-foreground/60 font-bold text-sm transition-all border border-foreground/5"
            onClick={() => router.back()}
          >
            Volver
          </button>
        </div>

        {/* Global Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            label="Total Respondidas"
            value={(stats.totalAnswered || 0).toString()}
            icon="📊"
            subValue={`${stats.totalCorrect || 0} correctas`}
          />
          <StatCard
            label="Precisión Media"
            value={`${Math.round(stats.accuracy || 0)}%`}
            icon="🎯"
            color={(stats.accuracy || 0) > 80 ? 'text-status-correct' : (stats.accuracy || 0) > 50 ? 'text-accent-primary' : 'text-status-incorrect'}
            subValue={(stats.accuracy || 0) > 80 ? 'Excelente nivel' : 'Sigue practicando'}
          />
          <StatCard
            label="Temas Dominados"
            value="0"
            icon="🏆"
            subValue="Implementación pendiente"
          />
        </div>

        <div className="bg-accent-primary/5 border border-accent-primary/20 rounded-3xl p-8 space-y-4">
          <h3 className="text-lg font-black text-accent-primary flex items-center gap-2">
            <span>⚡</span> Recomendación IA
          </h3>
          <p className="text-sm leading-relaxed text-foreground/70">
            {stats.accuracy < 70
              ? "Tu precisión global está por debajo del objetivo de certificación. Te recomendamos enfocarte en simulacros de 50 preguntas para mejorar la resistencia mental."
              : "¡Vas por buen camino! Estás cerca del nivel de aprobado oficial (80%). Prueba el modo contra reloj para mejorar tu agilidad."
            }
          </p>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: string;
  icon: string;
  subValue: string;
  color?: string;
}

const StatCard = ({ label, value, icon, subValue, color = 'text-foreground' }: StatCardProps): ReactElement => (
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
