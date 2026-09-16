import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TimeBankProvider, useTimeBank } from './context/TimeBankContext';

// Navigation & Modals
import Navbar from './components/Navigation/Navbar';
import Sidebar from './components/Navigation/Sidebar';
import MobileNav from './components/Navigation/MobileNav';
import BookingModal from './components/Modals/BookingModal';
import PostSkillModal from './components/Modals/PostSkillModal';
import NotificationsDrawer from './components/Modals/NotificationsDrawer';
import ProtectedRoute from './components/ProtectedRoute';

// Views & Pages
import LandingView from './views/LandingView';
import DashboardView from './views/DashboardView';
import DiscoverView from './views/DiscoverView';
import MySkillsView from './views/MySkillsView';
import CreditHistoryView from './views/CreditHistoryView';
import MemberProfileView from './views/MemberProfileView';
import OnboardingView from './views/OnboardingView';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminPage from './pages/AdminPage';

function AppContent() {
  const { currentView, setCurrentView, toastMessage } = useTimeBank();
  const { user: authUser, loading } = useAuth();

  // Route protection sync
  useEffect(() => {
    if (!loading) {
      if (!authUser) {
        // If logged out and on protected view, go to landing or login
        if (['dashboard', 'my-skills', 'wallet', 'admin'].includes(currentView)) {
          setCurrentView('landing');
        }
      } else {
        // If logged in and on login/signup, route to appropriate landing
        if (currentView === 'login' || currentView === 'signup') {
          if (authUser.role === 'admin') {
            setCurrentView('admin');
          } else {
            setCurrentView('dashboard');
          }
        }
      }
    }
  }, [authUser, loading, currentView, setCurrentView]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-on-surface p-6">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-4" />
        <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant animate-pulse">
          Connecting to TimeBank...
        </p>
      </div>
    );
  }

  // Determine when to show sidebar
  const showSidebar = 
    Boolean(authUser) &&
    currentView !== 'landing' &&
    currentView !== 'onboarding' &&
    currentView !== 'login' &&
    currentView !== 'signup' &&
    currentView !== 'admin';

  return (
    <div className="min-h-screen relative flex flex-col selection:bg-primary-container selection:text-on-primary-container">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Layout Area */}
      <div className="flex-1 flex">
        {showSidebar && <Sidebar />}

        <main className={`flex-1 transition-all duration-300 ${showSidebar ? 'lg:ml-64' : 'w-full'}`}>
          {currentView === 'landing' && <LandingView />}
          {currentView === 'login' && <LoginPage onNavigate={setCurrentView} />}
          {currentView === 'signup' && <SignupPage onNavigate={setCurrentView} />}
          {currentView === 'onboarding' && <OnboardingView />}
          
          {currentView === 'dashboard' && (
            <ProtectedRoute onNavigate={setCurrentView}>
              <DashboardView />
            </ProtectedRoute>
          )}

          {currentView === 'discover' && <DiscoverView />}

          {currentView === 'my-skills' && (
            <ProtectedRoute onNavigate={setCurrentView}>
              <MySkillsView />
            </ProtectedRoute>
          )}

          {currentView === 'wallet' && (
            <ProtectedRoute onNavigate={setCurrentView}>
              <CreditHistoryView />
            </ProtectedRoute>
          )}

          {currentView === 'profile' && <MemberProfileView />}

          {currentView === 'admin' && (
            <ProtectedRoute requireAdmin={true} onNavigate={setCurrentView}>
              <AdminPage />
            </ProtectedRoute>
          )}
        </main>
      </div>

      {/* Mobile Bottom Bar */}
      {showSidebar && <MobileNav />}

      {/* Modals & Drawers */}
      <BookingModal />
      <PostSkillModal />
      <NotificationsDrawer />

      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-8 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="glass-panel-elevated p-4 rounded-2xl shadow-2xl flex items-center gap-3 border-l-4 border-l-primary max-w-sm">
            <div className="w-8 h-8 rounded-full bg-pastel-mint text-primary flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[18px]">verified</span>
            </div>
            <div>
              <p className="font-headline-md text-xs font-bold text-on-surface">{toastMessage.title}</p>
              <p className="font-body-md text-[11px] text-on-surface-variant leading-tight">{toastMessage.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TimeBankProvider>
        <AppContent />
      </TimeBankProvider>
    </AuthProvider>
  );
}
