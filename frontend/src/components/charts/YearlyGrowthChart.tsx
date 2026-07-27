import { useGrowth } from '../../features/analytics/useGrowth';
import GrowthChart from './GrowthChart';

export default function YearlyGrowthChart() {
  const { data, isLoading, error } = useGrowth('yearly');

  return (
    <GrowthChart
      title="Yearly Growth"
      labels={data?.labels ?? []}
      data={data?.data ?? []}
      isLoading={isLoading}
      error={error ?? null}
    />
  );
}
