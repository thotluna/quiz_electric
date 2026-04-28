\"use client\";

import { ClientOption, QuestionType } from \"@/types\";

interface OptionButtonProps {
  option: ClientOption;
  isSelected: boolean;
  isDisabled: boolean;
  isCorrect?: boolean;
  isIncorrect?: boolean;
  type: QuestionType;
  onClick: (id: number) => void;
}

export const OptionButton = ({
  option,
  isSelected,
  isDisabled,
  isCorrect,
  isIncorrect,
  type,
  onClick
}: OptionButtonProps): JSX.Element => {
  return (
    <button
      disabled={isDisabled}
      onClick={() => onClick(option.id)}
      className={`
        w-full text-left p-4 rounded-xl border-2 transition-all duration-200 relative group
        ${isSelected
          ? isCorrect
            ? \"border-status-correct bg-status-correct/10 shadow-[0_0_15px_rgba(34,197,94,0.2)]\"
            : isIncorrect
              ? \"border-status-incorrect bg-status-incorrect/10 shadow-[0_0_15px_rgba(239,68,68,0.2)]\"
              : \"border-accent-primary bg-accent-primary/10 shadow-[0_0_15px_rgba(99,102,241,0.2)]\"
          : \"border-foreground/5 bg-surface-card hover:border-foreground/20 hover:bg-foreground/[0.02] shadow-sm\"
        }
        ${isDisabled && !isSelected ? \"opacity-50\" : \"\"}
      `}
    >
      <div className=\"flex items-center gap-4\">
        <div className={`
          shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors
          ${isSelected
            ? isCorrect
              ? \"border-status-correct bg-status-correct\"
              : isIncorrect
                ? \"border-status-incorrect bg-status-incorrect\"
                : \"border-accent-primary bg-accent-primary\"
            : \"border-foreground/10\"
          }
        `}>
          {isSelected && (
            <svg className=\"w-4 h-4 text-white\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\" strokeWidth={4}>
              <path strokeLinecap=\"round\" strokeLinejoin=\"round\" d=\"M5 13l4 4L19 7\" />
            </svg>
          )}
        </div>
        <span className={`
          font-bold text-sm md:text-base leading-tight transition-colors
          ${isSelected
            ? isCorrect
              ? \"text-status-correct\"
              : isIncorrect
                ? \"text-status-incorrect\"
                : \"text-accent-primary\"
            : \"text-foreground/70 group-hover:text-foreground\"
          }
        `}>
          {option.respuesta}
        </span>
      </div>
    </button>
  );
};
