"use client";

import { useState } from "react";
import { QuizConfig, QuizMode } from "@/types";

interface Topic {
  id: string;
  itc: string;
}

interface QuizSetupProps {
  topics: Topic[];
  onStart: (config: QuizConfig) => void;
}

export const QuizSetup = ({ topics, onStart }: QuizSetupProps) => {
  const [selectedMode, setSelectedMode] = useState<QuizMode>("standard");
  const [selectedTopic, setSelectedTopic] = useState<string>("");

  const modes: { id: QuizMode; title: string; desc: string; icon: string }[] = [
    { 
      id: "timed", 
      title: "10 A contrarreloj", 
      desc: "10 preguntas rápidas con tiempo límite.", 
      icon: "⏱️" 
    },
    { 
      id: "standard", 
      title: "50 Preguntas", 
      desc: "Simulacro completo estándar.", 
      icon: "📝" 
    },
    { 
      id: "infinite", 
      title: "Infinito", 
      desc: "Preguntas sin fin para repasar todo.", 
      icon: "♾️" 
    },
  ];

  const handleStart = (): void => {
    onStart({
      mode: selectedMode,
      questionCount: selectedMode === "timed" ? 10 : selectedMode === "standard" ? 50 : undefined,
      topicId: selectedTopic || undefined,
    });
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-foreground/80 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-accent-primary/10 text-accent-primary flex items-center justify-center text-sm">01</span>
          Selecciona el modo de prueba
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {modes.map((mode) => (
            <button
              key={mode.id}
              id={`mode-${mode.id}`}
              data-testid={`mode-${mode.id}`}
              onClick={() => setSelectedMode(mode.id)}
              className={`
                text-left p-5 rounded-2xl border-2 transition-all duration-300 group
                ${selectedMode === mode.id 
                  ? "border-accent-primary bg-accent-primary/5 shadow-lg scale-[1.02]" 
                  : "border-foreground/5 bg-surface-card hover:border-accent-primary/30"}
              `}
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{mode.icon}</div>
              <p className="font-bold text-foreground">{mode.title}</p>
              <p className="text-xs text-foreground/50 mt-1">{mode.desc}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-foreground/80 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-accent-primary/10 text-accent-primary flex items-center justify-center text-sm">02</span>
          Escoge el contenido
        </h2>
        <div className="bg-surface-card border border-foreground/5 rounded-2xl p-6 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              id="topic-all"
              data-testid="topic-all"
              onClick={() => setSelectedTopic("")}
              className={`
                py-3 px-4 rounded-xl text-xs font-bold border-2 transition-all
                ${selectedTopic === "" 
                  ? "border-accent-primary bg-accent-primary text-white" 
                  : "border-foreground/5 bg-background text-foreground/60 hover:border-accent-primary/30"}
              `}
            >
              Todo el Reglamento
            </button>
            {topics.map((topic) => (
              <button
                key={topic.id}
                id={`topic-${topic.id}`}
                data-testid={`topic-${topic.id}`}
                onClick={() => setSelectedTopic(topic.id)}
                className={`
                  py-3 px-4 rounded-xl text-xs font-bold border-2 transition-all
                  ${selectedTopic === topic.id 
                    ? "border-accent-primary bg-accent-primary text-white" 
                    : "border-foreground/5 bg-background text-foreground/60 hover:border-accent-primary/30"}
                `}
              >
                {topic.itc}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="pt-4">
        <button
          id="btn-start-quiz"
          data-testid="btn-start-quiz"
          onClick={handleStart}
          className="w-full py-5 rounded-2xl bg-accent-primary text-white font-black text-lg shadow-xl shadow-accent-primary/20 hover:bg-accent-primary/90 transition-all active:scale-[0.98]"
        >
          Empezar Simulacro
        </button>
      </div>
    </div>
  );
};
