'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

type AccountProfileCardProps = {
  user: {
    name: string;
    email: string;
  };
};

export function AccountProfileCard({ user }: AccountProfileCardProps) {
  const [name, setName] = useState(user.name);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus('saving');
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        throw new Error('Failed to update');
      }
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 1500);
    } catch (error) {
      console.error(error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2000);
    }
  }

  return (
    <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <header>
        <h2 className="text-xl font-semibold text-slate-900">Profile</h2>
        <p className="text-sm text-muted">Keep your contact information up to date.</p>
      </header>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-semibold text-slate-800">
            Full name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="h-11 w-full rounded-full border border-slate-200 px-4 text-sm focus:border-brand focus:outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-800">Email</label>
          <p className="rounded-full border border-dashed border-slate-200 px-4 py-2 text-sm text-muted">
            {user.email}
          </p>
        </div>
        <Button type="submit" size="sm" disabled={status === 'saving'}>
          {status === 'saving' ? 'Saving…' : 'Save changes'}
        </Button>
        {status === 'saved' && <p className="text-sm text-success">Profile updated.</p>}
        {status === 'error' && <p className="text-sm text-danger">Unable to update profile.</p>}
      </form>
    </section>
  );
}
