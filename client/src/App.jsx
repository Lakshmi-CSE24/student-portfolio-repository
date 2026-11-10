import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Authentication Provider & Guard
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Projects from './pages/Projects';
import Achievements from './pages/Achievements';
import Skills from './pages/Skills';
import Certificates from './pages/Certificates';
import Portfolio from './pages/Portfolio';
import PublicPortfolio from './pages/PublicPortfolio';
import Login from './pages/Login';
import Register from './pages/Register';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Standalone Public Recruiter Portfolio Route (Accessible without login) */}
          <Route path="/portfolio/:slug" element={<PublicPortfolio />} />

          {/* Protected Application Routes (Requires valid JWT authentication) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="/skills" element={<Skills />} />
              <Route path="/certificates" element={<Certificates />} />
              <Route path="/portfolio" element={<Portfolio />} />
            </Route>
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
