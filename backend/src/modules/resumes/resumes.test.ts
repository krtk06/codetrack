import request from 'supertest';
import { app } from '../../app.js';
import { prisma } from '../../config/database.js';
import * as cloudinary from './cloudinary.js';

jest.mock('./cloudinary.js', () => ({
  uploadResume: jest.fn(),
  deleteResume: jest.fn(),
  isCloudinaryConfigured: true
}));

async function loginUser(email: string, name: string) {
  const res = await request(app).post('/api/auth/register').send({
    email,
    password: 'securePass123',
    name
  });
  return res.body.accessToken as string;
}

function bufferToBase64(): string {
  return Buffer.from('PDF-CONTENT').toString('base64');
}

describe('Resumes API', () => {
  beforeEach(() => {
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.JWT_ACCESS_EXPIRY = '15m';
    process.env.JWT_REFRESH_EXPIRY = '7d';
    jest.clearAllMocks();
  });

  describe('GET /api/resumes', () => {
    it('returns 401 without authentication', async () => {
      const res = await request(app).get('/api/resumes');
      expect(res.status).toBe(401);
    });

    it('returns an empty list for a new user', async () => {
      const accessToken = await loginUser('wendy@example.com', 'Wendy');
      const res = await request(app)
        .get('/api/resumes')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(200);
      expect(res.body.resumes).toEqual([]);
    });
  });

  describe('POST /api/resumes', () => {
    it('creates a resume from base64 payload', async () => {
      (cloudinary.uploadResume as jest.Mock).mockResolvedValue({
        publicId: 'codetrack/resumes/test-1',
        url: 'https://example.com/test-1.pdf'
      });

      const accessToken = await loginUser('xander@example.com', 'Xander');
      const res = await request(app)
        .post('/api/resumes')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          label: 'Resume V1',
          fileBase64: bufferToBase64(),
          filename: 'resume-v1.pdf'
        });

      expect(res.status).toBe(201);
      expect(res.body.resume).toMatchObject({
        label: 'Resume V1',
        cloudinaryPublicId: 'codetrack/resumes/test-1',
        url: 'https://example.com/test-1.pdf'
      });
      expect(cloudinary.uploadResume).toHaveBeenCalled();
    });

    it('rejects payload without fileBase64', async () => {
      const accessToken = await loginUser('yvonne@example.com', 'Yvonne');
      const res = await request(app)
        .post('/api/resumes')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ label: 'Resume V1', filename: 'r.pdf' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/resumes/:id/stats', () => {
    it('returns counts derived from applications', async () => {
      (cloudinary.uploadResume as jest.Mock).mockResolvedValue({
        publicId: 'codetrack/resumes/stats-1',
        url: 'https://example.com/stats-1.pdf'
      });

      const accessToken = await loginUser('zara@example.com', 'Zara');
      const create = await request(app)
        .post('/api/resumes')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          label: 'Resume Stats',
          fileBase64: bufferToBase64(),
          filename: 'r.pdf'
        });
      const resumeId = create.body.resume.id as string;
      const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
      if (!resume) throw new Error('resume not found');

      const applications = [
        { status: 'APPLIED' as const, company: 'A', role: 'R', appliedDate: new Date() },
        { status: 'APPLIED' as const, company: 'B', role: 'R', appliedDate: new Date() },
        { status: 'REJECTED' as const, company: 'C', role: 'R', appliedDate: new Date() },
        { status: 'INTERVIEW' as const, company: 'D', role: 'R', appliedDate: new Date() },
        { status: 'SELECTED' as const, company: 'E', role: 'R', appliedDate: new Date() }
      ];
      for (const a of applications) {
        await prisma.application.create({ data: { userId: resume.userId, ...a } });
      }

      const res = await request(app)
        .get(`/api/resumes/${resumeId}/stats`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        applications: 5,
        interviews: 1,
        offers: 1,
        rejections: 1,
        pending: 2
      });
    });
  });

  describe('DELETE /api/resumes/:id', () => {
    it('deletes a resume', async () => {
      (cloudinary.uploadResume as jest.Mock).mockResolvedValue({
        publicId: 'codetrack/resumes/del-1',
        url: 'https://example.com/del-1.pdf'
      });
      (cloudinary.deleteResume as jest.Mock).mockResolvedValue(undefined);

      const accessToken = await loginUser('adam@example.com', 'Adam');
      const create = await request(app)
        .post('/api/resumes')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          label: 'Resume Del',
          fileBase64: bufferToBase64(),
          filename: 'r.pdf'
        });
      const id = create.body.resume.id as string;

      const res = await request(app)
        .delete(`/api/resumes/${id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(204);
      expect(cloudinary.deleteResume).toHaveBeenCalledWith('codetrack/resumes/del-1');
    });
  });
});
