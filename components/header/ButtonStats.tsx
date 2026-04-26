import { ChartNoAxesColumn } from "lucide-react";
import Link from "next/link"

export function ButtonStats() {

  return (
    <Link
      href="/stats"
      className="text-[9px] font-black text-foreground/40 hover:text-primary transition-colors uppercase tracking-widest px-2 py-1.5 rounded-lg hover:bg-primary/5 border border-transparent hover:border-primary/10"
    >
      <ChartNoAxesColumn />
    </Link>
  );
}