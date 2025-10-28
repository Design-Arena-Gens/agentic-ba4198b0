'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', startIcon, endIcon, error, ...props }, ref) => {
    return (
      <label className="flex w-full flex-col gap-1 text-sm text-slate-700">
        <span className="sr-only">{props['aria-label']}</span>
        <div
          className={cn(
            'flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm transition-[box-shadow,border-color] focus-within:border-brand focus-within:shadow-focus',
            error && 'border-danger focus-within:border-danger focus-within:shadow-none'
          )}
        >
          {startIcon && <span className="mr-2 text-muted" aria-hidden>{startIcon}</span>}
          <input
            ref={ref}
            type={type}
            className={cn(
              'w-full border-none bg-transparent text-base text-slate-900 placeholder:text-slate-400 focus:outline-none'
            )}
            {...props}
          />
          {endIcon && <span className="ml-2 text-muted" aria-hidden>{endIcon}</span>}
        </div>
        {error && <span className="px-4 text-xs text-danger">{error}</span>}
      </label>
    );
  }
);

Input.displayName = 'Input';
