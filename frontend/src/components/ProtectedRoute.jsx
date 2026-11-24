import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requireAdmin = false, onNavigate }) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user && onNavigate) {
      onNavigate('login');
    } else if (requireAdmin && user && user.role !== 'admin' && onNavigate) {
      onNavigate('dashboard');
    }
  }, [user, loading, requireAdmin, onNavigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-4" />
        <p className="text-on-surface-variant font-medium text-sm animate-pulse">Verifying secure session...</p>
      </div>
    );
  }

  if (!user || (requireAdmin && user.role !== 'admin')) {
    return null;
  }

  return children;
}
