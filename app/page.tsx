import { getTopics } from "@/lib/queries/questions";
import { createClient } from "@/lib/supabase/server";
import LoginPage from "@/components/auth/LoginPage";
import { QuizHome } from "@/components/quiz/QuizHome";
import * as fs from "fs";
import * as path from "path";

export default async function Home(props: { searchParams: Promise<{ test_session?: string }> }) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();

  let user = supabaseUser;
  let topics;

  // Bypass para tests E2E en entorno de desarrollo
  if (!user && process.env.NODE_ENV === 'development' && searchParams.test_session) {
    user = { id: 'test-user-123', email: 'test@example.com' } as never;
    
    // Cargamos temas del mock directamente para que coincidan con el test
    try {
      const mockPath = path.join(process.cwd(), "tests/mocks/db.mock.json");
      const mockData = JSON.parse(fs.readFileSync(mockPath, "utf-8"));
      topics = mockData.map((t: { id: string; itc: string }) => ({ id: t.id, itc: t.itc }));
    } catch (e) {
      console.error("Error loading mock topics:", e);
      topics = await getTopics();
    }
  } else {
    if (!user) {
      return <LoginPage />;
    }
    topics = await getTopics();
  }

  return <QuizHome user={user} topics={topics} />;
}
