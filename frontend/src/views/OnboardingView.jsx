import React, { useState } from 'react';
import { useTimeBank } from '../context/TimeBankContext';

export default function OnboardingView() {
  const { user, updateProfile, addCustomSkill, removeSkill, setCurrentView, triggerConfetti } = useTimeBank();

  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState(user.fullName || '');
  const [bio, setBio] = useState(user.bio || '');
  const [location, setLocation] = useState(user.location || '');
  const [customTeach, setCustomTeach] = useState('');
  const [customLearn, setCustomLearn] = useState('');

  // Keep fields synced if user hydrates after mount
  React.useEffect(() => {
    if (user.fullName && !fullName) setFullName(user.fullName);
    if (user.bio && !bio) setBio(user.bio);
    if (user.location && !location) setLocation(user.location);
  }, [user.fullName, user.bio, user.location]);

  const handleSaveProfile = async () => {
    await updateProfile({ 
      fullName: fullName.trim() || user.fullName, 
      bio: bio.trim(), 
      location: location.trim() || user.location,
      onboardingCompleted: true 
    });
    triggerConfetti();
    setCurrentView('dashboard');
  };

  const handleSkip = async () => {
    await updateProfile({ onboardingCompleted: true });
    setCurrentView('dashboard');
  };

  const handleAddTeach = (e) => {
    e.preventDefault();
    if (!customTeach.trim()) return;
    addCustomSkill(customTeach, 'teach');
    setCustomTeach('');
  };

  const handleAddLearn = (e) => {
    e.preventDefault();
    if (!customLearn.trim()) return;
    addCustomSkill(customLearn, 'learn');
    setCustomLearn('');
  };

  return (
    <div className="pt-24 pb-28 px-margin-mobile md:px-margin-desktop min-h-screen flex flex-col items-center justify-center max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="w-full flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm">
            TB
          </div>
          <span className="font-display-lg text-lg text-logo-sage font-bold tracking-tight">TimeBank Setup</span>
        </div>
        <button
          onClick={handleSkip}
          className="text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-sm">close</span>
          Skip to Dashboard
        </button>
      </div>

      <div className="w-full">
        {/* Progress Step Indicator */}
        <div className="mb-8 text-center">
          <div className="flex justify-center items-center gap-3 md:gap-6 mb-3">
            <button 
              onClick={() => setStep(1)} 
              className="flex items-center gap-2"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step >= 1 ? 'bg-primary text-white shadow-xs' : 'border border-outline-variant text-on-surface-variant'
              }`}>
                1
              </div>
              <span className={`text-xs font-bold ${step >= 1 ? 'text-primary' : 'text-on-surface-variant'}`}>
                Profile
              </span>
            </button>

            <div className={`w-8 md:w-16 h-px transition-colors ${step >= 2 ? 'bg-primary' : 'bg-outline-variant'}`}></div>

            <button 
              onClick={() => setStep(2)} 
              className="flex items-center gap-2"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step >= 2 ? 'bg-primary text-white shadow-xs' : 'border border-outline-variant text-on-surface-variant'
              }`}>
                2
              </div>
              <span className={`text-xs font-bold ${step >= 2 ? 'text-primary' : 'text-on-surface-variant'}`}>
                Interests & Skills
              </span>
            </button>

            <div className={`w-8 md:w-16 h-px transition-colors ${step >= 3 ? 'bg-primary' : 'bg-outline-variant'}`}></div>

            <button 
              onClick={() => setStep(3)} 
              className="flex items-center gap-2"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step >= 3 ? 'bg-primary text-white shadow-xs' : 'border border-outline-variant text-on-surface-variant'
              }`}>
                3
              </div>
              <span className={`text-xs font-bold ${step >= 3 ? 'text-primary' : 'text-on-surface-variant'}`}>
                Availability
              </span>
            </button>
          </div>
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="glass-panel-elevated p-6 md:p-10 rounded-3xl animate-in fade-in duration-300">
            <h2 className="font-headline-md text-xl md:text-2xl font-bold text-primary mb-2">
              Basic Info & Community Presence
            </h2>
            <p className="text-xs text-on-surface-variant mb-6">
              Let your neighbors know who you are and what you're passionate about.
            </p>

            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-6">
              {/* Avatar Uploader */}
              <div className="flex flex-col items-center">
                <label className="relative group cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (uploadEvent) => {
                          const dataUrl = uploadEvent.target.result;
                          updateProfile({ avatar: dataUrl });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-glass-border shadow-sm bg-surface-container-low flex items-center justify-center">
                    <img src={user.avatar || '/default-avatar.svg'} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute inset-0 bg-primary/40 backdrop-blur-[2px] rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white">
                    <span className="material-symbols-outlined text-2xl mb-0.5">photo_camera</span>
                    <span className="text-[10px] font-bold">Upload</span>
                  </div>
                </label>
                <div className="flex flex-col items-center gap-1 mt-2">
                  <p className="text-[11px] font-semibold text-on-surface-variant">Click to Upload Photo</p>
                  {user.avatar !== '/default-avatar.svg' && (
                    <button
                      type="button"
                      onClick={() => updateProfile({ avatar: '/default-avatar.svg' })}
                      className="text-[10px] text-error hover:underline font-medium"
                    >
                      Reset to Blank Avatar
                    </button>
                  )}
                </div>
              </div>

              {/* Text Fields */}
              <div className="flex-1 w-full space-y-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1" htmlFor="fullName">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Jordan Smith"
                    className="w-full glass-input text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1" htmlFor="location">
                    Location / Neighborhood
                  </label>
                  <input
                    id="location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Indiranagar, Bengaluru"
                    className="w-full glass-input text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1" htmlFor="bio">
                    Short Bio & Interests
                  </label>
                  <textarea
                    id="bio"
                    rows="3"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell the community a bit about yourself, hobbies, and why you joined..."
                    className="w-full glass-input text-sm"
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-glass-border">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-8 py-3 bg-primary text-white rounded-full font-label-sm text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <span>Continue to Skills</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Teach & Learn Skills */}
        {step === 2 && (
          <div className="glass-panel-elevated p-6 md:p-10 rounded-3xl animate-in fade-in duration-300">
            <h2 className="font-headline-md text-xl md:text-2xl font-bold text-primary mb-2">
              Your Skills & Interests
            </h2>
            <p className="text-xs text-on-surface-variant mb-6">
              Select skills you want to offer to earn credits, and skills you want to learn from neighbors.
            </p>

            {/* Teach Section */}
            <div className="mb-8 bg-white/30 p-5 rounded-2xl border border-glass-border">
              <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-logo-sage" style={{ fontVariationSettings: "'FILL' 1" }}>
                  volunteer_activism
                </span>
                I can teach / offer
              </h3>

              <div className="flex flex-wrap gap-2 mb-3">
                {user.skillsOffered.map((sk) => (
                  <span
                    key={sk.id}
                    className="px-4 py-1.5 rounded-full bg-primary text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                  >
                    <span>{sk.name || sk.title}</span>
                    <button onClick={() => removeSkill(sk.id, 'teach')} className="hover:text-red-200">
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Add custom teach */}
              <form onSubmit={handleAddTeach} className="flex gap-2 max-w-md">
                <input
                  type="text"
                  value={customTeach}
                  onChange={(e) => setCustomTeach(e.target.value)}
                  placeholder="+ Add skill to offer (e.g. Sourdough baking, Yoga)"
                  className="glass-input flex-1 text-xs py-2"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary/20 hover:bg-primary hover:text-white text-primary rounded-xl text-xs font-bold transition-all"
                >
                  Add
                </button>
              </form>
            </div>

            {/* Learn Section */}
            <div className="mb-8 bg-white/30 p-5 rounded-2xl border border-glass-border">
              <h3 className="text-xs font-bold text-tertiary uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  school
                </span>
                I want to learn
              </h3>

              <div className="flex flex-wrap gap-2 mb-3">
                {user.skillsWanted.map((sk) => (
                  <span
                    key={sk.id}
                    className="px-4 py-1.5 rounded-full bg-tertiary text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                  >
                    <span>{sk.name}</span>
                    <button onClick={() => removeSkill(sk.id, 'learn')} className="hover:text-red-200">
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Add custom learn */}
              <form onSubmit={handleAddLearn} className="flex gap-2 max-w-md">
                <input
                  type="text"
                  value={customLearn}
                  onChange={(e) => setCustomLearn(e.target.value)}
                  placeholder="+ Add skill to learn (e.g. Guitar, French, Carpentry)"
                  className="glass-input flex-1 text-xs py-2"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-tertiary/20 hover:bg-tertiary hover:text-white text-tertiary rounded-xl text-xs font-bold transition-all"
                >
                  Add
                </button>
              </form>
            </div>

            <div className="flex justify-between pt-4 border-t border-glass-border">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-6 py-2.5 rounded-full border border-glass-border text-xs font-bold text-on-surface-variant hover:bg-white/40"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-8 py-3 bg-primary text-white rounded-full font-label-sm text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <span>Continue to Availability</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Availability & Completion */}
        {step === 3 && (
          <div className="glass-panel-elevated p-6 md:p-10 rounded-3xl animate-in fade-in duration-300">
            <h2 className="font-headline-md text-xl md:text-2xl font-bold text-primary mb-2">
              Availability & Swap Format
            </h2>
            <p className="text-xs text-on-surface-variant mb-6">
              When are you most available to swap 1-hour sessions?
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {['Weekday Mornings', 'Weekday Evenings', 'Saturdays', 'Sundays'].map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => {
                    const current = user.availability || [];
                    const next = current.includes(slot)
                      ? current.filter(s => s !== slot)
                      : [...current, slot];
                    updateProfile({ availability: next });
                  }}
                  className={`p-4 rounded-2xl border text-center transition-all ${
                    user.availability?.includes(slot)
                      ? 'bg-primary text-white border-primary shadow-sm font-bold'
                      : 'bg-white/30 border-glass-border text-on-surface hover:bg-white/50'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl block mb-1">calendar_month</span>
                  <span className="text-xs">{slot}</span>
                </button>
              ))}
            </div>

            <div className="bg-pastel-mint/50 p-4 rounded-2xl border border-secondary-container mb-6 flex items-start gap-3">
              <span className="material-symbols-outlined text-logo-sage text-xl mt-0.5">verified</span>
              <div>
                <p className="text-xs font-bold text-primary">Decentralized Escrow Protection Enabled</p>
                <p className="text-xs text-on-secondary-container leading-relaxed mt-0.5">
                  Your starting balance is {user.balance.toFixed(1)} Time Credits. 1 credit is automatically held in escrow when booking and released when confirmed.
                </p>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-glass-border">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-2.5 rounded-full border border-glass-border text-xs font-bold text-on-surface-variant hover:bg-white/40"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                className="px-8 py-3.5 bg-primary text-white rounded-full font-label-sm text-xs font-bold hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 transition-all flex items-center gap-1.5 shadow-md"
              >
                <span>Complete Setup & Enter Dashboard</span>
                <span className="material-symbols-outlined text-base">check_circle</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
