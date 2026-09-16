import React, { useState } from 'react';
import { useTimeBank } from '../context/TimeBankContext';

export default function LandingView() {
  const { setCurrentView, openBookingModal, members } = useTimeBank();
  const [calcHours, setCalcHours] = useState(3);

  return (
    <div className="pt-24 pb-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto relative overflow-hidden">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-0 -translate-x-1/2 w-96 h-96 bg-pastel-mint rounded-full blur-[100px] opacity-70 pointer-events-none"></div>
      <div className="absolute top-1/3 right-0 translate-x-1/3 w-80 h-80 bg-pastel-peach rounded-full blur-[100px] opacity-60 pointer-events-none"></div>
      <div className="absolute bottom-10 left-1/3 w-96 h-96 bg-pastel-lavender rounded-full blur-[120px] opacity-50 pointer-events-none"></div>

      {/* Hero Section */}
      <header className="relative pt-8 pb-16 md:pt-16 md:pb-24 text-center max-w-4xl mx-auto z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 dark:bg-white/10 border border-glass-border backdrop-blur-md mb-8 shadow-xs">
          <span className="material-symbols-outlined text-logo-sage text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            schedule
          </span>
          <span className="font-label-sm text-xs font-semibold text-primary">
            A new decentralized economy based on time
          </span>
        </div>

        <h1 className="font-display-lg-mobile md:font-display-lg text-3xl sm:text-5xl md:text-6xl text-on-surface font-extrabold tracking-tight mb-6 leading-tight">
          Exchange skills, not money <br className="hidden md:block" />
          <span className="text-primary relative inline-block">
            1 hour = 1 credit
            <svg
              className="absolute -bottom-2 left-0 w-full h-3 text-logo-sage/40"
              fill="none"
              preserveAspectRatio="none"
              viewBox="0 0 200 12"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 9.5C52.5 -1.5 142.5 -1.5 198 9.5"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="4"
              />
            </svg>
          </span>
        </h1>

        <p className="font-body-lg text-base md:text-lg text-on-surface-variant max-w-2xl mx-auto mb-10 leading-relaxed">
          Join a luminous community where every skill has equal value. Whether you're teaching guitar, fixing plumbing, or learning Python, your time is your currency.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => setCurrentView('discover')}
            className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-full font-headline-md text-base hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
          >
            <span>Start Exchanging</span>
            <span className="material-symbols-outlined text-xl">arrow_forward</span>
          </button>

          <button
            onClick={() => setCurrentView('dashboard')}
            className="w-full sm:w-auto px-8 py-4 bg-white/50 dark:bg-white/10 border-[1.5px] border-glass-border rounded-full font-headline-md text-base text-primary hover:bg-white/70 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 backdrop-blur-xl flex items-center justify-center gap-2 shadow-xs"
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span>Explore Dashboard Demo</span>
          </button>
        </div>
      </header>

      {/* Interactive 1h = 1 Credit Visualizer */}
      <section className="my-12 z-10 relative max-w-4xl mx-auto">
        <div className="glass-panel-elevated p-6 md:p-10 text-center">
          <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            How TimeBank Works
          </div>
          <h2 className="font-headline-md text-2xl md:text-3xl text-on-surface font-bold mb-4">
            Give an hour. Get an hour.
          </h2>
          <p className="text-sm text-on-surface-variant max-w-xl mx-auto mb-8">
            There are no price negotiations or inflated rates. Every member’s time is valued equally with escrow security.
          </p>

          <div className="glass-panel p-6 rounded-2xl max-w-2xl mx-auto mb-8">
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">
              If I teach {calcHours} hours of my skill:
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={calcHours}
              onChange={(e) => setCalcHours(Number(e.target.value))}
              className="w-full accent-primary h-2 bg-surface-variant rounded-lg cursor-pointer mb-6"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              <div className="bg-pastel-mint/40 p-4 rounded-xl border border-secondary-container">
                <p className="text-xs font-bold text-secondary uppercase">You Earn</p>
                <p className="text-2xl font-bold text-primary">{calcHours}.0 Time Credits</p>
                <p className="text-xs text-on-surface-variant mt-1">Stored securely in your decentralized Time Wallet</p>
              </div>

              <div className="bg-pastel-lavender/50 p-4 rounded-xl border border-primary-container/40">
                <p className="text-xs font-bold text-primary uppercase">You Can Learn</p>
                <p className="text-2xl font-bold text-logo-sage">{calcHours} Hours of Any Skill</p>
                <p className="text-xs text-on-surface-variant mt-1">French, Python, Piano, Gardening, Woodworking & more</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => setCurrentView('onboarding')}
              className="px-6 py-3 bg-primary text-white rounded-full font-label-sm text-xs font-bold hover:bg-primary/90 transition-all shadow-sm"
            >
              Set Up Your Skills Profile
            </button>
          </div>
        </div>
      </section>

      {/* Featured Community Member Preview */}
      <section className="my-16 z-10 relative max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h3 className="font-headline-md text-2xl md:text-3xl text-on-surface font-bold">
              Meet Community Members Ready to Swap
            </h3>
            <p className="text-sm text-on-surface-variant mt-1">
              Connect with passionate neighbors exchanging skills in your area.
            </p>
          </div>
          <button
            onClick={() => setCurrentView('discover')}
            className="text-primary font-label-sm text-sm font-bold flex items-center gap-1 hover:underline"
          >
            <span>Browse All {members.length} Members</span>
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {members.slice(0, 3).map((m) => (
            <div
              key={m.id}
              className="glass-panel p-6 rounded-2xl flex flex-col justify-between hover:scale-[1.02] hover:bg-white/60 transition-all duration-300 group cursor-pointer"
              onClick={() => {
                setCurrentView('profile');
              }}
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={m.avatar || '/default-avatar.svg'}
                    alt={m.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                  <div>
                    <h4 className="font-headline-md text-base font-bold text-on-surface group-hover:text-primary transition-colors">
                      {m.name}
                    </h4>
                    <p className="text-xs text-on-surface-variant">{m.location}</p>
                    <div className="flex items-center gap-1 text-xs text-logo-sage font-bold mt-0.5">
                      <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span>{m.rating} ({m.swapsCount} Swaps)</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/30 p-2.5 rounded-xl border border-glass-border mb-4">
                  <span className="text-[11px] font-bold text-primary uppercase block mb-1">Teaches</span>
                  <p className="text-xs font-semibold text-on-surface line-clamp-1">{m.skills[0]?.title}</p>
                </div>

                <p className="text-xs text-on-surface-variant line-clamp-2 mb-4 leading-relaxed">
                  {m.bio}
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openBookingModal(m, m.skills[0]);
                }}
                className="w-full py-2.5 bg-primary/10 hover:bg-primary hover:text-white text-primary border border-primary/20 rounded-xl font-label-sm text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5"
              >
                <span>Request Swap</span>
                <span className="material-symbols-outlined text-[16px]">handshake</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-20 pt-10 border-t border-outline-variant/30 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-on-surface-variant">
        <div className="flex items-center gap-2 font-display-lg text-headline-md text-logo-sage font-bold">
          TimeBank
        </div>
        <p>© 2026 TimeBank. Skill exchange for a better, decentralized world.</p>
        <div className="flex gap-6">
          <button onClick={() => setCurrentView('discover')} className="hover:text-primary transition-colors">Discover</button>
          <button onClick={() => setCurrentView('my-skills')} className="hover:text-primary transition-colors">Swaps</button>
          <button onClick={() => setCurrentView('wallet')} className="hover:text-primary transition-colors">Time Wallet</button>
        </div>
      </footer>
    </div>
  );
}
