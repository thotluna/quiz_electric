import { Suspense } from "react";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth/getUser";
import { getQuizQuestionsAction } from "@/lib/application/actions/quiz-actions";
import { QuizManager } from "@/components/quiz/QuizManager";
import { QuizMode } from "@/types";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function QuizPage({ searchParams }: PageProps) {
  const user = await verifySession();
  const data = await searchParams;
  
  const topics = data.topics
    ? (data.topics as string).split(',')
    : [];
    
  const mode = (data.mode as QuizMode) || 'standard';

  const questions = await getQuizQuestionsAction(topics, mode === 'timed' ? 10 : 50, user.id);

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
            topicIds={topics} 
          />
      </Suspense>
    </main>
  );
}

function QuizLoading() {
  return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <div className="w-12 h-12 border-4 border-accent-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-foreground/50 font-medium animate-pulse">Cargando simulacro...</p>
    </div>
  );
}
