import React, { useState } from 'react';
import { useTimeBank } from '../../context/TimeBankContext';

export default function PostSkillModal() {
  const { postSkillModalOpen, setPostSkillModalOpen, postNewSkill } = useTimeBank();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Development');
  const [level, setLevel] = useState('Intermediate');
  const [format, setFormat] = useState('Online & In-Person');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('code');

  if (!postSkillModalOpen) return null;

  const categories = [
    { name: 'Development', icon: 'code' },
    { name: 'Design', icon: 'palette' },
    { name: 'Languages', icon: 'translate' },
    { name: 'Music', icon: 'piano' },
    { name: 'Gardening', icon: 'yard' },
    { name: 'Culinary', icon: 'restaurant' },
    { name: 'DIY & Home', icon: 'handyman' },
    { name: 'Wellness', icon: 'self_improvement' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    await postNewSkill({
      title,
      category,
      level,
      format,
      description,
      icon
    });

    setTitle('');
    setDescription('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        onClick={() => setPostSkillModalOpen(false)}
        className="fixed inset-0 bg-black/40 backdrop-blur-md transition-opacity"
      ></div>

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl glass-panel-elevated p-6 md:p-8 z-10 my-8 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-glass-border">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-xl">auto_fix_high</span>
            </div>
            <div>
              <h2 className="font-headline-md text-xl font-bold text-on-surface">Post a Skill Offering</h2>
              <p className="text-xs text-on-surface-variant">Share your expertise and start earning Time Credits (1h = 1 Credit)</p>
            </div>
          </div>
          <button 
            onClick={() => setPostSkillModalOpen(false)}
            className="p-1 rounded-full hover:bg-white/40 text-on-surface-variant"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-on-surface mb-1">
              Skill Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Modern React & State Management, Sourdough Baking 101"
              className="w-full glass-input text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  const matched = categories.find(c => c.name === e.target.value);
                  if (matched) setIcon(matched.icon);
                }}
                className="w-full glass-input text-sm bg-white/40"
              >
                {categories.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Skill Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full glass-input text-sm bg-white/40"
              >
                <option value="Beginner Friendly">Beginner Friendly</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced / Expert">Advanced / Expert</option>
                <option value="Master / Native">Master / Native</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface mb-1">
              Exchange Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Online Video', 'In-Person', 'Flexible (Both)'].map((f) => (
                <button
                  type="button"
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`py-2 px-2 text-xs rounded-xl border transition-all text-center ${
                    format === f
                      ? 'bg-primary text-white border-primary font-semibold shadow-xs'
                      : 'bg-white/25 border-glass-border text-on-surface hover:bg-white/40'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface mb-1">
              Description & What Members Will Learn
            </label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline what you will cover in a 1-hour session, any prerequisites, and how you like to teach..."
              className="w-full glass-input text-sm"
            ></textarea>
          </div>

          <div className="pt-3 flex gap-3">
            <button
              type="button"
              onClick={() => setPostSkillModalOpen(false)}
              className="flex-1 py-3 px-4 rounded-full border border-glass-border text-on-surface-variant font-label-sm text-xs hover:bg-white/30 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-full bg-primary text-white font-label-sm text-xs font-bold hover:bg-primary/90 hover:shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">check</span>
              Publish Skill
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
