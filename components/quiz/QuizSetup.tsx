'use client'

import React, { useState } from 'react'
import { QuizConfig, QuizMode } from '@/types'
import { Timer, FileText, Infinity, ChevronRight } from 'lucide-react'

interface Topic {
  id: string
  itc: string
}

interface QuizSetupProps {
  topics: Topic[]
  onStart: (config: QuizConfig) => void
}

export const QuizSetup = ({ topics, onStart }: QuizSetupProps) => {
  const [selectedMode, setSelectedMode] = useState<QuizMode>('standard')
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])

  const modes: { id: QuizMode; title: string; desc: string; icon: React.ReactElement }[] = [
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

  const toggleTopic = (id: string) => {
    setSelectedTopics((prev) => {
      if (prev.includes(id)) {
        return prev.filter((t) => t !== id)
      }
      return [...prev, id]
    })
  }

  const handleStart = (): void => {
    onStart({
      mode: selectedMode,
      questionCount: selectedMode === 'timed' ? 10 : selectedMode === 'standard' ? 50 : undefined,
      topicIds: selectedTopics.length > 0 ? selectedTopics : undefined,
    })
  }

  return (
    <div className="flex flex-col gap-3 animate-in fade-in duration-500">
      <section className="space-y-3">
        <h2 className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center text-[9px]">1</span>
          Modo de examen
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setSelectedMode(mode.id)}
              className={`
                group relative p-3 rounded-xl border transition-all duration-300 text-left
                ${selectedMode === mode.id 
                  ? 'border-primary bg-primary/10 shadow-[0_0_20px_-5px_var(--neon-color)]' 
                  : 'border-border bg-card hover:border-primary/30'}
              `}
            >
              {/* Highlight Overlay */}
              <div className={`absolute inset-0 rounded-xl transition-opacity ${
                selectedMode === mode.id ? 'bg-primary/5 opacity-100' : 'bg-foreground/5 opacity-0 group-hover:opacity-100'
              }`} />
              
              <div className="relative z-10">
                <div className={`mb-1.5 transition-colors ${selectedMode === mode.id ? 'text-primary' : 'text-foreground/20'}`}>
                  <div className="w-4 h-4">{mode.icon}</div>
                </div>
                <p className="font-black text-xs text-foreground tracking-tight leading-none">{mode.title}</p>
                <p className="text-[8px] font-bold text-foreground/40 uppercase mt-1 tracking-wide">{mode.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center text-[9px]">2</span>
          Contenido a evaluar
        </h2>
        <div className="bg-card/30 border border-border rounded-xl p-3">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
            <button
              onClick={() => setSelectedTopics([])}
              className={`
                col-span-2 py-1.5 px-3 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all
                ${selectedTopics.length === 0 
                  ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'border-border bg-card text-foreground/50 hover:border-primary/30'}
              `}
            >
              Todo el REBT
            </button>
            
            {Array.from({ length: 52 }, (_, i) => {
              const itcNumber = (i + 1).toString().padStart(2, '0')
              const itcName = `ITC-BT-${itcNumber}`
              const availableTopic = topics.find(t => t.itc.toUpperCase() === itcName)
              const isAvailable = !!availableTopic

              return (
                <button
                  key={itcName}
                  disabled={!isAvailable}
                  onClick={() => isAvailable && toggleTopic(availableTopic.id)}
                  className={`
                    py-1.5 px-1 rounded-lg text-[9px] font-bold uppercase tracking-tight border transition-all whitespace-nowrap
                    ${isAvailable 
                      ? selectedTopics.includes(availableTopic.id)
                        ? 'border-primary bg-primary text-white shadow-md shadow-primary/20' 
                        : 'border-border bg-card text-foreground/70 hover:border-primary/50 hover:text-primary hover:bg-primary/5'
                      : 'border-border/50 bg-foreground/3 text-foreground/20 cursor-not-allowed'}
                  `}
                  title={isAvailable ? `Estudiar ${itcName}` : 'Próximamente'}
                >
                  ITC-BT {itcNumber}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <button
        onClick={handleStart}
        className="w-full py-3 mt-1 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-[10px] transition-all flex items-center justify-center gap-3 group shadow-lg shadow-primary/20 tracking-widest"
      >
        <span>EMPEZAR SIMULACRO PROFESIONAL</span>
        <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" />
      </button>
    </div>
  )
}
