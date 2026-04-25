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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-surface-card rounded-3xl p-8 shadow-2xl border border-foreground/10 space-y-6 animate-in zoom-in-95 duration-500">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent-primary/10 border border-accent-primary/20">
            <span className="text-3xl">📋</span>
          </div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">
            Test sin terminar
          </h2>
          <p className="text-foreground/50 text-sm font-medium">
            Tienes un simulacro en progreso. ¿Quieres continuar donde lo dejaste?
          </p>
        </div>

        <div className="bg-foreground/5 rounded-2xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-foreground/40 uppercase tracking-widest">Modo</span>
            <span className="text-sm font-bold text-foreground">
              {config?.mode ? MODE_LABELS[config.mode] ?? config.mode : "—"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-foreground/40 uppercase tracking-widest">Progreso</span>
            <span className="text-sm font-bold text-accent-primary">
              {currentIndex}/{questions.length} preguntas
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-foreground/40 uppercase tracking-widest">Tiempo</span>
            <span className="text-sm font-bold text-foreground">
              {formatTime(timeElapsed)}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onResume}
            className="w-full py-4 rounded-2xl bg-accent-primary text-white font-black text-base shadow-xl shadow-accent-primary/20 hover:bg-accent-primary/90 active:scale-[0.98] transition-all"
          >
            Continuar Simulacro
          </button>
          <button
            onClick={onDiscard}
            className="w-full py-3 rounded-2xl bg-foreground/5 text-foreground/50 font-bold text-sm hover:bg-status-incorrect/10 hover:text-status-incorrect active:scale-[0.98] transition-all"
          >
            Descartar y empezar de nuevo
          </button>
        </div>
      </div>
    </div>
  );
};
