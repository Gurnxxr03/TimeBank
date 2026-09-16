import React, { useState, useMemo } from 'react';
import { useTimeBank } from '../context/TimeBankContext';

export default function DiscoverView() {
  const { members, openBookingModal, viewMemberProfile } = useTimeBank();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedFormat, setSelectedFormat] = useState('All');

  const categories = ['All', 'Development', 'Design', 'Languages', 'Music', 'Gardening', 'DIY & Home'];

  // Flattened skills with provider info
  const skillCards = useMemo(() => {
    let list = [];
    members.forEach(member => {
      (member.skills || []).forEach(skill => {
        list.push({
          member,
          skill,
          id: `${member.id}_${skill.id}`
        });
      });
    });

    return list.filter(({ member, skill }) => {
      const matchesSearch = 
        (skill.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (skill.desc || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (member.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (skill.category || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'All' || (skill.category || '').toLowerCase() === selectedCategory.toLowerCase();
      
      const matchesFormat = selectedFormat === 'All' || 
        (selectedFormat === 'Online' && (skill.format || '').toLowerCase().includes('online')) ||
        (selectedFormat === 'In-Person' && (skill.format || '').toLowerCase().includes('in-person'));

      return matchesSearch && matchesCategory && matchesFormat;
    });
  }, [members, searchQuery, selectedCategory, selectedFormat]);

  return (
    <div className="pt-24 lg:pt-28 pb-28 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
      {/* Header & Search */}
      <header className="mb-10 max-w-4xl">
        <h1 className="font-display-lg-mobile md:font-display-lg text-3xl md:text-5xl font-extrabold text-on-surface tracking-tight mb-3">
          Exchange skills.<br />
          <span className="text-logo-sage">Expand your potential.</span>
        </h1>

        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mt-6">
          {/* Search Bar */}
          <div className="relative w-full md:w-[380px]">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="What do you want to learn? (e.g. French, Python, Gardening)"
              className="glass-input w-full rounded-full py-3.5 pl-12 pr-4 text-sm font-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            )}
          </div>

          {/* Delivery Format Toggle */}
          <div className="flex bg-white/40 p-1 rounded-full border border-glass-border">
            {['All', 'Online', 'In-Person'].map(fmt => (
              <button
                key={fmt}
                onClick={() => setSelectedFormat(fmt)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedFormat === fmt
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mt-4 hide-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full font-label-sm text-xs font-semibold whitespace-nowrap transition-all border ${
                selectedCategory === cat
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'glass-panel text-on-surface-variant hover:bg-white/70 border-white/60'
              }`}
            >
              {cat === 'All' ? 'All Skills' : cat}
            </button>
          ))}
        </div>
      </header>

      {/* Results Count */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-xs font-medium text-on-surface-variant">
          Showing <span className="font-bold text-on-surface">{skillCards.length}</span> available skill swaps in your community
        </p>
      </div>

      {/* Provider & Skills Grid */}
      {skillCards.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-3xl max-w-lg mx-auto my-12">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-3">search_off</span>
          <h3 className="font-headline-md text-lg font-bold text-on-surface mb-2">No skills found</h3>
          <p className="text-xs text-on-surface-variant mb-6">Try searching for a different skill or clear your filters.</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setSelectedFormat('All'); }}
            className="px-6 py-2.5 bg-primary text-white rounded-full text-xs font-bold"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {skillCards.map(({ member, skill, id }) => (
            <article
              key={id}
              className="glass-panel rounded-2xl p-6 group hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden flex flex-col justify-between border-t-[1.5px] border-l-[1.5px] border-white/80 shadow-sm hover:shadow-md hover:bg-white/65"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div 
                    onClick={() => viewMemberProfile(member.id)}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-xs flex-shrink-0">
                      <img
                        src={member.avatar || '/default-avatar.svg'}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-headline-md text-sm font-bold text-on-surface group-hover:text-primary transition-colors">
                        {member.name}
                      </h4>
                      <p className="text-[11px] text-on-surface-variant">{member.distance || member.location}</p>
                    </div>
                  </div>

                  <span className="px-2 py-1 bg-pastel-mint text-primary rounded-lg text-[11px] font-bold border border-primary/20 flex-shrink-0">
                    {member.matchScore || 90}% Match
                  </span>
                </div>

                {/* Skill Details */}
                <div className="mb-4">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="px-2 py-0.5 bg-primary-container/40 text-on-primary-container text-[10px] font-bold rounded-md uppercase tracking-wider">
                      {skill.category}
                    </span>
                    <span className="text-[10px] text-on-surface-variant font-medium">
                      • {skill.level}
                    </span>
                  </div>

                  <h3 
                    onClick={() => viewMemberProfile(member.id)}
                    className="font-headline-md text-base font-bold text-on-surface mb-2 cursor-pointer hover:text-primary transition-colors leading-snug"
                  >
                    {skill.title || skill.name}
                  </h3>

                  <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-3 mb-3">
                    {skill.desc || 'Comprehensive 1-to-1 learning session with equal-value time credit exchange.'}
                  </p>

                  <div className="flex items-center gap-1 text-[11px] text-on-surface-variant/80 bg-white/40 px-2.5 py-1.5 rounded-lg border border-white/60">
                    <span className="material-symbols-outlined text-[14px]">videocam</span>
                    <span>{skill.format || 'Online & In-Person'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-glass-border/60 flex gap-2">
                <button
                  onClick={() => viewMemberProfile(member.id)}
                  className="px-3 py-2 text-xs font-semibold text-on-surface-variant hover:text-primary rounded-xl hover:bg-white/40 transition-colors"
                >
                  Profile
                </button>
                <button
                  onClick={() => openBookingModal(member, skill)}
                  className="flex-1 py-2 px-3 bg-primary text-white rounded-xl font-label-sm text-xs font-bold hover:bg-primary/90 hover:shadow-xs transition-all flex items-center justify-center gap-1"
                >
                  <span>Request (1 Cr)</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
