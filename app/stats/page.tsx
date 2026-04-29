import { StatsDashboard } from "@/components/quiz/StatsDashboard";
import { getUserStatsAction } from "@/lib/actions/stats";

export default async function StatsPage() {
  const stats = await getUserStatsAction()
  return (
    <div className="min-h-screen flex flex-col p-2 md:p-4 max-w-5xl mx-auto w-full">
      <StatsDashboard stats={stats} />
    </div>
  );
}