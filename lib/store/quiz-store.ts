import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { QuizConfig, Question, UserAnswer } from '@/types';

interface QuizState {
  config: QuizConfig | null;
  initialQuestions: Question[];
  questions: Question[];
  currentIndex: number;
  selectedOptionIds: number[];
  userAnswers: UserAnswer[];
  score: number;
  timeElapsed: number;
  isFinished: boolean;
  isTimeOut: boolean;
  questionStartTime: number;
  isShowingResult: boolean;
  isAutoAdvancing: boolean;
  userId: string | null;
  isLoading: boolean;
  isTestMode: boolean;
}

interface QuizActions {
  setUserId: (id: string) => void;
  startQuiz: (config: QuizConfig, allQuestions: Question[]) => void;
  selectOption: (optionId: number) => void;
  toggleOption: (optionId: number) => void;
  evaluateAnswer: () => void;
  advance: () => void;
  skipQuestion: () => void;
  finishQuiz: () => void;
  resetQuiz: () => void;
  tick: () => boolean;
  setIsAutoAdvancing: (value: boolean) => void;
  hasActiveSession: () => boolean;
  setTestMode: (value: boolean) => void;
}

type QuizStore = QuizState & QuizActions;

const STORAGE_KEY = 'quiz-storage';

const initialState: QuizState = {
  config: null,
  initialQuestions: [],
  questions: [],
  currentIndex: 0,
  selectedOptionIds: [],
  userAnswers: [],
  score: 0,
  timeElapsed: 0,
  isFinished: false,
  isTimeOut: false,
  questionStartTime: 0,
  userId: null,
  isLoading: false,
  isTestMode: false,
  isShowingResult: false,
  isAutoAdvancing: false,
};

const initialTransientState: Pick<QuizState, 'selectedOptionIds' | 'isShowingResult' | 'isAutoAdvancing' | 'isLoading'> = {
  selectedOptionIds: [],
  isShowingResult: false,
  isAutoAdvancing: false,
  isLoading: false,
};

export const useQuizStore = create<QuizStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setUserId: (id) => set({ userId: id }),

      startQuiz: (config, allQuestions) => {
        set({ isLoading: true });

        try {
          // Filtrar preguntas por tema si aplica
          let rawQuestions = config.topicId === 'all' 
            ? allQuestions 
            : allQuestions.filter(q => q.id.startsWith(config.topicId));

          if (rawQuestions.length === 0) {
            rawQuestions = allQuestions;
          }

          const count = config.mode === 'timed' ? 10 : config.mode === 'standard' ? 50 : rawQuestions.length;
          
          const getRandomQuestions = (pool: Question[], count: number) => {
            return [...pool].sort(() => Math.random() - 0.5).slice(0, Math.max(0, count));
          };

          const isTest = get().isTestMode;
          let finalSelection: Question[] = [];

          if (isTest) {
            finalSelection = rawQuestions;
          } else {
            // Lógica de pesos (ejemplo simplificado)
            finalSelection = getRandomQuestions(rawQuestions, count);
          }

          const shuffled = isTest ? finalSelection : finalSelection.sort(() => Math.random() - 0.5);

          set({
            config,
            initialQuestions: shuffled,
            questions: shuffled,
            currentIndex: 0,
            userAnswers: [],
            score: 0,
            timeElapsed: 0,
            isFinished: false,
            isTimeOut: false,
            questionStartTime: Date.now(),
            ...initialTransientState,
          });
        } finally {
          set({ isLoading: false });
        }
      },

      selectOption: (optionId) => {
        if (get().isShowingResult) return;
        set({ selectedOptionIds: [optionId] });
      },

      toggleOption: (optionId) => {
        if (get().isShowingResult) return;
        const current = get().selectedOptionIds;
        if (current.includes(optionId)) {
          set({ selectedOptionIds: current.filter(id => id !== optionId) });
        } else {
          set({ selectedOptionIds: [...current, optionId] });
        }
      },

      evaluateAnswer: () => {
        const { questions, selectedOptionIds, score, userAnswers } = get();
        if (questions.length === 0) return;

        const currentQuestion = questions[0];
        const isMultiple = currentQuestion.tipo === 'multiple';
        
        let isCorrect = false;
        let points = 0;

        if (isMultiple) {
          const correctIds = currentQuestion.opciones.filter(o => o.es_correcta).map(o => o.id);
          const selectedCorrect = selectedOptionIds.filter(id => correctIds.includes(id));
          const selectedIncorrect = selectedOptionIds.filter(id => !correctIds.includes(id));
          
          isCorrect = selectedCorrect.length === correctIds.length && selectedIncorrect.length === 0;
          points = isCorrect ? 1 : -0.25;
        } else {
          const selectedId = selectedOptionIds[0];
          const option = currentQuestion.opciones.find(o => o.id === selectedId);
          isCorrect = !!option?.es_correcta;
          points = isCorrect ? 1 : -0.25;
        }

        const answer: UserAnswer = {
          question: currentQuestion,
          selectedOptionIds,
          isCorrect,
          points,
          timeSpent: Math.floor((Date.now() - get().questionStartTime) / 1000),
          timestamp: new Date().toISOString(),
        };

        set({
          score: score + points,
          userAnswers: [...userAnswers, answer],
          isShowingResult: true,
          isAutoAdvancing: true,
        });
      },

      advance: () => {
        const { questions, config } = get();
        if (questions.length <= 1) {
          if (config?.mode === 'infinite') {
            // En modo infinito, si se acaban, podríamos traer más o ciclar
            // Por ahora terminamos
            set({ isFinished: true });
          } else {
            set({ isFinished: true });
          }
          return;
        }

        set({
          questions: questions.slice(1),
          currentIndex: get().currentIndex + 1,
          questionStartTime: Date.now(),
          ...initialTransientState,
        });
      },

      skipQuestion: () => {
        const { questions, userAnswers } = get();
        if (questions.length === 0) return;

        const answer: UserAnswer = {
          question: questions[0],
          selectedOptionIds: [],
          isCorrect: false,
          points: 0,
          timeSpent: 0,
          timestamp: new Date().toISOString(),
        };

        set({
          userAnswers: [...userAnswers, answer],
          ...initialTransientState,
        });
        get().advance();
      },

      finishQuiz: () => set({ isFinished: true }),

      resetQuiz: () => set(initialState),

      tick: () => {
        const { timeElapsed, config, isFinished, isShowingResult } = get();
        if (isFinished || isShowingResult) return false;

        const newTime = timeElapsed + 1;
        set({ timeElapsed: newTime });

        if (config?.mode === 'timed' && newTime >= 180) {
          set({ isFinished: true, isTimeOut: true });
          return true;
        }
        return false;
      },

      setIsAutoAdvancing: (value) => set({ isAutoAdvancing: value }),

      hasActiveSession: (): boolean => {
        const { config, isFinished, questions } = get();
        return config !== null && !isFinished && questions.length > 0;
      },
      
      setTestMode: (value: boolean): void => {
        set({ isTestMode: value });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    }
  )
);
