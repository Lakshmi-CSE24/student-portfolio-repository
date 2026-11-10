import React from 'react';
import { cn } from '../utils/cn';

export default function LoadingSkeleton({
  type = 'card',
  count = 1,
  className,
}) {
  const items = Array.from({ length: count });

  if (type === 'card') {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6', className)}>
        {items.map((_, i) => (
          <div
            key={i}
            className="p-6 rounded-2xl bg-[#11131F] border border-white/[0.05] animate-pulse space-y-4"
          >
            <div className="h-44 bg-white/[0.04] rounded-xl" />
            <div className="space-y-2">
              <div className="h-5 bg-white/[0.06] rounded-md w-3/4" />
              <div className="h-3.5 bg-white/[0.03] rounded-md w-full" />
              <div className="h-3.5 bg-white/[0.03] rounded-md w-2/3" />
            </div>
            <div className="flex gap-2 pt-2">
              <div className="h-6 w-16 bg-white/[0.04] rounded-full" />
              <div className="h-6 w-20 bg-white/[0.04] rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'stat') {
    return (
      <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5', className)}>
        {items.map((_, i) => (
          <div
            key={i}
            className="p-6 rounded-2xl bg-[#11131F] border border-white/[0.05] animate-pulse flex items-start justify-between"
          >
            <div className="space-y-3 w-2/3">
              <div className="h-3.5 bg-white/[0.05] rounded w-20" />
              <div className="h-8 bg-white/[0.07] rounded w-16" />
              <div className="h-3 bg-white/[0.03] rounded w-28" />
            </div>
            <div className="w-11 h-11 bg-white/[0.05] rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('space-y-3 animate-pulse', className)}>
      {items.map((_, i) => (
        <div key={i} className="h-12 bg-white/[0.04] rounded-xl w-full" />
      ))}
    </div>
  );
}
