import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { userApi, skillsApi } from '../api/client';
import {
  Clock,
  Plus,
  Trash2,
  Sparkles,
  Search,
  BookOpen,
  Calendar,
  Layers,
  X,
  AlertCircle,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, refreshUser } = useAuth();
  const [catalog, setCatalog] = useState([]);

  // Add Skill Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('offering');
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [proficiency, setProficiency] = useState('Intermediate');
  const [modalSearch, setModalSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Create New Skill Sub-form
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Technology & Coding');

  const fetchCatalog = useCallback(async () => {
    try {
      const data = await skillsApi.getCatalog();
      setCatalog(data);
    } catch (err) {
      console.error('Error fetching skills catalog:', err);
    }
  }, []);

  // Load catalog on mount
  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  const openAddModal = (type) => {
    setModalType(type);
    setSelectedSkillId('');
    setProficiency('Intermediate');
    setShowCreateNew(false);
    setNewSkillName('');
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleCreateNewSkill = async (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    try {
      setSubmitting(true);
      setModalError(null);
      const created = await skillsApi.createSkill({
        name: newSkillName.trim(),
        category: newSkillCategory,
      });
      await fetchCatalog();
      setSelectedSkillId(created.skill_id.toString());
      setShowCreateNew(false);
      setNewSkillName('');
    } catch (err) {
      setModalError(err.message || 'Failed to create skill in catalog.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddUserSkill = async (e) => {
    e.preventDefault();
    if (!selectedSkillId) {
      setModalError('Please select a skill from the list or create a new one.');
      return;
    }

    try {
      setSubmitting(true);
      setModalError(null);
      await userApi.addSkill({
        skill_id: parseInt(selectedSkillId, 10),
        type: modalType,
        proficiency,
      });
      await refreshUser();
      setIsModalOpen(false);
    } catch (err) {
      setModalError(err.message || 'Failed to add skill.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveSkill = async (id, skillName) => {
    if (!window.confirm(`Are you sure you want to remove "${skillName}" from your profile?`)) {
      return;
    }

    try {
      await userApi.removeSkill(id);
      await refreshUser();
    } catch (err) {
      alert(err.message || 'Failed to remove skill.');
    }
  };

  const offeringSkills = user?.skills?.filter((s) => s.type === 'offering') || [];
  const seekingSkills = user?.skills?.filter((s) => s.type === 'seeking') || [];

  const filteredCatalog = catalog.filter(
    (s) =>
      s.name.toLowerCase().includes(modalSearch.toLowerCase()) ||
      s.category.toLowerCase().includes(modalSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome & Profile Header Banner */}
      <div className="glass-panel-elevated p-6 sm:p-8 rounded-3xl border border-white/60 dark:border-white/10 shadow-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-extrabold text-2xl shadow-lg shadow-emerald-500/20">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
                  {user?.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                  {user?.role}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    user?.status === 'active'
                      ? 'bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300'
                      : 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300'
                  }`}
                >
                  {user?.status}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mt-1 flex items-center gap-3">
                <span>{user?.email}</span>
                <span>•</span>
                <span className="capitalize">Auth: {user?.auth_provider}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Joined {new Date(user?.created_at).toLocaleDateString()}
                </span>
              </p>
            </div>
          </div>

          {/* Time Credits Balance Card */}
          <div className="p-4 rounded-2xl bg-white/70 dark:bg-[#141716]/90 border border-emerald-500/20 shadow-md flex items-center gap-4 min-w-[240px]">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Time Credits Balance</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-on-surface">5.0</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Hours / Credits</span>
              </div>
              <p className="text-[10px] text-on-surface-variant/70">1 Hour Given = 1 Credit</p>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Offering Skills */}
        <div className="glass-panel p-6 rounded-3xl border border-white/60 dark:border-white/10 shadow-lg flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-on-surface">Skills I'm Offering</h2>
                <p className="text-xs text-on-surface-variant">Skills you can teach or trade with others</p>
              </div>
            </div>
            <button
              onClick={() => openAddModal('offering')}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm shadow-emerald-600/30 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Skill</span>
            </button>
          </div>

          {offeringSkills.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-black/10 dark:border-white/10 text-center">
              <Layers className="w-10 h-10 text-on-surface-variant/40 mb-2" />
              <p className="text-sm font-semibold text-on-surface">No offering skills listed yet</p>
              <p className="text-xs text-on-surface-variant max-w-xs mt-1">
                Share what you know — from programming and tutoring to languages or cooking.
              </p>
              <button
                onClick={() => openAddModal('offering')}
                className="mt-4 px-4 py-2 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-on-surface text-xs font-semibold transition-all"
              >
                + Offer your first skill
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {offeringSkills.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-white/60 dark:bg-white/5 border border-white/80 dark:border-white/10 shadow-sm flex items-center justify-between group hover:border-emerald-500/40 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-on-surface">{item.skill.name}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                        {item.proficiency || 'Intermediate'}
                      </span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant font-medium">
                      Category: <span className="text-on-surface">{item.skill.category}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveSkill(item.id, item.skill.name)}
                    className="p-2 rounded-xl text-on-surface-variant hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    title="Remove Skill"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Seeking Skills */}
        <div className="glass-panel p-6 rounded-3xl border border-white/60 dark:border-white/10 shadow-lg flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-on-surface">Skills I'm Seeking</h2>
                <p className="text-xs text-on-surface-variant">Skills you want to learn or receive help with</p>
              </div>
            </div>
            <button
              onClick={() => openAddModal('seeking')}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-600/30 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Skill</span>
            </button>
          </div>

          {seekingSkills.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-black/10 dark:border-white/10 text-center">
              <Search className="w-10 h-10 text-on-surface-variant/40 mb-2" />
              <p className="text-sm font-semibold text-on-surface">No seeking skills listed yet</p>
              <p className="text-xs text-on-surface-variant max-w-xs mt-1">
                Tell the community what you want to learn using your time credits.
              </p>
              <button
                onClick={() => openAddModal('seeking')}
                className="mt-4 px-4 py-2 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-on-surface text-xs font-semibold transition-all"
              >
                + Request your first skill
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {seekingSkills.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-white/60 dark:bg-white/5 border border-white/80 dark:border-white/10 shadow-sm flex items-center justify-between group hover:border-blue-500/40 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-on-surface">{item.skill.name}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">
                        {item.proficiency || 'Intermediate'}
                      </span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant font-medium">
                      Category: <span className="text-on-surface">{item.skill.category}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveSkill(item.id, item.skill.name)}
                    className="p-2 rounded-xl text-on-surface-variant hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    title="Remove Skill"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Skill Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg glass-panel-elevated p-6 rounded-3xl bg-white dark:bg-[#181c1a] border border-white/60 dark:border-white/10 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-on-surface">
                  {modalType === 'offering' ? 'Offer a Skill' : 'Request a Skill'}
                </span>
                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    modalType === 'offering'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                  }`}
                >
                  {modalType}
                </span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-xl text-on-surface-variant hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message */}
            {modalError && (
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{modalError}</span>
              </div>
            )}

            {!showCreateNew ? (
              <form onSubmit={handleAddUserSkill} className="space-y-4">
                {/* Search / Filter Catalog */}
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">
                    Select from Skill Catalog
                  </label>
                  <div className="relative mb-2">
                    <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={modalSearch}
                      onChange={(e) => setModalSearch(e.target.value)}
                      placeholder="Search skills or categories..."
                      className="glass-input w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/5"
                    />
                  </div>

                  <div className="max-h-48 overflow-y-auto rounded-xl border border-black/10 dark:border-white/10 p-1 space-y-1 bg-black/[0.02] dark:bg-white/[0.02]">
                    {filteredCatalog.length === 0 ? (
                      <p className="p-3 text-center text-xs text-on-surface-variant">
                        No matching skills found in catalog.
                      </p>
                    ) : (
                      filteredCatalog.map((s) => (
                        <div
                          key={s.skill_id}
                          onClick={() => setSelectedSkillId(s.skill_id.toString())}
                          className={`p-2.5 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-all ${
                            selectedSkillId === s.skill_id.toString()
                              ? 'bg-emerald-600 text-white font-bold shadow-sm'
                              : 'hover:bg-black/5 dark:hover:bg-white/5 text-on-surface'
                          }`}
                        >
                          <span>{s.name}</span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-md ${
                              selectedSkillId === s.skill_id.toString()
                                ? 'bg-white/20 text-white'
                                : 'bg-black/5 dark:bg-white/10 text-on-surface-variant'
                            }`}
                          >
                            {s.category}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Proficiency Level */}
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">
                    Proficiency Level
                  </label>
                  <select
                    value={proficiency}
                    onChange={(e) => setProficiency(e.target.value)}
                    className="glass-input w-full py-2.5 px-3 rounded-xl text-xs border border-black/10 dark:border-white/10 bg-white dark:bg-[#1f2422] text-on-surface"
                  >
                    <option value="Beginner">Beginner (Basic fundamentals)</option>
                    <option value="Intermediate">Intermediate (Comfortable & practical)</option>
                    <option value="Advanced">Advanced (High competence & nuance)</option>
                    <option value="Expert">Expert (Professional mastery)</option>
                  </select>
                </div>

                {/* Can't find skill button */}
                <div className="pt-1 flex items-center justify-between text-xs">
                  <span className="text-on-surface-variant">Don't see your skill?</span>
                  <button
                    type="button"
                    onClick={() => setShowCreateNew(true)}
                    className="font-bold text-emerald-600 hover:text-emerald-700 underline"
                  >
                    + Add New Skill to Catalog
                  </button>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/10 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !selectedSkillId}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/30 disabled:opacity-50 transition-all"
                  >
                    {submitting ? 'Adding...' : 'Add to Profile'}
                  </button>
                </div>
              </form>
            ) : (
              /* Create New Skill Form */
              <form onSubmit={handleCreateNewSkill} className="space-y-4">
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-xs text-emerald-800 dark:text-emerald-300">
                  Create a new skill in TimeBank's global catalog so you and other members can trade it.
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">Skill Name</label>
                  <input
                    type="text"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    placeholder="e.g. Next.js App Router or French Pastry Baking"
                    required
                    className="glass-input w-full px-3 py-2 text-xs rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">Category</label>
                  <select
                    value={newSkillCategory}
                    onChange={(e) => setNewSkillCategory(e.target.value)}
                    className="glass-input w-full py-2.5 px-3 rounded-xl text-xs border border-black/10 dark:border-white/10 bg-white dark:bg-[#1f2422] text-on-surface"
                  >
                    <option value="Technology & Coding">Technology & Coding</option>
                    <option value="Academics & Tutoring">Academics & Tutoring</option>
                    <option value="Languages">Languages</option>
                    <option value="Creative & Media">Creative & Media</option>
                    <option value="Practical & Career">Practical & Career</option>
                    <option value="Music & Performing Arts">Music & Performing Arts</option>
                    <option value="Health & Fitness">Health & Fitness</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-black/10 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowCreateNew(false)}
                    className="text-xs font-semibold text-on-surface-variant hover:underline"
                  >
                    ← Back to Catalog
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !newSkillName.trim()}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/30 disabled:opacity-50 transition-all"
                  >
                    {submitting ? 'Creating...' : 'Create & Select'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
