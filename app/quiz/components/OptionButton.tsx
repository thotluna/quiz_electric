"use client";

import { ClientOption, QuestionType } from "@/types";

interface OptionButtonProps {
  option: ClientOption;
  isSelected: boolean;
  isDisabled: boolean;
  isCorrect?: boolean;
  isIncorrect?: boolean;
  onClick?: (id: number) => void;
  type?: 'simple' | 'multiple';
}

export const OptionButton = ({
  option,
  isSelected,
  isDisabled,
  isCorrect,
  isIncorrect,
  onClick,
  type = 'simple',
}: OptionButtonProps) => {
  const isMultiple = type === 'multiple';

  return (
    <button
      id={`option-${option.id}`}
      data-testid={`option-${option.id}`}
      onClick={onClick ? () => onClick(option.id) : () => { }}
      disabled={isDisabled}
      className={`
        relative w-full p-3 md:p-4 mb-2 text-left transition-all duration-300 rounded-xl border-2
        ${isSelected && isCorrect
          ? "border-status-correct bg-status-correct/10 shadow-md scale-[1.01]"
          : isSelected && isIncorrect
            ? "border-status-incorrect bg-status-incorrect/10 shadow-md scale-[1.01]"
            : isSelected
              ? "border-accent-primary bg-accent-primary/5 shadow-md scale-[1.01]"
              : "border-foreground/5 bg-surface-card hover:border-accent-primary/50 hover:shadow-sm"
        }
        ${isDisabled ? "cursor-not-allowed opacity-90" : "cursor-pointer"}
        group flex flex-col gap-1
      `}
    >
      <div className="flex items-center gap-3 w-full">
        <div
          className={`
            w-5 h-5 border-2 flex items-center justify-center transition-colors shrink-0
            ${isMultiple ? "rounded-md" : "rounded-full"}
            ${isSelected && isCorrect
              ? "border-status-correct bg-status-correct"
              : isSelected && isIncorrect
                ? "border-status-incorrect bg-status-incorrect"
                : isSelected
                  ? "border-accent-primary bg-accent-primary"
                  : "border-foreground/20 group-hover:border-accent-primary/50"
            }
          `}
        >
          {isSelected && (
            <div className={`bg-background ${isMultiple ? "w-2.5 h-1.5 border-b-2 border-r-2 border-white rotate-45 mb-0.5" : "w-2 h-2 rounded-full"}`} />
          )}
        </div>
        <span
          className={`text-xs md:text-sm font-semibold ${isSelected && isCorrect
            ? "text-status-correct"
            : isSelected && isIncorrect
              ? "text-status-incorrect"
              : isSelected
                ? "text-accent-primary"
                : "text-foreground/80"
            }`}
        >
          {option.respuesta}
        </span>
      </div>
    </button>
  );
};
