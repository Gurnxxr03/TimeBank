import React from 'react';
import { TimeBankProvider, useTimeBank } from './context/TimeBankContext';
import Navbar from './components/Navigation/Navbar';
import Sidebar from './components/Navigation/Sidebar';
import MobileNav from './components/Navigation/MobileNav';
import BookingModal from './components/Modals/BookingModal';
import PostSkillModal from './components/Modals/PostSkillModal';
import NotificationsDrawer from './components/Modals/NotificationsDrawer';

// Views
import LandingView from './views/LandingView';
import DashboardView from './views/DashboardView';
import DiscoverView from './views/DiscoverView';
import MySkillsView from './views/MySkillsView';
import CreditHistoryView from './views/CreditHistoryView';
import MemberProfileView from './views/MemberProfileView';
import OnboardingView from './views/OnboardingView';

function AppContent() {
  const { currentView, toastMessage } = useTimeBank();

  // If on landing or linear onboarding, we can display full width without sidebar
  const showSidebar = currentView !== 'landing' && currentView !== 'onboarding';

  return (
    <div className="min-h-screen relative flex flex-col selection:bg-primary-container selection:text-on-primary-container">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Layout Area */}
      <div className="flex-1 flex">
        {showSidebar && <Sidebar />}

        <main className={`flex-1 transition-all duration-300 ${showSidebar ? 'lg:ml-64' : 'w-full'}`}>
          {currentView === 'landing' && <LandingView />}
          {currentView === 'dashboard' && <DashboardView />}
          {currentView === 'discover' && <DiscoverView />}
          {currentView === 'my-skills' && <MySkillsView />}
          {currentView === 'wallet' && <CreditHistoryView />}
          {currentView === 'profile' && <MemberProfileView />}
          {currentView === 'onboarding' && <OnboardingView />}
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
    <TimeBankProvider>
      <AppContent />
    </TimeBankProvider>
  );
}
