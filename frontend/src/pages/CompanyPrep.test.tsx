import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import CompanyPrep from './CompanyPrep';
import * as api from '../features/companies/companiesApi';
import type { CompanyPrep as CompanyPrepData } from '../features/companies/companiesTypes';

vi.mock('../features/companies/companiesApi', () => ({
  getSupportedCompanies: vi.fn(),
  getCompanyPrep: vi.fn()
}));

const companies = ['Google', 'Amazon', 'Microsoft', 'Meta', 'Adobe', 'Atlassian'];

const prep: CompanyPrepData = {
  company: 'Google',
  frequentTopics: ['Graphs', 'Trees', 'Dynamic Programming'],
  roadmap: [
    { phase: 'Foundations', topics: ['Arrays', 'Strings', 'Hashing'], suggestedProblems: 30 },
    { phase: 'Core DS', topics: ['Trees', 'Graphs', 'Heaps'], suggestedProblems: 40 },
    { phase: 'Advanced', topics: ['Dynamic Programming', 'Sliding Window'], suggestedProblems: 40 }
  ],
  weakTopicFocus: ['Graphs', 'Trees']
};

function Wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  return (
    <MemoryRouter>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </MemoryRouter>
  );
}

describe('CompanyPrep page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders company buttons and prep data for the first company', async () => {
    vi.mocked(api.getSupportedCompanies).mockResolvedValue(companies);
    vi.mocked(api.getCompanyPrep).mockResolvedValue(prep);

    render(<CompanyPrep />, { wrapper: Wrapper });

    await waitFor(() => expect(screen.getByText('Google')).toBeInTheDocument());
    expect(screen.getByText('Amazon')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Foundations')).toBeInTheDocument());
    expect(screen.getByText('Graphs, Trees')).toBeInTheDocument();
  });

  it('switches companies when a button is clicked', async () => {
    vi.mocked(api.getSupportedCompanies).mockResolvedValue(companies);
    vi.mocked(api.getCompanyPrep).mockImplementation(async (company) => ({
      ...prep,
      company,
      frequentTopics: company === 'Amazon' ? ['Trees', 'System Design'] : prep.frequentTopics
    }));

    render(<CompanyPrep />, { wrapper: Wrapper });

    await waitFor(() => expect(screen.getByText('Google')).toBeInTheDocument());

    await waitFor(() => expect(api.getCompanyPrep).toHaveBeenCalledWith('Google'));
  });
});
