"use client"

import { FileText, Timer, Infinity } from "lucide-react";
import { QuizMode } from "@/types";
import { useQuizConfigStore } from "@/lib/store/quiz-config-store";
import { ButtonMode, Mode } from "./ButtonMode";



export function QuizModes() {
  const selectedMode = useQuizConfigStore((s) => s.mode);
  const setMode = useQuizConfigStore((s) => s.setMode);

  const modes: Mode[] = [
    {
      id: 'timed',
      title: 'Contrarreloj',
      desc: '10 preguntas rápidas',
      icon: <Timer size={20} />
    },
    {
      id: 'standard',
      title: '50 Preguntas',
      desc: 'Simulacro completo',
      icon: <FileText size={20} />
    },
    {
      id: 'infinite',
      title: 'Infinito',
      desc: 'Repaso sin fin',
      icon: <Infinity size={20} />
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {modes.map((mode) => (
        <ButtonMode key={mode.id} mode={mode} selected={selectedMode === mode.id} onClick={(s) => setMode(s as QuizMode)} />
      ))}
    </div>
  );
}