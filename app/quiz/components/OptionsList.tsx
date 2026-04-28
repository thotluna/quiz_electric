\"use client\";

import { useQuizStore } from \"@/lib/store/quiz-store\";
import { OptionButton } from \"./OptionButton\";

export const OptionsList = (): JSX.Element | null => {
  const currentIndex = useQuizStore((s) => s.currentIndex);
  const questions = useQuizStore((s) => s.questions);
  const selectedOptionIds = useQuizStore((s) => s.selectedOptionIds);
  const isShowingResult = useQuizStore((s) => s.isShowingResult);
  const userAnswers = useQuizStore((s) => s.userAnswers);
  const selectOption = useQuizStore((s) => s.selectOption);
  const toggleOption = useQuizStore((s) => s.toggleOption);

  const currentQuestion = questions[currentIndex];

  if (!currentQuestion) return null;

  const currentAnswer = userAnswers.find(a => a.questionId === currentQuestion.id);

  return (
    <div className=\"space-y-2 mt-4\">
      {currentQuestion.opciones.map((option) => {
        const isSelected = selectedOptionIds.includes(option.id);
        const isCorrect = isShowingResult && isSelected && currentAnswer?.isCorrect;
        const isIncorrect = isShowingResult && isSelected && !currentAnswer?.isCorrect;

        return (
          <OptionButton
            key={option.id}
            option={option}
            isSelected={isSelected}
            isDisabled={isShowingResult}
            isCorrect={isCorrect}
            isIncorrect={isIncorrect}
            type={currentQuestion.tipo}
            onClick={(id) => {
              if (currentQuestion.tipo === \"multiple\") {
                toggleOption(id);
              } else {
                selectOption(id);
              }
            }}
          />
        );
      })}
    </div>
  );
};
