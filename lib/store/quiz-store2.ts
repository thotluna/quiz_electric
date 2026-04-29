'use client'

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ClientQuestion, QuizConfig, QuizMode } from '@/types';
import { evaluateAnswerAction } from '@/lib/application/actions/quiz-actions';
import { EvaluationResult } from '@/lib/domain/types';

interface QuizState {
  mode: QuizMode
  topicIds: string[]
  time: number

  questions: ClientQuestion[]

  currentQuestion: ClientQuestion | null
  isCorrectAnswer: boolean | null
  selectedOptionIds: string[]

  answers: EvaluationResult[]

  hasNext: boolean
  nextDisable: boolean

  isFinished: boolean
  score: number
  timeElapsed: number

}
interface QuizActions {
  initQuiz: (config: QuizConfig, questions: ClientQuestion[]) => void;

  selectOption: (id: string) => void;

  evaluateAnswer: () => Promise<void>;

  nextQuestion: () => void;

  omitQuestion: () => void;

  finishQuiz: () => void;

}

const initialState: QuizState = {
  mode: 'standard',
  topicIds: [],
  time: 180,
  questions: [],
  currentQuestion: null,
  isCorrectAnswer: null,
  selectedOptionIds: [],
  answers: [],
  hasNext: false,
  nextDisable: false,
  isFinished: true,
  score: 0,
  timeElapsed: 0,
}

type QuizStore = QuizState & QuizActions;

export const useQuizStore2 = create<QuizStore>()(persist((set, get) => ({
  ...initialState,
  initQuiz: (config: QuizConfig, questions: ClientQuestion[]) => {
    const questionsCopy = [...questions];
    const firstQuestion = questionsCopy.shift() || null;
    set({
      ...initialState,
      questions: questionsCopy,
      topicIds: config.topicIds,
      mode: config.mode,
      time: config.mode === 'timed' ? 180 : 0,
      currentQuestion: firstQuestion,
      isFinished: false,
      hasNext: questionsCopy.length > 0,
    });
  },

  selectOption: (id: string) => {
    const { selectedOptionIds, currentQuestion } = get();
    if (!currentQuestion) return;
    if (currentQuestion.tipo === 'multiple') {
      set({
        selectedOptionIds: selectedOptionIds.includes(id)
          ? selectedOptionIds.filter(optId => optId !== id)
          : [...selectedOptionIds, id],
      });
    } else {
      set({
        selectedOptionIds: [id],
      });
    }
  },

  evaluateAnswer: async () => {
    set({ nextDisable: true });
    const { currentQuestion, selectedOptionIds } = get();
    if (!currentQuestion) return;
    const result = await evaluateAnswerAction(currentQuestion.id, selectedOptionIds);
    set({
      answers: [...get().answers, result],
      isCorrectAnswer: result.isCorrect,

    });
  },

  nextQuestion: () => {
    const { questions } = get();
    const nextQuestions = [...questions];
    const nextQ = nextQuestions.shift() || null;

    set({
      questions: nextQuestions,
      currentQuestion: nextQ,
      selectedOptionIds: [],
      hasNext: nextQuestions.length > 0,
      isCorrectAnswer: null,
      nextDisable: false,
    });
  },

  omitQuestion: () => {
    const { questions, currentQuestion } = get();
    if (!currentQuestion) return;

    const nextQuestions = [...questions, currentQuestion];
    const nextQ = nextQuestions.shift() || null;

    set({
      questions: nextQuestions,
      currentQuestion: nextQ,
      selectedOptionIds: [],
      hasNext: nextQuestions.length > 0,
    });
  },

  finishQuiz: () => {
    const { answers } = get();
    const score = answers.reduce((acc, answer) => acc + answer.score, 0);
    set({
      isFinished: true,
      score,
    });
  },

}), {
  name: 'quiz',
}));