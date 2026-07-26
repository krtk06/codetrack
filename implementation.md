# CodeTrack Pro Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build CodeTrack Pro v1 — a React + Node coding analytics and interview-prep platform — in four phases aligned with the PRD's P0/P1/P2/P3 priorities.

**Architecture:** A monorepo with `frontend/` (React, Vite, Tailwind, React Query, Redux Toolkit) and `backend/` (Express, Prisma, PostgreSQL). The backend exposes REST APIs protected by JWT, fetches LeetCode snapshots via the unofficial GraphQL endpoint, and uses OpenAI for the AI Interview Coach. Deploy frontend on Vercel, backend on Render, database on Neon, and resume files on Cloudinary.

**Tech Stack:** React.js, React Router, Redux Toolkit, Axios, Tailwind CSS, Framer Motion, React Hook Form, Recharts, React Query, Node.js, Express.js, REST APIs, JWT authentication, bcrypt, role-based access control, input validation, centralized error-handling middleware, PostgreSQL, Prisma, OpenAI API, Resend, Cloudinary, Jest, Vitest, React Testing Library, Playwright.

## Global Constraints

- No mobile native app. v1 is a responsive web app.
- CodeChef has no stable public API; v1 supports manual entry and CSV import only.
- No built-in code editor or online judge. The platform does not host problems or run code.
- No automatic job-application scraping. Users enter application details by hand.
- No public social feed or leaderboards.
- No real-time GitHub commit-level code analysis beyond activity counts and heatmap contributions.
- No paid subscription tiers or billing. All v1 features are free.
- No resume parsing from file uploads. Resume versions live as file links on Cloudinary with user-entered metadata.
- LeetCode integration depends on an unofficial GraphQL endpoint; build caching, snapshotting, retry, and stale-data warnings from the start.
- All JWT-protected routes must validate the access token and enforce role-based access control.
- Every feature must ship with tests, error states, loading skeletons, and toast feedback.

## Decisions Made During This Conversation

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Repository layout | Monorepo (`frontend/` + `backend/` in one repo) | Simpler CI, shared conventions, faster local development. |
| Database access | Prisma ORM on PostgreSQL | Schema-first migrations, type-safe queries, strong DX for a normalized schema. |
| AI Interview Coach | OpenAI API (GPT-4o / GPT-3.5-turbo) | Reliable structured-output support, well-documented JSON mode. |
| Transactional email | Resend | Good deliverability, simple Node SDK, fits Render backend. |
| Frontend build tool | Vite | Faster dev server and HMR than CRA; standard with React 18+. |
| Test strategy | Jest + Supertest for backend; Vitest + React Testing Library for frontend; Playwright for critical e2e flows. | Covers unit, integration, and end-to-end with tools suited to each layer. |

## Project Structure

```
codetrack-pro/
├── frontend/
│   ├── src/
│   │   ├── components/          # reusable UI (cards, charts, heatmap, kanban)
│   │   ├── pages/               # route-level pages
│   │   ├── features/            # Redux slices + API hooks per domain
│   │   ├── hooks/               # custom React hooks
│   │   ├── lib/                 # axios client, queryClient, constants
│   │   ├── routes.tsx           # React Router route table
│   │   └── main.tsx             # app entry
│   ├── index.html
│   ├── package.json
│   └── vitest.config.ts
├── backend/
│   ├── src/
│   │   ├── config/              # env validation, database, redis config
│   │   ├── modules/             # one folder per domain
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── leetcode/
│   │   │   ├── analytics/
│   │   │   ├── topics/
│   │   │   ├── contests/
│   │   │   ├── interviews/
│   │   │   ├── applications/
│   │   │   ├── resumes/
│   │   │   ├── recommendations/
│   │   │   ├── companies/
│   │   │   ├── aiCoach/
│   │   │   └── admin/
│   │   ├── common/              # error handler, async wrapper, validators
│   │   ├── jobs/                # cron / queue workers (snapshot job)
│   │   ├── app.ts               # Express app factory
│   │   └── server.ts            # bootstrapping
│   ├── prisma/
│   │   └── schema.prisma
│   ├── tests/
│   │   ├── unit
│   │   └── integration
│   ├── package.json
│   └── jest.config.js
├── docker-compose.yml           # local PostgreSQL + (optional) Redis
└── .github/workflows/ci.yml
```

Each backend module follows the same layout:

```
backend/src/modules/<domain>/
├── <domain>.controller.ts      # route handlers
├── <domain>.service.ts         # business logic
├── <domain>.routes.ts          # Express router
├── <domain>.validator.ts       # zod / joi schemas
├── <domain>.types.ts           # TS interfaces
└── <domain>.test.ts            # integration tests
```

## Phase 0: Scaffold, Database, and Auth Pipeline

### Task 0.1: Initialize monorepo and toolchain

**Files:**
- Create: `package.json` (root workspace), `frontend/package.json`, `backend/package.json`
- Create: `.nvmrc` with `20`, `.editorconfig`, `.gitignore`
- Create: `.github/workflows/ci.yml`

**Interfaces:**
- Root workspace uses npm/pnpm workspaces. Backend Node 20+. Frontend Node 20+.

- [ ] **Step 1:** Scaffold root monorepo with workspace scripts.
- [ ] **Step 2:** Initialize `frontend/` with Vite + React + TypeScript.
- [ ] **Step 3:** Initialize `backend/` with Express + TypeScript.
- [ ] **Step 4:** Add ESLint + Prettier configs at root (shared package optional).
- [ ] **Step 5:** Add GitHub Actions CI that installs, lints, and runs tests for both apps.
- [ ] **Step 6:** Commit.

