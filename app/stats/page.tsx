import { StatsDashboard } from "@/components/quiz/StatsDashboard";
import { getUserStats } from "@/lib/actions/stats";
import { Header } from "@/components/header/header";

export default async function StatsPage() {
  const stats = await getUserStats()
  return (
    <div className="min-h-screen flex flex-col p-2 md:p-4 max-w-5xl mx-auto w-full">
      <StatsDashboard stats={stats} />
    </div>
  );
}