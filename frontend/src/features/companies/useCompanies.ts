import { useQuery } from '@tanstack/react-query';
import { getCompanyPrep, getSupportedCompanies } from './companiesApi';
import type { CompanyPrep } from './companiesTypes';

export function useSupportedCompanies() {
  return useQuery({
    queryKey: ['companies', 'supported'],
    queryFn: getSupportedCompanies,
    staleTime: 24 * 60 * 60 * 1000
  });
}

export function useCompanyPrep(company: string | null) {
  return useQuery<CompanyPrep>({
    queryKey: ['companies', 'prep', company],
    queryFn: () => getCompanyPrep(company as string),
    enabled: Boolean(company),
    staleTime: 24 * 60 * 60 * 1000
  });
}
