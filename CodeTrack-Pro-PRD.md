# Product Requirements Document: CodeTrack Pro

## 1. Overview & Problem Statement

College students and new graduates preparing for software engineering interviews track progress across disconnected platforms. They solve problems on LeetCode, compete on Codeforces, upload code to GitHub, and apply for jobs in spreadsheets. That creates a fragmented view that hides real patterns: which topics are improving, whether daily practice is consistent, how contest ratings trend, and which job applications convert to interviews.

CodeTrack Pro is a coding analytics and interview-preparation platform. It acts as a fitness tracker for interview prep. It connects LeetCode, Codeforces, GitHub, and manual CodeChef data in one dashboard. It surfaces topic-level strengths and weaknesses, schedules interviews, tracks mock-interview performance, and manages job applications. Students see where they stand, what to practice next, and how their interview pipeline is progressing.

## 2. Goals & Success Metrics

### Primary Goals
- Consolidate coding activity, contest history, and interview progress into a single dashboard.
- Make daily consistency, topic mastery, and application-to-interview conversion visible and actionable.
- Reduce the time a student spends updating tracking spreadsheets by hand.
- Support SWE intern and fresher interview preparation end-to-end.

### Success Metrics (KPIs)
- **DAU/WAU ratio**: Target 35% weekly active users by month three after onboarding.
- **LeetCode account connection rate**: At least 60% of registered users link a LeetCode username within seven days.
- **Streak retention**: 40% of users maintain a seven-day or longer coding streak within the first month.
- **Application-to-interview conversion tracked in-app**: Measure the ratio of applications moved to the Interview stage; baseline and improve over the first quarter.
- **Snapshot coverage**: 90% of connected LeetCode accounts have daily snapshots for at least 25 of the last 30 days.
- **Mock interview completion**: 30% of active users log at least one mock interview per month.
- **Contest analysis usage**: 25% of active users with contest data view the Contest Analysis page weekly.

## 3. Non-Goals

CodeTrack Pro v1 does not include the following:
- A mobile native app. The v1 experience is responsive web only.
- Automatic live integration with CodeChef. Users enter CodeChef data by hand or import it via CSV.
- A built-in code editor or online judge. The platform does not host problems or run code.
- Automatic job application scraping. Users enter application details by hand.
- A public social feed or leaderboards. Private progress and comparisons are out of scope.
- Real-time GitHub commit-level code analysis beyond activity counts and heatmap contributions.
- Paid subscription tiers or billing. v1 keeps all features free.
- Resume parsing from file uploads. Resume versions live as file links on Cloudinary; users enter metadata by hand.

## 4. User Personas

### Priya — Placement-Prep Student
- Third-year computer science student preparing for campus placements.
- Solves 10–15 LeetCode problems a week but cannot tell which topics are weakest.
- Needs topic-level breakdowns, a daily plan, and interview scheduling for company visits.
- Goal: secure a software development intern offer before graduation.

### Arjun — Competitive Programmer
- Active on Codeforces and CodeChef, tracks rating and contest frequency.
- Wants a single view of contest performance across platforms and rating growth.
- Goal: improve contest rating and translate consistency into placement readiness.

### Rahul — Fresher Job Seeker
- Recent graduate applying to 10–15 companies per month.
- Manages applications, resumes, online assessments, and interview rounds in multiple tabs.
- Needs a Kanban board for applications, a resume-version tracker, and an interview scheduler.
- Goal: convert applications into interview calls and offers.

## 5. User Stories / Use Cases

### 1. Authentication & Profile
- As a student, I want to register with my email and password so I can create a secure account.
- As a student, I want to verify my email, reset a forgotten password, and change my password when needed.
- As a student, I want to update my profile with my college, graduation year, target company, target role, LeetCode username, and GitHub username so the dashboard is personalized.

### 2. Dashboard
- As a student, I want to see my name, current goal, and progress toward it when I open the dashboard.
- As a student, I want stat cards for total problems solved, current streak, longest streak, contest rating, monthly growth, and applications submitted.
- As a student, I want weekly, monthly, and yearly growth charts so I can see my trajectory.

### 3. LeetCode Integration
- As a student, I want to enter my LeetCode username and pull my solved counts, acceptance rate, contest rating, and global ranking.
- As a student, I want the platform to keep daily snapshots of these metrics so historical analysis reflects real changes.

### 4. Coding Analytics Engine
- As a student, I want daily, weekly, and monthly growth metrics plus problems-per-day, success rate, consistency scores, and streak analysis so I understand my practice patterns.
- As a student, I want line, bar, and area charts for these metrics so I can spot trends.

