"use client";

import React, { useEffect, useRef } from "react";
import { useQuizStore } from "@/lib/store/quiz-store";
import { QuestionCard } from "./QuestionCard";
import { OptionButton } from "./OptionButton";
import { QuizControls } from "./QuizControls";
import { StatsBar } from "./StatsBar";
import { QuizResults } from "./QuizResults";
import { saveQuizStatsAction } from "@/lib/actions/stats";

const TIMED_MODE_SECONDS = 180;

export const Quiz = (): React.ReactElement => {
  const config = useQuizStore((s) => s.config);
  const questions = useQuizStore((s) => s.questions);
  const userId = useQuizStore((s) => s.userId);
  const selectedOptionIds = useQuizStore((s) => s.selectedOptionIds);
  const isShowingResult = useQuizStore((s) => s.isShowingResult);
  const isFinished = useQuizStore((s) => s.isFinished);
  const score = useQuizStore((s) => s.score);
  const timeElapsed = useQuizStore((s) => s.timeElapsed);
  const isTimeOut = useQuizStore((s) => s.isTimeOut);
  const userAnswers = useQuizStore((s) => s.userAnswers);
  const lastEvaluation = useQuizStore((s) => s.lastEvaluation);

  const selectOption = useQuizStore((s) => s.selectOption);
  const toggleOption = useQuizStore((s) => s.toggleOption);
  const evaluateAnswer = useQuizStore((s) => s.evaluateAnswer);
  const nextQuestion = useQuizStore((s) => s.nextQuestion);
  const resetQuiz = useQuizStore((s) => s.resetQuiz);
  const tick = useQuizStore((s) => s.tick);

  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isInfinite = config?.mode === "infinite";
  const timeLeft = config?.mode === "timed" ? TIMED_MODE_SECONDS - timeElapsed : 0;

  useEffect(() => {
    if (isFinished) return;

    const interval = setInterval(() => {
      tick();
    }, 1000);

    return () => clearInterval(interval);
  }, [isFinished, tick]);

  useEffect(() => {
    if (isFinished && userAnswers.length > 0 && userId && config) {
      saveQuizStatsAction(userId, userAnswers, config, score, timeElapsed).catch(console.error);
    }
  }, [isFinished, userAnswers, userId, config, score, timeElapsed]);

  if (!questions || questions.length === 0) {
    if (isFinished) {
       return (
        <QuizResults
          userAnswers={userAnswers}
          timeElapsed={timeElapsed}
          totalQuestions={useQuizStore.getState().initialQuestions.length}
          score={score}
          isTimeOut={isTimeOut}
          onReset={resetQuiz}
        />
      );
    }
    return (
      <div className="text-center p-12 bg-surface-card rounded-2xl border-2 border-foreground/5 space-y-6">
        <p className="text-foreground/50">No hay preguntas disponibles.</p>
        <button onClick={resetQuiz} className="px-6 py-2 rounded-xl bg-accent-primary text-white font-bold">
          Volver al inicio
        </button>
      </div>
    );
  }

  const currentQuestion = questions[0];
  const isMultiple = currentQuestion.tipo === "multiple";

  const handleNext = async (): Promise<void> => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
    }

    if (!isShowingResult) {
      await evaluateAnswer();

      autoAdvanceTimerRef.current = setTimeout(() => {
        nextQuestion();
      }, 3000);
    } else {
      nextQuestion();
    }
  };

  const answeredCount = userAnswers.length;
  const total = useQuizStore.getState().initialQuestions.length;
  const displayIndex = Math.min(answeredCount + 1, total);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-surface-card rounded-2xl p-4 md:p-6 shadow-xl border border-foreground/5 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={resetQuiz}
            className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest hover:text-accent-primary transition-colors"
          >
            ← Abandonar
          </button>
          <div className="flex items-center gap-2">
            {isInfinite && (
              <span className="px-2 py-1 rounded-md bg-accent-primary/10 text-accent-primary text-[10px] font-black uppercase tracking-tighter">
                Modo Infinito
              </span>
            )}
          </div>
        </div>

        <StatsBar
          timeElapsed={config?.mode === "timed" ? timeLeft : timeElapsed}
          correctAnswers={score}
          currentQuestion={displayIndex}
          totalQuestions={total}
          isCountdown={config?.mode === "timed"}
        />

        <QuestionCard
          question={currentQuestion}
          questionNumber={displayIndex}
          totalQuestions={total}
        />

        <div className="space-y-2 mt-4">
          {currentQuestion.opciones.map((option) => {
            const isSelected = selectedOptionIds.includes(option.id);
            const isCorrect = isShowingResult && lastEvaluation?.correctIds?.includes(option.id);
            const isIncorrect = isShowingResult && isSelected && !lastEvaluation?.correctIds?.includes(option.id);

            return (
              <OptionButton
                key={option.id}
                option={option}
                isSelected={isSelected}
                isDisabled={isShowingResult}
                isCorrect={!!isCorrect}
                isIncorrect={!!isIncorrect}
                type={currentQuestion.tipo}
                onClick={isMultiple ? toggleOption : selectOption}
              />
            );
          })}
        </div>

        <QuizControls
          onNext={handleNext}
          onSkip={nextQuestion}
          onFinish={(): void => {
            useQuizStore.getState().finishQuiz();
          }}
          showFinish={userAnswers.length >= total}
          hasSelected={selectedOptionIds.length > 0}
          isShowingResult={isShowingResult}
          isAutoAdvancing={false}
          isCorrect={lastEvaluation?.isCorrect}
          isLastQuestion={!isInfinite && questions.length === 1}
          explanation={lastEvaluation?.explanation}
        />
      </div>
    </div>
  );
};
