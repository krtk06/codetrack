import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AppShell from './components/AppShell';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
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
  { path: '/contest-analysis', element: protectedElement(<div className="text-xl">Contest analysis coming soon</div>) },
  { path: '/heatmap', element: protectedElement(<div className="text-xl">Heatmap coming soon</div>) },
  { path: '/interviews', element: protectedElement(<div className="text-xl">Interviews coming soon</div>) },
  { path: '/resume-tracker', element: protectedElement(<div className="text-xl">Resume tracker coming soon</div>) },
  { path: '/applications', element: protectedElement(<div className="text-xl">Applications coming soon</div>) },
  { path: '/company-prep', element: protectedElement(<div className="text-xl">Company prep coming soon</div>) },
  { path: '/ai-coach', element: protectedElement(<div className="text-xl">AI coach coming soon</div>) },
  { path: '/profile', element: protectedElement(<div className="text-xl">Profile coming soon</div>) },
  { path: '/settings', element: protectedElement(<Settings />) },
  { path: '/admin', element: protectedElement(<div className="text-xl">Admin coming soon</div>) }
]);
