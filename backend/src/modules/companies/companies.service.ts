import { prisma } from '../../config/database.js';
import { notFound, badRequest } from '../../common/errors.js';
import { COMPANIES, SUPPORTED_COMPANIES } from './companies.data.js';
import type { CompanyPrepResponse } from './companies.types.js';

export function getSupportedCompanies(): string[] {
  return SUPPORTED_COMPANIES;
}

export async function getCompanyPrep(
  companyName: string,
  userId: string
): Promise<CompanyPrepResponse> {
  const profile = COMPANIES[companyName];
  if (!profile) {
    throw notFound(`Company not supported: ${companyName}. Supported: ${SUPPORTED_COMPANIES.join(', ')}`);
  }

  let weakTopics: string[] = [];
  if (userId) {
    const performance = await prisma.topicPerformance.findMany({
      where: { userId },
      include: { topic: true }
    });
    weakTopics = performance
      .filter((p) => p.successRate < 50)
      .map((p) => p.topic.name);
  }

  const weakTopicSet = new Set(weakTopics);
  const weakFocus = profile.frequentTopics.filter((topic) => weakTopicSet.has(topic));

  return {
    company: profile.name,
    frequentTopics: profile.frequentTopics,
    roadmap: profile.roadmap,
    weakTopicFocus: weakFocus
  };
}

export function assertCompanySupported(companyName: string): void {
  if (!COMPANIES[companyName]) {
    throw badRequest(`Company not supported: ${companyName}`);
  }
}
