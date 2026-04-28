\"use client\";

import { create } from \"zustand\";
import { persist } from \"zustand/middleware\";

interface QuizConfigState {
  topicIds: string[];
  setTopicId: (id: string) => void;
  reset: () => void;
}

export const useQuizConfigStore = create<QuizConfigState>()(
  persist(
    (set) => ({
      topicIds: [],
      setTopicId: (id: string) => set((s) => {
        if (id === \"\") return { topicIds: [] };
        const exists = s.topicIds.includes(id);
        return {
          topicIds: exists
            ? s.topicIds.filter(t => t !== id)
            : [...s.topicIds, id]
        };
      }),
      reset: () => set({ topicIds: [] })
    }),
    { name: \"quiz-config-storage\" }
  )
);
