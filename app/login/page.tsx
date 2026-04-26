import LoginPage from "@/components/auth/LoginPage";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If user is already logged in, send them to the home page
  if (user) {
    redirect("/");
  }

  return <LoginPage />;
}