**Tests:** CI workflow passes on an empty repo.

### Task 0.2: Local PostgreSQL and Prisma setup

**Files:**
- Create: `docker-compose.yml`
- Create: `backend/prisma/schema.prisma`
- Create: `backend/.env.example`
- Create: `backend/src/config/database.ts`

**Interfaces:**
- `DATABASE_URL=postgresql://user:pass@localhost:5432/codetrack_dev`

- [ ] **Step 1:** Add `docker-compose.yml` with a `postgres:16` service.
- [ ] **Step 2:** Add Prisma as a dev dependency and `@prisma/client`.
- [ ] **Step 3:** Define `User` model in `schema.prisma` with `id`, `email`, `password`, `name`, `role`, `createdAt`, `updatedAt`.
- [ ] **Step 4:** Run `npx prisma migrate dev --name init`.
- [ ] **Step 5:** Export a singleton Prisma client from `backend/src/config/database.ts`.
- [ ] **Step 6:** Write a test that connects to the test database and creates a user.
- [ ] **Step 7:** Commit.

**Tests:** `backend/tests/integration/database.test.ts` passes.

### Task 0.3: User model and password hashing

**Files:**
- Modify: `backend/prisma/schema.prisma`
- Create: `backend/src/modules/users/users.types.ts`
- Create: `backend/src/modules/users/users.service.ts`
- Create: `backend/src/modules/users/users.test.ts`

**Interfaces:**
```ts
interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  role?: 'USER' | 'ADMIN';
}

interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
}
```

- [ ] **Step 1:** Extend `User` model with `college`, `graduationYear`, `targetCompany`, `targetRole`, `leetcodeUsername`, `githubUsername`, `isEmailVerified`.
- [ ] **Step 2:** Add `bcrypt` helper functions `hashPassword(password: string): Promise<string>` and `comparePassword(password: string, hash: string): Promise<boolean>`.
- [ ] **Step 3:** Implement `createUser(input)` that hashes the password before inserting.
- [ ] **Step 4:** Implement `findUserByEmail(email)`.
- [ ] **Step 5:** Write tests for create, find, and password hashing.
- [ ] **Step 6:** Commit.

**Tests:** `backend/src/modules/users/users.test.ts` passes.

### Task 0.4: JWT utilities and centralized error handler

**Files:**
- Create: `backend/src/common/errors.ts`
- Create: `backend/src/common/asyncHandler.ts`
- Create: `backend/src/common/jwt.ts`
- Create: `backend/src/middleware/auth.ts`

**Interfaces:**
```ts
interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

function signAccessToken(payload: TokenPayload): string;
function signRefreshToken(payload: { userId: string }): string;
function verifyAccessToken(token: string): TokenPayload;
```

- [ ] **Step 1:** Add `jsonwebtoken` and `zod` dependencies.
- [ ] **Step 2:** Create `AppError` class with status code and message.
- [ ] **Step 3:** Create `asyncHandler` wrapper to catch async errors and forward to Express error middleware.
- [ ] **Step 4:** Implement JWT sign/verify helpers using env vars `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_EXPIRY`, `JWT_REFRESH_EXPIRY`.
- [ ] **Step 5:** Create `requireAuth` middleware that validates the `Authorization: Bearer <token>` header and attaches `req.user`.
- [ ] **Step 6:** Create `requireRole(...roles)` middleware.
- [ ] **Step 7:** Write tests for token sign/verify and middleware behavior.
- [ ] **Step 8:** Commit.

**Tests:** `backend/tests/unit/jwt.test.ts` and `backend/tests/integration/auth.middleware.test.ts` pass.

### Task 0.5: Auth API routes

**Files:**
- Create: `backend/src/modules/auth/auth.controller.ts`
- Create: `backend/src/modules/auth/auth.routes.ts`
- Create: `backend/src/modules/auth/auth.service.ts`
- Create: `backend/src/modules/auth/auth.validator.ts`
- Modify: `backend/src/app.ts`

**Interfaces:**
```ts
POST /api/auth/register      → { user, accessToken, refreshToken }
POST /api/auth/login         → { user, accessToken, refreshToken }
POST /api/auth/logout        → 204
POST /api/auth/refresh       → { accessToken, refreshToken }
POST /api/auth/forgot-password → 202
POST /api/auth/reset-password  → 204
POST /api/auth/change-password → 204 (protected)
GET  /api/auth/verify-email/:token → redirect to login
```

- [ ] **Step 1:** Implement register route with email uniqueness check and verification-token generation.
- [ ] **Step 2:** Implement login route with password verification.
- [ ] **Step 3:** Implement refresh-token rotation: store hashed refresh tokens in a `RefreshToken` table with expiry.
- [ ] **Step 4:** Implement logout that deletes the refresh token.
- [ ] **Step 5:** Implement forgot-password that generates a signed reset token and (via email stub) logs the link in dev.
- [ ] **Step 6:** Implement reset-password and change-password.
- [ ] **Step 7:** Wire routes into `/api/auth`.
- [ ] **Step 8:** Write integration tests covering happy paths and validation errors.
- [ ] **Step 9:** Commit.

**Tests:** `backend/src/modules/auth/auth.test.ts` passes.

### Task 0.6: Email delivery with Resend

