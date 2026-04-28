"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ClientQuestion, QuizConfig, UserAnswer } from '@/types';
import { evaluateAnswerAction } from '@/lib/application/actions/quiz-actions';

const STORAGE_KEY = 'quiz-electric-session';
const TIMED_MODE_SECONDS = 180;

interface QuizState {
  userId: string | null;
  config: QuizConfig | null;
  questions: ClientQuestion[];
  initialQuestions: ClientQuestion[];
  currentIndex: number;
  userAnswers: UserAnswer[];
  timeElapsed: number;
  score: number;
  isFinished: boolean;
  isTimeOut: boolean;
  questionStartTime: number;
  selectedOptionIds: number[];
  isShowingResult: boolean;
  isAutoAdvancing: boolean;
  isLoading: boolean;
  lastEvaluation: {
    isCorrect: boolean;
    points: number;
    explanation?: string;
    correctIds?: number[];
  } | null;
}

interface QuizActions {
  setUserId: (id: string) => void;
  initQuiz: (config: QuizConfig, questions: ClientQuestion[]) => void;
  selectOption: (id: number) => void;
  toggleOption: (id: number) => void;
  evaluateAnswer: () => Promise<void>;
  nextQuestion: () => void;
  finishQuiz: () => void;
  resetQuiz: () => void;
  resumeQuiz: () => void;
  discardSavedQuiz: () => void;
  tick: () => boolean;
  setIsAutoAdvancing: (value: boolean) => void;
  hasActiveSession: () => boolean;
}

type QuizStore = QuizState & QuizActions;

const initialState: QuizState = {
  userId: null,
  config: null,
  questions: [],
  initialQuestions: [],
  currentIndex: 0,
  userAnswers: [],
  timeElapsed: 0,
  score: 0,
  isFinished: false,
  isTimeOut: false,
  questionStartTime: 0,
  selectedOptionIds: [],
  isShowingResult: false,
  isAutoAdvancing: false,
  isLoading: false,
  lastEvaluation: null,
};

export const useQuizStore = create<QuizStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setUserId: (id: string): void => { set({ userId: id }) },

      initQuiz: (config: QuizConfig, questions: ClientQuestion[]): void => {
        set({
          ...initialState,
          config,
          questions,
          initialQuestions: questions,
          userId: get().userId,
          questionStartTime: Date.now(),
        });
      },

      selectOption: (id: number): void => {
        if (get().isShowingResult) return;
        set({ selectedOptionIds: [id] });
      },

      toggleOption: (id: number): void => {
        if (get().isShowingResult) return;
        const { selectedOptionIds } = get();
        const newIds = selectedOptionIds.includes(id)
          ? selectedOptionIds.filter(optId => optId !== id)
          : [...selectedOptionIds, id];
        set({ selectedOptionIds: newIds });
      },

      evaluateAnswer: async (): Promise<void> => {
        const { selectedOptionIds, questions, questionStartTime, score, userAnswers } = get();
        if (selectedOptionIds.length === 0 || questions.length === 0) return;

        const currentQuestion = questions[0]; // In our queue system, we always evaluate the first one
        const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);

        set({ isLoading: true });

        try {
          const result = await evaluateAnswerAction(currentQuestion.id, selectedOptionIds, timeSpent);

          const newAnswer: UserAnswer = {
            question: currentQuestion,
            selectedOptionIds,
            isCorrect: result.isCorrect,
            points: result.points,
            timeSpent,
            explanation: result.explanation,
            correctIds: result.correctIds,
          };

          set({
            score: score + result.points,
            userAnswers: [...userAnswers, newAnswer],
            lastEvaluation: {
              isCorrect: result.isCorrect,
              points: result.points,
              explanation: result.explanation,
              correctIds: result.correctIds,
            },
            isShowingResult: true,
            isLoading: false,
          });
        } catch (error) {
          console.error('Error evaluating answer:', error);
          set({ isLoading: false });
        }
      },

      nextQuestion: (): void => {
        const { questions, initialQuestions } = get();
        const remainingQuestions = questions.slice(1);

        if (remainingQuestions.length === 0) {
          set({ isFinished: true, isAutoAdvancing: false });
          return;
        }

        set({
          questions: remainingQuestions,
          currentIndex: initialQuestions.length - remainingQuestions.length,
          selectedOptionIds: [],
          isShowingResult: false,
          lastEvaluation: null,
          questionStartTime: Date.now(),
        });
      },

      finishQuiz: (): void => { set({ isFinished: true, isAutoAdvancing: false }) },

      resetQuiz: (): void => { set({ ...initialState, userId: get().userId }) },

      resumeQuiz: (): void => { set({ isShowingResult: false, questionStartTime: Date.now() }) },

      discardSavedQuiz: (): void => { set({ ...initialState, userId: get().userId }) },

      tick: (): boolean => {
        const { timeElapsed, config } = get();
        if (get().isFinished) return false;

        const newTime = timeElapsed + 1;

        if (config?.mode === 'timed' && newTime >= TIMED_MODE_SECONDS) {
          set({ timeElapsed: newTime, isTimeOut: true, isFinished: true });
          return true;
        }

        set({ timeElapsed: newTime });
        return false;
      },

      setIsAutoAdvancing: (value: boolean): void => { set({ isAutoAdvancing: value }) },

      hasActiveSession: (): boolean => {
        const { config, isFinished, questions } = get();
        return !!config && !isFinished && questions.length > 0;
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state: QuizStore) => ({
        userId: state.userId,
        config: state.config,
        questions: state.questions,
        initialQuestions: state.initialQuestions,
        currentIndex: state.currentIndex,
        userAnswers: state.userAnswers,
        timeElapsed: state.timeElapsed,
        score: state.score,
        isFinished: state.isFinished,
        isTimeOut: state.isTimeOut,
        questionStartTime: state.questionStartTime,
      }),
    }
  )
);
