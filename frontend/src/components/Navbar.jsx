import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Clock, ShieldCheck, User as UserIcon, LogOut, LayoutDashboard } from 'lucide-react';

export default function Navbar({ currentView, onNavigate }) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    onNavigate('login');
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/75 dark:bg-[#141716]/80 border-b border-white/50 dark:border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={() => onNavigate(isAuthenticated ? 'dashboard' : 'login')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-on-surface">TimeBank</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                1h = 1 Credit
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant hidden sm:block">Community Skill Exchange</p>
          </div>
        </div>

        {/* Navigation & User Controls */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Member Dashboard Link */}
              <button
                onClick={() => onNavigate('dashboard')}
                className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all ${
                  currentView === 'dashboard'
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">My Dashboard</span>
              </button>

              {/* Admin Portal Link (Admins Only) */}
              {isAdmin && (
                <button
                  onClick={() => onNavigate('admin')}
                  className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all ${
                    currentView === 'admin'
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin Portal</span>
                </button>
              )}

              {/* User Dropdown / Profile pill */}
              <div className="flex items-center gap-2 pl-2 border-l border-black/10 dark:border-white/10">
                <div className="flex items-center gap-2 py-1 px-2.5 rounded-xl bg-black/5 dark:bg-white/5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-xs">
                    {user?.name ? user.name[0].toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-xs font-semibold text-on-surface leading-tight truncate max-w-[120px]">
                      {user?.name}
                    </p>
                    <p className="text-[10px] text-on-surface-variant leading-tight capitalize">
                      {user?.role}
                    </p>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 rounded-xl text-on-surface-variant hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('login')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  currentView === 'login'
                    ? 'bg-black/5 dark:bg-white/10 text-on-surface'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => onNavigate('signup')}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/25 transition-all"
              >
                Join TimeBank
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
