import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requireAdmin = false, onNavigate }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-4" />
        <p className="text-on-surface-variant font-medium text-sm animate-pulse">Verifying secure session...</p>
      </div>
    );
  }

  if (!user) {
    if (onNavigate) {
      onNavigate('login');
      return null;
    }
    return null;
  }

  if (requireAdmin && user.role !== 'admin') {
    if (onNavigate) {
      onNavigate('dashboard');
      return null;
    }
    return null;
  }

  return children;
}
