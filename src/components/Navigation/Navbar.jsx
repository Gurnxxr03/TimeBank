import React, { useState } from 'react';
import { useTimeBank } from '../../context/TimeBankContext';

export default function Navbar() {
  const { user, currentView, setCurrentView, notifications, setNotificationsDrawerOpen } = useTimeBank();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 bg-white/45 dark:bg-black/30 backdrop-blur-[24px] border-b-[1.5px] border-white/60 dark:border-white/10 shadow-sm shadow-secondary/5 h-[72px] transition-all">
      {/* Brand */}
      <div 
        onClick={() => setCurrentView('landing')}
        className="flex items-center gap-3 cursor-pointer group"
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
      <div className="hidden md:flex items-center gap-8">
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
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-3 md:gap-4">
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
              src={user.avatar}
              alt={user.fullName}
              className="w-full h-full object-cover"
            />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-3 w-56 glass-panel-elevated p-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-3 py-2 border-b border-outline-variant/30">
                <p className="font-headline-md text-sm font-bold text-on-surface">{user.fullName}</p>
                <p className="font-label-sm text-xs text-on-surface-variant">{user.location}</p>
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

                <div className="border-t border-outline-variant/30 my-1 pt-1">
                  <label className="w-full text-left px-3 py-2 text-xs text-primary font-semibold hover:bg-primary/10 rounded-lg flex items-center gap-2 cursor-pointer">
                    <span className="material-symbols-outlined text-base">upload</span>
                    <span>Upload New Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (uploadEvent) => {
                            user.avatar = uploadEvent.target.result;
                            window.localStorage.setItem('timebank_user_v2', JSON.stringify({ ...user, avatar: uploadEvent.target.result }));
                            window.location.reload();
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  {user.avatar !== '/default-avatar.svg' && (
                    <button
                      onClick={() => {
                        user.avatar = '/default-avatar.svg';
                        window.localStorage.setItem('timebank_user_v2', JSON.stringify({ ...user, avatar: '/default-avatar.svg' }));
                        window.location.reload();
                      }}
                      className="w-full text-left px-3 py-1.5 text-[11px] text-error hover:bg-error-container/30 rounded-lg flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">restart_alt</span>
                      Reset to Blank Avatar
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