**Files:**
- Create: `backend/src/config/email.ts`
- Create: `backend/src/modules/email/email.service.ts`
- Create: `backend/src/modules/email/email.test.ts`

**Interfaces:**
```ts
interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

async function sendEmail(message: EmailMessage): Promise<void>;
```

- [ ] **Step 1:** Add `resend` SDK and a `RESEND_API_KEY` env var.
- [ ] **Step 2:** Implement `sendEmail` that calls Resend in production and logs to console in dev/test.
- [ ] **Step 3:** Create email templates for verification, password reset, and interview reminders.
- [ ] **Step 4:** Wire `sendEmail` into auth service.
- [ ] **Step 5:** Write tests with mocked Resend client.
- [ ] **Step 6:** Commit.

**Tests:** `backend/src/modules/email/email.test.ts` passes.

### Task 0.7: Frontend auth pages and API client

**Files:**
- Create: `frontend/src/lib/api.ts`
- Create: `frontend/src/lib/auth.ts`
- Create: `frontend/src/features/auth/authSlice.ts`
- Create: `frontend/src/pages/Login.tsx`, `Register.tsx`, `ForgotPassword.tsx`, `ResetPassword.tsx`
- Create: `frontend/src/components/AuthLayout.tsx`

**Interfaces:**
- Axios instance with request interceptor attaching `accessToken` and response interceptor refreshing on 401.

- [ ] **Step 1:** Create axios client with base URL from env.
- [ ] **Step 2:** Add Redux Toolkit auth slice storing `user`, `accessToken`, `refreshToken`, `isAuthenticated`.
- [ ] **Step 3:** Build login, register, forgot-password, and reset-password forms with React Hook Form + validation.
- [ ] **Step 4:** Add toast notifications for auth success/error.
- [ ] **Step 5:** Write unit tests for the auth slice and form validation.
- [ ] **Step 6:** Commit.

**Tests:** `frontend/src/features/auth/authSlice.test.ts` and form tests pass.

### Task 0.8: Protected routing and global layout

**Files:**
- Create: `frontend/src/components/ProtectedRoute.tsx`
- Create: `frontend/src/components/AppShell.tsx`
- Create: `frontend/src/components/Sidebar.tsx`, `Topbar.tsx`
- Modify: `frontend/src/routes.tsx`

**Interfaces:**
- `ProtectedRoute` redirects unauthenticated users to `/login`.
- `AppShell` renders sidebar, topbar, and toast container.

- [ ] **Step 1:** Implement `ProtectedRoute` component.
- [ ] **Step 2:** Implement responsive `AppShell` with collapsible sidebar and mobile menu.
- [ ] **Step 3:** Add top-level routes: public (`/`, `/login`, `/register`, `/forgot-password`, `/reset-password`) and protected (`/dashboard`, `/analytics`, `/contest-analysis`, `/heatmap`, `/interviews`, `/resume-tracker`, `/applications`, `/settings`, `/profile`, `/company-prep`, `/ai-coach`, `/admin`).
- [ ] **Step 4:** Add dark-mode toggle using Tailwind `dark` class.
- [ ] **Step 5:** Write tests for `ProtectedRoute`.
- [ ] **Step 6:** Commit.

**Tests:** `frontend/src/components/ProtectedRoute.test.tsx` passes.

## Phase 1: P0 MVP — Dashboard, LeetCode, Analytics, Topics, Heatmap

### Task 1.1: Profile settings and user update API

**Files:**
- Modify: `backend/src/modules/users/users.service.ts`
- Modify: `backend/src/modules/users/users.controller.ts`
- Create: `backend/src/modules/users/users.routes.ts`
- Create: `frontend/src/pages/Settings.tsx`, `Profile.tsx`

**Interfaces:**
```ts
PATCH /api/users/me
Body: Partial<Omit<User, 'id' | 'email' | 'password' | 'role' | 'createdAt' | 'updatedAt'>>
```

- [ ] **Step 1:** Implement `updateUser(userId, data)` excluding protected fields.
- [ ] **Step 2:** Add `GET /api/users/me` and `PATCH /api/users/me` protected routes.
- [ ] **Step 3:** Build settings form for profile fields including `leetcodeUsername` and `githubUsername`.
- [ ] **Step 4:** Write backend integration tests and frontend form tests.
- [ ] **Step 5:** Commit.

**Tests:** `users.test.ts` and `Settings.test.tsx` pass.

### Task 1.2: LeetCode GraphQL fetcher and snapshot worker

**Files:**
- Create: `backend/src/modules/leetcode/leetcode.client.ts`
- Create: `backend/src/modules/leetcode/leetcode.service.ts`
- Create: `backend/src/modules/leetcode/leetcode.types.ts`
- Create: `backend/src/jobs/snapshot.job.ts`

**Interfaces:**
```ts
interface LeetCodeStats {
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  acceptanceRate: number;
  contestRating: number | null;
  globalRanking: number | null;
}

async function fetchLeetCodeStats(username: string): Promise<LeetCodeStats>;
```

- [ ] **Step 1:** Add `axios` and build a client that POSTs the GraphQL query to `https://leetcode.com/graphql` with retries and rate-limit handling.
- [ ] **Step 2:** Map response fields to `LeetCodeStats`.
- [ ] **Step 3:** Implement `createSnapshot(userId, stats)` that inserts into `DailySnapshots`.
- [ ] **Step 4:** Implement a snapshot job (`node-cron`) that runs daily for every user with a `leetcodeUsername`.
- [ ] **Step 5:** Add an on-demand endpoint `POST /api/leetcode/:username/sync`.
- [ ] **Step 6:** Write tests with mocked GraphQL responses and snapshot assertions.
- [ ] **Step 7:** Commit.

