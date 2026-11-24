import React, { useState, useMemo } from 'react';
import { useTimeBank } from '../context/TimeBankContext';

export default function CreditHistoryView() {
  const { user, transactions, setCurrentView, setPostSkillModalOpen } = useTimeBank();
  const [filterType, setFilterType] = useState('all');

  const filteredTransactions = transactions.filter((t) => {
    if (filterType === 'all') return true;
    if (filterType === 'earned') return t.type === 'earned';
    if (filterType === 'spent') return t.type === 'spent';
    if (filterType === 'escrow') return t.type === 'escrow';
    return true;
  });

  const completedSessionsCount = useMemo(
    () => transactions.filter((t) => t.status === 'Completed').length,
    [transactions]
  );

  const totalHoursExchanged = useMemo(
    () => Number((user.lifetimeEarned + user.lifetimeSpent).toFixed(1)),
    [user.lifetimeEarned, user.lifetimeSpent]
  );

  return (
    <div className="pt-24 lg:pt-28 pb-28 px-margin-mobile md:px-margin-desktop w-full max-w-container-max mx-auto space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="font-display-lg-mobile md:font-display-lg text-2xl md:text-4xl text-primary font-extrabold mb-1">
            Time Wallet & Ledger
          </h1>
          <p className="font-body-lg text-sm text-on-surface-variant">
            Track your time exchanges, earned skills, escrow protections, and current balance.
          </p>
        </div>

        <button
          onClick={() => setPostSkillModalOpen(true)}
          className="px-5 py-2.5 bg-secondary text-white rounded-full font-label-sm text-xs font-bold hover:bg-secondary/90 transition-all flex items-center gap-1.5 shadow-sm"
        >
          <span className="material-symbols-outlined text-base">volunteer_activism</span>
          <span>Offer a Skill to Earn</span>
        </button>
      </header>

      {/* Top Bento Grid: Balance & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Balance Card (Spans 2 cols) */}
        <div className="glass-card ambient-shadow rounded-3xl p-6 md:p-8 md:col-span-2 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary-container/30 rounded-full blur-3xl pointer-events-none"></div>

          <div className="z-10">
            <h2 className="font-headline-md text-base text-on-surface flex items-center gap-2 mb-2 font-bold">
              <span className="material-symbols-outlined text-logo-sage">account_balance</span>
              Total Available Balance
            </h2>

            <div className="flex items-baseline gap-3 mt-2">
              <span className="font-display-lg text-5xl md:text-6xl leading-none text-primary font-extrabold">
                {user.balance.toFixed(1)}
              </span>
              <span className="font-body-lg text-lg text-on-surface-variant font-medium">
                Time Credits (Hours)
              </span>
            </div>
          </div>

          <div className="z-10 mt-6 bg-pastel-mint/40 border border-primary/15 rounded-2xl p-4 flex items-center justify-between gap-3">
            <div>
              <p className="font-label-sm text-xs text-primary font-bold mb-0.5">
                Equal-Value Time Exchange
              </p>
              <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
                Every 1 hour of service equals 1 Time Credit. Book sessions with community members or offer skills to earn more.
              </p>
            </div>
            <button
              onClick={() => setCurrentView('discover')}
              className="px-4 py-2 bg-primary text-white font-bold text-xs rounded-xl transition-all flex-shrink-0"
            >
              Browse Skills
            </button>
          </div>
        </div>

        {/* Escrow & Lifetime Stats */}
        <div className="flex flex-col gap-4">
          <div className="glass-card rounded-3xl p-6 flex-grow flex flex-col justify-center">
            <p className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider mb-1 font-bold">
              In Escrow Protection
            </p>
            <div className="flex items-center gap-3 mt-1">
              <span className="material-symbols-outlined text-tertiary p-2 bg-tertiary-container/30 rounded-full text-xl">
                lock_clock
              </span>
              <span className="font-headline-md text-3xl font-extrabold text-on-surface">
                {user.inEscrow.toFixed(1)} <span className="text-sm font-normal text-on-surface-variant">hrs</span>
              </span>
            </div>
            <p className="font-body-md text-xs text-on-surface-variant mt-2">
              Reserved for scheduled swaps. Released upon completion.
            </p>
          </div>

          <div className="glass-card rounded-3xl p-6 flex justify-between items-center bg-pastel-mint/30">
            <div>
              <p className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider mb-1 font-bold">
                Lifetime Earned
              </p>
              <span className="font-headline-md text-2xl text-primary font-extrabold">
                {user.lifetimeEarned.toFixed(1)} hrs
              </span>
            </div>
            <div className="w-11 h-11 rounded-full bg-white/60 flex items-center justify-center border border-white">
              <span className="material-symbols-outlined text-logo-sage text-xl">trending_up</span>
            </div>
          </div>
        </div>
      </div>

      {/* Real Contribution Stats */}
      <div className="glass-card rounded-3xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-2">
          <div>
            <h3 className="font-headline-md text-lg font-bold text-primary">Your Community Impact</h3>
            <p className="text-xs text-on-surface-variant">Live metrics from your registered account & swaps</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/30 rounded-2xl p-4 border border-white/50">
            <div className="flex items-center gap-2 mb-1 text-on-surface-variant text-xs">
              <span className="material-symbols-outlined text-secondary text-base">schedule</span>
              <span>Total Time Exchanged</span>
            </div>
            <p className="font-headline-md text-2xl font-bold text-primary">
              {totalHoursExchanged} <span className="text-xs font-normal">hours</span>
            </p>
          </div>

          <div className="bg-white/30 rounded-2xl p-4 border border-white/50">
            <div className="flex items-center gap-2 mb-1 text-on-surface-variant text-xs">
              <span className="material-symbols-outlined text-secondary text-base">handshake</span>
              <span>Sessions Completed</span>
            </div>
            <p className="font-headline-md text-2xl font-bold text-primary">
              {completedSessionsCount} <span className="text-xs font-normal">sessions</span>
            </p>
          </div>

          <div className="bg-white/30 rounded-2xl p-4 border border-white/50">
            <div className="flex items-center gap-2 mb-1 text-on-surface-variant text-xs">
              <span className="material-symbols-outlined text-secondary text-base">school</span>
              <span>Skills Offered</span>
            </div>
            <p className="font-headline-md text-2xl font-bold text-primary">
              {user.skillsOffered.length} <span className="text-xs font-normal">active skills</span>
            </p>
          </div>
        </div>
      </div>

      {/* Transaction History Ledger */}
      <div className="glass-card rounded-3xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h3 className="font-headline-md text-xl font-bold text-on-surface">Transaction Ledger</h3>
            <p className="text-xs text-on-surface-variant">Database-backed record of your time transfers</p>
          </div>

          {/* Filter Pills */}
          <div className="flex bg-white/40 rounded-full p-1 border border-glass-border">
            {[
              { id: 'all', label: 'All' },
              { id: 'earned', label: 'Earned' },
              { id: 'spent', label: 'Spent' },
              { id: 'escrow', label: 'In Escrow' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  filterType === f.id
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions List */}
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-10 text-on-surface-variant">
            <span className="material-symbols-outlined text-3xl opacity-40 mb-2">receipt_long</span>
            <p className="text-sm font-semibold text-on-surface">No transactions yet</p>
            <p className="text-xs mt-1">Book a skill swap or offer a skill to see your ledger activity.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-white/40 border border-transparent hover:border-glass-border transition-all"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                      tx.type === 'earned'
                        ? 'bg-secondary-container text-on-secondary-container'
                        : tx.type === 'spent'
                        ? 'bg-surface-container-high text-on-surface-variant'
                        : 'bg-tertiary-container/50 text-tertiary'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">
                      {tx.type === 'earned' ? 'add' : tx.type === 'spent' ? 'remove' : 'lock_clock'}
                    </span>
                  </div>

                  <div>
                    <p className="font-body-md text-sm font-semibold text-on-surface leading-tight">
                      {tx.title}
                    </p>
                    <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-[13px]">calendar_today</span>
                      <span>
                        {tx.date} • with {tx.partner}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p
                    className={`font-headline-md text-sm font-bold ${
                      tx.type === 'earned'
                        ? 'text-primary'
                        : tx.type === 'spent'
                        ? 'text-on-surface'
                        : 'text-tertiary'
                    }`}
                  >
                    {tx.type === 'earned' ? `+${tx.hours}` : tx.type === 'spent' ? `-${tx.hours}` : `${tx.hours}`} hrs
                  </p>
                  <span
                    className={`inline-block px-2 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider mt-0.5 ${
                      tx.type === 'earned'
                        ? 'bg-secondary-container/60 text-on-secondary-container'
                        : tx.type === 'spent'
                        ? 'bg-surface-variant text-on-surface-variant'
                        : 'bg-tertiary-container/40 text-tertiary'
                    }`}
                  >
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
