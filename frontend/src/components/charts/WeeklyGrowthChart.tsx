import { useGrowth } from '../../features/analytics/useGrowth';
import GrowthChart from './GrowthChart';

export default function WeeklyGrowthChart() {
  const { data, isLoading, error } = useGrowth('weekly');

  return (
    <GrowthChart
      title="Weekly Growth"
      labels={data?.labels ?? []}
      data={data?.data ?? []}
      isLoading={isLoading}
      error={error ?? null}
    />
  );
}
