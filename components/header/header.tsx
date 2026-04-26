import { createClient } from "@/lib/supabase/server";
import UserMenu from "../auth/UserMenu";
import { ButtonStats } from "./ButtonStats";

export async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return (
    <header className="grid grid-cols-2 md:flex md:justify-between items-center border-b border-border p-4 pb-4 relative w-full ">

      <div className="flex flex-col items-left">
        <h1 className="text-xl md:text-2xl font-black tracking-tighter uppercase italic text-transparent bg-clip-text bg-linear-to-r from-primary to-cyan-400 drop-shadow-[0_0_10px_var(--neon-color)] leading-none">
          Quiz Electric
        </h1>
        <p className="hidden md:block text-[8px] font-bold text-foreground/30 uppercase tracking-[0.2em] mt-0.5">
          REBT · Nivel Profesional
        </p>
      </div>

      <div className="flex justify-end items-center gap-2">
        {user && (
          <>
            <ButtonStats />
            <UserMenu />
          </>
        )}
      </div>
    </header>
  );
}   