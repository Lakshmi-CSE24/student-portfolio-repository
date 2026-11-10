import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Sparkles, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import Input from '../components/Input';
import Button from '../components/Button';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const successMessage = location.state?.successMessage;
  const initialEmail = location.state?.email || '';
  const fromLocation = location.state?.from?.pathname || '/dashboard';

  const [formData, setFormData] = useState({
    email: initialEmail,
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email.trim() || !formData.password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      await login(formData.email, formData.password);
      // Navigate to intended protected route or dashboard
      navigate(fromLocation, { replace: true });
    } catch (err) {
      const serverMessage = err.response?.data?.message || err.message || 'Login failed.';
      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090A0F] text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-brand-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center mb-8 text-center"
      >
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-glow mb-3">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Welcome back to <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-violet-400 bg-clip-text text-transparent">Folio</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm">
          Sign in to your university student portfolio repository.
        </p>
      </motion.div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="w-full max-w-md"
      >
        <div className="p-7 sm:p-8 rounded-2xl bg-[#11131F]/90 border border-white/[0.08] backdrop-blur-xl shadow-2xl shadow-black/80">
          {/* Success Banner from Registration */}
          {successMessage && !error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-2.5 text-xs text-emerald-300"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </motion.div>
          )}

          {/* Error Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-2.5 text-xs text-rose-300"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="University Email"
              type="email"
              icon={Mail}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="student@university.edu"
              required
            />

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Password
                </label>
                <a href="#forgot" className="text-xs text-brand-400 hover:text-brand-300 font-medium">
                  Forgot?
                </a>
              </div>
              <Input
                type="password"
                icon={Lock}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••••••"
                required
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={loading}
                rightIcon={ArrowRight}
              >
                Sign In to Dashboard
              </Button>
            </div>
          </form>

          {/* Security footnote */}
          <div className="mt-6 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center gap-2.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Secure JWT authentication backed by MySQL80</span>
          </div>

          <div className="mt-6 pt-5 border-t border-white/[0.08] text-center text-xs text-slate-400">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-semibold ml-1">
              Create student account
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
