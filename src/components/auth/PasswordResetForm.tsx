'use client';

import { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

export function PasswordResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get('token') ?? '';
  const emailFromUrl = searchParams.get('email') ?? '';
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState(emailFromUrl);
  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      await resetPassword({ email, token, newPassword: password });
      setMessage('Password updated successfully. Redirecting…');
      setTimeout(() => router.push('/account'), 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reset password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-semibold text-slate-800">
          Email address
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-11 w-full rounded-full border border-slate-200 px-4 text-sm focus:border-brand focus:outline-none"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="token" className="text-sm font-semibold text-slate-800">
          Reset token
        </label>
        <input
          id="token"
          type="text"
          required
          value={token}
          onChange={(event) => setToken(event.target.value)}
          className="h-11 w-full rounded-full border border-slate-200 px-4 text-sm focus:border-brand focus:outline-none"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-semibold text-slate-800">
          New password
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="h-11 w-full rounded-full border border-slate-200 px-4 text-sm focus:border-brand focus:outline-none"
        />
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      {message && <p className="text-sm text-success">{message}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? 'Updating…' : 'Update password'}
      </Button>
    </form>
  );
}
