'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QuestionCard } from './QuestionCard'
import { QuizControls } from './QuizControls'
import { StatsBar } from './StatsBar'
import { useQuizStore } from '@/lib/store/quiz-store'

export const Quiz = () => {
  const { 
    currentQuestions, 
    currentIndex,
    userAnswers,
    isComplete,
    isPaused,
    timeLeft,
    config,
    nextQuestion,
    previousQuestion,
    togglePause,
    saveSession
  } = useQuizStore()

  const [hasAutoSaved, setHasAutoSaved] = useState(false)

  // Auto-save on completion
  useEffect(() => {
    if (isComplete && !hasAutoSaved) {
      saveSession().then(() => setHasAutoSaved(true))
    }
  }, [isComplete, hasAutoSaved, saveSession])

  if (!currentQuestions.length) return null

  const currentQuestion = currentQuestions[currentIndex]
  const currentAnswer = userAnswers.find(a => a.questionId === currentQuestion.id)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <StatsBar />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <QuestionCard 
            question={currentQuestion}
            answer={currentAnswer}
          />
        </motion.div>
      </AnimatePresence>

      <QuizControls 
        onNext={nextQuestion}
        onPrevious={previousQuestion}
        onPause={togglePause}
        isFirst={currentIndex === 0}
        isLast={currentIndex === currentQuestions.length - 1}
        isPaused={isPaused}
      />
    </div>
  )
}
