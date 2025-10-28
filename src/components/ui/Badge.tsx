import { cn } from '@/lib/utils';

type BadgeProps = {
  children: React.ReactNode;
  className?: string;
  tone?: 'brand' | 'success' | 'muted';
};

const toneStyles: Record<NonNullable<BadgeProps['tone']>, string> = {
  brand: 'bg-brand/10 text-brand border border-brand/30',
  success: 'bg-success/10 text-success border border-success/20',
  muted: 'bg-slate-200 text-slate-600 border border-slate-300',
};

export function Badge({ children, className, tone = 'muted' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
        toneStyles[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
