import { getQuizQuestionsAction } from "@/lib/application/actions/quiz-actions";
import { verifySession } from "@/lib/auth/getUser";
import { QuizMode } from "@/types";
import { redirect } from "next/navigation";
import StatQuiz from "./components/StatQuiz";
import QuestionDisplay from "./components/QuestionDisplay";
import BottonBoxQuiz from "./components/BottonBoxQuiz";
import { Suspense } from "react";
import QuizInitializer from "./components/QuizInitializer";
import Comments from "./components/Comments";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function QuizPage2({ searchParams }: PageProps) {
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
    <>
      <QuizInitializer mode={mode} topicIds={topics} questions={questions} />
      <main className="flex flex-col w-full h-full  gap-1 ">
        <Suspense fallback={<div>Loading...</div>}>
          <StatQuiz />
        </Suspense>
        <Suspense fallback={<div>Loading...</div>}>
          <QuestionDisplay />
        </Suspense>
        <Suspense fallback={<div>Loading...</div>}>
          <BottonBoxQuiz />
        </Suspense>
        <Suspense fallback={<div>Loading...</div>}>
          <Comments />
        </Suspense>
      </main>
    </>
  );
}