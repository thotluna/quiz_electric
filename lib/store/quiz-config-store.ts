"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { QuizMode } from "@/types";

interface QuizConfigState {
  userId: string | null;
  mode: QuizMode;
  topicIds: string[];
  setUserId: (id: string) => void;
  setMode: (mode: QuizMode) => void;
  setTopicId: (id: string) => void;
  toggleTopic: (id: string) => void;
  reset: () => void;
}

export const useQuizConfigStore = create<QuizConfigState>()(
  persist(
    (set) => ({
      userId: null,
      mode: "standard",
      topicIds: [],
      setUserId: (userId: string) => set({ userId }),
      setMode: (mode: QuizMode) => set({ mode }),
      setTopicId: (id: string) => set((s) => {
        if (id === "") return { topicIds: [] };
        const exists = s.topicIds.includes(id);
        return {
          topicIds: exists
            ? s.topicIds.filter(t => t !== id)
            : [...s.topicIds, id]
        };
      }),
      toggleTopic: (topicId: string) => set((s) => ({
        topicIds: s.topicIds.includes(topicId)
          ? s.topicIds.filter(id => id !== topicId)
          : [...s.topicIds, topicId]
      })),
      reset: () => set({ topicIds: [], mode: "standard" })
    }),
    { name: "quiz-config-storage" }
  )
);
