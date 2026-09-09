import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';

function MainApp() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState('login');

  // Sync initial view based on auth status
  useEffect(() => {
    if (!loading) {
      if (user) {
        if (currentView === 'login' || currentView === 'signup') {
          setCurrentView('dashboard');
        }
      } else {
        if (currentView === 'dashboard' || currentView === 'admin') {
          setCurrentView('login');
        }
      }
    }
  }, [user, loading, currentView]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-on-surface p-6">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-600/20 border-t-emerald-600 animate-spin mb-4" />
        <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant animate-pulse">
          Connecting to TimeBank...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface">
      {/* Top Navigation */}
      <Navbar currentView={currentView} onNavigate={setCurrentView} />

      {/* Main Content Views */}
      <main className="flex-1 pb-12">
        {currentView === 'login' && <LoginPage onNavigate={setCurrentView} />}
        {currentView === 'signup' && <SignupPage onNavigate={setCurrentView} />}
        {currentView === 'dashboard' && (
          <ProtectedRoute onNavigate={setCurrentView}>
            <DashboardPage />
          </ProtectedRoute>
        )}
        {currentView === 'admin' && (
          <ProtectedRoute requireAdmin={true} onNavigate={setCurrentView}>
            <AdminPage />
          </ProtectedRoute>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-black/5 dark:border-white/5 py-6 text-center text-xs text-on-surface-variant">
        <p>© {new Date().getFullYear()} TimeBank — Skill Exchange Platform. 1 Hour = 1 Credit.</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
