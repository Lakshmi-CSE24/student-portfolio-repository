import React from 'react';
import { cn } from '../utils/cn';

export default function Badge({
  children,
  variant = 'brand',
  size = 'md',
  className,
  dot = false,
  ...props
}) {
  const variants = {
    brand: 'bg-brand-500/10 text-brand-300 border-brand-500/20',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    info: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
    danger: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    neutral: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
    violet: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
  };

  const dotColors = {
    brand: 'bg-brand-400',
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    info: 'bg-cyan-400',
    danger: 'bg-rose-400',
    neutral: 'bg-slate-400',
    violet: 'bg-violet-400',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-medium',
    lg: 'text-sm px-3 py-1.5 font-semibold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border tracking-wide uppercase font-semibold select-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0 animate-pulse', dotColors[variant])} />}
      {children}
    </span>
  );
}
