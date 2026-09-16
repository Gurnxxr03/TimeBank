import React from 'react';
import { useTimeBank } from '../../context/TimeBankContext';

export default function NotificationsDrawer() {
  const { 
    notificationsDrawerOpen, 
    setNotificationsDrawerOpen, 
    notifications, 
    setNotifications,
    setCurrentView 
  } = useTimeBank();

  if (!notificationsDrawerOpen) return null;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={() => setNotificationsDrawerOpen(false)}
        className="absolute inset-0 bg-black/25 backdrop-blur-sm transition-opacity"
      ></div>

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md glass-panel-elevated p-6 flex flex-col shadow-2xl rounded-l-3xl border-l border-white/60 animate-in slide-in-from-right duration-300">
          <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[24px]">notifications</span>
              <h2 className="font-headline-md text-lg font-bold text-on-surface">Notifications</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={markAllRead}
                className="text-xs text-primary font-medium hover:underline px-2 py-1 rounded"
              >
                Mark all read
              </button>
              <button
                onClick={() => setNotificationsDrawerOpen(false)}
                className="p-1 rounded-full hover:bg-white/40 text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-4 space-y-3">
            {notifications.map(notif => (
              <div 
                key={notif.id}
                className={`p-4 rounded-2xl border transition-all ${
                  notif.read 
                    ? 'bg-white/20 border-white/30 text-on-surface-variant' 
                    : 'bg-white/60 border-primary/20 text-on-surface shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-white/60 shadow-xs flex-shrink-0">
                    <span className={`material-symbols-outlined text-[20px] ${notif.color || 'text-primary'}`}>
                      {notif.icon || 'info'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-headline-md text-sm font-bold text-on-surface leading-tight mb-1">
                      {notif.title}
                    </p>
                    <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
                      {notif.desc}
                    </p>
                    <span className="text-[11px] text-on-surface-variant/70 mt-2 block">
                      {notif.time}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-outline-variant/30 flex gap-2">
            <button
              onClick={() => {
                setNotificationsDrawerOpen(false);
                setCurrentView('wallet');
              }}
              className="w-full py-2.5 bg-primary text-white rounded-xl font-label-sm text-xs font-bold hover:bg-primary/90 transition-all text-center"
            >
              View Time Wallet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
