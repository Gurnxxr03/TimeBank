import React, { useState } from 'react';
import { useTimeBank } from '../context/TimeBankContext';

export default function CreditHistoryView() {
  const { user, setUser, transactions, setTransactions, setCurrentView, showToast, triggerConfetti } = useTimeBank();
  const [filterType, setFilterType] = useState('all');

  const filteredTransactions = transactions.filter(t => {
    if (filterType === 'all') return true;
    if (filterType === 'earned') return t.type === 'earned';
    if (filterType === 'spent') return t.type === 'spent';
    if (filterType === 'escrow') return t.type === 'escrow';
    return true;
  });

  // Simulation test to earn credits (e.g. completing a community mentorship task)
  const simulateEarnCredit = () => {
    const newBal = Number((user.balance + 1.0).toFixed(1));
    const newLifetime = Number((user.lifetimeEarned + 1.0).toFixed(1));
    setUser(prev => ({
      ...prev,
      balance: newBal,
      lifetimeEarned: newLifetime
    }));

    const newTx = {
      id: `tx_${Date.now()}`,
      title: 'Taught Community Web Workshop',
      partner: 'Portland TimeBank Hub',
      date: 'Just now',
      hours: 1.0,
      type: 'earned',
      status: 'Completed',
      notes: 'Introductory HTML & CSS open community session.'
    };

    setTransactions(prev => [newTx, ...prev]);
    triggerConfetti();
    showToast('Credits Deposited!', '+1.0 Time Credit added to your balance.');
  };

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
          onClick={simulateEarnCredit}
          className="px-5 py-2.5 bg-secondary text-white rounded-full font-label-sm text-xs font-bold hover:bg-secondary/90 transition-all flex items-center gap-1.5 shadow-sm"
        >
          <span className="material-symbols-outlined text-base">volunteer_activism</span>
          <span>Simulate Teaching (+1 Hr)</span>
        </button>
      </header>

      {/* Top Bento Grid: Balance, Warning & Stats */}
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

          {/* 12-Month Decay Warning Box */}
          <div className="z-10 mt-6 bg-error-container/40 border border-error/20 rounded-2xl p-4 flex items-start gap-3">
            <span className="material-symbols-outlined text-error mt-0.5 text-xl flex-shrink-0">
              warning
            </span>
            <div className="flex-1">
              <p className="font-label-sm text-xs text-error font-bold mb-0.5">
                12-Month Decay Warning
              </p>
              <p className="font-body-md text-xs text-on-error-container leading-relaxed">
                {user.decayWarning.amount} hours will expire on {user.decayWarning.expiryDate}. Use them soon by requesting a skill to maximize your community impact!
              </p>
            </div>
            <button
              onClick={() => setCurrentView('discover')}
              className="px-3 py-1.5 bg-white/80 hover:bg-white text-error font-bold text-xs rounded-xl transition-all flex-shrink-0 border border-error/20"
            >
              Use Now
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

      {/* Contribution Stats & 7-Day Activity Chart */}
      <div className="glass-card rounded-3xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-2">
          <div>
            <h3 className="font-headline-md text-lg font-bold text-primary">Your Community Impact</h3>
            <p className="text-xs text-on-surface-variant">Weekly hours exchanged and sessions completed</p>
          </div>
          <div className="bg-white/40 px-3 py-1 rounded-full text-xs font-semibold text-on-surface-variant border border-white/60">
            This Month
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/30 rounded-2xl p-4 border border-white/50">
            <div className="flex items-center gap-2 mb-1 text-on-surface-variant text-xs">
              <span className="material-symbols-outlined text-secondary text-base">schedule</span>
              <span>Time Shared</span>
            </div>
            <p className="font-headline-md text-2xl font-bold text-primary">12 <span className="text-xs font-normal">hours</span></p>
          </div>

          <div className="bg-white/30 rounded-2xl p-4 border border-white/50">
            <div className="flex items-center gap-2 mb-1 text-on-surface-variant text-xs">
              <span className="material-symbols-outlined text-secondary text-base">handshake</span>
              <span>Sessions Completed</span>
            </div>
            <p className="font-headline-md text-2xl font-bold text-primary">8 <span className="text-xs font-normal">sessions</span></p>
          </div>

          <div className="bg-white/30 rounded-2xl p-4 border border-white/50">
            <div className="flex items-center gap-2 mb-1 text-on-surface-variant text-xs">
              <span className="material-symbols-outlined text-secondary text-base">school</span>
              <span>Skills Shared</span>
            </div>
            <p className="font-headline-md text-2xl font-bold text-primary">4 <span className="text-xs font-normal">distinct skills</span></p>
          </div>
        </div>

        {/* 7-Day Activity Bar Chart */}
        <div className="pt-2">
          <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-3">
            Activity (Last 7 Days)
          </h4>
          <div className="flex items-end h-28 gap-2 md:gap-4 w-full bg-white/20 p-3 rounded-2xl border border-white/40">
            {[
              { day: 'Mon', hours: 0.5, height: '20%' },
              { day: 'Tue', hours: 1.5, height: '40%' },
              { day: 'Wed', hours: 0.0, height: '8%' },
              { day: 'Thu', hours: 3.0, height: '80%' },
              { day: 'Fri', hours: 2.0, height: '55%' },
              { day: 'Sat', hours: 1.0, height: '30%' },
              { day: 'Sun', hours: 4.0, height: '100%' },
            ].map(col => (
              <div key={col.day} className="flex-1 flex flex-col items-center h-full justify-end group">
                <span className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                  {col.hours}h
                </span>
                <div 
                  className="w-full bg-primary/40 group-hover:bg-primary rounded-t-lg transition-all"
                  style={{ height: col.height }}
                ></div>
                <span className="text-[10px] font-semibold text-on-surface-variant mt-1.5">{col.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction History Ledger */}
      <div className="glass-card rounded-3xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h3 className="font-headline-md text-xl font-bold text-on-surface">Transaction Ledger</h3>
            <p className="text-xs text-on-surface-variant">Immutable record of community time transfers</p>
          </div>

          {/* Filter Pills */}
          <div className="flex bg-white/40 rounded-full p-1 border border-glass-border">
            {[
              { id: 'all', label: 'All' },
              { id: 'earned', label: 'Earned' },
              { id: 'spent', label: 'Spent' },
              { id: 'escrow', label: 'In Escrow' }
            ].map(f => (
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
        <div className="flex flex-col gap-3">
          {filteredTransactions.map(tx => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-white/40 border border-transparent hover:border-glass-border transition-all"
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  tx.type === 'earned'
                    ? 'bg-secondary-container text-on-secondary-container'
                    : tx.type === 'spent'
                    ? 'bg-surface-container-high text-on-surface-variant'
                    : 'bg-tertiary-container/50 text-tertiary'
                }`}>
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
                    <span>{tx.date} • with {tx.partner}</span>
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className={`font-headline-md text-sm font-bold ${
                  tx.type === 'earned' ? 'text-primary' : tx.type === 'spent' ? 'text-on-surface' : 'text-tertiary'
                }`}>
                  {tx.type === 'earned' ? `+${tx.hours}` : tx.type === 'spent' ? `-${tx.hours}` : `${tx.hours}`} hrs
                </p>
                <span className={`inline-block px-2 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider mt-0.5 ${
                  tx.type === 'earned'
                    ? 'bg-secondary-container/60 text-on-secondary-container'
                    : tx.type === 'spent'
                    ? 'bg-surface-variant text-on-surface-variant'
                    : 'bg-tertiary-container/40 text-tertiary'
                }`}>
                  {tx.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
