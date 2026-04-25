import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Question, QuizConfig, UserAnswer } from '@/types';
import { getQuestionsByTopic, getAllQuestions } from '@/lib/queries/questions';
import { getUserStatsForQuestions } from '@/lib/actions/stats';

const STORAGE_KEY = 'quiz-electric-session';
const TIMED_MODE_SECONDS = 180;

interface QuizState {
  userId: string | null;
  config: QuizConfig | null;
  questions: Question[]; // Esta será la cola de trabajo (se irá vaciando)
  initialQuestions: Question[]; // Copia para los resultados finales
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
}

interface QuizActions {
  setUserId: (id: string) => void;
  startQuiz: (quizConfig: QuizConfig) => Promise<void>;
  selectOption: (id: number) => void;
  toggleOption: (id: number) => void;
  evaluateAnswer: () => void;
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

const initialSessionState: Omit<QuizState, 'selectedOptionIds' | 'isShowingResult' | 'isAutoAdvancing' | 'isLoading'> = {
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

const initialTransientState: Pick<QuizState, 'selectedOptionIds' | 'isShowingResult' | 'isAutoAdvancing' | 'isLoading'> = {
  selectedOptionIds: [],
  isShowingResult: false,
  isAutoAdvancing: false,
  isLoading: false,
};

export const useQuizStore = create<QuizStore>()(
  persist(
    (set, get) => ({
      ...initialSessionState,
      ...initialTransientState,

      setUserId: (id: string): void => {
        set({ userId: id });
      },

      startQuiz: async (quizConfig: QuizConfig): Promise<void> => {
        set({ isLoading: true });

        try {
          const rawQuestions = quizConfig.topicId === 'all' || !quizConfig.topicId
            ? await getAllQuestions() 
            : await getQuestionsByTopic(quizConfig.topicId);

          const questionIds = rawQuestions.map(q => q.id);
          const stats = await getUserStatsForQuestions(questionIds);

          // Categorizamos
          const unseen: Question[] = [];
          const failed: Question[] = [];
          const correct: Question[] = [];

          rawQuestions.forEach(q => {
            const stat = stats.find(s => s.question_id === q.id);
            if (!stat || stat.times_answered === 0) {
              unseen.push(q);
            } else if (stat.times_correct < stat.times_answered) {
              failed.push(q);
            } else {
              correct.push(q);
            }
          });

          // Selección con pesos: 50% Nuevas, 30% Falladas, 20% Acertadas
          const totalTarget = quizConfig.questionCount || 10;
          const targetUnseen = Math.ceil(totalTarget * 0.5); // 5
          const targetFailed = Math.ceil(totalTarget * 0.3); // 3
          // targetCorrect is the rest

          // Función para elegir aleatoriamente de un pool
          const pickFromPool = (pool: Question[], count: number) => {
            return [...pool].sort(() => Math.random() - 0.5).slice(0, Math.max(0, count));
          };

          const isTest = typeof window !== 'undefined' && document.cookie.includes('test_session');
          let finalSelection: Question[] = [];

          if (isTest) {
            finalSelection = rawQuestions;
          } else {
            // 1. Intentamos pillar las Nuevas
            const pickedUnseen = pickFromPool(unseen, targetUnseen);
            finalSelection = [...finalSelection, ...pickedUnseen];

            // 2. Intentamos pillar las Falladas
            // Si faltaron nuevas, las sumamos al cupo de falladas
            const extraForFailed = targetUnseen - pickedUnseen.length;
            const pickedFailed = pickFromPool(failed, targetFailed + extraForFailed);
            finalSelection = [...finalSelection, ...pickedFailed];

            // 3. Intentamos pillar las Acertadas
            // El resto hasta llegar al total
            const remainingToFill = totalTarget - finalSelection.length;
            const pickedCorrect = pickFromPool(correct, remainingToFill);
            finalSelection = [...finalSelection, ...pickedCorrect];

            // 4. Si aún no llegamos al total (porque hay pocas preguntas en el tema)
            // Rellenamos con cualquier cosa que falte de los pools
            if (finalSelection.length < totalTarget) {
              const currentIds = new Set(finalSelection.map(q => q.id));
              const others = rawQuestions.filter(q => !currentIds.has(q.id));
              const fill = pickFromPool(others, totalTarget - finalSelection.length);
              finalSelection = [...finalSelection, ...fill];
            }
          }

          // Mezcla final para que no salgan por bloques de categorías
          // NOTA: Desactivamos el shuffle en modo test para que sea determinista
          const shuffled = isTest ? finalSelection : finalSelection.sort(() => Math.random() - 0.5);

          set({
            ...initialTransientState,
            config: quizConfig,
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
        } catch (error) {
          console.error('Error starting weighted quiz:', error);
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

      evaluateAnswer: (): void => {
        const { selectedOptionIds, questions, questionStartTime, score, userAnswers } = get();
        if (selectedOptionIds.length === 0 || questions.length === 0) return;

        const currentQuestion = questions[0];
        const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
        
        let points = 0;
        let isCorrect = false;

        if (currentQuestion.tipo === 'multiple') {
          const correctOptions = currentQuestion.opciones.filter(o => o.es_correcta);
          const totalCorrect = correctOptions.length;
          const totalIncorrect = currentQuestion.opciones.length - totalCorrect;
          
          const posPointsPerOption = 1 / totalCorrect;
          const negPointsPerOption = totalIncorrect > 0 ? 0.25 / totalIncorrect : 0;

          let partialScore = 0;
          selectedOptionIds.forEach(id => {
            const opt = currentQuestion.opciones.find(o => o.id === id);
            if (opt?.es_correcta) {
              partialScore += posPointsPerOption;
            } else {
              partialScore -= negPointsPerOption;
            }
          });
          
          points = partialScore;
          // Consideramos "correcto" si ha marcado todas las que son y ninguna de las que no
          // lo cual daría exactamente 1 punto
          isCorrect = Math.abs(partialScore - 1) < 0.01;
        } else {
          // Simple: solo tomamos la primera (o única) selección
          const selectedId = selectedOptionIds[0];
          const selectedOption = currentQuestion.opciones.find(o => o.id === selectedId);
          isCorrect = !!selectedOption?.es_correcta;
          points = isCorrect ? 1 : -0.25;
        }

        const answer: UserAnswer = {
          question: currentQuestion,
          selectedOptionIds,
          isCorrect,
          timeSpent,
        };

        const existingIndex = userAnswers.findIndex(a => a.question.id === currentQuestion.id);
        const newUserAnswers = [...userAnswers];
        
        if (existingIndex !== -1) {
          newUserAnswers[existingIndex] = answer;
        } else {
          newUserAnswers.push(answer);
        }

        set({
          isShowingResult: true,
          isAutoAdvancing: true,
          score: score + points,
          userAnswers: newUserAnswers,
        });
      },

      skipQuestion: (): void => {
        const { questions, userAnswers, questionStartTime } = get();
        if (questions.length === 0) return;

        const currentQuestion = questions[0];
        const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);

        // Registramos el salto si no existía ya
        const existingIndex = userAnswers.findIndex(a => a.question.id === currentQuestion.id);
        const newUserAnswers = [...userAnswers];
        
        if (existingIndex === -1) {
          newUserAnswers.push({
            question: currentQuestion,
            selectedOptionIds: [],
            isCorrect: false,
            timeSpent,
          });
        }

        // Movemos la pregunta actual al final de la cola
        const remaining = questions.filter(q => q.id !== currentQuestion.id);
        const reorderedQuestions = [...remaining, currentQuestion];

        set({
          questions: reorderedQuestions,
          userAnswers: newUserAnswers,
          selectedOptionIds: [],
          isShowingResult: false,
          isAutoAdvancing: false,
          questionStartTime: Date.now(),
        });
      },

      advance: (): void => {
        const { questions, userAnswers, isFinished } = get();
        if (isFinished || questions.length === 0) return;

        // Buscamos la respuesta correspondiente a la pregunta que está actualmente en el índice 0
        const currentQuestionInQueue = questions[0];
        const currentAnswer = userAnswers.find(a => a.question.id === currentQuestionInQueue.id);
        
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
      skipHydration: true,
      partialize: (state) => ({
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
