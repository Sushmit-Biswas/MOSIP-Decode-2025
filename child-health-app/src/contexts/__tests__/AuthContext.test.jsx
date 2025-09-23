import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';

// Mock the services
vi.mock('../../services/eSignetService', () => ({
  default: {
    sendOTP: vi.fn(),
    verifyOTP: vi.fn(),
    logout: vi.fn(),
    clearAuthData: vi.fn(),
    getStoredAuthData: vi.fn(),
  }
}));

vi.mock('../../services/activityLogger', () => ({
  default: {
    logActivity: vi.fn()
  }
}));

vi.mock('../../services/notificationService', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Test component to use the AuthContext
const TestComponent = () => {
  const { user, isAuthenticated, login, logout, loading } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'not-loading'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
      <div data-testid="user">{user ? user.name : 'no-user'}</div>
      <button onClick={() => login({ name: 'Test User', role: 'field_representative' }, 'test-token', 3600)}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should provide initial unauthenticated state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
  });

  it('should handle login successfully', async () => {
    const user = userEvent.setup();
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    await user.click(loginButton);

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
      expect(screen.getByTestId('user')).toHaveTextContent('Test User');
    });
  });

  it('should handle logout successfully', async () => {
    const user = userEvent.setup();
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // First login
    const loginButton = screen.getByText('Login');
    await user.click(loginButton);

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
    });

    // Then logout
    const logoutButton = screen.getByText('Logout');
    await user.click(logoutButton);

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
      expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    });
  });

  it('should store auth data in localStorage on login', async () => {
    const user = userEvent.setup();
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    await user.click(loginButton);

    await waitFor(() => {
      const storedData = localStorage.getItem('auth');
      expect(storedData).toBeTruthy();
      
      const parsedData = JSON.parse(storedData);
      expect(parsedData.user.name).toBe('Test User');
      expect(parsedData.token).toBe('test-token');
    });
  });

  it('should clear auth data from localStorage on logout', async () => {
    const user = userEvent.setup();
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Login first
    const loginButton = screen.getByText('Login');
    await user.click(loginButton);

    await waitFor(() => {
      expect(localStorage.getItem('auth')).toBeTruthy();
    });

    // Then logout
    const logoutButton = screen.getByText('Logout');
    await user.click(logoutButton);

    await waitFor(() => {
      expect(localStorage.getItem('auth')).toBeNull();
    });
  });
});