'use client'

import { useQuestionDisplay } from "@/hooks/useQuestionDisplay";

export default function QuestionDisplay() {
  const { currentQuestion, selectOption, selectedOptionIds, isCorrectAnswer } = useQuestionDisplay()


  return (
    <section className="flex flex-col w-full items-center px-4  ">
      <article className=" rounded-xl rounded-b-none  w-full p-4 border-2 border-white/60">
        <h2 className="text-2xl font-bold ">{currentQuestion?.pregunta}</h2>
      </article>
      <article className="flex flex-col w-full gap-1 mt-4">
        {currentQuestion?.opciones.map((option) => {
          const isSelected = selectedOptionIds.includes(option.id);
          const inputType = currentQuestion.tipo === 'multiple' ? 'checkbox' : 'radio';

          return (
            <label
              key={option.id}
              className={`
                flex items-center gap-1 p-4 rounded-xl border-2 transition-all cursor-pointer
                ${isSelected
                  ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                  : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'}
                ${isCorrectAnswer == false && isSelected ? 'bg-red-500/10 border-red-500' : ''}
                ${isCorrectAnswer && isSelected ? 'bg-green-500/10 border-green-500' : ''}
              `}
            >
              <div className="flex items-center justify-center">
                <input
                  type={inputType}
                  name="quiz-option"
                  value={option.id}
                  checked={isSelected}
                  onChange={() => selectOption(option.id)}
                  className="peer hidden"
                />
                <div className={`
                  w-6 h-6 border-2 flex items-center justify-center transition-all
                  ${currentQuestion.tipo === 'multiple' ? 'rounded-md' : 'rounded-full'}
                  ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-white/30'}
                `}>
                  {isSelected && (
                    <div className="w-2 h-2 bg-white rounded-full animate-in zoom-in duration-200" />
                  )}
                </div>
              </div>
              <span className={` transition-colors ${isSelected ? 'text-white' : 'text-white/70'}`}>
                {option.texto}
              </span>
            </label>
          );
        })}
      </article>
    </section>
  );
}