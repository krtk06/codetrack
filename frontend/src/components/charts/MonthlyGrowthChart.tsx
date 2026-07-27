import { useGrowth } from '../../features/analytics/useGrowth';
import GrowthChart from './GrowthChart';

export default function MonthlyGrowthChart() {
  const { data, isLoading, error } = useGrowth('monthly');

  return (
    <GrowthChart
      title="Monthly Growth"
      labels={data?.labels ?? []}
      data={data?.data ?? []}
      isLoading={isLoading}
      error={error ?? null}
    />
  );
}