**Tests:** `backend/src/modules/leetcode/leetcode.test.ts` and `backend/src/jobs/snapshot.job.test.ts` pass.

### Task 1.3: ProblemStats API and live stats display

**Files:**
- Create: `backend/src/modules/leetcode/leetcode.controller.ts`
- Create: `backend/src/modules/leetcode/leetcode.routes.ts`
- Create: `frontend/src/features/leetcode/leetcodeApi.ts`

**Interfaces:**
```ts
GET /api/leetcode/:username/stats → LeetCodeStats & { lastUpdated: Date; isStale: boolean }
```

- [ ] **Step 1:** Upsert `ProblemStats` from the latest snapshot.
- [ ] **Step 2:** Return stats with `lastUpdated` and a stale flag if older than 48 hours.
- [ ] **Step 3:** Create React Query hook `useLeetCodeStats(username)`.
- [ ] **Step 4:** Add sync button and stale warning UI.
- [ ] **Step 5:** Write integration tests.
- [ ] **Step 6:** Commit.

**Tests:** Stats endpoint and hook tests pass.

### Task 1.4: Dashboard welcome section and stat cards

**Files:**
- Create: `frontend/src/pages/Dashboard.tsx`
- Create: `frontend/src/components/dashboard/WelcomeCard.tsx`
- Create: `frontend/src/components/dashboard/StatCard.tsx`
- Create: `backend/src/modules/dashboard/dashboard.service.ts`

**Interfaces:**
```ts
GET /api/dashboard → {
  user: { name, goal, progress };
  stats: {
    totalProblemsSolved: number;
    currentStreak: number;
    longestStreak: number;
    contestRating: number | null;
    monthlyGrowth: number;
    applicationsSubmitted: number;
  };
}
```

- [ ] **Step 1:** Add `Goals` model to Prisma (`title`, `target`, `current`, `userId`).
- [ ] **Step 2:** Implement dashboard service that aggregates stats from `ProblemStats`, `Applications`, and `DailySnapshots`.
- [ ] **Step 3:** Build welcome card showing name, goal (e.g., "Solve 500 Problems"), and progress (e.g., "425 / 500").
- [ ] **Step 4:** Build six stat cards with loading skeletons.
- [ ] **Step 5:** Write tests for service and components.
- [ ] **Step 6:** Commit.

**Tests:** Dashboard service and component tests pass.

### Task 1.5: Growth charts

**Files:**
- Create: `frontend/src/components/charts/WeeklyGrowthChart.tsx`
- Create: `frontend/src/components/charts/MonthlyGrowthChart.tsx`
- Create: `frontend/src/components/charts/YearlyGrowthChart.tsx`
- Create: `backend/src/modules/analytics/analytics.service.ts`

**Interfaces:**
```ts
GET /api/analytics/growth?period=weekly|monthly|yearly → { labels: string[]; data: number[] }
```

- [ ] **Step 1:** Implement `getGrowthData(userId, period)` that queries `DailySnapshots`.
- [ ] **Step 2:** Weekly data returns day-by-day solved counts, e.g., [250, 252, ..., 278].
- [ ] **Step 3:** Build Recharts line charts for weekly, monthly, and yearly growth.
- [ ] **Step 4:** Add empty, loading, and error states.
- [ ] **Step 5:** Write tests.
- [ ] **Step 6:** Commit.

**Tests:** Analytics service and chart rendering tests pass.

### Task 1.6: Coding analytics engine

**Files:**
- Create: `backend/src/modules/analytics/analytics.types.ts`
- Create: `backend/src/modules/analytics/analytics.controller.ts`
- Create: `backend/src/modules/analytics/analytics.routes.ts`
- Create: `frontend/src/pages/Analytics.tsx`

**Interfaces:**
```ts
GET /api/analytics/summary → {
  dailyGrowth: number;
  weeklyGrowth: number;
  monthlyGrowth: number;
  problemsPerDay: number;
  successRate: number;
  codingConsistency: number;
  streakAnalysis: { current: number; longest: number };
}
```

- [ ] **Step 1:** Implement metric calculations from `DailySnapshots`.
- [ ] **Step 2:** Add endpoints for summary and trend data.
- [ ] **Step 3:** Build Analytics page with line, bar, and area charts.
- [ ] **Step 4:** Write tests for edge cases (no snapshots, single snapshot, gaps).
- [ ] **Step 5:** Commit.

**Tests:** Analytics engine tests pass.

### Task 1.7: Topic catalog and TopicPerformance

**Files:**
- Create: `backend/prisma/seed/topics.seed.ts`
- Modify: `backend/prisma/schema.prisma`
- Create: `backend/src/modules/topics/topics.service.ts`
- Create: `backend/src/modules/topics/topics.controller.ts`

**Interfaces:**
```ts
GET /api/topics → Topic[]
GET /api/topics/performance → TopicPerformance[]
```

- [ ] **Step 1:** Add `Topic` and `TopicPerformance` models.
- [ ] **Step 2:** Seed the fourteen topics: Arrays, Strings, Linked Lists, Stacks, Queues, Trees, Graphs, Dynamic Programming, Greedy, Backtracking, Sliding Window, Binary Search, Heap, Trie.
- [ ] **Step 3:** Implement `upsertTopicPerformance` to store `solved`, `attempted`, `successRate` per user and topic.
- [ ] **Step 4:** Derive topic performance from LeetCode problem tags by mapping solved problems to topics (v1 may use manual mapping or a static lookup).
- [ ] **Step 5:** Write tests.
- [ ] **Step 6:** Commit.

