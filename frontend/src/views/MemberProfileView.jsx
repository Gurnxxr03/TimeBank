import React from 'react';
import { useTimeBank } from '../context/TimeBankContext';

export default function MemberProfileView() {
  const { selectedMember, openBookingModal, members, viewMemberProfile, setCurrentView } = useTimeBank();

  const member = selectedMember || members[0];

  if (!member) {
    return (
      <div className="pt-28 pb-36 px-margin-mobile md:px-margin-desktop max-w-2xl mx-auto text-center">
        <div className="glass-panel p-10 rounded-3xl">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-3">person_search</span>
          <h2 className="font-headline-md text-xl font-bold text-on-surface mb-2">No Registered Members Found</h2>
          <p className="text-xs text-on-surface-variant mb-6">
            Registered community members and their offered skills will appear here.
          </p>
          <button
            onClick={() => setCurrentView('discover')}
            className="px-6 py-2.5 bg-primary text-white rounded-full text-xs font-bold"
          >
            Back to Discover
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 lg:pt-28 pb-36 px-margin-mobile md:px-margin-desktop w-full max-w-container-max mx-auto">
      {/* Switch member preview pills */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 hide-scrollbar">
        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mr-1">
          Select Member Profile:
        </span>
        {members.map(m => (
          <button
            key={m.id}
            onClick={() => viewMemberProfile(m.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 flex-shrink-0 ${
              m.id === member.id
                ? 'bg-primary text-white font-bold shadow-xs'
                : 'glass-panel text-on-surface hover:bg-white/60'
            }`}
          >
            <img src={m.avatar || '/default-avatar.svg'} alt={m.name} className="w-4 h-4 rounded-full object-cover" />
            <span>{m.name}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Profile Summary & Compatibility */}
        <aside className="lg:col-span-4 flex flex-col gap-6">
          {/* Profile Card */}
          <div className="glass-panel p-6 flex flex-col items-center text-center relative overflow-hidden group">
            <div className="relative w-28 h-28 mb-4">
              <img
                src={member.avatar || '/default-avatar.svg'}
                alt={member.name}
                className="w-full h-full object-cover rounded-full border-4 border-white shadow-sm"
              />
              <div className="absolute -bottom-1 -right-1 bg-secondary-container text-on-secondary-container p-1.5 rounded-full shadow-xs border-2 border-white">
                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified
                </span>
              </div>
            </div>

            <h1 className="font-headline-md text-xl font-bold text-on-surface mb-1">
              {member.name}
            </h1>
            <p className="font-body-md text-xs text-on-surface-variant mb-3 flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-logo-sage text-sm">location_on</span>
              <span>{member.location}</span>
              <span className="text-outline-variant mx-1">•</span>
              <span>{member.distance}</span>
            </p>

            <div className="flex items-center gap-2 mb-4 bg-white/40 px-3.5 py-1.5 rounded-full border border-glass-border">
              <span className="material-symbols-outlined text-logo-sage text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                star
              </span>
              <span className="font-label-sm text-xs font-bold text-on-surface">{member.rating}</span>
              <span className="font-body-md text-[11px] text-on-surface-variant">({member.swapsCount} Swaps)</span>
            </div>

            <p className="font-body-md text-xs text-on-surface-variant leading-relaxed text-left border-t border-outline-variant/30 pt-4 w-full">
              {member.bio}
            </p>
          </div>

          {/* Compatibility Score Widget */}
          <div className="glass-panel p-6">
            <h3 className="font-headline-md text-sm font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">psychology</span>
              Compatibility Score
            </h3>

            <div className="flex items-end justify-between mb-2">
              <span className="font-display-lg text-3xl font-extrabold text-primary">{member.matchScore}%</span>
              <span className="font-label-sm text-xs font-bold text-logo-sage mb-1">
                {member.matchScore >= 90 ? 'Perfect Match' : member.matchScore >= 80 ? 'High Match' : 'Good Match'}
              </span>
            </div>

            <div className="w-full bg-surface-container-high rounded-full h-2 mb-4 overflow-hidden">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-700" 
                style={{ width: `${member.matchScore}%` }}
              ></div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">schedule</span>
                  Availability
                </span>
                <span className="font-semibold text-on-surface">{member.matchBreakdown?.availability || 'Matched'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">distance</span>
                  Proximity
                </span>
                <span className="font-semibold text-on-surface">{member.matchBreakdown?.proximity || 'Nearby'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">handshake</span>
                  Skill Alignment
                </span>
                <span className="font-semibold text-on-surface">{member.matchBreakdown?.skillNeed || 'Great'}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Column: Skills Offered Bento & Reviews */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Skills Offered Bento Grid */}
          <section className="glass-panel p-6 md:p-8">
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">school</span>
              Skills Offered by {member.name.split(' ')[0]}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(member.skills || []).map((skill, index) => (
                <div
                  key={skill.id}
                  className={`bg-white/40 border border-glass-border rounded-2xl p-5 hover:scale-[1.01] hover:bg-white/60 transition-all duration-300 flex flex-col justify-between ${
                    index === 2 ? 'md:col-span-2' : ''
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2.5 bg-pastel-mint rounded-xl text-primary">
                        <span className="material-symbols-outlined text-[20px]">{skill.icon || 'yard'}</span>
                      </div>
                      <span className="font-label-sm text-[11px] font-semibold px-2.5 py-1 bg-surface-variant/60 text-on-surface-variant rounded-full">
                        {skill.level}
                      </span>
                    </div>

                    <h4 className="font-headline-md text-base font-bold text-on-surface mb-1">
                      {skill.title}
                    </h4>

                    <p className="font-body-md text-xs text-on-surface-variant leading-relaxed mb-4">
                      {skill.desc}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/60">
                    <span className="text-[11px] text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">videocam</span>
                      {skill.format}
                    </span>
                    <button
                      onClick={() => openBookingModal(member, skill)}
                      className="px-4 py-1.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-xs"
                    >
                      Book 1h Swap
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Reviews */}
          <section className="glass-panel p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-headline-md text-lg font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-logo-sage">reviews</span>
                Recent Community Reviews
              </h2>
              <span className="text-xs font-bold text-primary">
                {(member.reviews || []).length} Verified Reviews
              </span>
            </div>

            <div className="space-y-4">
              {(member.reviews || []).map(rev => (
                <div key={rev.id} className="border-b border-outline-variant/20 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={rev.avatar || '/default-avatar.svg'}
                      alt={rev.author}
                      className="w-9 h-9 rounded-full object-cover border border-white"
                    />
                    <div>
                      <h5 className="font-body-md text-xs font-bold text-on-surface">{rev.author}</h5>
                      <div className="flex text-logo-sage text-[12px]">
                        {[...Array(5)].map((_, i) => (
                          <span 
                            key={i} 
                            className="material-symbols-outlined text-[14px]"
                            style={{ fontVariationSettings: i < Math.floor(rev.rating) ? "'FILL' 1" : "'FILL' 0" }}
                          >
                            star
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="text-[11px] text-on-surface-variant ml-auto">{rev.date}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed pl-12">
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 w-full max-w-lg px-4 pointer-events-none">
        <div className="glass-panel-elevated rounded-full p-2.5 flex items-center justify-between pointer-events-auto ambient-shadow-primary border border-white/80">
          <div className="flex items-center gap-3 pl-3">
            <div className="w-9 h-9 rounded-full bg-primary-container/40 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">handshake</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-xs font-bold text-on-surface">Request a Skill Swap</span>
              <span className="text-[11px] text-on-surface-variant">Standard Rate: 1.0 Time Credit/hr</span>
            </div>
          </div>

          <button
            onClick={() => openBookingModal(member, member.skills ? member.skills[0] : null)}
            className="bg-primary text-white font-label-sm text-xs font-bold px-6 py-3 rounded-full hover:bg-primary/90 transition-all shadow-md flex items-center gap-1.5 group"
          >
            <span>Request</span>
            <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
