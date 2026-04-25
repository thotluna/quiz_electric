"use client";

import { useQuizStore } from "@/lib/store/quiz-store";

const MODE_LABELS: Record<string, string> = {
  timed: "⏱️ Contrarreloj",
  standard: "📝 Simulacro Estándar",
  infinite: "♾️ Modo Infinito",
};

interface ResumeModalProps {
  onResume: () => void;
  onDiscard: () => void;
}

export const ResumeModal = ({ onResume, onDiscard }: ResumeModalProps) => {
  const config = useQuizStore((s) => s.config);
  const currentIndex = useQuizStore((s) => s.currentIndex);
  const questions = useQuizStore((s) => s.questions);
  const timeElapsed = useQuizStore((s) => s.timeElapsed);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 border-2 border-primary/50 space-y-6 animate-in zoom-in-95 duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20">
            <span className="text-3xl">📋</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Test sin terminar
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-bold">
            Tienes un simulacro en progreso. ¿Quieres continuar donde lo dejaste?
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-5 border border-slate-200 dark:border-white/10 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Modo</span>
            <span className="text-xs font-black text-slate-700 dark:text-white uppercase italic">
              {config?.mode ? MODE_LABELS[config.mode] ?? config.mode : "—"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progreso</span>
            <span className="text-xs font-black text-primary uppercase">
              {currentIndex}/{questions.length} preguntas
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiempo</span>
            <span className="text-xs font-black text-slate-700 dark:text-white uppercase">
              {formatTime(timeElapsed)}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <button
            onClick={onResume}
            className="w-full py-4 rounded-2xl bg-primary text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/30 hover:bg-primary/90 active:scale-[0.98] transition-all"
          >
            Continuar Simulacro
          </button>
          <button
            onClick={onDiscard}
            className="w-full py-3 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-white/30 font-black text-[10px] uppercase tracking-widest hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-500 active:scale-[0.98] transition-all"
          >
            Descartar y empezar de nuevo
          </button>
        </div>
      </div>
    </div>
  );
};