**Tests:** Topic seed and performance endpoint tests pass.

### Task 1.8: Topic analysis page and radar chart

**Files:**
- Create: `frontend/src/pages/Analytics.tsx` extension or `TopicAnalysis.tsx`
- Create: `frontend/src/components/charts/TopicRadarChart.tsx`
- Create: `frontend/src/components/topics/StrongTopicsList.tsx`
- Create: `frontend/src/components/topics/NeedImprovementList.tsx`

**Interfaces:**
- Strong topics list and Need Improvement list derived from success-rate thresholds.

- [ ] **Step 1:** Build radar chart across fourteen topics using Recharts.
- [ ] **Step 2:** Render strong and weak topic lists with example shapes (Strong = Arrays, Strings; Needs Improvement = DP, Graphs).
- [ ] **Step 3:** Add empty/loading/error states.
- [ ] **Step 4:** Write component tests.
- [ ] **Step 5:** Commit.

**Tests:** Topic analysis page tests pass.

### Task 1.9: Coding heatmap

**Files:**
- Create: `frontend/src/pages/Heatmap.tsx`
- Create: `frontend/src/components/heatmap/CalendarHeatmap.tsx`
- Create: `backend/src/modules/heatmap/heatmap.service.ts`

**Interfaces:**
```ts
GET /api/heatmap?year=2026 → { date: string; count: number; level: 0|1|2|3|4 }[]
```

- [ ] **Step 1:** Compute daily activity counts from `DailySnapshots` and GitHub contributions.
- [ ] **Step 2:** Return levels 0–4 based on count thresholds.
- [ ] **Step 3:** Build GitHub-style calendar heatmap component with tooltips.
- [ ] **Step 4:** Surface Consistency, Active Days, Missed Days, and Streaks.
- [ ] **Step 5:** Write tests.
- [ ] **Step 6:** Commit.

**Tests:** Heatmap service and component tests pass.

## Phase 2: P1 Core Interview Prep — Contests, Interviews, Mock Interviews, Applications

### Task 2.1: Contest model and Codeforces integration

**Files:**
- Modify: `backend/prisma/schema.prisma`
- Create: `backend/src/modules/contests/contests.types.ts`
- Create: `backend/src/modules/contests/codeforces.client.ts`
- Create: `backend/src/modules/contests/contests.service.ts`

**Interfaces:**
```ts
interface ContestRecord {
  platform: 'LEETCODE' | 'CODEFORCES' | 'CODECHEF';
  contestName: string;
  date: Date;
  rank: number;
  solved: number;
  ratingBefore: number | null;
  ratingAfter: number | null;
}
```

- [ ] **Step 1:** Add `Contest` model.
- [ ] **Step 2:** Implement Codeforces API client using the public API.
- [ ] **Step 3:** Implement `importCodeforcesContests(handle)` and `createContest`.
- [ ] **Step 4:** Expose `POST /api/contests/import/codeforces`.
- [ ] **Step 5:** Write tests with mocked Codeforces responses.
- [ ] **Step 6:** Commit.

**Tests:** Codeforces client and contest import tests pass.

### Task 2.2: CodeChef manual and CSV import

**Files:**
- Create: `backend/src/modules/contests/codechef.parser.ts`
- Modify: `backend/src/modules/contests/contests.controller.ts`

**Interfaces:**
```ts
POST /api/contests
Body: ContestRecord | ContestRecord[]

POST /api/contests/import/codechef/csv
Content-Type: multipart/form-data
```

- [ ] **Step 1:** Implement single contest creation and bulk insert.
- [ ] **Step 2:** Implement CSV parser for CodeChef contest exports with validation.
- [ ] **Step 3:** Add frontend manual-entry form and CSV upload.
- [ ] **Step 4:** Write tests.
- [ ] **Step 5:** Commit.

**Tests:** CSV parser and contest endpoint tests pass.

### Task 2.3: Contest analysis page

**Files:**
- Create: `frontend/src/pages/ContestAnalysis.tsx`
- Create: `frontend/src/components/charts/RatingTrendChart.tsx`
- Create: `backend/src/modules/contests/contests.controller.ts`

**Interfaces:**
```ts
GET /api/contests/analysis → {
  bestRank: number;
  worstRank: number;
  averageRank: number;
  ratingGrowth: number;
  participationFrequency: number;
  ratingTrend: number[]; // e.g., [1450, 1492, 1520, 1580, 1625]
}
```

- [ ] **Step 1:** Implement analysis calculations.
- [ ] **Step 2:** Build rating trend line chart.
- [ ] **Step 3:** Display best/worst/average rank and participation frequency.
- [ ] **Step 4:** Write tests.
- [ ] **Step 5:** Commit.

**Tests:** Contest analysis endpoint and page tests pass.

### Task 2.4: Interview scheduler

**Files:**
- Modify: `backend/prisma/schema.prisma`
- Create: `backend/src/modules/interviews/interviews.service.ts`
- Create: `frontend/src/pages/Interviews.tsx`

**Interfaces:**
```ts
POST /api/interviews
Body: { company, round, date, time, location, meetingLink, status: 'Scheduled' | 'Completed' | 'Cancelled' }

GET /api/interviews/upcoming → Interview[]
```

