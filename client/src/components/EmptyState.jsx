import React from 'react';
import { FolderGit2 } from 'lucide-react';
import Button from './Button';
import { cn } from '../utils/cn';

export default function EmptyState({
  icon: Icon = FolderGit2,
  title = 'No items found',
  description = 'Get started by creating your first entry.',
  actionLabel,
  onAction,
  className,
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-10 sm:p-14 rounded-2xl border border-dashed border-white/[0.12] bg-[#10121D]/50',
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 mb-4 shadow-glow-sm">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-white mb-1.5">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary" size="md">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
