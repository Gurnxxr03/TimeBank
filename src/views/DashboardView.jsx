import React from 'react';
import { useTimeBank } from '../context/TimeBankContext';

export default function DashboardView() {
  const { 
    user, 
    members, 
    learningTrackers, 
    transactions, 
    setCurrentView, 
    openBookingModal, 
    setPostSkillModalOpen,
    viewMemberProfile
  } = useTimeBank();

  // Recommended providers based on user preferences
  const recommendedProviders = [
    {
      member: members.find(m => m.id === 'gurnoor_singh') || members[1],
      skill: { title: 'Advanced Python Mentorship', category: 'Development', icon: 'terminal' },
      matchScore: 95,
      format: 'Online',
      reason: 'Matches your Python interest + Saturday availability.',
      availability: 'Saturdays, Mornings'
    },
    {
      member: members.find(m => m.id === 'rohit_verma') || members[2],
      skill: { title: 'Keyboard & Harmonium Basics', category: 'Music', icon: 'piano' },
      matchScore: 88,
      format: 'In-Person',
      reason: 'Matches your saved Music & Piano goals.',
      availability: 'Evenings, Weekends'
    },
    {
      member: members.find(m => m.id === 'ananya_sharma') || members[0],
      skill: { title: 'Balcony Gardening & Composting', category: 'Gardening', icon: 'yard' },
      matchScore: 85,
      format: 'In-Person / Online',
      reason: 'Top community rating in Bengaluru (2.4 km away).',
      availability: 'Weekends, Afternoons'
    }
  ];

  return (
    <div className="pt-24 lg:pt-28 pb-28 px-margin-mobile md:px-margin-desktop w-full max-w-container-max mx-auto">
      {/* Hero Header Banner */}
      <section className="glass-panel-elevated rounded-3xl p-6 md:p-8 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="font-display-lg-mobile md:font-display-lg text-2xl md:text-4xl text-on-surface font-extrabold mb-2">
            Good morning, {user.fullName.split(' ')[0]}
          </h1>
          <div className="flex flex-col gap-1">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl md:text-5xl font-bold text-gradient tracking-tight">
                {user.balance.toFixed(1)}
              </span>
              <span className="font-headline-md text-lg md:text-xl text-on-surface-variant font-medium">
                Time Credits
              </span>
            </div>
            <p className="font-body-md text-xs text-on-surface-variant/80">
              Available in your decentralized wallet (1 hr = 1 credit)
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 items-start md:items-end w-full md:w-auto">
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-primary-container/40 text-on-primary-container rounded-full text-xs font-semibold border border-primary/10 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
              +{user.lifetimeEarned.toFixed(1)} Earned
            </span>
            <span className="px-3 py-1 bg-surface-variant/70 text-on-surface-variant rounded-full text-xs font-semibold border border-outline/10 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
              -{user.lifetimeSpent.toFixed(1)} Spent
            </span>
            <span className="px-3 py-1 bg-tertiary-container/40 text-on-tertiary-container rounded-full text-xs font-semibold border border-tertiary/20 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">lock_clock</span>
              {user.inEscrow.toFixed(1)} in Escrow
            </span>
          </div>

          <div className="flex gap-3 w-full md:w-auto mt-2">
            <button
              onClick={() => setCurrentView('discover')}
              className="flex-1 md:flex-none px-6 py-3 bg-primary text-white rounded-full font-label-sm text-xs font-bold shadow-md hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">search</span>
              Find Help
            </button>
            <button
              onClick={() => setPostSkillModalOpen(true)}
              className="flex-1 md:flex-none px-6 py-3 bg-white/60 border-2 border-white text-logo-sage font-label-sm text-xs font-bold rounded-full hover:bg-white/80 transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Offer a Skill
            </button>
          </div>
        </div>
      </section>

      {/* Main Grid: Recommendations & Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Recommended For You & Skills Overview */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recommendations */}
          <section>
            <div className="flex justify-between items-end mb-6">
              <div>
                <h3 className="font-headline-md text-xl font-bold text-on-surface">
                  Recommended for You
                </h3>
                <p className="text-xs text-on-surface-variant">
                  AI-powered skill matches based on your interests and schedule
                </p>
              </div>
              <button
                onClick={() => setCurrentView('discover')}
                className="text-primary font-label-sm text-xs font-bold hover:underline"
              >
                View All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendedProviders.map(({ member, skill, matchScore, format, reason, availability }) => (
                <div
                  key={member.id}
                  className="glass-panel rounded-2xl p-5 hover:scale-[1.01] hover:bg-white/60 transition-all duration-300 flex flex-col h-full group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-pastel-mint text-primary rounded-lg text-xs font-bold border border-primary/20">
                      <span className="material-symbols-outlined text-[14px]">verified</span>
                      <span>{matchScore}% Match</span>
                    </div>
                    <span className="px-2 py-0.5 bg-surface-variant/50 text-on-surface-variant rounded-md text-[10px] uppercase font-bold tracking-wider">
                      {format}
                    </span>
                  </div>

                  <h4 
                    onClick={() => viewMemberProfile(member.id)}
                    className="font-headline-md text-lg font-bold text-on-surface mb-1 cursor-pointer hover:text-primary transition-colors"
                  >
                    {skill.title}
                  </h4>

                  <div 
                    onClick={() => viewMemberProfile(member.id)}
                    className="flex items-center gap-2 mb-3 cursor-pointer"
                  >
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-7 h-7 rounded-full object-cover border border-white"
                    />
                    <span className="text-xs font-medium text-on-surface-variant">{member.name}</span>
                    <div className="flex items-center text-logo-sage text-xs">
                      <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="ml-0.5 font-bold">{member.rating}</span>
                    </div>
                  </div>

                  <div className="text-xs text-on-surface-variant bg-white/40 p-2.5 rounded-xl mb-3 border border-white/60">
                    <div className="flex items-start gap-1.5">
                      <span className="material-symbols-outlined text-[14px] text-primary mt-0.5">insights</span>
                      <span>{reason}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mb-4 mt-auto">
                    <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                    <span>{availability}</span>
                  </div>

                  <button
                    onClick={() => openBookingModal(member, skill)}
                    className="w-full py-2.5 bg-transparent border border-primary/30 text-primary font-label-sm text-xs font-bold rounded-xl hover:bg-primary hover:text-white transition-all duration-200"
                  >
                    Request Session (1 Credit)
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* User Skills Bento Overview */}
          <section className="glass-panel p-6 rounded-3xl">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-headline-md text-lg font-bold text-on-surface">
                  Your Skills Profile
                </h3>
                <p className="text-xs text-on-surface-variant">What you teach and what you want to learn</p>
              </div>
              <button
                onClick={() => setCurrentView('onboarding')}
                className="text-xs text-primary font-bold hover:underline"
              >
                Edit Preferences
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/30 p-4 rounded-2xl border border-glass-border">
                <span className="text-xs font-bold text-primary uppercase block mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">volunteer_activism</span>
                  I can teach ({user.skillsOffered.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {user.skillsOffered.map((sk) => (
                    <span key={sk.id} className="px-3 py-1 bg-white/60 text-on-surface text-xs rounded-full border border-white font-medium">
                      {sk.name || sk.title}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white/30 p-4 rounded-2xl border border-glass-border">
                <span className="text-xs font-bold text-tertiary uppercase block mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">school</span>
                  I want to learn ({user.skillsWanted.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {user.skillsWanted.map((sk) => (
                    <span key={sk.id} className="px-3 py-1 bg-white/60 text-on-surface text-xs rounded-full border border-white font-medium">
                      {sk.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Upcoming Sessions & Quick Activity */}
        <div className="space-y-8">
          {/* Upcoming Sessions */}
          <section className="glass-panel rounded-3xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline-md text-lg font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">event_upcoming</span>
                Upcoming Sessions
              </h3>
              <button 
                onClick={() => setCurrentView('my-skills')}
                className="text-xs text-primary font-bold hover:underline"
              >
                Manage
              </button>
            </div>

            <div className="space-y-3">
              {learningTrackers.map((tracker) => (
                <div
                  key={tracker.id}
                  className="bg-white/40 border border-white/70 p-4 rounded-2xl flex gap-3 items-center hover:bg-white/60 transition-colors cursor-pointer"
                  onClick={() => setCurrentView('my-skills')}
                >
                  <div className="w-11 h-11 rounded-xl bg-primary-container/40 text-primary flex flex-col items-center justify-center flex-shrink-0 font-bold">
                    <span className="text-[10px] uppercase">Oct</span>
                    <span className="text-base leading-none">12</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-headline-md text-xs font-bold text-on-surface truncate">
                      {tracker.title}
                    </p>
                    <p className="text-[11px] text-on-surface-variant flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-[12px]">schedule</span>
                      <span>{tracker.nextSession}</span>
                    </p>
                    <span className="text-[10px] text-primary font-semibold">with {tracker.partner}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Activity Ledger Quick Snapshot */}
          <section className="glass-panel rounded-3xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline-md text-lg font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">receipt_long</span>
                Recent Activity
              </h3>
              <button
                onClick={() => setCurrentView('wallet')}
                className="text-xs text-primary font-bold hover:underline"
              >
                View Wallet
              </button>
            </div>

            <ul className="space-y-3">
              {transactions.slice(0, 4).map((tx) => (
                <li
                  key={tx.id}
                  className="flex items-center justify-between pb-2.5 border-b border-white/30 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                      tx.type === 'earned' 
                        ? 'bg-pastel-mint text-primary' 
                        : tx.type === 'spent' 
                        ? 'bg-error-container/40 text-error' 
                        : 'bg-tertiary-container/40 text-tertiary'
                    }`}>
                      <span className="material-symbols-outlined text-[14px]">
                        {tx.type === 'earned' ? 'add' : tx.type === 'spent' ? 'remove' : 'lock_clock'}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-on-surface truncate max-w-[140px]">
                        {tx.title}
                      </p>
                      <p className="text-[10px] text-on-surface-variant">{tx.date}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold ${
                    tx.type === 'earned' ? 'text-primary' : tx.type === 'spent' ? 'text-on-surface-variant' : 'text-tertiary'
                  }`}>
                    {tx.type === 'earned' ? `+${tx.hours}` : tx.type === 'spent' ? `-${tx.hours}` : `${tx.hours} in escrow`}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
