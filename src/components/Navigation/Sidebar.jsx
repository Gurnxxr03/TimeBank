import React from 'react';
import { useTimeBank } from '../../context/TimeBankContext';

export default function Sidebar() {
  const { user, currentView, setCurrentView, setPostSkillModalOpen } = useTimeBank();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', fillIcon: true },
    { id: 'discover', label: 'Discover Skills', icon: 'search', fillIcon: false },
    { id: 'my-skills', label: 'My Skills & Swaps', icon: 'auto_fix_high', fillIcon: true },
    { id: 'wallet', label: 'Credit History & Wallet', icon: 'history', fillIcon: true },
    { id: 'profile', label: 'Member Profile', icon: 'psychology', fillIcon: false },
    { id: 'onboarding', label: 'Profile Setup', icon: 'manage_accounts', fillIcon: false },
  ];

  return (
    <aside className="hidden lg:flex flex-col p-6 gap-4 bg-white/40 dark:bg-white/5 backdrop-blur-[48px] border-r border-white/60 dark:border-white/10 shadow-md shadow-secondary/5 fixed h-screen w-64 left-0 z-40 pt-28">
      {/* User info box */}
      <div 
        onClick={() => setCurrentView('profile')}
        className="flex flex-col items-center gap-2 mb-4 p-3 rounded-2xl hover:bg-white/40 cursor-pointer transition-colors"
      >
        <div className="relative">
          <img
            src={user.avatar}
            alt={user.fullName}
            className="w-16 h-16 rounded-full object-cover border-[2px] border-white shadow-sm"
          />
          <span className="absolute bottom-0 right-0 w-4 h-4 bg-secondary-container border-2 border-white rounded-full flex items-center justify-center text-[10px] text-on-secondary-container font-bold">
            ✓
          </span>
        </div>
        <div className="text-center">
          <h3 className="font-headline-md text-sm font-bold text-on-surface">{user.fullName}</h3>
          <p className="font-label-sm text-xs text-on-surface-variant">{user.role}</p>
        </div>
      </div>

      {/* Post a skill CTA */}
      <button
        onClick={() => setPostSkillModalOpen(true)}
        className="bg-primary text-white font-label-sm text-label-sm font-bold py-3 px-4 rounded-full hover:bg-primary/90 hover:shadow-[0_0_15px_rgba(40,105,92,0.4)] transition-all duration-300 mb-2 w-full flex items-center justify-center gap-2 group"
      >
        <span className="material-symbols-outlined text-[18px] group-hover:rotate-90 transition-transform">
          add
        </span>
        Post a Skill
      </button>

      {/* Navigation list */}
      <nav className="flex flex-col gap-1.5 flex-grow overflow-y-auto">
        {navItems.map(item => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left font-body-md ${
                isActive
                  ? 'bg-primary-container/30 text-on-primary-container font-bold shadow-sm translate-x-1'
                  : 'text-on-surface-variant hover:bg-white/40 hover:translate-x-1'
              }`}
            >
              <span 
                className="material-symbols-outlined text-[22px]"
                style={isActive && item.fillIcon ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom links */}
      <div className="mt-auto flex flex-col gap-1 pt-4 border-t border-white/40 dark:border-white/10">
        <button
          onClick={() => setCurrentView('landing')}
          className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:bg-white/40 rounded-xl transition-all text-xs"
        >
          <span className="material-symbols-outlined text-[18px]">home</span>
          <span>Home / Landing</span>
        </button>
        <button
          onClick={() => setCurrentView('onboarding')}
          className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:bg-white/40 rounded-xl transition-all text-xs"
        >
          <span className="material-symbols-outlined text-[18px]">settings</span>
          <span>Settings & Interests</span>
        </button>
      </div>
    </aside>
  );
}