### 5. Topic Analysis
- As a student, I want to track my solved, attempted, and success-rate numbers across all core DSA topics.
- As a student, I want to see a strong-topics list and a need-improvement list plus a radar chart.

### 6. Smart Recommendation Engine
- As a student, I want recommendations for weak topics, a daily practice plan, and a personalized learning path based on my performance.
- As a student, I want my plan to show concrete counts, such as five array problems, three tree problems, and two graph problems.

### 7. Contest Analysis
- As a student, I want to record contest results for LeetCode, Codeforces, and CodeChef.
- As a student, I want to see my best rank, worst rank, average rank, rating growth, participation frequency, and a rating trend line.

### 8. Coding Heatmap
- As a student, I want a GitHub-style calendar heatmap of daily activity so I can see consistency, active days, missed days, and streaks.

### 9. Interview Scheduler
- As a student, I want to schedule interviews with company, round, date, time, location, meeting link, and status.
- As a student, I want to see upcoming interviews on the dashboard.

### 10. Mock Interview Tracker
- As a student, I want to log mock interviews with date, interviewer, topic, score, and feedback.
- As a student, I want to see my mock-interview performance analytics over time.

### 11. Resume Tracker
- As a student, I want to manage multiple resume versions (e.g., Resume V1, Resume V2, Resume V3).
- As a student, I want to track applications, interviews, offers, rejections, and pending counts plus a funnel chart.

### 12. Job Application Tracker
- As a student, I want to add job applications with company, role, location, applied date, and status.
- As a student, I want to view applications on a Kanban board by status.

### 13. Company Preparation Module
- As a student, I want to select a target company from Google, Amazon, Microsoft, Meta, Adobe, or Atlassian.
- As a student, I want to see frequently asked topics for that company and a generated preparation roadmap.

### 14. AI Interview Coach
- As a student, I want to describe a recent interview failure in free text and receive structured weak areas and a recommended plan.
- As a student, I want to know that this is an LLM-backed feature, not a rule-based recommendation, and that the input and output are explicit.

### 15. Notification System
- As a student, I want daily reminders, goal-completion alerts, interview notifications, and contest notifications.
- As a student, I want to choose which notification types I receive.

### 16. Admin Dashboard
- As an admin, I want to manage users, view platform statistics, manage recommendations, and monitor platform usage.

## 6. Feature Requirements

### 6.1 Authentication & Profile

#### Registration & Login
- The registration flow collects name, email, password, and role.
- The login flow issues a JWT access token and a refresh token.
- Logout invalidates the refresh token on the server.

#### Password & Verification
- Forgot password sends a reset link to the registered email.
- Reset password consumes the token and updates the password.
- Change password requires the current password and a new password.
- Email verification confirms the email address before full account activation.

#### Profile Fields
The user profile stores the following fields:
- id
- name
- email
- password
- college
- graduationYear
- targetCompany
- targetRole
- leetcodeUsername
- githubUsername
- createdAt
- updatedAt

#### Security Mechanics
- bcrypt hashes passwords before storage.
- Routes that expose user data or actions require a valid JWT access token.
- Refresh tokens rotate on use.
- Role-based access control distinguishes regular users from admins.
- Input validation runs on every registration, login, and profile update.
- Centralized error-handling middleware returns consistent error shapes.

### 6.2 Dashboard

#### Welcome Section
- The dashboard greets the user by name.
- It displays the current goal, for example "Solve 500 Problems".
- It shows progress toward that goal, for example "425 / 500".

#### Stat Cards
The dashboard displays six stat cards:
1. Total Problems Solved
2. Current Streak
3. Longest Streak
4. Contest Rating
5. Monthly Growth
6. Applications Submitted

#### Progress Charts
- Weekly Growth, Monthly Growth, and Yearly Growth charts are present.
- The Weekly Growth chart shows a day-by-day solved-count progression, for example Monday 250 rising to Sunday 278.

### 6.3 LeetCode Integration

#### Input
- The user enters a LeetCode username.

#### Fetched & Displayed Fields
- Total Solved
- Easy Solved
- Medium Solved
- Hard Solved
- Acceptance Rate
- Contest Rating
- Global Ranking

The platform displays these values in a shape similar to: Easy 150, Medium 230, Hard 45, Total 425.

#### Snapshot Requirement
- The system stores daily snapshots of the data above.
- It does not display only the live state; it preserves historical snapshots.
- The analytics engine, streak logic, and growth charts read from these snapshots.

### 6.4 Coding Analytics Engine

#### Source
- Daily snapshots from LeetCode Integration feed the engine.

