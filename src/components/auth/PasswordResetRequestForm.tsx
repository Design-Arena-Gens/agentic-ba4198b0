'use client';

import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

export function PasswordResetRequestForm() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setMessage('If an account exists for this email, you will receive reset instructions shortly.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to process request');
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
          placeholder="you@example.com"
        />
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      {message && <p className="text-sm text-success">{message}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? 'Sending…' : 'Send reset link'}
      </Button>
    </form>
  );
}
