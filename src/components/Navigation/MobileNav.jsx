import React from 'react';
import { useTimeBank } from '../../context/TimeBankContext';

export default function MobileNav() {
  const { currentView, setCurrentView, setPostSkillModalOpen } = useTimeBank();

  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'discover', label: 'Discover', icon: 'search' },
    { id: 'post', label: 'Post', icon: 'add_circle', isAction: true },
    { id: 'my-skills', label: 'My Skills', icon: 'auto_fix_high' },
    { id: 'wallet', label: 'Wallet', icon: 'history' }
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 w-full z-50 bg-white/60 dark:bg-black/40 backdrop-blur-[36px] border-t-[1.5px] border-white/60 dark:border-white/10 shadow-lg px-2 py-2">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {items.map(item => {
          if (item.isAction) {
            return (
              <button
                key={item.id}
                onClick={() => setPostSkillModalOpen(true)}
                className="flex flex-col items-center justify-center p-2 -mt-5 bg-primary text-white rounded-full w-12 h-12 shadow-lg shadow-primary/30 active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined text-[24px]">add</span>
              </button>
            );
          }

          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex flex-col items-center gap-0.5 p-2 rounded-xl transition-all ${
                isActive
                  ? 'text-primary font-bold'
                  : 'text-on-surface-variant/70 hover:text-primary'
              }`}
            >
              <span 
                className="material-symbols-outlined text-[22px]"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
