import { Suspense } from "react";
import { JsonQuestionRepository } from "@/lib/infrastructure/repositories/JsonQuestionRepository";
import { verifySession } from "@/lib/auth/getUser";
import { SectionSetup } from "@/app/components/SectionSetup";
import { QuizTopics } from "@/app/components/QuizTopics";
import { QuizConfigSync } from "@/app/components/QuizConfigSync";
import { GoQuizBotton } from "@/app/components/GoQuizBotton";
import { QuizModes } from "@/app/components/QuizModes";

export default async function Home() {
  const user = await verifySession();
  const repo = new JsonQuestionRepository();
  const topics = await repo.getAllTopics();

  return (
    <main className="flex flex-col w-full h-full justify-start gap-6 py-4 p-4 animate-in fade-in duration-500">
      <QuizConfigSync userId={user.id} />
      <SectionSetup title="Modo de examen">
        <Suspense fallback={<ModesSkeleton />}>
          <QuizModes />
        </Suspense>
      </SectionSetup>

      <SectionSetup title="Temas">
        <Suspense fallback={<TopicsSkeleton />}>
          <QuizTopics topics={topics} />
        </Suspense>
      </SectionSetup>

      <GoQuizBotton />
    </main>
  );
}

function ModesSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-16 rounded-xl bg-card/50 border border-border/50 animate-pulse" />
      ))}
    </div>
  );
}

function TopicsSkeleton() {
  return (
    <div className="bg-card/30 border border-border rounded-xl p-3">
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
        <div className="col-span-2 h-8 rounded-lg bg-card/50 animate-pulse" />
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-8 rounded-lg bg-card/50 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
