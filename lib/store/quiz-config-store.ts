import { create } from 'zustand';
import { QuizMode } from '@/types';

interface QuizConfigState {
  userId: string | null;
  mode: QuizMode;
  topicIds: string[];
}

interface QuizConfigActions {
  setUserId: (userId: string) => void;
  setMode: (mode: QuizMode) => void;
  setTopicIds: (topicIds: string[]) => void;
  setTopicId: (topicIds: string) => void;
  toggleTopic: (topicId: string) => void;
  resetConfig: () => void;
}

type QuizConfigStore = QuizConfigState & QuizConfigActions;

const initialState: QuizConfigState = {
  userId: null,
  mode: 'standard',
  topicIds: [],
};

export const useQuizConfigStore = create<QuizConfigStore>((set, get) => ({
  ...initialState,

  setUserId: (userId: string): void => {
    set({ userId });
  },

  setMode: (mode: QuizMode): void => {
    set({ mode });
  },

  setTopicIds: (topicIds: string[]): void => {
    set({ topicIds });
  },

  setTopicId: (topicId: string): void => {
    const { topicIds } = get();
    if (topicIds.includes(topicId)) {
      set({ topicIds: topicIds.filter((id) => id !== topicId) });
    } else {
      set({ topicIds: [...topicIds, topicId] });
    }
  },

  toggleTopic: (topicId: string): void => {
    set((state) => {
      const isSelected = state.topicIds.includes(topicId);
      const newTopics = isSelected
        ? state.topicIds.filter((id) => id !== topicId)
        : [...state.topicIds, topicId];

      return { topicIds: newTopics };
    });
  },

  resetConfig: (): void => {
    set((state) => ({
      ...initialState,
      userId: state.userId, // Preserve userId during config reset
    }));
  },
}));
