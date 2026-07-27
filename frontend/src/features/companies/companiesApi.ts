import { api } from '../../lib/api';
import type { CompanyPrep } from './companiesTypes';

export async function getSupportedCompanies(): Promise<string[]> {
  const response = await api.get<{ companies: string[] }>('/companies/companies');
  return response.data.companies;
}

export async function getCompanyPrep(company: string): Promise<CompanyPrep> {
  const response = await api.get<CompanyPrep>('/companies/prep', {
    params: { company }
  });
  return response.data;
}