#### Calculated Metrics
- Daily Growth
- Weekly Growth
- Monthly Growth
- Problems Per Day
- Success Rate
- Coding Consistency
- Streak Analysis

#### Visualizations
- Line Charts
- Bar Charts
- Area Charts

### 6.5 Topic Analysis

#### Topics Tracked
The platform tracks exactly these fourteen topics:
1. Arrays
2. Strings
3. Linked Lists
4. Stacks
5. Queues
6. Trees
7. Graphs
8. Dynamic Programming
9. Greedy
10. Backtracking
11. Sliding Window
12. Binary Search
13. Heap
14. Trie

#### Per-Topic Data
For each topic the system stores:
- Solved
- Attempted
- Success Rate

#### Derived Output
- Strong Topics list. Example shape: Strong = Arrays, Strings.
- Need Improvement list. Example shape: Needs Improvement = DP, Graphs.

#### Visualization
- Radar chart showing topic performance across the fourteen topics.

### 6.6 Smart Recommendation Engine

#### Core Rule
- If a topic's success rate is below 50%, the system recommends practice questions from that topic.

#### Outputs
- Weak Topic Recommendations
- Daily Practice Plans
- Personalized Learning Paths

#### Example Output Shape
A "Today's Plan" card lists concrete counts per topic, for example:
- 5 Array Problems
- 3 Tree Problems
- 2 Graph Problems

### 6.7 Contest Analysis

#### Platforms
- LeetCode
- Codeforces
- CodeChef

#### Per-Contest Fields
- Contest Name
- Date
- Rank
- Solved
- Rating Before
- Rating After

#### Metrics
- Best Rank
- Worst Rank
- Average Rank
- Rating Growth
- Contest Participation Frequency

#### Visualization
- Rating trend line chart. Example shape: a rising sequence such as 1450, 1492, 1520, 1580, 1625.

### 6.8 Coding Heatmap

- A GitHub-style calendar heatmap shows daily coding activity.
- The system surfaces:
  - Consistency
  - Active Days
  - Missed Days
  - Streaks
- Color intensity reflects activity level per day.

### 6.9 Interview Scheduler

#### Fields
- Company
- Round
- Date
- Time
- Location
- Meeting Link
- Status

#### Status Values
- Scheduled
- Completed
- Cancelled

#### Dashboard Requirement
- The dashboard surfaces upcoming interviews in a visible section.

### 6.10 Mock Interview Tracker

#### Fields
- Date
- Interviewer
- Topic
- Score
- Feedback

#### Example Output Shape
- Topic = DSA
- Score = 7/10
- Feedback = "Need Graph Practice"

#### Analytics
- The system generates performance analytics over time from these entries.

### 6.11 Resume Tracker

#### Resume Versions
- The user can maintain multiple resume versions, for example Resume V1, Resume V2, Resume V3.
- Each version links to a file on Cloudinary.

#### Tracked Counts
- Applications
- Interviews
- Offers
- Rejections
- Pending

Example shape: Applications 50, Rejected 35, Pending 10, Interview 5.

#### Visualization
- Funnel chart showing the conversion from Applications to Interviews to Offers.

### 6.12 Job Application Tracker

#### Fields
- Company
- Role
- Location
- Applied Date
- Status

#### Status Values
- Applied
- OA
- Interview
- Rejected
- Selected

#### Display
- The board groups applications by status.

### 6.13 Company Preparation Module

#### Target Companies
The user selects one from:
- Google
- Amazon
- Microsoft
- Meta
- Adobe
- Atlassian

#### Output
- Frequently asked topics per company. Example shape: Google maps to Graphs, Trees, Dynamic Programming.
- Generated preparation roadmap with suggested problem counts and ordering.

### 6.14 AI Interview Coach

This feature is an LLM-backed call, not a rules engine.

#### Input
- The user submits a free-text failure description.
- Example input: "I failed my Amazon interview."

#### Structured Output
- Weak Areas. Example: Trees, System Design, Behavioral Questions.
- Recommended Plan. Example: 10 Tree Problems, 5 LLD Problems, STAR Method Practice.

#### Contract
- The system sends structured input to an LLM and receives structured output.
- The output schema is fixed and validated before display.

### 6.15 Notification System

#### Notification Types
- Daily Reminders
- Goal Completion Alerts
- Interview Notifications
- Contest Notifications

#### Requirements
- Users can toggle each notification type.
- Notifications arrive via toast and in-app badge.

### 6.16 Admin Dashboard

#### Capabilities
- Manage Users
- View Statistics
- Manage Recommendations
- Monitor Platform Usage

#### Access
- Only admins access the admin dashboard.

## 7. Prioritization / Release Plan

