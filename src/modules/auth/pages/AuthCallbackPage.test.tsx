import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AuthCallbackPage from './AuthCallbackPage';

const mockNavigate = vi.hoisted(() => vi.fn());
const mockLogin = vi.hoisted(() => vi.fn());
const mockExchangeCodeForTokens = vi.hoisted(() => vi.fn());
const mockExchangeGoogleToken = vi.hoisted(() => vi.fn());
const mockGetCurrentUser = vi.hoisted(() => vi.fn());
const mockBuildAuthUser = vi.hoisted(() => vi.fn());
const mockSetTokens = vi.hoisted(() => vi.fn());
const mockSetUser = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('@/app/auth/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin }),
}));

vi.mock('@/app/auth/cognitoHostedUi', () => ({
  exchangeCodeForTokens: mockExchangeCodeForTokens,
}));

vi.mock('@/app/auth/tokenStorage', () => ({
  tokenStorage: {
    setTokens: mockSetTokens,
    setUser: mockSetUser,
    clearAuth: vi.fn(),
  },
}));

vi.mock('@/services/api/authApi', () => ({
  authApi: {
    exchangeGoogleToken: mockExchangeGoogleToken,
    getCurrentUser: mockGetCurrentUser,
  },
  buildAuthUserFromCurrentUser: mockBuildAuthUser,
}));

const tokens = {
  accessToken: 'access-token',
  idToken: 'id-token',
  refreshToken: 'refresh-token',
};

const currentUser = {
  userId: 'user-1',
  email: 'candidate@example.com',
  provider: 'GOOGLE',
  roles: ['JOB_SEEKER'],
  accountStatus: 'ACTIVE',
};

const user = {
  id: 'user-1',
  userId: 'user-1',
  email: 'candidate@example.com',
  firstName: 'Candidate',
  lastName: 'User',
  displayName: 'Candidate User',
  role: 'JOB_SEEKER',
  roles: ['JOB_SEEKER'],
  permissions: [],
};

const renderPage = (state: 'login' | 'signup') =>
  render(
    <MemoryRouter initialEntries={[`/callback?code=auth-code&state=${state}`]}>
      <AuthCallbackPage />
    </MemoryRouter>,
  );

const renderCallbackErrorPage = () =>
  render(
    <MemoryRouter initialEntries={[
      '/callback?error=access_denied&error_description=Google%20account%20access%20was%20denied.',
    ]}>
      <AuthCallbackPage />
    </MemoryRouter>,
  );

describe('AuthCallbackPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExchangeCodeForTokens.mockResolvedValue(tokens);
    mockExchangeGoogleToken.mockResolvedValue({});
    mockGetCurrentUser.mockResolvedValue(currentUser);
    mockBuildAuthUser.mockResolvedValue(user);
  });

  it('registers a Google candidate before loading the user for signup', async () => {
    sessionStorage.setItem('pending_candidate_profile', JSON.stringify({
      fullName: 'Previous User',
      email: 'previous@example.com',
      phoneNumber: '8095376689',
    }));

    renderPage('signup');

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/profile/create', { replace: true });
    });

    expect(mockExchangeGoogleToken).toHaveBeenCalledWith({ idToken: 'id-token' });
    expect(mockExchangeGoogleToken.mock.invocationCallOrder[0]).toBeLessThan(
      mockGetCurrentUser.mock.invocationCallOrder[0],
    );
    expect(sessionStorage.getItem('pending_candidate_profile')).toBeNull();
    expect(mockLogin).toHaveBeenCalledWith({ user, tokens });
  });

  it('does not register again for a normal Google login', async () => {
    renderPage('login');

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/candidate/dashboard', { replace: true });
    });

    expect(mockExchangeGoogleToken).not.toHaveBeenCalled();
    expect(mockGetCurrentUser).toHaveBeenCalledOnce();
  });

  it('continues as login when the Google candidate already exists', async () => {
    mockExchangeGoogleToken.mockRejectedValue({ response: { status: 409 } });

    renderPage('signup');

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/profile/create', { replace: true });
    });

    expect(mockGetCurrentUser).toHaveBeenCalledOnce();
    expect(mockLogin).toHaveBeenCalledWith({ user, tokens });
  });

  it('forwards the Cognito callback error description to login', async () => {
    renderCallbackErrorPage();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        '/login?error=google_callback&message=Google+account+access+was+denied.',
        { replace: true },
      );
    });
  });
});