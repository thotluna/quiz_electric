"use client";

import React, { useEffect, useRef } from "react";
import { useQuizStore } from "@/lib/store/quiz-store";
import { QuestionCard } from "./QuestionCard";
import { OptionButton } from "./OptionButton";
import { QuizControls } from "./QuizControls";
import { StatsBar } from "./StatsBar";
import { QuizResults } from "./QuizResults";
import { saveQuizResults } from "@/lib/actions/stats";

const TIMED_MODE_SECONDS = 180;

export const Quiz = (): React.ReactElement => {
  const config = useQuizStore((s) => s.config);
  const questions = useQuizStore((s) => s.questions);
  const currentIndex = useQuizStore((s) => s.currentIndex);
  const selectedOptionIds = useQuizStore((s) => s.selectedOptionIds);
  const isShowingResult = useQuizStore((s) => s.isShowingResult);
  const isFinished = useQuizStore((s) => s.isFinished);
  const score = useQuizStore((s) => s.score);
  const timeElapsed = useQuizStore((s) => s.timeElapsed);
  const isTimeOut = useQuizStore((s) => s.isTimeOut);
  const isAutoAdvancing = useQuizStore((s) => s.isAutoAdvancing);
  const userAnswers = useQuizStore((s) => s.userAnswers);

  const selectOption = useQuizStore((s) => s.selectOption);
  const toggleOption = useQuizStore((s) => s.toggleOption);
  const evaluateAnswer = useQuizStore((s) => s.evaluateAnswer);
  const skipQuestion = useQuizStore((s) => s.skipQuestion);
  const advance = useQuizStore((s) => s.advance);
  const resetQuiz = useQuizStore((s) => s.resetQuiz);
  const tick = useQuizStore((s) => s.tick);
  const setIsAutoAdvancing = useQuizStore((s) => s.setIsAutoAdvancing);

  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isInfinite = config?.mode === "infinite";
  const timeLeft = config?.mode === "timed" ? TIMED_MODE_SECONDS - timeElapsed : 0;

  // Efecto para el temporizador
  useEffect(() => {
    if (isFinished || isAutoAdvancing) return;

    const interval = setInterval(() => {
      const timeRanOut = tick();
      if (timeRanOut) {
        console.log('Time out! Saving progress:', userAnswers);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isFinished, isAutoAdvancing, tick, userAnswers]);

  // Efecto para guardar resultados automáticamente cuando el test termina
  useEffect(() => {
    if (isFinished && userAnswers.length > 0) {
      console.log(`Finalizando test. Guardando ${userAnswers.length} respuestas.`);
      saveQuizResults(userAnswers, config!, score, timeElapsed).then(res => {
        console.log('Save result:', res);
        if (!res.success) {
          alert('Error al guardar estadísticas: ' + res.error);
        }
      });
    }
  }, [isFinished, userAnswers, config, score, timeElapsed]);

  if (!questions || questions.length === 0) {
    return (
      <div className="text-center p-12 bg-surface-card rounded-2xl border-2 border-foreground/5 space-y-6">
        <p className="text-foreground/50">No hay preguntas disponibles para este tema.</p>
        <button onClick={resetQuiz} className="px-6 py-2 rounded-xl bg-accent-primary text-white font-bold">
          Volver al inicio
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex % questions.length];
  const isMultiple = currentQuestion.tipo === "multiple";

  // En caso de múltiple, podemos mostrar explicaciones de todas las seleccionadas 
  // o solo un bloque general. Por simplicidad, tomaremos la explicación de la primera seleccionada 
  // que sea incorrecta, o la primera si todas son correctas.
  const selectedOptions = currentQuestion.opciones.filter(opt => selectedOptionIds.includes(opt.id));
  const firstIncorrect = selectedOptions.find(o => !o.es_correcta);
  const selectedOption = firstIncorrect || selectedOptions[0];

  const handleNext = (): void => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
    }

    if (!isShowingResult) {
      evaluateAnswer();

      // Esperamos 3 segundos de feedback antes de avanzar automáticamente
      autoAdvanceTimerRef.current = setTimeout(() => {
        advance();
      }, 3000);
    } else {
      setIsAutoAdvancing(false);
      advance();
    }
  };

  const handleReset = (): void => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
    }
    resetQuiz();
  };

  if (isFinished) {
    return (
      <QuizResults
        userAnswers={userAnswers}
        timeElapsed={timeElapsed}
        totalQuestions={useQuizStore.getState().initialQuestions.length}
        score={score}
        isTimeOut={isTimeOut}
        onReset={handleReset}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-surface-card rounded-2xl p-4 md:p-6 shadow-xl border border-foreground/5 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={handleReset}
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

        {(() => {
          const answeredCount = userAnswers.filter(a => a.selectedOptionIds.length > 0).length;
          const total = useQuizStore.getState().initialQuestions.length;
          const displayIndex = Math.min(answeredCount + 1, total);

          return (
            <>
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
            </>
          );
        })()}

        <div className="space-y-2 mt-4">
          {currentQuestion.opciones.map((option) => {
            const isSelected = selectedOptionIds.includes(option.id);
            const isCorrect = isShowingResult && isSelected && option.es_correcta;
            const isIncorrect = isShowingResult && isSelected && !option.es_correcta;

            return (
              <OptionButton
                key={option.id}
                option={option}
                isSelected={isSelected}
                isDisabled={isShowingResult}
                isCorrect={isCorrect}
                isIncorrect={isIncorrect}
                type={currentQuestion.tipo}
                onClick={isMultiple ? toggleOption : selectOption}
              />
            );
          })}
        </div>

        <QuizControls
          onNext={handleNext}
          onSkip={skipQuestion}
          onFinish={() => {
            useQuizStore.getState().finishQuiz();
          }}
          showFinish={userAnswers.length >= useQuizStore.getState().initialQuestions.length}
          hasSelected={selectedOptionIds.length > 0}
          isShowingResult={isShowingResult}
          isAutoAdvancing={isAutoAdvancing}
          isCorrect={userAnswers.find(a => a.question.id === currentQuestion.id)?.isCorrect}
          isLastQuestion={!isInfinite && currentIndex === questions.length - 1}
          explanation={selectedOption?.explicacion}
        />
      </div>

      <div className="text-center mt-4">
        <p className="text-[10px] text-foreground/30 font-medium uppercase tracking-widest">
          {config?.mode === "timed" ? "🏁 Entrenamiento Contra Reloj" : config?.mode === "infinite" ? "♾️ Entrenamiento Infinito" : "📋 Simulacro Estándar"}
        </p>
      </div>
    </div>
  );
};
