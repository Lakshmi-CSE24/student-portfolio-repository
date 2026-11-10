import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'indigo',
  index = 0,
}) {
  const colorMap = {
    indigo: {
      gradient: 'from-indigo-500/20 to-brand-500/5',
      iconBg: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
      borderGlow: 'hover:border-indigo-500/40',
    },
    emerald: {
      gradient: 'from-emerald-500/20 to-teal-500/5',
      iconBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      borderGlow: 'hover:border-emerald-500/40',
    },
    violet: {
      gradient: 'from-violet-500/20 to-purple-500/5',
      iconBg: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
      borderGlow: 'hover:border-violet-500/40',
    },
    cyan: {
      gradient: 'from-cyan-500/20 to-blue-500/5',
      iconBg: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
      borderGlow: 'hover:border-cyan-500/40',
    },
    amber: {
      gradient: 'from-amber-500/20 to-orange-500/5',
      iconBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      borderGlow: 'hover:border-amber-500/40',
    }
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'relative group p-6 rounded-2xl bg-[#11131F]/90 border border-white/[0.08] backdrop-blur-md overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40',
        scheme.borderGlow
      )}
    >
      {/* Background soft ambient gradient */}
      <div
        className={cn(
          'absolute -right-8 -top-8 w-32 h-32 rounded-full blur-2xl opacity-40 pointer-events-none bg-gradient-to-br transition-opacity duration-300 group-hover:opacity-75',
          scheme.gradient
        )}
      />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight font-sans">
              {value}
            </span>
            {trend && (
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                {trend}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-2 font-medium">
              {subtitle}
            </p>
          )}
        </div>

        {Icon && (
          <div
            className={cn(
              'p-3 rounded-xl border transition-all duration-300 group-hover:scale-110',
              scheme.iconBg
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
