import { cn } from '@/lib/utils';

type RatingStarsProps = {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabel?: boolean;
};

const sizeMap = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

export function RatingStars({ rating, size = 'md', className, showLabel = true }: RatingStarsProps) {
  const percentage = Math.min(100, Math.max(0, (rating / 5) * 100));

  return (
    <span className={cn('flex items-center gap-2', className)} aria-label={`Rated ${rating} out of 5`}>
      <span className="relative inline-block" aria-hidden>
        <span className={cn('flex text-slate-300', sizeMap[size])}>
          {'★★★★★'}
        </span>
        <span
          className={cn('absolute inset-0 flex overflow-hidden text-brand', sizeMap[size])}
          style={{ width: `${percentage}%` }}
        >
          {'★★★★★'}
        </span>
      </span>
      {showLabel && <span className="text-xs text-muted">{rating.toFixed(1)}</span>}
    </span>
  );
}
