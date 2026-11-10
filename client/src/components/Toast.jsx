import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../utils/cn';

export default function Toast({
  isOpen,
  onClose,
  title,
  message,
  type = 'success',
}) {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-cyan-400 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-500/30',
    warning: 'border-amber-500/30',
    error: 'border-rose-500/30',
    info: 'border-cyan-500/30',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={cn(
            'fixed bottom-6 right-6 z-50 flex items-start gap-3 p-4 rounded-xl bg-[#141624] border shadow-2xl backdrop-blur-md max-w-sm w-full',
            borders[type]
          )}
        >
          {icons[type]}
          <div className="flex-1 min-w-0">
            {title && (
              <h4 className="text-sm font-semibold text-white tracking-tight">
                {title}
              </h4>
            )}
            {message && (
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                {message}
              </p>
            )}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