- [ ] **Step 1:** Add `Interview` model with statuses Scheduled, Completed, Cancelled.
- [ ] **Step 2:** Implement CRUD and upcoming interviews query.
- [ ] **Step 3:** Build scheduler form and list view.
- [ ] **Step 4:** Surface upcoming interviews on the Dashboard.
- [ ] **Step 5:** Write tests.
- [ ] **Step 6:** Commit.

**Tests:** Interview service and scheduler tests pass.

### Task 2.5: Mock interview tracker

**Files:**
- Modify: `backend/prisma/schema.prisma`
- Create: `backend/src/modules/mock-interviews/mockInterviews.service.ts`
- Create: `frontend/src/components/interviews/MockInterviewForm.tsx`

**Interfaces:**
```ts
POST /api/mock-interviews
Body: { date, interviewer, topic, score, feedback }
```

- [ ] **Step 1:** Add `MockInterview` model.
- [ ] **Step 2:** Implement CRUD and performance-over-time aggregation.
- [ ] **Step 3:** Build form and analytics chart (example: Topic = DSA, Score = 7/10, Feedback = "Need Graph Practice").
- [ ] **Step 4:** Write tests.
- [ ] **Step 5:** Commit.

**Tests:** Mock interview tests pass.

### Task 2.6: Job application tracker

**Files:**
- Modify: `backend/prisma/schema.prisma`
- Create: `backend/src/modules/applications/applications.service.ts`
- Create: `frontend/src/pages/Applications.tsx`
- Create: `frontend/src/components/applications/KanbanBoard.tsx`

**Interfaces:**
```ts
POST /api/applications
Body: { company, role, location, appliedDate, status: 'Applied' | 'OA' | 'Interview' | 'Rejected' | 'Selected' }

GET /api/applications?status=... → Application[]
```

- [ ] **Step 1:** Add `Application` model with statuses Applied, OA, Interview, Rejected, Selected.
- [ ] **Step 2:** Implement CRUD and filtering.
- [ ] **Step 3:** Build Kanban board grouped by status.
- [ ] **Step 4:** Add drag-and-drop or move-action UX.
- [ ] **Step 5:** Write tests.
- [ ] **Step 6:** Commit.

**Tests:** Application service and Kanban tests pass.

### Task 2.7: Dashboard integrations

**Files:**
- Modify: `frontend/src/pages/Dashboard.tsx`

- [ ] **Step 1:** Show upcoming interviews section.
- [ ] **Step 2:** Show recent applications summary.
- [ ] **Step 3:** Add quick-action buttons to add interview/application.
- [ ] **Step 4:** Commit.

**Tests:** Dashboard integration tests pass.

## Phase 3: P2 Intelligence & Career Tools

### Task 3.1: Smart recommendation engine

**Files:**
- Create: `backend/src/modules/recommendations/recommendations.service.ts`
- Create: `backend/src/modules/recommendations/recommendations.controller.ts`

**Interfaces:**
```ts
GET /api/recommendations → {
  weakTopics: string[];
  dailyPlan: { topic: string; count: number }[]; // e.g., [{ topic: 'Arrays', count: 5 }, ...]
  learningPath: { phase: string; topics: string[] }[];
}
```

- [ ] **Step 1:** Implement rule: if topic success rate is below 50%, recommend practice.
- [ ] **Step 2:** Generate daily practice plan with concrete counts.
- [ ] **Step 3:** Build a simple personalized learning path ordered by weakest topics.
- [ ] **Step 4:** Persist recommendations in `Recommendations` table.
- [ ] **Step 5:** Write tests.
- [ ] **Step 6:** Commit.

**Tests:** Recommendation engine tests pass.

### Task 3.2: Daily practice plan UI

**Files:**
- Create: `frontend/src/components/recommendations/TodaysPlanCard.tsx`
- Create: `frontend/src/pages/Analytics.tsx` extension

- [ ] **Step 1:** Build "Today's Plan" card showing counts per topic.
- [ ] **Step 2:** Example output: 5 Array Problems, 3 Tree Problems, 2 Graph Problems.
- [ ] **Step 3:** Add mark-as-done actions.
- [ ] **Step 4:** Commit.

**Tests:** Daily plan component tests pass.

### Task 3.3: Resume tracker

**Files:**
- Modify: `backend/prisma/schema.prisma`
- Create: `backend/src/modules/resumes/resumes.service.ts`
- Create: `backend/src/modules/resumes/cloudinary.ts`
- Create: `frontend/src/pages/ResumeTracker.tsx`

**Interfaces:**
```ts
POST /api/resumes
Content-Type: multipart/form-data
Body: { file, label } // e.g., Resume V1

GET /api/resumes/:id/stats → { applications, interviews, offers, rejections, pending }
```

- [ ] **Step 1:** Add `Resume` model with Cloudinary public ID and URL.
- [ ] **Step 2:** Integrate Cloudinary SDK for upload and delete.
- [ ] **Step 3:** Track counts per resume version.
- [ ] **Step 4:** Build resume list, upload form, and funnel chart.
- [ ] **Step 5:** Example counts: Applications 50, Rejected 35, Pending 10, Interview 5.
- [ ] **Step 6:** Write tests with mocked Cloudinary.
- [ ] **Step 7:** Commit.

**Tests:** Resume tracker tests pass.

### Task 3.4: Company preparation module

**Files:**
- Create: `backend/src/modules/companies/companies.data.ts`
- Create: `backend/src/modules/companies/companies.service.ts`
- Create: `frontend/src/pages/CompanyPrep.tsx`

