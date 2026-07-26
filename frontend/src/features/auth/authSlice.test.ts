import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import authReducer, { loginUser, registerUser, logoutUser, setCredentials, logout, clearError } from './authSlice';
import { api } from '../../lib/api';

vi.mock('../../lib/api', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn()
  }
}));

const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

function createStore() {
  return configureStore({
    reducer: { auth: authReducer }
  });
}

describe('auth slice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
  });

  const user = { id: 'u1', email: 'a@b.com', name: 'Alice', role: 'USER' };

  it('has an unauthenticated initial state', () => {
    const store = createStore();
    expect(store.getState().auth.isAuthenticated).toBe(false);
    expect(store.getState().auth.user).toBeNull();
  });

  it('setCredentials stores tokens and authenticates', () => {
    const store = createStore();
    store.dispatch(setCredentials({ user, accessToken: 'at', refreshToken: 'rt' }));
    expect(store.getState().auth.isAuthenticated).toBe(true);
    expect(store.getState().auth.user).toEqual(user);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('codetrack_access_token', 'at');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('codetrack_refresh_token', 'rt');
  });

  it('logout clears state and tokens', () => {
    const store = createStore();
    store.dispatch(setCredentials({ user, accessToken: 'at', refreshToken: 'rt' }));
    store.dispatch(logout());
    expect(store.getState().auth.isAuthenticated).toBe(false);
    expect(store.getState().auth.user).toBeNull();
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('codetrack_access_token');
  });

  it('clearError resets error', () => {
    const store = createStore();
    store.dispatch(loginUser.rejected(new Error('bad'), 'request-id', { email: 'a@b.com', password: 'pass' }));
    store.dispatch(clearError());
    expect(store.getState().auth.error).toBeNull();
  });

  it('loginUser calls API and stores tokens', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { user, accessToken: 'at', refreshToken: 'rt' } });
    const store = createStore();
    await store.dispatch(loginUser({ email: 'a@b.com', password: 'pass' }));

    expect(api.post).toHaveBeenCalledWith('/auth/login', { email: 'a@b.com', password: 'pass' });
    expect(store.getState().auth.isAuthenticated).toBe(true);
    expect(store.getState().auth.user).toEqual(user);
  });

  it('registerUser calls API and stores tokens', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { user, accessToken: 'at', refreshToken: 'rt' } });
    const store = createStore();
    await store.dispatch(registerUser({ email: 'a@b.com', password: 'pass', name: 'Alice' }));

    expect(api.post).toHaveBeenCalledWith('/auth/register', { email: 'a@b.com', password: 'pass', name: 'Alice' });
    expect(store.getState().auth.isAuthenticated).toBe(true);
  });

  it('logoutUser calls API and clears state', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: null });
    const store = createStore();
    store.dispatch(setCredentials({ user, accessToken: 'at', refreshToken: 'rt' }));
    await store.dispatch(logoutUser());

    expect(api.post).toHaveBeenCalledWith('/auth/logout', { refreshToken: 'rt' });
    expect(store.getState().auth.isAuthenticated).toBe(false);
  });
});
