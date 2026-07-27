import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AppShell from './components/AppShell';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import TopicAnalysis from './pages/TopicAnalysis';
import Heatmap from './pages/Heatmap';
import Contests from './pages/Contests';
import ContestAnalysis from './pages/ContestAnalysis';
import Interviews from './pages/Interviews';
import MockInterviews from './pages/MockInterviews';
import Applications from './pages/Applications';
import ResumeTracker from './pages/ResumeTracker';
import Settings from './pages/Settings';

const protectedElement = (page: React.ReactNode) => (
  <ProtectedRoute>
    <AppShell>{page}</AppShell>
  </ProtectedRoute>
);

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  { path: '/reset-password', element: <ResetPassword /> },
  { path: '/dashboard', element: protectedElement(<Dashboard />) },
  { path: '/analytics', element: protectedElement(<Analytics />) },
  { path: '/topics', element: protectedElement(<TopicAnalysis />) },
  { path: '/contest-analysis', element: protectedElement(<Contests />) },
  { path: '/contests/analysis', element: protectedElement(<ContestAnalysis />) },
  { path: '/heatmap', element: protectedElement(<Heatmap />) },
  { path: '/interviews', element: protectedElement(<Interviews />) },
  { path: '/mock-interviews', element: protectedElement(<MockInterviews />) },
  { path: '/resume-tracker', element: protectedElement(<ResumeTracker />) },
  { path: '/applications', element: protectedElement(<Applications />) },
  { path: '/company-prep', element: protectedElement(<div className="text-xl">Company prep coming soon</div>) },
  { path: '/ai-coach', element: protectedElement(<div className="text-xl">AI coach coming soon</div>) },
  { path: '/profile', element: protectedElement(<div className="text-xl">Profile coming soon</div>) },
  { path: '/settings', element: protectedElement(<Settings />) },
  { path: '/admin', element: protectedElement(<div className="text-xl">Admin coming soon</div>) }
]);
