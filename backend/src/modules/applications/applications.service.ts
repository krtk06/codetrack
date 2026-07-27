import { prisma } from '../../config/database.js';
import { notFound } from '../../common/errors.js';
import type {
  ApplicationResponse,
  ApplicationStatus,
  CreateApplicationInput,
  UpdateApplicationInput
} from './applications.types.js';

function toApplicationResponse(application: {
  id: string;
  company: string;
  role: string;
  location: string | null;
  appliedDate: Date;
  status: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}): ApplicationResponse {
  return {
    id: application.id,
    company: application.company,
    role: application.role,
    location: application.location,
    appliedDate: application.appliedDate.toISOString(),
    status: application.status as ApplicationStatus,
    notes: application.notes,
    createdAt: application.createdAt.toISOString(),
    updatedAt: application.updatedAt.toISOString()
  };
}

export async function createApplication(
  userId: string,
  input: CreateApplicationInput
): Promise<ApplicationResponse> {
  const application = await prisma.application.create({
    data: {
      userId,
      company: input.company,
      role: input.role,
      location: input.location ?? null,
      appliedDate: new Date(input.appliedDate),
      status: input.status ?? 'APPLIED',
      notes: input.notes ?? null
    }
  });

  return toApplicationResponse(application);
}

export async function getApplications(
  userId: string,
  status?: ApplicationStatus
): Promise<ApplicationResponse[]> {
  const items = await prisma.application.findMany({
    where: { userId, ...(status ? { status } : {}) },
    orderBy: [{ appliedDate: 'desc' }, { createdAt: 'desc' }]
  });
  return items.map(toApplicationResponse);
}

export async function updateApplication(
  userId: string,
  id: string,
  input: UpdateApplicationInput
): Promise<ApplicationResponse> {
  const existing = await prisma.application.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    throw notFound('Application not found');
  }

  const application = await prisma.application.update({
    where: { id },
    data: {
      company: input.company,
      role: input.role,
      location: input.location ?? undefined,
      appliedDate: input.appliedDate ? new Date(input.appliedDate) : undefined,
      status: input.status,
      notes: input.notes ?? undefined
    }
  });

  return toApplicationResponse(application);
}

export async function deleteApplication(userId: string, id: string): Promise<void> {
  const existing = await prisma.application.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    throw notFound('Application not found');
  }
  await prisma.application.delete({ where: { id } });
}
