import { prisma } from '../../config/database.js';
import { notFound } from '../../common/errors.js';
import { deleteResume as deleteFromCloudinary, uploadResume } from './cloudinary.js';
import type { ResumeResponse, ResumeStats } from './resumes.types.js';

function toResumeResponse(resume: {
  id: string;
  label: string;
  url: string;
  cloudinaryPublicId: string;
  createdAt: Date;
  updatedAt: Date;
}): ResumeResponse {
  return {
    id: resume.id,
    label: resume.label,
    url: resume.url,
    cloudinaryPublicId: resume.cloudinaryPublicId,
    createdAt: resume.createdAt.toISOString(),
    updatedAt: resume.updatedAt.toISOString()
  };
}

export async function createResume(
  userId: string,
  label: string,
  buffer: Buffer,
  filename: string
): Promise<ResumeResponse> {
  const upload = await uploadResume(buffer, filename);
  const resume = await prisma.resume.create({
    data: {
      userId,
      label,
      cloudinaryPublicId: upload.publicId,
      url: upload.url
    }
  });
  return toResumeResponse(resume);
}

export async function getResumes(userId: string): Promise<ResumeResponse[]> {
  const items = await prisma.resume.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
  return items.map(toResumeResponse);
}

export async function deleteResume(userId: string, id: string): Promise<void> {
  const existing = await prisma.resume.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    throw notFound('Resume not found');
  }
  await deleteFromCloudinary(existing.cloudinaryPublicId);
  await prisma.resume.delete({ where: { id } });
}

export async function getResumeStats(userId: string, id: string): Promise<ResumeStats> {
  const existing = await prisma.resume.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    throw notFound('Resume not found');
  }

  const [total, byStatus] = await Promise.all([
    prisma.application.count({ where: { userId } }),
    prisma.application.groupBy({
      by: ['status'],
      where: { userId },
      _count: { _all: true }
    })
  ]);

  const counts: Record<string, number> = {};
  for (const row of byStatus) {
    counts[row.status] = row._count._all;
  }

  const applied = counts.APPLIED ?? 0;
  const oa = counts.OA ?? 0;
  const interview = counts.INTERVIEW ?? 0;
  const rejections = counts.REJECTED ?? 0;
  const selected = counts.SELECTED ?? 0;

  const applications = applied + oa + interview + rejections + selected;
  const pending = applied + oa;
  const offers = selected;

  return {
    applications,
    interviews: interview,
    offers,
    rejections,
    pending
  };
}
