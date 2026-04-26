import { getTopics } from "@/lib/queries/questions";
import { getUser, verifySession } from "@/lib/auth/getUser";
import { QuizHome } from "@/components/quiz/QuizHome";

export default async function Home(props: { searchParams: Promise<{ test_session?: string }> }) {
  const searchParams = await props.searchParams;

  // La Home es una ruta protegida
  const user = await verifySession();

  const topics = await getTopics();

  return (
    <QuizHome user={user} topics={topics} />
  );
}
