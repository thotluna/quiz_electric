"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ClientQuestion, UserAnswer, QuizConfig, EvaluationResult } from "@/types";
import { evaluateAnswerAction } from "@/lib/actions/quiz";
import { saveQuizStatsAction } from "@/lib/actions/stats";

interface QuizState {
  questions: ClientQuestion[];
  currentIndex: number;
  userAnswers: UserAnswer[];
  config: QuizConfig | null;
  userId: string | null;
  isFinished: boolean;
  isLoading: boolean;
  isEvaluating: boolean;
  selectedOptionIds: number[];
  isShowingResult: boolean;
  lastEvaluation: EvaluationResult | null;
  timer: number;
  isPaused: boolean;

  // Actions
  initQuiz: (config: QuizConfig, questions: ClientQuestion[]) => void;
  setUserId: (userId: string) => void;
  selectOption: (optionId: number) => void;
  toggleOption: (optionId: number) => void;
  evaluateCurrentAnswer: () => Promise<void>;
  nextQuestion: () => void;
  finishQuiz: () => Promise<void>;
  discardSavedQuiz: () => void;
  resumeQuiz: () => void;
  tick: () => void;
  setPaused: (paused: boolean) => void;
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      questions: [],
      currentIndex: 0,
      userAnswers: [],
      config: null,
      userId: null,
      isFinished: false,
      isLoading: false,
      isEvaluating: false,
      selectedOptionIds: [],
      isShowingResult: false,
      lastEvaluation: null,
      timer: 0,
      isPaused: false,

      setUserId: (userId) => set({ userId }),

      initQuiz: (config, questions) => {
        set({
          config,
          questions,
          currentIndex: 0,
          userAnswers: [],
          isFinished: false,
          selectedOptionIds: [],
          isShowingResult: false,
          lastEvaluation: null,
          timer: 0,
          isPaused: false
        });
      },

      selectOption: (id) => {
        if (get().isShowingResult) return;
        set({ selectedOptionIds: [id] });
      },

      toggleOption: (id) => {
        if (get().isShowingResult) return;
        const current = get().selectedOptionIds;
        const next = current.includes(id)
          ? current.filter((i) => i !== id)
          : [...current, id];
        set({ selectedOptionIds: next });
      },

      evaluateCurrentAnswer: async () => {
        const { questions, currentIndex, selectedOptionIds, timer } = get();
        const question = questions[currentIndex];

        if (!question || selectedOptionIds.length === 0) return;

        set({ isEvaluating: true, isPaused: true });

        try {
          const result = await evaluateAnswerAction(question.id, selectedOptionIds);

          const answer: UserAnswer = {
            questionId: question.id,
            questionText: question.pregunta,
            selectedOptionIds,
            isCorrect: result.isCorrect,
            timeSpent: timer,
            points: result.points,
            explicacion: result.explicacion,
            question: result.fullQuestion // We store full question in user answer for results screen
          };

          set((s) => ({
            userAnswers: [...s.userAnswers, answer],
            isShowingResult: true,
            lastEvaluation: result,
            isEvaluating: false
          }));
        } catch (error) {
          console.error("Evaluation failed:", error);
          set({ isEvaluating: false, isPaused: false });
        }
      },

      nextQuestion: () => {
        const { currentIndex, questions } = get();
        if (currentIndex < questions.length - 1) {
          set({
            currentIndex: currentIndex + 1,
            selectedOptionIds: [],
            isShowingResult: false,
            lastEvaluation: null,
            timer: 0,
            isPaused: false
          });
        } else {
          get().finishQuiz();
        }
      },

      finishQuiz: async () => {
        const { userId, userAnswers, config } = get();
        set({ isFinished: true, isPaused: true });

        if (userId && userAnswers.length > 0 && config) {
          const score = userAnswers.filter(a => a.isCorrect).length;
          const totalTime = userAnswers.reduce((acc, a) => acc + a.timeSpent, 0);
          await saveQuizStatsAction(userId, userAnswers, config, score, totalTime);
        }
      },

      discardSavedQuiz: () => {
        set({
          config: null,
          questions: [],
          userAnswers: [],
          currentIndex: 0,
          isFinished: false
        });
      },

      resumeQuiz: () => {
        set({ isPaused: false });
      },

      tick: () => {
        if (!get().isPaused && !get().isFinished) {
          set((s) => ({ timer: s.timer + 1 }));
        }
      },

      setPaused: (isPaused) => set({ isPaused })
    }),
    {
      name: "quiz-electric-session",
      partialize: (state) => ({
        config: state.config,
        questions: state.questions,
        userAnswers: state.userAnswers,
        currentIndex: state.currentIndex,
        userId: state.userId,
        isFinished: state.isFinished,
        timer: state.timer
      })
    }
  )
);
