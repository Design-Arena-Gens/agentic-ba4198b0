'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

export function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register({ name, email, password });
      router.push('/account');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-semibold text-slate-800">
          Full name
        </label>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="h-11 w-full rounded-full border border-slate-200 px-4 text-sm focus:border-brand focus:outline-none"
          placeholder="Jane Doe"
        />
      </div>
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
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-semibold text-slate-800">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="h-11 w-full rounded-full border border-slate-200 px-4 text-sm focus:border-brand focus:outline-none"
          placeholder="Create a secure password"
        />
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? 'Creating account…' : 'Create account'}
      </Button>
    </form>
  );
}
