'use client';

import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuizConfigStore } from "@/lib/store/quiz-config-store";

export function GoQuizBotton() {
  const router = useRouter();
  const { mode, topicIds } = useQuizConfigStore();

  function handleStart(): void {
    const params = new URLSearchParams();
    params.set('mode', mode);
    
    if (topicIds.length > 0) {
      params.set('topics', topicIds.join(','));
    }

    router.push(`/quiz?${params.toString()}`);
  }

  return (
    <button
      onClick={handleStart}
      className="w-full py-3 mt-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-[10px] transition-all flex items-center justify-center gap-3 group shadow-lg shadow-primary/20 tracking-widest"
    >
      <span>EMPEZAR SIMULACRO PROFESIONAL</span>
      <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" />
    </button>
  );
}