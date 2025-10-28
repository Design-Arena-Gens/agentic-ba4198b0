'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

type ProductReviewFormProps = {
  productSlug: string;
};

export function ProductReviewForm({ productSlug }: ProductReviewFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!user) {
    return (
      <p className="rounded-2xl bg-slate-50 p-4 text-sm text-muted">
        Sign in to share your experience with this product.
      </p>
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/products/${productSlug}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ rating, comment }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Unable to submit review');
      }
      setComment('');
      setMessage('Thank you! Your review has been saved.');
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Share your thoughts</h3>
        <p className="text-sm text-muted">Help fellow shoppers make confident decisions.</p>
      </div>
      <label className="flex flex-col gap-2 text-sm text-slate-700">
        Rating
        <select
          value={rating}
          onChange={(event) => setRating(Number(event.target.value))}
          className="h-10 w-28 rounded-full border border-slate-200 px-4 text-sm focus:border-brand focus:outline-none"
        >
          {[5, 4, 3, 2, 1].map((value) => (
            <option key={value} value={value}>
              {value} stars
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-2 text-sm text-slate-700">
        Comment
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          required
          rows={4}
          className="rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-brand focus:outline-none"
          placeholder="What did you love? What could be better?"
        />
      </label>
      <Button type="submit" disabled={submitting}>
        {submitting ? 'Submitting…' : 'Submit review'}
      </Button>
      {message && <p className="text-sm text-muted">{message}</p>}
    </form>
  );
}
