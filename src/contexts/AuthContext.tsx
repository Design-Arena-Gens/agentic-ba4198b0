'use client';

import { createContext, useContext, useState } from 'react';
import useSWR from 'swr';

type AuthUser = {
  id: number;
  email: string;
  name: string;
  addresses?: Array<{
    id: number;
    label: string | null;
    fullName: string;
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string | null;
    isDefault: boolean;
  }>;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  error?: string;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (payload: { email: string; token: string; newPassword: string }) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) {
    throw new Error('Failed to fetch session');
  }
  return res.json();
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [clientError, setClientError] = useState<string | undefined>(undefined);
  const { data, error, isLoading, mutate } = useSWR<{ user: AuthUser | null }>(
    '/api/auth/session',
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  const user = data?.user ?? null;

  async function login(email: string, password: string) {
    setClientError(undefined);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      const message = payload.error ?? 'Unable to login';
      setClientError(message);
      throw new Error(message);
    }

    await mutate();
  }

  async function register(payload: { name: string; email: string; password: string }) {
    setClientError(undefined);
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const message = data.error ?? 'Unable to register';
      setClientError(message);
      throw new Error(message);
    }

    await mutate();
  }

  async function logout() {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    await mutate();
  }

  async function requestPasswordReset(email: string) {
    const res = await fetch('/api/auth/password/reset-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      throw new Error(payload.error ?? 'Unable to request password reset');
    }
  }

  async function resetPassword(payload: { email: string; token: string; newPassword: string }) {
    const res = await fetch('/api/auth/password/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? 'Unable to reset password');
    }
    await mutate();
  }

  const value: AuthContextValue = {
    user,
    loading: isLoading,
    error: clientError ?? (error ? error.message : undefined),
    login,
    register,
    logout,
    refresh: async () => {
      await mutate();
    },
    requestPasswordReset,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
