import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ClientQuestion, QuizConfig, UserAnswer, EvaluationResult, Question, QuizMode } from '@/types';
import { getUserStatsForQuestions } from '@/lib/actions/stats';
import { evaluateAnswerAction } from '@/lib/actions/quiz';
import { getQuestionsByTopicAction, getTopicsAction, getAllQuestionsAction } from '@/lib/actions/questions';

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
  isEvaluating: boolean;
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

const initialSessionState: Omit<QuizState, 'selectedOptionIds' | 'isShowingResult' | 'isAutoAdvancing' | 'isLoading' | 'isEvaluating'> = {
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
};

const initialTransientState: Pick<QuizState, 'selectedOptionIds' | 'isShowingResult' | 'isAutoAdvancing' | 'isLoading' | 'isEvaluating'> = {
  selectedOptionIds: [],
  isShowingResult: false,
  isAutoAdvancing: false,
  isLoading: false,
  isEvaluating: false,
};

export const useQuizStore = create<QuizStore>()(
  persist(
    (set, get) => ({
      ...initialSessionState,
      ...initialTransientState,

      setUserId: (id: string): void => {
        set({ userId: id });
      },

      initQuiz: (config: QuizConfig, questions: ClientQuestion[]): void => {
        const isTest = typeof window !== 'undefined' && document.cookie.includes('test_session');
        const shuffled = isTest ? questions : [...questions].sort(() => Math.random() - 0.5);

        set({
          ...initialTransientState,
          config,
          questions: shuffled,
          initialQuestions: [...shuffled],
          currentIndex: 0,
          userAnswers: [],
          timeElapsed: 0,
          score: 0,
          isFinished: false,
          isTimeOut: false,
          questionStartTime: Date.now(),
          isLoading: false,
        });
      },

      startQuiz: async (quizConfig: QuizConfig): Promise<void> => {
        set({ isLoading: true });
        try {
          let serverQuestions: ClientQuestion[] = [];
          if (!quizConfig.topicIds || quizConfig.topicIds.length === 0) {
            serverQuestions = await getAllQuestionsAction();
          } else {
            serverQuestions = await getQuestionsByTopicAction(quizConfig.topicIds, quizConfig.mode as QuizMode);
          }

          set({
            ...initialSessionState,
            ...initialTransientState,
            config: quizConfig,
            questions: serverQuestions,
            initialQuestions: serverQuestions,
            questionStartTime: Date.now(),
            isLoading: false,
          });
        } catch (error) {
          console.error('Error starting quiz:', error);
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

        set({ isEvaluating: true });
        const currentQuestion = questions[0];
        const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);

        try {
          const result: EvaluationResult = await evaluateAnswerAction(currentQuestion.id, selectedOptionIds);

          const answer: UserAnswer = {
            questionId: currentQuestion.id,
            questionText: currentQuestion.pregunta,
            question: result.fullQuestion,
            selectedOptionIds,
            isCorrect: result.isCorrect,
            timeSpent,
            points: result.points,
            explicacion: result.explicacion,
          };

          const existingIndex = userAnswers.findIndex(a => a.questionId === currentQuestion.id);
          const newUserAnswers = [...userAnswers];

          if (existingIndex !== -1) {
            newUserAnswers[existingIndex] = answer;
          } else {
            newUserAnswers.push(answer);
          }

          set({
            isShowingResult: true,
            isAutoAdvancing: true,
            score: score + result.points,
            userAnswers: newUserAnswers,
            isEvaluating: false,
          });
        } catch (error) {
          console.error('Error evaluating answer:', error);
          set({ isEvaluating: false });
        }
      },

      skipQuestion: (): void => {
        const { questions, userAnswers, questionStartTime } = get();
        if (questions.length === 0) return;

        const currentQuestion = questions[0];
        const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);

        const existingIndex = userAnswers.findIndex(a => a.questionId === currentQuestion.id);
        const newUserAnswers = [...userAnswers];

        if (existingIndex === -1) {
          newUserAnswers.push({
            questionId: currentQuestion.id,
            questionText: currentQuestion.pregunta,
            selectedOptionIds: [],
            isCorrect: false,
            timeSpent,
            points: 0,
          });
        }

        const remaining = questions.filter(q => q.id !== currentQuestion.id);
        const reorderedQuestions = [...remaining, currentQuestion];

        set({
          questions: reorderedQuestions,
          userAnswers: newUserAnswers,
          currentIndex: get().currentIndex + 1,
          selectedOptionIds: [],
          isShowingResult: false,
          isAutoAdvancing: false,
          questionStartTime: Date.now(),
        });
      },

      advance: (): void => {
        const { questions, userAnswers, isFinished } = get();
        if (isFinished || questions.length === 0) return;

        const currentQuestionInQueue = questions[0];
        const currentAnswer = userAnswers.find(a => a.questionId === currentQuestionInQueue.id);

        let remainingQuestions = [...questions];

        if (currentAnswer && currentAnswer.selectedOptionIds.length > 0) {
          remainingQuestions = questions.filter(q => q.id !== currentQuestionInQueue.id);
        }

        if (remainingQuestions.length === 0) {
          get().finishQuiz();
          return;
        }

        set({
          questions: remainingQuestions,
          currentIndex: get().initialQuestions.length - remainingQuestions.length,
          selectedOptionIds: [],
          isShowingResult: false,
          isAutoAdvancing: false,
          questionStartTime: Date.now(),
        });
      },

      finishQuiz: (): void => {
        set({ isFinished: true, isAutoAdvancing: false });
      },

      resetQuiz: (): void => {
        set({ ...initialSessionState, ...initialTransientState, userId: get().userId });
      },

      resumeQuiz: (): void => {
        set({
          ...initialTransientState,
          questionStartTime: Date.now(),
        });
      },

      discardSavedQuiz: (): void => {
        set({ ...initialSessionState, ...initialTransientState, userId: get().userId });
      },

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

      setIsAutoAdvancing: (value: boolean): void => {
        set({ isAutoAdvancing: value });
      },

      hasActiveSession: (): boolean => {
        const { config, isFinished, questions } = get();
        return config !== null && !isFinished && questions.length > 0;
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state): any => ({
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
function getAllQuestions(): Question[] | PromiseLike<Question[]> {
  throw new Error('Function not implemented.');
}

