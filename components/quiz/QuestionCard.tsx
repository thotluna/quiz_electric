import { ClientQuestion } from "@/types";

interface QuestionCardProps {
  question: ClientQuestion;
  questionNumber: number;
  totalQuestions?: number;
}

export const QuestionCard = ({
  question,
  questionNumber,
  totalQuestions,
}: QuestionCardProps): React.ReactElement => {
  return (
    <div className="mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {question.tipo === "multiple" && (
        <div className="flex items-center gap-1.5 mb-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black bg-accent-primary/10 text-accent-primary border border-accent-primary/20 uppercase tracking-widest animate-pulse">
            ● Selección Múltiple
          </span>
        </div>
      )}
      <h2 className="text-lg md:text-2xl font-bold leading-tight text-foreground">
        {question.pregunta}
      </h2>
      {totalQuestions && (
        <div className="mt-4 h-1 w-full bg-foreground/5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-accent-primary transition-all duration-700 ease-out" 
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
};
