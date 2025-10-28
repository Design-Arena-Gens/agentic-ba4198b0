'use client';

import { useState } from 'react';
import { RatingStars } from './RatingStars';
import { Button } from '@/components/ui/Button';

type Review = {
  id?: number;
  rating: number;
  comment: string;
  reviewer: string;
  createdAt?: string | Date;
};

type ExternalReview = {
  rating: number;
  comment: string;
  reviewer: string;
  date?: string;
};

type ReviewListProps = {
  reviews: Review[];
  externalReviews: ExternalReview[];
};

export function ReviewList({ reviews, externalReviews }: ReviewListProps) {
  const [showExternal, setShowExternal] = useState(false);
  const displayReviews = showExternal ? externalReviews : reviews;

  return (
    <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Customer insights</h3>
          <p className="text-sm text-muted">
            {showExternal
              ? 'Aggregated from trusted third-party review providers.'
              : 'Verified feedback from the ShopVerse community.'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={showExternal ? 'ghost' : 'primary'}
            size="sm"
            onClick={() => setShowExternal(false)}
          >
            Internal reviews
          </Button>
          <Button
            type="button"
            variant={showExternal ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setShowExternal(true)}
          >
            Third-party reviews
          </Button>
        </div>
      </header>

      <div className="space-y-4">
        {displayReviews.length === 0 && (
          <p className="text-sm text-muted">
            {showExternal
              ? 'No third-party reviews were available at this time.'
              : 'Be the first to review this product.'}
          </p>
        )}
        {displayReviews.map((review, index) => (
          <article
            key={'id' in review ? `internal-${review.id}` : `external-${review.reviewer}-${index}`}
            className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <RatingStars rating={review.rating} size="sm" />
                <span className="text-sm font-semibold text-slate-900">{review.reviewer}</span>
              </div>
            {'createdAt' in review && review.createdAt && (
                <time
                  className="text-xs text-muted"
                  dateTime={new Date(review.createdAt).toISOString()}
                >
                  {new Date(review.createdAt).toLocaleDateString()}
                </time>
            )}
            {'date' in review && review.date && (
              <time className="text-xs text-muted" dateTime={review.date}>
                {new Date(review.date).toLocaleDateString()}
              </time>
              )}
            </div>
            <p className="mt-3 text-sm text-slate-700">“{review.comment}”</p>
          </article>
        ))}
      </div>
    </section>
  );
}
