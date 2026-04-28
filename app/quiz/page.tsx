import { Suspense } from "react";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth/getUser";
import { getQuizQuestionsAction } from "@/lib/application/actions/quiz-actions";
import { QuizManager } from "@/components/quiz/QuizManager";
import { QuizMode } from "@/types";

interface QuizPageProps {
  searchParams: Promise<{
    mode?: string;
    topics?: string;
  }>;
}

export default async function QuizPage({ searchParams }: QuizPageProps) {
  const user = await verifySession();
  const params = await searchParams;

  const mode = (params.mode as QuizMode) || 'standard';
  const topicIds = params.topics ? params.topics.split(',') : [];

  const questions = await getQuizQuestionsAction(topicIds, mode === 'timed' ? 10 : 50, user.id);

  if (questions.length === 0) {
    redirect('/?error=no_questions');
  }

  return (
    <main className="flex flex-col w-full h-full items-center justify-center relative z-10 p-4">
      <Suspense fallback={<QuizLoading />}>
         <QuizManager 
            userId={user.id} 
            initialQuestions={questions} 
            mode={mode} 
            topicIds={topicIds} 
          />
      </Suspense>
    </main>
  );
}

function QuizLoading() {
  return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-foreground/50 font-medium animate-pulse">Cargando simulacro...</p>
    </div>
  );
}
