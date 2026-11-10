import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../utils/cn';

export default function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  type = 'button',
  onClick,
  ...props
}) {
  const baseStyles = 'relative inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#090A0F] disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary: 'bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-600 hover:from-brand-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 focus:ring-brand-500 border border-indigo-400/20',
    secondary: 'bg-background-elevated hover:bg-background-hover text-slate-200 hover:text-white border border-white/[0.08] hover:border-white/[0.15] focus:ring-slate-500',
    outline: 'bg-transparent hover:bg-white/[0.04] text-slate-300 hover:text-white border border-white/[0.12] hover:border-white/[0.25] focus:ring-slate-500',
    ghost: 'bg-transparent hover:bg-white/[0.06] text-slate-300 hover:text-white focus:ring-slate-500',
    danger: 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 focus:ring-rose-500',
    glow: 'bg-brand-500 text-white shadow-glow hover:shadow-glow-lg border border-brand-400/30',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-5 py-3 gap-2.5',
  };

  return (
    <motion.button
      type={type}
      whileHover={!disabled && !isLoading ? { scale: 1.01, translateY: -1 } : {}}
      whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {isLoading && (
        <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
      )}
      {!isLoading && LeftIcon && (
        <LeftIcon className="w-4 h-4 text-current shrink-0" />
      )}
      <span>{children}</span>
      {!isLoading && RightIcon && (
        <RightIcon className="w-4 h-4 text-current shrink-0" />
      )}
    </motion.button>
  );
}
