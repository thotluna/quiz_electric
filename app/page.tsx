import { getTopics } from "@/lib/queries/questions";
import { createClient } from "@/lib/supabase/server";
import LoginPage from "@/components/auth/LoginPage";
import { QuizHome } from "@/components/quiz/QuizHome";
import { User } from "@supabase/supabase-js";

export default async function Home(props: { searchParams: Promise<{ test_session?: string }> }) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Bypass para tests E2E en entorno de desarrollo
  let finalUser = user;
  if (!user && searchParams.test_session && process.env.NODE_ENV === 'development') {
    finalUser = { id: 'test-user-123', email: 'test@example.com' } as User;
  }

  if (!finalUser) {
    return <LoginPage />;
  }

  const topics = await getTopics();
  return <QuizHome user={finalUser} topics={topics} />;
}
