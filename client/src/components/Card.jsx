import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';

export default function Card({
  children,
  className,
  hover = false,
  glow = false,
  animate = false,
  padding = 'normal',
  onClick,
  ...props
}) {
  const paddings = {
    none: 'p-0',
    sm: 'p-3.5',
    normal: 'p-5 sm:p-6',
    lg: 'p-7 sm:p-8',
  };

  const Component = animate ? motion.div : 'div';

  return (
    <Component
      onClick={onClick}
      {...(animate ? {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.35, ease: 'easeOut' }
      } : {})}
      className={cn(
        'relative bg-[#11131F]/80 backdrop-blur-md rounded-2xl border border-white/[0.07] overflow-hidden',
        hover && 'transition-all duration-300 hover:border-brand-500/30 hover:bg-[#141726]/90 hover:shadow-xl hover:shadow-brand-500/5 hover:-translate-y-0.5',
        glow && 'shadow-glow-sm border-brand-500/20',
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
