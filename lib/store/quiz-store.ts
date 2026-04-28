import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ClientQuestion, QuizConfig, UserAnswer } from '@/types';
import { getQuizQuestionsAction, evaluateQuestionAction } from '@/lib/application/actions/quiz-actions';

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
    explanation: string;
    correctIds: number[];
  } | null;
}

interface QuizActions {
  setUserId: (id: string) => void;
  startQuiz: (quizConfig: QuizConfig) => Promise<void>;
  initQuiz: (config: QuizConfig, questions: ClientQuestion[]) => void;
  selectOption: (id: number) => void;
  toggleOption: (id: number) => void;
  evaluateAnswer: () => Promise<void>;
  skipQuestion: () => void;
  advance: () => void;
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
          userId: get().userId,
          config,
          questions,
          initialQuestions: [...questions],
          questionStartTime: Date.now(),
        });
      },

      startQuiz: async (quizConfig: QuizConfig): Promise<void> => {
        set({ isLoading: true });
        try {
          const questions = await getQuizQuestionsAction(
            quizConfig.topicIds || [], 
            quizConfig.questionCount, 
            get().userId
          );
          
          get().initQuiz(quizConfig, questions);
        } catch (error) {
          console.error('Failed to start quiz:', error);
        } finally {
          set({ isLoading: false });
        }
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

        const currentQuestion = questions[0];
        set({ isLoading: true });

        try {
          const result = await evaluateQuestionAction(
            currentQuestion.id,
            currentQuestion.tipo === 'multiple' ? selectedOptionIds : selectedOptionIds[0]
          );

          const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
          
          const answer: UserAnswer = {
            question: currentQuestion,
            selectedOptionIds,
            isCorrect: result.isCorrect,
            points: result.points,
            timeSpent: timeSpent,
            explanation: result.explanation,
            correctIds: result.correctIds
          };

          const newUserAnswers = [...userAnswers, answer];

          set({
            isShowingResult: true,
            isAutoAdvancing: true,
            score: score + result.points,
            userAnswers: newUserAnswers,
            lastEvaluation: {
              isCorrect: result.isCorrect,
              explanation: result.explanation,
              correctIds: result.correctIds
            }
          });
        } catch (error) {
          console.error('Evaluation failed:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      skipQuestion: (): void => {
        const { questions, userAnswers, questionStartTime, currentIndex } = get();
        if (questions.length === 0) return;

        const currentQuestion = questions[0];
        const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);

        const newUserAnswers = [...userAnswers, {
          question: currentQuestion,
          selectedOptionIds: [],
          isCorrect: false,
          points: 0,
          timeSpent,
        }];

        const remaining = questions.filter(q => q.id !== currentQuestion.id);
        const reorderedQuestions = [...remaining, currentQuestion];

        set({
          questions: reorderedQuestions,
          userAnswers: newUserAnswers,
          currentIndex: currentIndex + 1,
          selectedOptionIds: [],
          isShowingResult: false,
          isAutoAdvancing: false,
          questionStartTime: Date.now(),
          lastEvaluation: null,
        });
      },

      advance: (): void => {
        const { questions, userAnswers, isFinished, initialQuestions } = get();
        if (isFinished || questions.length === 0) return;

        const currentQuestion = questions[0];
        const hasAnswered = userAnswers.some(a => a.question.id === currentQuestion.id && a.selectedOptionIds.length > 0);
        
        let remainingQuestions = [...questions];
        if (hasAnswered) {
          remainingQuestions = questions.filter(q => q.id !== currentQuestion.id);
        }

        if (remainingQuestions.length === 0) {
          set({ isFinished: true, isAutoAdvancing: false });
          return;
        }

        set({
          questions: remainingQuestions,
          currentIndex: initialQuestions.length - remainingQuestions.length,
          selectedOptionIds: [],
          isShowingResult: false,
          isAutoAdvancing: false,
          questionStartTime: Date.now(),
          lastEvaluation: null,
        });
      },

      finishQuiz: (): void => { set({ isFinished: true, isAutoAdvancing: false }) },

      resetQuiz: (): void => { set({ ...initialState, userId: get().userId }) },

      resumeQuiz: (): void => { set({ isShowingResult: false, questionStartTime: Date.now() }) },

      discardSavedQuiz: (): void => { set({ ...initialState, userId: get().userId }) },

      tick: (): boolean => {
        const { timeElapsed, config } = get();
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
