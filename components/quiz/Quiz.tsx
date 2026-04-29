"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ClientQuestion } from "@/lib/domain/entities/Question";
import { UserAnswer, QuizConfig } from "@/types";
import { OptionButton } from "./OptionButton";
import { QuizResults } from "./QuizResults";
import { saveQuizSessionAction } from "@/lib/actions/stats";
import { evaluateAnswerAction } from "@/lib/application/actions/quiz-actions";
import { StatsBar } from "./StatsBar";
import { QuizControls } from "./QuizControls";

const TIMED_MODE_SECONDS = 180;

interface QuizProps {
  questions: ClientQuestion[];
  config: QuizConfig;
  userId: string | null;
}

export const Quiz: React.FC<QuizProps> = ({ questions, config, userId }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const [isShowingResult, setIsShowingResult] = useState(false);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(config.mode === 'timed' ? TIMED_MODE_SECONDS : 0);
  const [score, setScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [currentEvaluation, setCurrentEvaluation] = useState<{ isCorrect: boolean, explanation?: string } | null>(null);

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (config.mode === 'timed' && !isFinished) {
      timer = setInterval(() => {
        setTimeLeft(prev => Math.max(0, prev - 1));
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    } else if (config.mode !== 'timed' && !isFinished) {
      timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }

    if (config.mode === 'timed' && timeLeft === 0 && !isFinished) {
      setIsFinished(true);
    }

    return () => clearInterval(timer);
  }, [timeLeft, isFinished, config.mode]);

  useEffect(() => {
    if (isFinished && userAnswers.length > 0 && config) {
      saveQuizSessionAction(config, userAnswers).catch(console.error);
    }
  }, [isFinished, userAnswers, config]);

  const handleOptionClick = (optionId: string) => {
    if (isShowingResult) return;

    if (currentQuestion.tipo === 'multiple') {
      setSelectedOptionIds(prev => 
        prev.includes(optionId) 
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelectedOptionIds([optionId]);
    }
  };

  const handleEvaluate = async () => {
    if (selectedOptionIds.length === 0) return;
    
    const result = await evaluateAnswerAction(currentQuestion.id, selectedOptionIds);
    
    setCurrentEvaluation({
      isCorrect: result.isCorrect,
      explanation: result.explanation
    });

    const newAnswer: UserAnswer = {
      question: currentQuestion,
      selectedOptionIds,
      isCorrect: result.isCorrect,
      points: result.score,
      timeSpent: 0,
      correctIds: result.correctIds,
      explanation: result.explanation
    };

    setUserAnswers(prev => [...prev, newAnswer]);
    setScore(prev => prev + result.score);
    setIsShowingResult(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOptionIds([]);
      setIsShowingResult(false);
      setCurrentEvaluation(null);
    } else {
      setIsFinished(true);
    }
  };

  const handleSkip = () => {
    const skippedAnswer: UserAnswer = {
      question: currentQuestion,
      selectedOptionIds: [],
      isCorrect: false,
      points: 0,
      timeSpent: 0
    };
    setUserAnswers(prev => [...prev, skippedAnswer]);
    handleNext();
  };

  if (isFinished) {
    return (
      <QuizResults 
        userAnswers={userAnswers} 
        timeElapsed={timeElapsed}
        totalQuestions={questions.length}
        score={score}
        onReset={() => window.location.reload()} 
      />
    );
  }

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto gap-6 p-4">
      <StatsBar 
        timeElapsed={config.mode === 'timed' ? timeLeft : timeElapsed}
        correctAnswers={userAnswers.filter(a => a.isCorrect).length}
        currentQuestion={currentQuestionIndex + 1}
        totalQuestions={questions.length}
        isCountdown={config.mode === 'timed'}
      />

      <div className="bg-surface-card rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">
            Pregunta {currentQuestionIndex + 1}
          </span>
          <h2 className="text-xl font-semibold text-slate-900 leading-tight">
            {currentQuestion.pregunta}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {currentQuestion.opciones.map((option) => {
            const isSelected = selectedOptionIds.includes(option.id);
            const isCorrect = isShowingResult && currentEvaluation?.isCorrect && isSelected;
            const isIncorrect = isShowingResult && !currentEvaluation?.isCorrect && isSelected;

            return (
              <OptionButton
                key={option.id}
                option={option}
                isSelected={isSelected}
                isDisabled={isShowingResult}
                isCorrect={isCorrect}
                isIncorrect={isIncorrect}
                onClick={() => handleOptionClick(option.id)}
              />
            );
          })}
        </div>
      </div>

      <QuizControls 
        onNext={isShowingResult ? handleNext : handleEvaluate}
        onSkip={handleSkip}
        onFinish={() => setIsFinished(true)}
        showFinish={currentQuestionIndex === questions.length - 1}
        hasSelected={selectedOptionIds.length > 0}
        isShowingResult={isShowingResult}
        isAutoAdvancing={false}
        isCorrect={currentEvaluation?.isCorrect}
        isLastQuestion={currentQuestionIndex === questions.length - 1}
        explanation={currentEvaluation?.explanation}
      />
    </div>
  );
};
