"use client";

import { useQuizConfigStore } from "@/lib/store/quiz-config-store";

export function QuizTopics({ topics }: {
  topics: {
    id: string;
    itc: string;
  }[]
}) {
  const setSelectedTopics = useQuizConfigStore((s) => s.setTopicId);
  const selectedTopics = useQuizConfigStore((s) => s.topicIds);

  const toggleTopic = (id: string): void => {
    setSelectedTopics(id);
  }

  return (
    <div className="bg-card/30 border border-border rounded-xl p-3">
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
        <button
          onClick={() => setSelectedTopics("")}
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
  );
}