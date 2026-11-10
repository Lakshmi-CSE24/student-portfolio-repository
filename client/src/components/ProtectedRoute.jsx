import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090A0F] flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        <p className="text-xs uppercase tracking-wider font-semibold">Verifying secure student session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page and remember original location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