### P0 — MVP
Must ship before any other release.
- Authentication & Profile
- Dashboard
- LeetCode Integration
- Coding Analytics Engine
- Topic Analysis
- Coding Heatmap

### P1 — Core Interview Prep
Ship after P0 stabilizes.
- Contest Analysis
- Interview Scheduler
- Mock Interview Tracker
- Job Application Tracker

### P2 — Intelligence & Career Tools
Ship after validating P1 adoption.
- Smart Recommendation Engine
- Resume Tracker
- Company Preparation Module
- AI Interview Coach

### P3 — Platform & Operations
Ship after the core user experience is solid.
- Notification System
- Admin Dashboard

## 8. Data Requirements

v1 uses these entities:

- **Users**: Stores identity, credentials, profile details (college, graduationYear, targetCompany, targetRole, leetcodeUsername, githubUsername), roles, and timestamps. This anchors every other record.
- **ProblemStats**: Stores the latest aggregated problem-solving counts per difficulty, acceptance rate, and similar platform-level metrics. It serves as the live-facing view; historical changes live in DailySnapshots.
- **DailySnapshots**: Stores daily captures of LeetCode stats (Total Solved, Easy Solved, Medium Solved, Hard Solved, Acceptance Rate, Contest Rating, Global Ranking). Snapshots feed the analytics engine, growth charts, and streak calculations.
- **Topics**: Stores the catalog of fourteen topics (Arrays, Strings, Linked Lists, Stacks, Queues, Trees, Graphs, Dynamic Programming, Greedy, Backtracking, Sliding Window, Binary Search, Heap, Trie).
- **TopicPerformance**: Stores per-user solved count, attempted count, and success rate for each topic. This drives the strong/weak topic lists, radar chart, and recommendation engine.
- **Contests**: Stores per-contest records (Contest Name, Date, Rank, Solved, Rating Before, Rating After) and platform (LeetCode, Codeforces, CodeChef). This feeds contest metrics and rating trend charts.
- **Interviews**: Stores scheduled interview details (Company, Round, Date, Time, Location, Meeting Link, Status) with values Scheduled, Completed, Cancelled.
- **MockInterviews**: Stores mock interview logs (Date, Interviewer, Topic, Score, Feedback) and generates performance analytics over time.
- **Applications**: Stores job applications (Company, Role, Location, Applied Date, Status) with values Applied, OA, Interview, Rejected, Selected. This feeds the Kanban board and funnel analytics.
- **Resumes**: Stores resume versions (e.g., Resume V1, Resume V2, Resume V3), file links on Cloudinary, and the tracked counts (Applications, Interviews, Offers, Rejections, Pending).
- **Recommendations**: Stores generated weak-topic recommendations, daily practice plans, and personalized learning paths. It links back to TopicPerformance and the user.
- **Goals**: Stores user-defined goals such as "Solve 500 Problems" and the current progress (e.g., "425 / 500") used in the dashboard welcome section.
- **Notifications**: Stores user preferences and queued messages for Daily Reminders, Goal Completion Alerts, Interview Notifications, and Contest Notifications.

## 9. UX Requirements

### Pages
The v1 frontend includes these twelve pages:
1. Landing Page
2. Login
3. Register
4. Dashboard
5. Analytics
6. Contest Analysis
7. Heatmap
8. Interviews
9. Resume Tracker
10. Applications
11. Settings
12. Profile

### Design Requirements
The UI supports:
- Dark Mode
- Responsive Design
- Mobile Friendly
- Professional Dashboard
- Glassmorphism Effects
- Smooth Animations
- Loading Skeletons
- Toast Notifications

### Required States Per Page
- **Empty state**: When no data exists, show a clear message, a relevant icon, and a primary action (for example, "Connect LeetCode" or "Add Application").
- **Loading state**: Use skeleton loaders for cards, charts, and lists. Avoid spinner-only screens.
- **Error state**: Show an error message, a retry action, and a support or documentation link when relevant.
- **Success state**: Confirm actions with toast notifications and, when relevant, updated dashboards.

## 10. Technical Considerations & Risks

### Full Tech Stack
v1 uses the following stack:

**Frontend**
- React.js
- React Router
- Redux Toolkit
- Axios
- Tailwind CSS
- Framer Motion
- React Hook Form
- Recharts
- React Query

**Backend**
- Node.js
- Express.js
- REST APIs
- JWT authentication
- bcrypt password hashing
- Role-based access control
- Input validation
- Centralized error-handling middleware

**Database**
- PostgreSQL with normalized schema, foreign keys, and indexing.

**Deployment**
- Frontend on Vercel.
- Backend on Render.
- Database on Neon (PostgreSQL).
- File storage on Cloudinary.

