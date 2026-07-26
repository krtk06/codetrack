import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Settings from './Settings';
import * as usersApi from '../features/users/usersApi';

vi.mock('../features/users/usersApi', () => ({
  getCurrentUser: vi.fn(),
  updateCurrentUser: vi.fn()
}));

const mockUser = {
  id: 'u1',
  email: 'alice@example.com',
  name: 'Alice',
  role: 'USER',
  college: 'MIT',
  graduationYear: 2025,
  targetCompany: 'Google',
  targetRole: 'SDE Intern',
  leetcodeUsername: 'alice_lc',
  githubUsername: 'alice_gh',
  isEmailVerified: true
};

describe('Settings page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads and displays the current profile', async () => {
    vi.mocked(usersApi.getCurrentUser).mockResolvedValue({ user: mockUser });
    render(<Settings />);

    await waitFor(() => expect(screen.getByDisplayValue('Alice')).toBeInTheDocument());
    expect(screen.getByDisplayValue('MIT')).toBeInTheDocument();
    expect(screen.getByDisplayValue('alice_lc')).toBeInTheDocument();
  });

  it('submits updated profile values', async () => {
    vi.mocked(usersApi.getCurrentUser).mockResolvedValue({ user: mockUser });
    vi.mocked(usersApi.updateCurrentUser).mockResolvedValue({
      user: { ...mockUser, name: 'Alice Updated', college: 'Stanford' }
    });

    render(<Settings />);
    await waitFor(() => expect(screen.getByDisplayValue('Alice')).toBeInTheDocument());

    const nameInput = screen.getByLabelText('Name');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Alice Updated');

    const collegeInput = screen.getByLabelText('College');
    await userEvent.clear(collegeInput);
    await userEvent.type(collegeInput, 'Stanford');

    await userEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() =>
      expect(usersApi.updateCurrentUser).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Alice Updated', college: 'Stanford' })
      )
    );
  });

  it('shows an error when the profile fails to load', async () => {
    vi.mocked(usersApi.getCurrentUser).mockRejectedValue(new Error('network'));
    render(<Settings />);
    await waitFor(() => expect(document.querySelector('[class*="animate-spin"]')).not.toBeInTheDocument());
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
  });
});
