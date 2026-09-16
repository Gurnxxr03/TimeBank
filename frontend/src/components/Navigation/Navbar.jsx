import React, { useState } from 'react';
import { useTimeBank } from '../../context/TimeBankContext';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { 
    user, 
    currentView, 
    setCurrentView, 
    notifications, 
    setNotificationsDrawerOpen,
    handleLogout
  } = useTimeBank();

  const { isAuthenticated, isAdmin } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/55 dark:bg-black/40 backdrop-blur-xl border-b border-white/60 dark:border-white/10 px-margin-mobile md:px-margin-desktop py-3.5 flex items-center justify-between transition-all duration-300">
      {/* Brand Logo */}
      <div 
        onClick={() => setCurrentView(isAuthenticated ? 'dashboard' : 'landing')}
        className="flex items-center gap-2.5 cursor-pointer group select-none"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-logo-sage flex items-center justify-center text-white shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
          <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            schedule
          </span>
        </div>
        <span className="font-display-lg text-headline-md text-logo-sage font-bold tracking-tight">
          TimeBank
        </span>
      </div>

      {/* Desktop Navigation Links */}
      {isAuthenticated && (
        <div className="hidden md:flex items-center gap-6">
          <button
            onClick={() => setCurrentView('discover')}
            className={`font-body-md font-medium px-3 py-1.5 rounded-xl transition-all duration-200 ${
              currentView === 'discover'
                ? 'text-primary font-bold bg-primary/10 border-b-2 border-primary'
                : 'text-on-surface-variant/80 hover:text-primary hover:bg-white/30'
            }`}
          >
            Discover
          </button>
          <button
            onClick={() => setCurrentView('my-skills')}
            className={`font-body-md font-medium px-3 py-1.5 rounded-xl transition-all duration-200 ${
              currentView === 'my-skills'
                ? 'text-primary font-bold bg-primary/10 border-b-2 border-primary'
                : 'text-on-surface-variant/80 hover:text-primary hover:bg-white/30'
            }`}
          >
            Exchange
          </button>
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`font-body-md font-medium px-3 py-1.5 rounded-xl transition-all duration-200 ${
              currentView === 'dashboard'
                ? 'text-primary font-bold bg-primary/10 border-b-2 border-primary'
                : 'text-on-surface-variant/80 hover:text-primary hover:bg-white/30'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setCurrentView('wallet')}
            className={`font-body-md font-medium px-3 py-1.5 rounded-xl transition-all duration-200 ${
              currentView === 'wallet'
                ? 'text-primary font-bold bg-primary/10 border-b-2 border-primary'
                : 'text-on-surface-variant/80 hover:text-primary hover:bg-white/30'
            }`}
          >
            Wallet
          </button>
          {isAdmin && (
            <button
              onClick={() => setCurrentView('admin')}
              className={`font-body-md font-semibold px-3 py-1.5 rounded-xl transition-all duration-200 ${
                currentView === 'admin'
                  ? 'text-amber-700 font-bold bg-amber-500/15 border-b-2 border-amber-600'
                  : 'text-amber-600 hover:text-amber-700 hover:bg-amber-50'
              }`}
            >
              Admin Portal
            </button>
          )}
        </div>
      )}

      {/* Right Side Actions */}
      <div className="flex items-center gap-3 md:gap-4">
        {isAuthenticated ? (
          <>
            {/* Balance badge */}
            <div 
              onClick={() => setCurrentView('wallet')}
              className="cursor-pointer flex items-center gap-1.5 bg-primary/10 border border-primary/20 hover:bg-primary/15 transition-all text-primary px-3.5 py-1.5 rounded-full font-label-sm text-label-sm font-bold shadow-sm"
              title="Click to view Time Wallet & Ledger"
            >
              <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
              <span>{user.balance.toFixed(1)} Credits</span>
            </div>

            {/* Notifications button */}
            <button
              onClick={() => setNotificationsDrawerOpen(true)}
              className="relative p-2 rounded-full hover:bg-white/40 dark:hover:bg-white/10 text-on-surface-variant hover:text-primary transition-all duration-200"
              title="Notifications"
            >
              <span className="material-symbols-outlined text-[24px]">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-error rounded-full ring-2 ring-white"></span>
              )}
            </button>

            {/* User avatar menu */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/80 shadow-sm hover:scale-105 transition-transform flex items-center justify-center bg-surface-container-low"
              >
                <img
                  src={user.avatar || '/default-avatar.svg'}
                  alt={user.fullName}
                  className="w-full h-full object-cover"
                />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 glass-panel-elevated p-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-3 py-2 border-b border-outline-variant/30">
                    <p className="font-headline-md text-sm font-bold text-on-surface">{user.fullName}</p>
                    <p className="font-label-sm text-xs text-on-surface-variant">{user.location || user.email}</p>
                    {isAdmin && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-amber-500/20 text-amber-800 text-[10px] font-bold rounded-md">
                        ADMINISTRATOR
                      </span>
                    )}
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => { setCurrentView('dashboard'); setProfileDropdownOpen(false); }}
                      className="w-full text-left px-3 py-2 text-sm text-on-surface hover:bg-primary/10 rounded-lg flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-base">dashboard</span>
                      Dashboard
                    </button>
                    <button
                      onClick={() => { setCurrentView('onboarding'); setProfileDropdownOpen(false); }}
                      className="w-full text-left px-3 py-2 text-sm text-on-surface hover:bg-primary/10 rounded-lg flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-base">person</span>
                      Edit Profile & Skills
                    </button>
                    <button
                      onClick={() => { setCurrentView('wallet'); setProfileDropdownOpen(false); }}
                      className="w-full text-left px-3 py-2 text-sm text-on-surface hover:bg-primary/10 rounded-lg flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-base">history</span>
                      Credit History
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => { setCurrentView('admin'); setProfileDropdownOpen(false); }}
                        className="w-full text-left px-3 py-2 text-sm text-amber-700 hover:bg-amber-500/15 rounded-lg flex items-center gap-2 font-medium"
                      >
                        <span className="material-symbols-outlined text-base">admin_panel_settings</span>
                        Admin Panel
                      </button>
                    )}

                    <div className="border-t border-outline-variant/30 my-1 pt-1">
                      <button
                        onClick={() => { setProfileDropdownOpen(false); handleLogout(); }}
                        className="w-full text-left px-3 py-2 text-sm text-error hover:bg-error-container/30 rounded-lg flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-base">logout</span>
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentView('login')}
              className="px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/10 rounded-full transition-all"
            >
              Sign In
            </button>
            <button
              onClick={() => setCurrentView('signup')}
              className="px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-primary/90 rounded-full shadow-sm transition-all"
            >
              Get Started
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
