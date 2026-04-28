"use client";

import React from "react";

interface ResumeModalProps {
  onResume: () => void;
  onDiscard: () => void;
}

export const ResumeModal = ({ onResume, onDiscard }: ResumeModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-surface-card border border-foreground/10 rounded-2xl p-6 shadow-2xl shadow-accent-primary/20 animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-accent-primary/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-accent-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">Sesión Encontrada</h2>
            <p className="text-foreground/60 text-sm leading-relaxed">
              Tienes un simulacro en curso. ¿Deseas retomarlo donde lo dejaste o empezar uno nuevo?
            </p>
          </div>

          <div className="flex flex-col w-full gap-3 pt-2">
            <button
              onClick={onResume}
              className="w-full py-4 bg-accent-primary text-white font-black rounded-xl shadow-lg shadow-accent-primary/25 transition-transform active:scale-95 hover:scale-[1.02]"
            >
              RETOMAR SIMULACRO
            </button>
            <button
              onClick={onDiscard}
              className="w-full py-4 bg-foreground/5 text-foreground/50 font-black rounded-xl transition-colors hover:bg-foreground/10 hover:text-foreground"
            >
              EMPEZAR NUEVO
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
