import TopicRadarChart from '../components/charts/TopicRadarChart';
import StrongTopicsList from '../components/topics/StrongTopicsList';
import NeedImprovementList from '../components/topics/NeedImprovementList';
import { useTopicPerformance } from '../features/topics/useTopicPerformance';

export default function TopicAnalysis() {
  const { data, isLoading, error } = useTopicPerformance();
  const performance = data ?? [];

  if (error) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-[var(--destructive)]">
        Failed to load topic performance.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">Topic Analysis</h1>
        <p className="text-[var(--muted-foreground)]">
          See which topics you excel at and where to focus.
        </p>
      </div>

      <TopicRadarChart data={performance} isLoading={isLoading} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <StrongTopicsList topics={performance} isLoading={isLoading} />
        <NeedImprovementList topics={performance} isLoading={isLoading} />
      </div>
    </div>
  );
}
