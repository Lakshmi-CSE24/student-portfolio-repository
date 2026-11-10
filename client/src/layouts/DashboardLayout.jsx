import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  User,
  FolderGit2,
  Award,
  Code2,
  FileCheck2,
  Globe2,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Bell,
  Search,
} from 'lucide-react';
import { cn } from '../utils/cn';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Profile', path: '/profile', icon: User },
  { name: 'Projects', path: '/projects', icon: FolderGit2 },
  { name: 'Achievements', path: '/achievements', icon: Award },
  { name: 'Skills', path: '/skills', icon: Code2 },
  { name: 'Certificates', path: '/certificates', icon: FileCheck2 },
  { name: 'My Portfolio', path: '/portfolio', icon: Globe2, isHighlight: true },
];

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#090A0F] text-slate-100 flex flex-col md:flex-row antialiased selection:bg-brand-500/30 selection:text-brand-200">
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between px-5 py-3.5 bg-[#0D0F18]/90 border-b border-white/[0.08] sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-violet-600 flex items-center justify-center text-white shadow-glow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">
              Folio
            </span>
            <span className="text-[10px] block text-slate-400 font-medium tracking-wide uppercase -mt-0.5">
              Repository
            </span>
          </div>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="md:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar (Desktop sticky + Mobile drawer) */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-[#0E1018] border-r border-white/[0.07] flex flex-col transition-transform duration-300 ease-in-out md:static md:translate-x-0 md:h-screen md:sticky md:top-0',
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Logo and Brand */}
        <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-glow">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0E1018]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-white">
                  Folio
                </span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  Pro
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate max-w-[150px]">
                Student Portfolio Repo
              </p>
            </div>
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Navigation Links */}
        <div className="flex-1 px-4 py-5 overflow-y-auto space-y-1.5">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Main Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/');

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                  isActive
                    ? 'text-white bg-gradient-to-r from-brand-600/20 to-violet-600/10 border border-brand-500/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute left-0 w-1 h-5 bg-gradient-to-b from-brand-400 to-violet-500 rounded-r-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}

                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      'w-4 h-4 transition-colors',
                      isActive ? 'text-brand-400' : 'text-slate-400 group-hover:text-slate-300',
                      item.isHighlight && !isActive && 'text-violet-400'
                    )}
                  />
                  <span>{item.name}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span
                      className={cn(
                        'text-[10px] font-bold px-2 py-0.5 rounded-md border',
                        isActive
                          ? 'bg-brand-500/30 text-brand-200 border-brand-400/40'
                          : 'bg-white/[0.05] text-slate-400 border-white/[0.08]'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                  {item.isHighlight && (
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                  )}
                </div>
              </NavLink>
            );
          })}

          {/* Quick link to portfolio view */}
          <div className="pt-4">
            <NavLink
              to="/portfolio"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <ExternalLink className="w-3.5 h-3.5 text-brand-400" />
                <span>View Portfolio</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
            </NavLink>
          </div>
        </div>

        {/* User Card & Bottom Controls */}
        <div className="p-4 border-t border-white/[0.06] bg-[#0B0D14]/70 space-y-3">
          {/* Student Profile Quick Snippet */}
          <NavLink
            to="/profile"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.04] transition-colors border border-transparent hover:border-white/[0.06]"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-violet-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-glow-sm">
              {user?.name
                ? user.name
                    .split(' ')
                    .filter(Boolean)
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase()
                : 'SP'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">
                {user?.name || 'Student'}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {user?.email || 'Authenticated User'}
              </p>
            </div>
          </NavLink>

          {/* Bottom Settings & Logout */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/[0.06]">
            <NavLink
              to="/profile"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors border border-transparent hover:border-white/[0.06]"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Profile</span>
            </NavLink>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors border border-transparent hover:border-rose-500/20"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar */}
        <header className="h-16 px-6 sm:px-8 border-b border-white/[0.06] bg-[#090A0F]/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
          {/* Breadcrumb / Status */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Central Repository
            </span>
            <span className="hidden sm:inline-block text-xs text-slate-500">•</span>
            <span className="hidden sm:inline-block text-xs text-slate-400 font-medium">
              Student Identity & Credentials
            </span>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-3">
            <NavLink
              to="/portfolio"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-gradient-to-r from-brand-600/80 to-violet-600/80 hover:from-brand-500 hover:to-violet-500 text-white shadow-glow-sm transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Live Portfolio</span>
            </NavLink>

            <div className="w-px h-5 bg-white/[0.1] mx-1 hidden sm:block" />

            <button
              type="button"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500 ring-2 ring-[#090A0F]" />
            </button>
          </div>
        </header>

        {/* Viewport Content with ambient gradients */}
        <div className="flex-1 p-6 sm:p-8 lg:p-10 relative">
          {/* Ambient subtle light glows */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="absolute top-40 right-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

          {/* Render Route Child */}
          <Outlet />
        </div>
      </main>
    </div>
  );
}
