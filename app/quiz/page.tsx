import { QuestionCard } from "@/app/quiz/components/QuestionCard";
import { QuizControls } from "@/app/quiz/components/QuizControls";
import { StatsBar } from "@/app/quiz/components/StatsBar";
import { OptionsList } from "@/app/quiz/components/OptionsList";
import { AbandonButton } from "@/app/quiz/components/AbandonButton";
import { verifySession } from "@/lib/auth/getUser";
import { getQuestionsByTopic } from "@/lib/queries/questions";
import { QuizMode, ClientQuestion, QuizConfig } from "@/types";
import { QuizInitialization } from "@/app/quiz/components/QuizInitialization";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function QuizPage({ searchParams }: PageProps) {

  const user = await verifySession();
  const data = await searchParams;
  const topics = data.topics
    ? (data.topics as string).split(',')
    : []
  const mode = data.mode as QuizMode;

  const questions = await getQuestionsByTopic(topics, mode, user.id);

  const config: QuizConfig = {
    mode,
    topicIds: topics,
    questionCount: questions.length,
  };

  return (
    <div className="max-w-2xl mx-auto">
      <QuizInitialization
        questions={questions}
        config={config}
      />
      <div className="bg-surface-card rounded-2xl p-4 md:p-6 shadow-xl border border-foreground/5 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-4">
          <AbandonButton />
          <div className="flex items-center gap-2">
            {mode === "infinite" && (
              <span className="px-2 py-1 rounded-md bg-accent-primary/10 text-accent-primary text-[10px] font-black uppercase tracking-tighter">
                Modo Infinito
              </span>
            )}
          </div>
        </div>

        <StatsBar />

        <QuestionCard />

        <div className="space-y-2 mt-4">
          <OptionsList />
        </div>

        <QuizControls />
      </div>
    </div>
  );
}
