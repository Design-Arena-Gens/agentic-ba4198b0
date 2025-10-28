'use client';

import { forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = Omit<HTMLMotionProps<'button'>, 'children'> & {
  children?: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
};

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:
    'bg-brand text-white shadow-subtle hover:bg-brand-dark focus-visible:shadow-focus',
  secondary:
    'bg-slate-900 text-white hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-brand',
  outline:
    'border border-brand text-brand hover:bg-brand/10 focus-visible:ring-2 focus-visible:ring-brand/60',
  ghost:
    'text-slate-700 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-brand/60',
};

const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-5 text-sm font-semibold',
  lg: 'h-12 px-6 text-base font-semibold',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'primary', size = 'md', className, icon, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.98 }}
        whileHover={{ y: -1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className={cn(
          'inline-flex items-center justify-center rounded-full transition-all focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60',
          VARIANT_STYLES[variant],
          SIZE_STYLES[size],
          className
        )}
        {...props}
      >
        {icon && <span className="mr-2 flex items-center" aria-hidden>{icon}</span>}
        <span className="font-semibold tracking-tight">{children}</span>
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
