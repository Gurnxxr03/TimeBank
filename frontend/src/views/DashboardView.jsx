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

  // Recommended providers dynamically derived from registered community members
  const recommendedProviders = members
    .filter((m) => m.id !== user.id && (m.skills || []).length > 0)
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
    .slice(0, 3)
    .map((m) => {
      const topSkill = m.skills[0];
      return {
        member: m,
        skill: topSkill,
        matchScore: m.matchScore || 85,
        reason: m.matchBreakdown?.skillNeed || `Offers ${topSkill.title}`,
        availability: (m.availability && m.availability.length > 0) ? m.availability.join(', ') : 'Flexible',
      };
    });

  return (
    <div className="pt-24 lg:pt-28 pb-28 px-margin-mobile md:px-margin-desktop w-full max-w-container-max mx-auto">
      {/* Hero Header Banner */}
      <section className="glass-panel-elevated rounded-3xl p-6 md:p-8 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="font-display-lg-mobile md:font-display-lg text-2xl md:text-4xl text-on-surface font-extrabold mb-2">
            Good morning, {(user.fullName || 'Member').split(' ')[0]}
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

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Recommended Matches & User Skills */}
        <div className="lg:col-span-2 space-y-8">
          {/* Smart AI Recommendations Section */}
          <section className="glass-panel p-6 rounded-3xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-pastel-mint px-2.5 py-0.5 rounded-full mb-1">
                  <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                  <span>AI Compatibility Match</span>
                </div>
                <h2 className="font-headline-md text-xl font-bold text-on-surface">
                  Recommended Skill Swaps For You
                </h2>
              </div>
              <button
                onClick={() => setCurrentView('discover')}
                className="text-xs text-primary font-bold hover:underline flex items-center gap-0.5"
              >
                <span>View all</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>

            {recommendedProviders.length === 0 ? (
              <div className="bg-white/40 border border-white/80 p-8 rounded-2xl text-center">
                <span className="material-symbols-outlined text-3xl text-on-surface-variant/40 mb-2">group_add</span>
                <p className="text-sm font-bold text-on-surface mb-1">No community skill matches yet</p>
                <p className="text-xs text-on-surface-variant mb-4">
                  As more registered members add skills to offer, personalized matches will appear here.
                </p>
                <button
                  onClick={() => setPostSkillModalOpen(true)}
                  className="px-5 py-2 bg-primary text-white rounded-full text-xs font-bold"
                >
                  Offer Your First Skill
                </button>
              </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendedProviders.map(({ member, skill, matchScore, reason, availability }) => (
                <div
                  key={member.id}
                  className="bg-white/40 border border-white/80 p-5 rounded-2xl flex flex-col justify-between hover:scale-[1.02] hover:bg-white/60 transition-all duration-300 group"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div 
                        onClick={() => viewMemberProfile(member.id)}
                        className="cursor-pointer relative"
                      >
                        <img
                          src={member.avatar || '/default-avatar.svg'}
                          alt={member.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs"
                        />
                        <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-primary text-white text-[9px] font-bold rounded-full">
                          {matchScore}%
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h3 
                          onClick={() => viewMemberProfile(member.id)}
                          className="font-headline-md text-sm font-bold text-on-surface group-hover:text-primary cursor-pointer truncate"
                        >
                          {member.name}
                        </h3>
                        <p className="text-[11px] text-on-surface-variant truncate">{member.location}</p>
                      </div>
                    </div>

                    <div className="bg-white/50 p-2.5 rounded-xl border border-glass-border mb-3">
                      <span className="text-[10px] font-bold text-primary uppercase block mb-0.5">Teaches</span>
                      <p className="text-xs font-semibold text-on-surface truncate">{skill.title}</p>
                    </div>

                    <div className="text-[11px] text-on-surface-variant/90 leading-relaxed mb-3 flex items-start gap-1">
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
            )}
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
                {user.skillsOffered.length === 0 ? (
                  <p className="text-[11px] text-on-surface-variant/80 italic py-1">
                    No skills offered yet. Click "Offer a Skill" above to share your talents!
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {user.skillsOffered.map((sk) => (
                      <span key={sk.id} className="px-3 py-1 bg-white/60 text-on-surface text-xs rounded-full border border-white font-medium">
                        {sk.name || sk.title}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white/30 p-4 rounded-2xl border border-glass-border">
                <span className="text-xs font-bold text-tertiary uppercase block mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">school</span>
                  I want to learn ({user.skillsWanted.length})
                </span>
                {user.skillsWanted.length === 0 ? (
                  <p className="text-[11px] text-on-surface-variant/80 italic py-1">
                    No learning goals added yet. Click "Edit Preferences" to add skills you want to learn!
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {user.skillsWanted.map((sk) => (
                      <span key={sk.id} className="px-3 py-1 bg-white/60 text-on-surface text-xs rounded-full border border-white font-medium">
                        {sk.name}
                      </span>
                    ))}
                  </div>
                )}
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
              {learningTrackers.length === 0 ? (
                <div className="p-4 bg-white/30 rounded-2xl text-center text-xs text-on-surface-variant">
                  <p className="font-medium">No upcoming sessions yet.</p>
                  <button 
                    onClick={() => setCurrentView('discover')} 
                    className="text-primary font-bold hover:underline mt-1 inline-block"
                  >
                    Find a skill to swap
                  </button>
                </div>
              ) : (
                learningTrackers.map((tracker) => (
                  <div
                    key={tracker.id}
                    className="bg-white/40 border border-white/70 p-4 rounded-2xl flex gap-3 items-center hover:bg-white/60 transition-colors cursor-pointer"
                    onClick={() => setCurrentView('my-skills')}
                  >
                    <div className="w-11 h-11 rounded-xl bg-primary-container/40 text-primary flex flex-col items-center justify-center flex-shrink-0 font-bold">
                      <span className="text-[10px] uppercase">Session</span>
                      <span className="text-base leading-none">#1</span>
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
                ))
              )}
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

            {transactions.length === 0 ? (
              <div className="p-4 bg-white/30 rounded-2xl text-center text-xs text-on-surface-variant">
                <p className="font-medium">No transactions recorded yet.</p>
                <p className="text-[11px] text-on-surface-variant/70 mt-0.5">Your credit ledger will show swaps and escrow transfers here.</p>
              </div>
            ) : (
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
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