### API Reliability
- LeetCode has no official public API. CodeTrack Pro uses the unofficial GraphQL endpoint. It caches data, snapshots daily, and monitors for breakage. The backend detects fetch failures, retries with exponential backoff, and surfaces a stale-data warning to the user.
- CodeChef has no stable public API. v1 uses manual entry or CSV import only.
- Codeforces has a real, documented public API. It supports the safe live integration.

### Rate Limits & Staleness
- The backend respects LeetCode and Codeforces rate limits. It batches and throttles requests.
- Snapshot jobs run daily or on demand. If a snapshot fails, the dashboard shows the previous snapshot with a "last updated" timestamp.
- The dashboard flags data older than 48 hours as stale.

### Auth Security
- JWT access tokens have a short expiry; refresh tokens rotate and live in secure storage.
- bcrypt hashes passwords with a cost factor appropriate for production.
- Input validation prevents injection and malformed payloads.
- Role-based access control guards admin endpoints.
- Centralized error-handling middleware does not leak stack traces or sensitive values.

### Scalability
- The snapshot job is isolated so it can be moved to a background worker later.
- Database indexes support high-frequency reads for dashboards and analytics.
- Cloudinary serves static files, reducing backend load.

## 11. System Design Notes

### High-Level Architecture
- The React.js frontend runs on Vercel and communicates with the Node.js/Express backend on Render.
- The backend exposes REST APIs protected by JWT authentication.
- PostgreSQL on Neon stores normalized data, and Cloudinary stores resume files.
- A scheduled snapshot service fetches LeetCode and Codeforces data and stores daily records.

### Data Flow
1. The user registers and verifies email.
2. The user adds LeetCode and GitHub usernames in profile settings.
3. A scheduled snapshot job fetches LeetCode stats via the unofficial GraphQL endpoint and stores them in DailySnapshots.
4. The analytics engine reads snapshots to compute Daily Growth, Weekly Growth, Monthly Growth, Problems Per Day, Success Rate, Coding Consistency, and Streak Analysis.
5. Snapshots or manual entries update TopicPerformance and Contests.
6. The recommendation engine generates recommendations from TopicPerformance success rates below 50%.
7. Users manage Interviews, MockInterviews, Applications, and Resumes; these feed dashboard cards and charts.

### Authentication Flow
1. Registration hashes the password with bcrypt and stores a user record.
2. Login verifies the password and returns a JWT access token and refresh token.
3. The frontend stores the access token and sends it in the Authorization header.
4. Protected routes validate the token and enforce role-based access control.
5. Token refresh uses a refresh endpoint that rotates the refresh token.

### Snapshot-to-Analytics Flow
- DailySnapshots serves as the single source of truth for historical progress.
- The analytics engine queries DailySnapshots to compute growth, streaks, and consistency.
- Charts render the computed results without recomputing on every page load; the backend caches or pre-aggregates results when possible.

## 12. Open Questions

1. What is the fallback if the LeetCode GraphQL endpoint changes or is rate-limited more tightly than expected? Do we allow manual override for the fetched fields?
2. Should the mock-interview score be numeric only, or do we also support text rubrics such as communication, problem-solving, and coding speed?
3. How does the AI Interview Coach handle personal or sensitive data? Do we need an explicit consent screen and data-retention policy?
4. What is the retention policy for DailySnapshots and contest history? Do we archive data after a certain number of years?
5. Should the platform support a public profile or a shareable link for recruiters, or is progress private by default?
6. Which notification channels are in scope for v1? In-app only, or email and push as well?
7. What are the exact rules for coding consistency scoring? Does one problem per day count as active, or do we weight by difficulty?
8. How do we validate the output of the AI Interview Coach before presenting it to the user? Do we run a review step or a confidence threshold?

## 13. Appendix: Resume/Portfolio Value

CodeTrack Pro gives placement-prep students and freshers a concrete, data-backed portfolio of their interview readiness.

- The dashboard shows real progress: goals, stat cards, and weekly/monthly/yearly growth charts.
- The LeetCode integration and daily snapshots prove consistency and improvement over time.
- Topic analysis and the recommendation engine produce a clear narrative of strengths and a plan to close gaps.
- Contest analysis and the heatmap demonstrate participation and discipline.
- The interview scheduler, mock interview tracker, job application tracker, and resume tracker show that the candidate can manage a real job search pipeline.

The v1 scope (P0 and P1) is sufficient for this value: a student can connect a coding platform, track analytics, practice by topic, schedule and log interviews, and manage applications. The P2 and P3 features add intelligence and operations, but the core portfolio story is already complete in the first two release phases.