**Interfaces:**
```ts
GET /api/companies/prep?company=Google → {
  company: string;
  frequentTopics: string[]; // e.g., ['Graphs', 'Trees', 'Dynamic Programming']
  roadmap: { phase: string; topics: string[]; suggestedProblems: number }[];
}
```

- [ ] **Step 1:** Add static data for Google, Amazon, Microsoft, Meta, Adobe, Atlassian.
- [ ] **Step 2:** Generate roadmap based on selected company and user weak topics.
- [ ] **Step 3:** Build company selector and roadmap view.
- [ ] **Step 4:** Write tests.
- [ ] **Step 5:** Commit.

**Tests:** Company prep endpoint tests pass.

### Task 3.5: AI Interview Coach

**Files:**
- Create: `backend/src/modules/ai-coach/aiCoach.service.ts`
- Create: `backend/src/modules/ai-coach/aiCoach.controller.ts`
- Create: `backend/src/modules/ai-coach/aiCoach.prompt.ts`
- Create: `frontend/src/pages/AICoach.tsx`

**Interfaces:**
```ts
POST /api/ai-coach/analyze
Body: { failureDescription: string } // e.g., "I failed my Amazon interview."
Response: {
  weakAreas: string[]; // e.g., ['Trees', 'System Design', 'Behavioral Questions']
  recommendedPlan: { activity: string; count?: number }[]; // e.g., [{ activity: 'Tree Problems', count: 10 }, ...]
}
```

- [ ] **Step 1:** Add `OPENAI_API_KEY` and `OPENAI_MODEL` env vars.
- [ ] **Step 2:** Build OpenAI prompt with JSON schema and example output.
- [ ] **Step 3:** Validate LLM output against zod schema before returning.
- [ ] **Step 4:** Build free-text input UI and structured results display.
- [ ] **Step 5:** Add error handling for model failures.
- [ ] **Step 6:** Write tests with mocked OpenAI client.
- [ ] **Step 7:** Commit.

**Tests:** AI coach endpoint and component tests pass.

## Phase 4: P3 Platform & Operations

### Task 4.1: Notification service

**Files:**
- Modify: `backend/prisma/schema.prisma`
- Create: `backend/src/modules/notifications/notifications.service.ts`
- Create: `backend/src/modules/notifications/notifications.controller.ts`

**Interfaces:**
```ts
GET /api/notifications/preferences → {
  dailyReminders: boolean;
  goalCompletionAlerts: boolean;
  interviewNotifications: boolean;
  contestNotifications: boolean;
}

PATCH /api/notifications/preferences
```

- [ ] **Step 1:** Add `NotificationPreference` model.
- [ ] **Step 2:** Implement preference CRUD.
- [ ] **Step 3:** Schedule jobs: daily reminders, goal-completion checks, interview reminders, contest alerts.
- [ ] **Step 4:** Use Resend for email notifications and in-app queue for toast notifications.
- [ ] **Step 5:** Write tests.
- [ ] **Step 6:** Commit.

**Tests:** Notification preference and job tests pass.

### Task 4.2: Toast notifications and in-app badges

**Files:**
- Create: `frontend/src/components/ui/Toast.tsx`
- Create: `frontend/src/components/ui/NotificationBadge.tsx`
- Modify: `frontend/src/lib/api.ts` to handle 401 and global errors with toast.

- [ ] **Step 1:** Integrate toast notifications for success/error/notification events.
- [ ] **Step 2:** Add notification badge on the topbar.
- [ ] **Step 3:** Write tests.
- [ ] **Step 4:** Commit.

**Tests:** Toast and badge tests pass.

### Task 4.3: Admin dashboard

**Files:**
- Create: `backend/src/modules/admin/admin.service.ts`
- Create: `backend/src/modules/admin/admin.controller.ts`
- Create: `backend/src/modules/admin/admin.routes.ts`
- Create: `frontend/src/pages/AdminDashboard.tsx`

**Interfaces:**
```ts
GET /api/admin/users → User[]
GET /api/admin/stats → { totalUsers, activeUsers, snapshotsToday }
GET /api/admin/recommendations → Recommendation[]
GET /api/admin/usage → { apiCalls, errors }
```

- [ ] **Step 1:** Implement admin-only endpoints protected by `requireRole('ADMIN')`.
- [ ] **Step 2:** Implement user list, platform stats, recommendation management, and usage monitoring.
- [ ] **Step 3:** Build admin dashboard UI with tables and summary cards.
- [ ] **Step 4:** Write tests.
- [ ] **Step 5:** Commit.

**Tests:** Admin endpoint and dashboard tests pass.

### Task 4.4: End-to-end, performance, and deployment

**Files:**
- Create: `e2e/auth.spec.ts`, `e2e/dashboard.spec.ts`
- Create: `frontend/vercel.json`
- Create: `backend/render.yaml` (or `render.yml`)

- [ ] **Step 1:** Write Playwright tests for register → login → dashboard → LeetCode sync flow.
- [ ] **Step 2:** Add performance budgets for bundle size.
- [ ] **Step 3:** Configure Vercel deploy for frontend and Render deploy for backend.
- [ ] **Step 4:** Add Neon PostgreSQL connection strings for staging and production.
- [ ] **Step 5:** Add Cloudinary env vars for production.
- [ ] **Step 6:** Run full test suite and fix regressions.
- [ ] **Step 7:** Commit.

