import React from 'react';
import { useTimeBank } from '../context/TimeBankContext';

export default function MySkillsView() {
  const { 
    learningTrackers, 
    teachingTrackers, 
    transactions, 
    releaseEscrowSession, 
    setPostSkillModalOpen,
    setCurrentView 
  } = useTimeBank();

  const escrowTransactions = transactions.filter(t => t.type === 'escrow');

  return (
    <div className="pt-24 lg:pt-28 pb-28 px-margin-mobile md:px-margin-desktop w-full max-w-container-max mx-auto">
      {/* Header */}
      <header className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="font-display-lg-mobile md:font-display-lg text-2xl md:text-4xl text-on-surface font-extrabold mb-2">
            Skills Management
          </h1>
          <p className="font-body-lg text-sm text-on-surface-variant max-w-2xl">
            Manage your active exchanges, monitor learning progress, and track your teaching commitments in one serene space.
          </p>
        </div>

        <button
          onClick={() => setPostSkillModalOpen(true)}
          className="px-6 py-3 bg-primary text-white rounded-full font-label-sm text-xs font-bold shadow-sm hover:bg-primary/90 transition-all flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Post New Skill
        </button>
      </header>

      {/* 3-Column Bento Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Column 1: Currently Learning */}
        <section className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="font-headline-md text-lg font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                school
              </span>
              Currently Learning ({learningTrackers.length})
            </h2>
            <button
              onClick={() => setCurrentView('discover')}
              className="text-xs text-primary font-bold hover:underline"
            >
              + Find More
            </button>
          </div>

          <div className="space-y-4">
            {learningTrackers.map((item) => {
              const progressPct = Math.round((item.currentSession / item.totalSessions) * 100);
              return (
                <div
                  key={item.id}
                  className="glass-panel p-5 rounded-2xl hover:scale-[1.01] hover:bg-white/60 transition-all duration-300 group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${item.bgColor || 'bg-pastel-lavender'} flex items-center justify-center text-primary`}>
                        <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                      </div>
                      <div>
                        <h3 className="font-headline-md text-sm font-bold text-on-surface">
                          {item.title}
                        </h3>
                        <p className="font-label-sm text-xs text-on-surface-variant">with {item.partner}</p>
                      </div>
                    </div>
                    <span className="bg-secondary-container/80 text-on-secondary-container px-2 py-0.5 rounded-md font-label-sm text-[10px] font-bold">
                      {item.status}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-on-surface-variant">Next Session</span>
                      <span className="font-medium text-on-surface">{item.nextSession}</span>
                    </div>

                    <div className="w-full bg-surface-variant/60 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-primary h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between text-[11px] text-on-surface-variant">
                      <span>{item.format}</span>
                      <span className="font-semibold text-primary">{item.currentSession}/{item.totalSessions} Sessions</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Column 2: Currently Teaching */}
        <section className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="font-headline-md text-lg font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                design_services
              </span>
              Currently Teaching ({teachingTrackers.length})
            </h2>
            <button
              onClick={() => setPostSkillModalOpen(true)}
              className="text-xs text-primary font-bold hover:underline"
            >
              + Teach
            </button>
          </div>

          <div className="space-y-4">
            {teachingTrackers.map((item) => {
              const progressPct = Math.round((item.currentSession / item.totalSessions) * 100);
              return (
                <div
                  key={item.id}
                  className="glass-panel p-5 rounded-2xl hover:scale-[1.01] hover:bg-white/60 transition-all duration-300 group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${item.bgColor || 'bg-pastel-mint'} flex items-center justify-center text-primary`}>
                        <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                      </div>
                      <div>
                        <h3 className="font-headline-md text-sm font-bold text-on-surface">
                          {item.title}
                        </h3>
                        <p className="font-label-sm text-xs text-on-surface-variant">with {item.partner}</p>
                      </div>
                    </div>
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md font-label-sm text-[10px] font-bold">
                      {item.status}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-on-surface-variant">Next Session</span>
                      <span className="font-medium text-on-surface">{item.nextSession}</span>
                    </div>

                    <div className="w-full bg-surface-variant/60 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-logo-sage h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between text-[11px] text-on-surface-variant">
                      <span>Earns 1 Credit/hr</span>
                      <span className="font-semibold text-logo-sage">{item.currentSession}/{item.totalSessions} Sessions</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Column 3: Active Escrow & Swap Actions */}
        <section className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="font-headline-md text-lg font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                handshake
              </span>
              Active Escrow Swaps ({escrowTransactions.length})
            </h2>
            <button
              onClick={() => setCurrentView('wallet')}
              className="text-xs text-primary font-bold hover:underline"
            >
              Ledger
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {escrowTransactions.length === 0 ? (
              <div className="glass-panel p-6 text-center rounded-2xl">
                <span className="material-symbols-outlined text-3xl text-on-surface-variant/40 mb-2">lock_open</span>
                <p className="text-xs font-semibold text-on-surface">No active escrow swaps</p>
                <p className="text-[11px] text-on-surface-variant mt-1">When you book a skill swap, credits are held here until confirmed.</p>
              </div>
            ) : (
              escrowTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="glass-panel p-5 rounded-2xl border-t-[1.5px] border-l-[1.5px] border-white/80 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <h4 className="font-headline-md text-sm font-bold text-on-surface">
                      {tx.title}
                    </h4>
                    <span className="bg-tertiary-container/50 text-on-tertiary-container px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                      In Escrow
                    </span>
                  </div>

                  <p className="text-xs text-on-surface-variant mb-3">
                    {tx.notes || `With ${tx.partner} (${tx.hours} credits held in escrow).`}
                  </p>

                  <div className="flex justify-between items-center pt-2 border-t border-glass-border">
                    <span className="text-xs font-bold text-primary">{tx.hours} Credits</span>
                    <button
                      onClick={() => releaseEscrowSession(tx.id)}
                      className="px-3 py-1.5 bg-primary text-white hover:bg-primary/90 rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">check</span>
                      <span>Confirm & Release</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
