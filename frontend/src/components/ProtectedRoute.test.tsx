import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import ProtectedRoute from './ProtectedRoute';
import authReducer from '../features/auth/authSlice';
import type { User } from '../features/auth/authSlice';

function renderWithAuth(state: {
  isAuthenticated: boolean;
  loading: boolean;
  user?: User | null;
}) {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        user: state.user ?? null,
        accessToken: state.isAuthenticated ? 'at' : null,
        refreshToken: state.isAuthenticated ? 'rt' : null,
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
        error: null
      }
    }
  });

  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/login" element={<div data-testid="login-page">Login</div>} />
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <div data-testid="protected-page">Protected</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </Provider>
  );

  return store;
}

describe('ProtectedRoute', () => {
  it('shows a spinner while auth state is loading', () => {
    renderWithAuth({ isAuthenticated: false, loading: true });
    expect(document.querySelector('[class*="animate-spin"]')).toBeInTheDocument();
  });

  it('redirects unauthenticated users to /login', () => {
    renderWithAuth({ isAuthenticated: false, loading: false });
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-page')).not.toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    renderWithAuth({
      isAuthenticated: true,
      loading: false,
      user: { id: 'u1', email: 'a@b.com', name: 'Alice', role: 'USER' }
    });
    expect(screen.getByTestId('protected-page')).toBeInTheDocument();
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
  });
});