**Tests:** CI pipeline passes; Playwright smoke tests pass against staging.

## Cross-Cutting Concerns

### Validation
- Use Zod for all backend request validation.
- Use React Hook Form + Zod resolver on the frontend.

### Error Handling
- Every route wraps controllers in `asyncHandler`.
- `AppError` carries a status code and message.
- Centralized error middleware returns `{ error: { message, code } }` without leaking stack traces in production.

### Auth Security
- Access tokens short-lived (15 minutes); refresh tokens long-lived (7 days) and stored hashed.
- Passwords hashed with bcrypt cost factor 12.
- CORS configured for the frontend origin only.
- Helmet for security headers.

### Rate Limiting & External APIs
- Use `express-rate-limit` on auth endpoints.
- Throttle LeetCode/Codeforces snapshot jobs per user to avoid bans.
- Cache external API responses for 1 hour minimum.

### Observability
- Add `pino` for structured logging.
- Log snapshot failures and external API errors.
- Track key metrics: signup, LeetCode connect rate, sync failures.

### File Uploads
- Use `multer` in memory and upload to Cloudinary.
- Validate file type (PDF only) and size (< 5 MB).

## Testing Strategy

- **Backend unit tests:** Jest for services, utilities, and clients with mocked external APIs.
- **Backend integration tests:** Jest + Supertest against a test PostgreSQL database reset before each test.
- **Frontend unit tests:** Vitest + React Testing Library for components, hooks, and Redux slices.
- **End-to-end tests:** Playwright covering critical flows: auth, profile setup, LeetCode sync, dashboard rendering, and adding an application.
- **Snapshot testing:** Avoid frontend snapshot tests; prefer explicit assertions.
- **Test data:** Use factories (e.g., `factory.user()`, `factory.contest()`) to keep tests readable.

## Deployment & Environments

### Local Development
1. Clone repo.
2. `cp backend/.env.example backend/.env` and set the required values.
3. `docker compose up -d` to start PostgreSQL.
4. `cd backend && npm install && npx prisma migrate dev && npm run dev`.
5. `cd frontend && npm install && npm run dev`.
6. Run tests: `npm test` in each app.

### Staging
- Frontend: Vercel preview deployments per pull request.
- Backend: Render web service with `NODE_ENV=staging`.
- Database: Neon staging branch.

### Production
- Frontend: Vercel production domain.
- Backend: Render production service.
- Database: Neon production.
- Cloudinary: production bucket for resumes.
- Resend: production sending domain.
- Cron job: Render cron job or background worker for daily snapshots.

### Environment Variables
```
# Backend
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://...
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
RESEND_API_KEY=...
OPENAI_API_KEY=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Frontend
VITE_API_URL=http://localhost:4000/api
```

## Risk & Fallback Plan

| Risk | Mitigation |
|------|------------|
| LeetCode GraphQL endpoint changes or blocks requests | Build manual override and CSV import for problem stats; cache aggressively; alert admins on repeated failures. |
| Codeforces API downtime | Queue retries; show last known data with stale warning. |
| OpenAI API failures | Return a generic fallback plan and log the error; cache successful plans. |
| Email deliverability issues | Use Resend dashboards; implement in-app-only fallback for notifications. |
| Slow dashboard due to analytics queries | Pre-aggregate daily summaries; add database indexes on `DailySnapshots.userId` and `date`. |

## Spec Coverage Checklist

- [x] Authentication & Profile: register, login, logout, forgot/reset/change password, email verification, profile update, all user schema fields, JWT/refresh, bcrypt, RBAC, protected routes.
- [x] Dashboard: welcome by name, goal/progress examples, six stat cards, weekly/monthly/yearly growth, Monday 250 → Sunday 278 example.
- [x] LeetCode Integration: username input, fetched fields, Easy 150/Medium 230/Hard 45/Total 425 example, daily snapshots.
- [x] Coding Analytics Engine: all metrics, line/bar/area charts.
- [x] Topic Analysis: all fourteen topics, Solved/Attempted/Success Rate, Strong/Need Improvement lists, radar chart.
- [x] Smart Recommendations: below 50% rule, weak topics, daily plan, learning path, Today's Plan counts.
- [x] Contest Analysis: LeetCode/Codeforces/CodeChef, all fields and metrics, rating trend example.
- [x] Coding Heatmap: consistency, active/missed days, streaks.
- [x] Interview Scheduler: all fields and statuses, upcoming interviews.
- [x] Mock Interview Tracker: all fields and example.
- [x] Resume Tracker: multiple versions, tracked counts example, funnel chart.
- [x] Job Application Tracker: all fields and statuses, Kanban board.
- [x] Company Prep: all six companies, example topic mapping, roadmap.
- [x] AI Interview Coach: LLM-backed, example input/output, structured output contract.
- [x] Notifications: all four types.
- [x] Admin Dashboard: all four capabilities.
- [x] UX: all twelve pages, all design requirements, empty/loading/error/success states.
- [x] Tech stack: every technology named in Technical Considerations.
- [x] API risks: LeetCode/CodeChef/Codeforces explicitly addressed.

## Next Steps

1. Review this plan against team capacity and decide whether to split Phase 1 into sprints.
2. Confirm final environment variable names and Cloudinary/Resend/OpenAI accounts.
3. Start execution with Task 0.1.

---

**Plan complete.** Two execution options:

1. **Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, and iterate fast.
2. **Inline Execution** — Execute tasks in this session using `executing-plans`, with batch execution and checkpoints for review.

Which approach do you want?
