import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/users.routes.js';
import leetcodeRoutes from './modules/leetcode/leetcode.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import analyticsRoutes from './modules/analytics/analytics.routes.js';
import topicsRoutes from './modules/topics/topics.routes.js';
import heatmapRoutes from './modules/heatmap/heatmap.routes.js';
import contestsRoutes from './modules/contests/contests.routes.js';
import interviewsRoutes from './modules/interviews/interviews.routes.js';
import mockInterviewsRoutes from './modules/mock-interviews/mockInterviews.routes.js';
import applicationsRoutes from './modules/applications/applications.routes.js';
import recommendationsRoutes from './modules/recommendations/recommendations.routes.js';
import resumesRoutes from './modules/resumes/resumes.routes.js';
import companiesRoutes from './modules/companies/companies.routes.js';
import aiCoachRoutes from './modules/ai-coach/aiCoach.routes.js';

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.text({ type: 'text/csv' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leetcode', leetcodeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/topics', topicsRoutes);
app.use('/api/heatmap', heatmapRoutes);
app.use('/api/contests', contestsRoutes);
app.use('/api/interviews', interviewsRoutes);
app.use('/api/mock-interviews', mockInterviewsRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/resumes', resumesRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/ai-coach', aiCoachRoutes);

app.use(errorHandler);
