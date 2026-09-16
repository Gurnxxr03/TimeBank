import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from './AuthContext';
import { userApi, skillsApi } from '../api/client';

const TimeBankContext = createContext();

export const DEFAULT_BLANK_AVATAR = '/default-avatar.svg';

export const buildUserState = (authUser) => {
  if (!authUser) {
    return {
      id: null,
      fullName: '',
      email: '',
      role: 'user',
      location: 'Community Member',
      distance: '',
      avatar: DEFAULT_BLANK_AVATAR,
      bio: '',
      balance: 10.0,
      inEscrow: 0.0,
      lifetimeEarned: 0.0,
      lifetimeSpent: 0.0,
      rating: 5.0,
      reviewsCount: 0,
      onboardingCompleted: false,
      skillsOffered: [],
      skillsWanted: [],
      availability: ['Saturdays', 'Weekday Evenings']
    };
  }

  const offered = Array.isArray(authUser.skills)
    ? authUser.skills
        .filter(s => s.type === 'offering')
        .map(s => ({
          id: s.id,
          userSkillId: s.id,
          skillId: s.skill_id,
          name: s.skill?.name || 'Skill',
          category: s.skill?.category || 'General',
          level: s.proficiency || 'Intermediate',
          icon: 'school'
        }))
    : [];

  const wanted = Array.isArray(authUser.skills)
    ? authUser.skills
        .filter(s => s.type === 'seeking')
        .map(s => ({
          id: s.id,
          userSkillId: s.id,
          skillId: s.skill_id,
          name: s.skill?.name || 'Skill',
          category: s.skill?.category || 'General',
          level: s.proficiency || 'Beginner',
          icon: 'search'
        }))
    : [];

  let availability = ['Saturdays', 'Weekday Evenings'];
  if (Array.isArray(authUser.availability) && authUser.availability.length > 0) {
    availability = authUser.availability;
  }

  return {
    id: authUser.user_id,
    fullName: authUser.name || 'Member',
    email: authUser.email || '',
    role: authUser.role || 'user',
    location: authUser.location || 'Community Member',
    distance: '0 km away',
    avatar: authUser.avatar || DEFAULT_BLANK_AVATAR,
    bio: authUser.bio || '',
    balance: typeof authUser.time_credits === 'number' ? authUser.time_credits : 10.0,
    inEscrow: typeof authUser.in_escrow === 'number' ? authUser.in_escrow : 0.0,
    lifetimeEarned: typeof authUser.lifetime_earned === 'number' ? authUser.lifetime_earned : 0.0,
    lifetimeSpent: typeof authUser.lifetime_spent === 'number' ? authUser.lifetime_spent : 0.0,
    rating: typeof authUser.rating === 'number' ? authUser.rating : 5.0,
    reviewsCount: 0,
    onboardingCompleted: Boolean(authUser.onboarding_completed),
    skillsOffered: offered,
    skillsWanted: wanted,
    availability: availability
  };
};

const INITIAL_MEMBERS = [
  {
    id: 'ananya_sharma',
    name: 'Ananya Sharma',
    role: 'Urban Agriculturist & Polyglot',
    location: 'Koramangala, Bengaluru, KA',
    distance: '2.4 km away',
    avatar: DEFAULT_BLANK_AVATAR,
    verified: true,
    rating: 4.9,
    swapsCount: 128,
    matchScore: 85,
    matchBreakdown: {
      availability: 'High Match (Weekends)',
      proximity: 'Excellent (2.4 km)',
      skillNeed: 'Perfect Match (Gardening & Languages)'
    },
    bio: 'Passionate about sustainable living and community terrace gardening. I love teaching people how to grow organic vegetables in apartments, repair furniture, and practice conversational languages.',
    skills: [
      { id: 'an_1', title: 'Urban Balcony Gardening & Organic Composting', category: 'Gardening', level: 'Expert', icon: 'yard', format: 'In-Person / Online', desc: 'Balcony setups, kitchen waste composting, companion potting, and organic pest management for Indian city homes.' },
      { id: 'an_2', title: 'Conversational Spanish & Hindi Dialects', category: 'Languages', level: 'Native', icon: 'translate', format: 'Online / Local Cafe', desc: 'Casual conversation practice, vocabulary building, and cultural immersion tailored to your pace.' },
      { id: 'an_3', title: 'Basic Woodworking & Furniture Polish', category: 'Crafts', level: 'Intermediate', icon: 'carpenter', format: 'In-Person', desc: 'Repairing loose joints, sanding, varnishing, and refinishing vintage wooden furniture pieces.' }
    ],
    reviews: [
      { id: 'rev_1', author: 'Vikram Singh', avatar: DEFAULT_BLANK_AVATAR, rating: 5, date: '2 days ago', comment: 'Ananya helped me set up my balcony tomato and curry leaf planters. Incredibly patient and knowledgeable!' },
      { id: 'rev_2', author: 'Priya Nair', avatar: DEFAULT_BLANK_AVATAR, rating: 4.5, date: '1 week ago', comment: 'Great conversational session! We spoke exclusively in Spanish for an hour with helpful gentle corrections.' }
    ]
  },
  {
    id: 'gurnoor_singh',
    name: 'Gurnoor Singh',
    role: 'Senior Software Architect',
    location: 'HSR Layout, Bengaluru, KA',
    distance: '1.8 km away',
    avatar: DEFAULT_BLANK_AVATAR,
    verified: true,
    rating: 5.0,
    swapsCount: 94,
    matchScore: 95,
    matchBreakdown: {
      availability: 'Exact Match (Sat 5-6 PM)',
      proximity: 'Very Close (1.8 km)',
      skillNeed: 'Direct Match (Python Mentorship)'
    },
    bio: 'Software engineer by trade with a love for teaching clean architecture, Python, backend design, algorithms, and automated workflows.',
    skills: [
      { id: 'gn_1', title: 'Python Fundamentals & Automation Scripting', category: 'Development', level: 'Expert', icon: 'terminal', format: 'Online', desc: 'From clean code habits to data automation and web APIs. Practical, project-driven learning.' },
      { id: 'gn_2', title: 'Data Structures & Scalable System Design', category: 'Development', level: 'Advanced', icon: 'data_object', format: 'Online', desc: 'Prepare for technical interviews and architect high-performance distributed applications.' }
    ],
    reviews: [
      { id: 'rev_g1', author: 'Rohan Verma', avatar: DEFAULT_BLANK_AVATAR, rating: 5, date: 'Yesterday', comment: 'Gurnoor explained asynchronous programming and backend scaling in 45 minutes with unmatched clarity. Worth every credit!' }
    ]
  },
  {
    id: 'rohit_verma',
    name: 'Rohit Verma',
    role: 'Classical & Jazz Musician',
    location: 'Bandra West, Mumbai, MH',
    distance: '3.1 km away',
    avatar: DEFAULT_BLANK_AVATAR,
    verified: true,
    rating: 5.0,
    swapsCount: 76,
    matchScore: 88,
    matchBreakdown: {
      availability: 'Evenings & Weekends',
      proximity: 'Nearby (3.1 km)',
      skillNeed: 'Music Category Match'
    },
    bio: '15 years of keyboard and harmonium performance experience. Passionate about teaching chord voicing, ragas, improvisation, and ear training.',
    skills: [
      { id: 'rv_1', title: 'Keyboard & Harmonium Basics', category: 'Music', level: 'Expert', icon: 'piano', format: 'In-Person / Online', desc: 'Understand the circle of fifths, scale structures, chord progressions, and rhythm with practical songs.' },
      { id: 'rv_2', title: 'Ear Training & Melody Deconstruction', category: 'Music', level: 'Advanced', icon: 'hearing', format: 'Online', desc: 'Learn how to listen to songs and practical melodies.' }
    ],
    reviews: [
      { id: 'rev_d1', author: 'Ananya Sharma', avatar: DEFAULT_BLANK_AVATAR, rating: 5, date: '3 days ago', comment: 'Rohit made scales and chord improvisation intuitive and fun. Highly recommend his sessions!' }
    ]
  },
  {
    id: 'priya_nair',
    name: 'Priya Nair',
    role: 'Graphic Designer & Illustrator',
    location: 'Whitefield, Bengaluru, KA',
    distance: '4.2 km away',
    avatar: DEFAULT_BLANK_AVATAR,
    verified: true,
    rating: 4.8,
    swapsCount: 52,
    matchScore: 80,
    matchBreakdown: {
      availability: 'Weekday Evenings',
      proximity: '4.2 km away',
      skillNeed: 'Design & Illustration'
    },
    bio: 'Brand identity designer, vector illustrator, and watercolor enthusiast with 8+ years experience helping small ventures find their visual voice.',
    skills: [
      { id: 'pn_1', title: 'Vector Illustration & Figma Prototyping', category: 'Design', level: 'Expert', icon: 'brush', format: 'Online', desc: 'Master vector geometry, SVG exports, interactive Figma components, and digital styling.' }
    ],
    reviews: [
      { id: 'rev_p1', author: 'Alex Chen', avatar: DEFAULT_BLANK_AVATAR, rating: 5, date: '1 week ago', comment: 'Priya helped me redesign my portfolio icons and explained typography hierarchy brilliantly!' }
    ]
  }
];

const INITIAL_TRANSACTIONS = [
  {
    id: 'tx_01',
    title: 'Balcony Gardening & Composting Mentorship',
    partner: 'Ananya Sharma',
    date: 'Oct 12, 2026',
    hours: 2.0,
    type: 'spent',
    status: 'Completed',
    notes: '2-hour balcony planning session held in Koramangala. 2 Credits transferred.'
  },
  {
    id: 'tx_02',
    title: 'Python Web Scraping & Automation Workshop',
    partner: 'Gurnoor Singh',
    date: 'Oct 8, 2026',
    hours: 3.5,
    type: 'earned',
    status: 'Completed',
    notes: 'Taught async Beautiful Soup and FastAPI basics. 3.5 Credits received.'
  },
  {
    id: 'tx_03',
    title: 'Classical Harmonium & Raga Improvisation',
    partner: 'Rohit Verma',
    date: 'Scheduled: Oct 18, 2026',
    hours: 2.0,
    type: 'escrow',
    status: 'In Escrow',
    notes: 'Upcoming weekend session. Credits held safely in escrow until confirmation.'
  }
];

const INITIAL_LEARNING_TRACKERS = [
  {
    id: 'lrn_1',
    title: 'Urban Balcony Gardening & Soil Health',
    partner: 'Ananya Sharma',
    avatar: DEFAULT_BLANK_AVATAR,
    icon: 'yard',
    bgColor: 'bg-pastel-mint',
    currentSession: 2,
    totalSessions: 4,
    nextSession: 'Saturday, 10:00 AM (In-Person)',
    status: 'Active',
    format: 'In-Person'
  },
  {
    id: 'lrn_2',
    title: 'Keyboard Chords & Music Theory',
    partner: 'Rohit Verma',
    avatar: DEFAULT_BLANK_AVATAR,
    icon: 'piano',
    bgColor: 'bg-pastel-lavender',
    currentSession: 1,
    totalSessions: 3,
    nextSession: 'Sunday, 4:30 PM (Online)',
    status: 'Active',
    format: 'Online'
  }
];

const INITIAL_TEACHING_TRACKERS = [
  {
    id: 'tch_1',
    title: 'Modern UI/UX Design with Figma',
    partner: 'Alex Chen',
    avatar: DEFAULT_BLANK_AVATAR,
    icon: 'design_services',
    bgColor: 'bg-pastel-peach',
    currentSession: 3,
    totalSessions: 3,
    nextSession: 'Completed yesterday',
    status: 'Completed',
    format: 'Online'
  }
];

const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif_1',
    title: 'Escrow Secured for Session',
    desc: '2.0 Time Credits placed into escrow for Classical Harmonium with Rohit Verma.',
    time: '2 hours ago',
    read: false,
    icon: 'lock_clock',
    color: 'text-tertiary'
  },
  {
    id: 'notif_2',
    title: 'Swap Request Accepted',
    desc: 'Ananya Sharma confirmed your session for Saturday at 10:00 AM.',
    time: 'Yesterday',
    read: false,
    icon: 'check_circle',
    color: 'text-primary'
  },
  {
    id: 'notif_3',
    title: '12-Month Inactivity Warning',
    desc: '3.0 Time Credits will decay on Oct 15 if inactive. Share skills or book a swap!',
    time: '3 days ago',
    read: true,
    icon: 'hourglass_bottom',
    color: 'text-error'
  }
];

export function TimeBankProvider({ children }) {
  const { user: authUser, logout: authLogout, refreshUser } = useAuth();

  // Primary state strictly derived and bound to authenticated user
  const [user, setUser] = useState(() => buildUserState(authUser));

  const [members, setMembers] = useState(INITIAL_MEMBERS);

  // Transactions scoped to authenticated user ID
  const [transactions, setTransactions] = useState(() => {
    if (authUser?.user_id) {
      const saved = localStorage.getItem(`timebank_txs_${authUser.user_id}`);
      if (saved) {
        try { return JSON.parse(saved); } catch (_e) {}
      }
    }
    return [];
  });

  // Learning trackers scoped to authenticated user ID
  const [learningTrackers, setLearningTrackers] = useState(() => {
    if (authUser?.user_id) {
      const saved = localStorage.getItem(`timebank_trackers_${authUser.user_id}`);
      if (saved) {
        try { return JSON.parse(saved); } catch (_e) {}
      }
    }
    return [];
  });

  const [teachingTrackers, setTeachingTrackers] = useState(INITIAL_TEACHING_TRACKERS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  // Active view state
  const [currentView, setCurrentView] = useState('landing');
  const [selectedMemberId, setSelectedMemberId] = useState('ananya_sharma');
  const [catalogSkills, setCatalogSkills] = useState([]);

  // Modal states
  const [bookingModalState, setBookingModalState] = useState({
    isOpen: false,
    member: null,
    skill: null
  });
  const [postSkillModalOpen, setPostSkillModalOpen] = useState(false);
  const [notificationsDrawerOpen, setNotificationsDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Sync user state whenever authUser changes
  useEffect(() => {
    setUser(buildUserState(authUser));
    if (authUser?.user_id) {
      const savedTxs = localStorage.getItem(`timebank_txs_${authUser.user_id}`);
      if (savedTxs) {
        try { setTransactions(JSON.parse(savedTxs)); } catch (_e) { setTransactions([]); }
      } else {
        setTransactions([]);
      }

      const savedTrackers = localStorage.getItem(`timebank_trackers_${authUser.user_id}`);
      if (savedTrackers) {
        try { setLearningTrackers(JSON.parse(savedTrackers)); } catch (_e) { setLearningTrackers([]); }
      } else {
        setLearningTrackers([]);
      }
    } else {
      setTransactions([]);
      setLearningTrackers([]);
    }
  }, [authUser]);

  // Save user-scoped data
  useEffect(() => {
    if (authUser?.user_id) {
      localStorage.setItem(`timebank_txs_${authUser.user_id}`, JSON.stringify(transactions));
    }
  }, [transactions, authUser?.user_id]);

  useEffect(() => {
    if (authUser?.user_id) {
      localStorage.setItem(`timebank_trackers_${authUser.user_id}`, JSON.stringify(learningTrackers));
    }
  }, [learningTrackers, authUser?.user_id]);

  // Toast helper
  const showToast = (title, message, type = 'success') => {
    setToastMessage({ title, message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Trigger celebration confetti
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#28695c', '#87A96B', '#98d8c8', '#FFDAB9', '#E6E6FA']
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Open booking modal
  const openBookingModal = (member, skill = null) => {
    const targetSkill = skill || (member.skills && member.skills[0]);
    setBookingModalState({
      isOpen: true,
      member,
      skill: targetSkill
    });
  };

  const closeBookingModal = () => {
    setBookingModalState({
      isOpen: false,
      member: null,
      skill: null
    });
  };

  // Confirm booking action
  const confirmBooking = ({ member, skill, date, time, format, cost = 1.0 }) => {
    if (user.balance < cost) {
      showToast('Insufficient Balance', 'You need at least 1 credit to book a session. Earn credits by offering skills!', 'error');
      return false;
    }

    const newBalance = Number((user.balance - cost).toFixed(1));
    const newEscrow = Number((user.inEscrow + cost).toFixed(1));

    setUser(prev => ({
      ...prev,
      balance: newBalance,
      inEscrow: newEscrow
    }));

    const newTx = {
      id: `tx_${Date.now()}`,
      title: `${skill.title || skill.name}`,
      partner: member.name,
      date: `Scheduled: ${date}`,
      hours: cost,
      type: 'escrow',
      status: 'In Escrow',
      notes: `${format} session at ${time}. Escrow released upon session completion.`
    };

    setTransactions(prev => [newTx, ...prev]);

    const newTracker = {
      id: `lrn_${Date.now()}`,
      title: skill.title || skill.name,
      partner: member.name,
      avatar: member.avatar,
      icon: skill.icon || 'school',
      bgColor: 'bg-pastel-mint',
      currentSession: 1,
      totalSessions: 1,
      nextSession: `${date}, ${time}`,
      status: 'Active',
      format: format
    };

    setLearningTrackers(prev => [newTracker, ...prev]);

    const newNotif = {
      id: `notif_${Date.now()}`,
      title: 'Session Booked & Escrow Secured',
      desc: `Reserved ${cost} credit for "${skill.title || skill.name}" with ${member.name}.`,
      time: 'Just now',
      read: false,
      icon: 'lock_clock',
      color: 'text-primary'
    };
    setNotifications(prev => [newNotif, ...prev]);

    closeBookingModal();
    triggerConfetti();
    showToast('Booking Confirmed!', `${cost} Credit held in Escrow for ${member.name}.`);
    return true;
  };

  // Release escrow
  const releaseEscrowSession = (txId) => {
    const tx = transactions.find(t => t.id === txId);
    if (!tx || tx.type !== 'escrow') return;

    const hours = tx.hours;
    const newEscrow = Math.max(0, Number((user.inEscrow - hours).toFixed(1)));
    const newSpent = Number((user.lifetimeSpent + hours).toFixed(1));

    setUser(prev => ({
      ...prev,
      inEscrow: newEscrow,
      lifetimeSpent: newSpent
    }));

    setTransactions(prev => prev.map(t => {
      if (t.id === txId) {
        return {
          ...t,
          type: 'spent',
          status: 'Completed',
          notes: `Session successfully confirmed. ${hours} credit transferred to ${t.partner}.`
        };
      }
      return t;
    }));

    triggerConfetti();
    showToast('Session Completed!', `${hours} Credit released to ${tx.partner}.`);
  };

  // Post a new skill offering (sync with backend if logged in)
  const postNewSkill = async (skillData) => {
    let backendSkillId = null;

    if (authUser) {
      try {
        let match = catalogSkills.find(s => s.name.toLowerCase() === skillData.title.toLowerCase());
        if (!match) {
          try {
            match = await skillsApi.createSkill({
              name: skillData.title,
              category: skillData.category || 'General'
            });
            setCatalogSkills(prev => [...prev, match]);
          } catch (_e) {
            const cat = await skillsApi.getCatalog();
            match = cat.find(s => s.name.toLowerCase() === skillData.title.toLowerCase());
          }
        }

        if (match) {
          backendSkillId = match.skill_id;
          await userApi.addSkill({
            skill_id: backendSkillId,
            type: 'offering',
            proficiency: skillData.level || 'Intermediate'
          });
          if (refreshUser) refreshUser();
        }
      } catch (err) {
        console.warn('Backend skill sync note:', err.message);
      }
    }

    const newSkill = {
      id: `sk_${Date.now()}`,
      skillId: backendSkillId,
      name: skillData.title,
      title: skillData.title,
      category: skillData.category,
      level: skillData.level || 'Intermediate',
      icon: skillData.icon || 'auto_fix_high',
      format: skillData.format || 'Online / In-Person',
      desc: skillData.description
    };

    setUser(prev => ({
      ...prev,
      skillsOffered: [newSkill, ...prev.skillsOffered]
    }));

    setPostSkillModalOpen(false);
    triggerConfetti();
    showToast('Skill Published!', `"${newSkill.name}" is now visible to the TimeBank community.`);
  };

  // Add custom skill
  const addCustomSkill = async (name, type = 'teach') => {
    if (!name.trim()) return;
    const cleanName = name.trim();

    if (authUser) {
      try {
        let match = catalogSkills.find(s => s.name.toLowerCase() === cleanName.toLowerCase());
        if (!match) {
          try {
            match = await skillsApi.createSkill({ name: cleanName, category: 'General' });
            setCatalogSkills(prev => [...prev, match]);
          } catch (_e) {
            const cat = await skillsApi.getCatalog();
            match = cat.find(s => s.name.toLowerCase() === cleanName.toLowerCase());
          }
        }
        if (match) {
          await userApi.addSkill({
            skill_id: match.skill_id,
            type: type === 'teach' ? 'offering' : 'seeking',
            proficiency: type === 'teach' ? 'Intermediate' : 'Beginner'
          });
          if (refreshUser) refreshUser();
        }
      } catch (err) {
        console.warn('Backend add skill note:', err.message);
      }
    }

    const item = {
      id: `custom_${Date.now()}`,
      name: cleanName,
      category: 'General',
      level: type === 'teach' ? 'Intermediate' : 'Beginner',
      icon: type === 'teach' ? 'volunteer_activism' : 'school'
    };

    if (type === 'teach') {
      setUser(prev => ({ ...prev, skillsOffered: [...prev.skillsOffered, item] }));
    } else {
      setUser(prev => ({ ...prev, skillsWanted: [...prev.skillsWanted, item] }));
    }
    showToast('Skill Added', `"${cleanName}" added to your ${type === 'teach' ? 'offerings' : 'learning goals'}.`);
  };

  // Remove skill
  const removeSkill = async (id, type = 'teach') => {
    const target = (type === 'teach' ? user.skillsOffered : user.skillsWanted).find(s => s.id === id);
    if (authUser && target && target.userSkillId) {
      try {
        await userApi.removeSkill(target.userSkillId);
        if (refreshUser) refreshUser();
      } catch (err) {
        console.warn('Backend remove skill note:', err.message);
      }
    }

    if (type === 'teach') {
      setUser(prev => ({ ...prev, skillsOffered: prev.skillsOffered.filter(s => s.id !== id) }));
    } else {
      setUser(prev => ({ ...prev, skillsWanted: prev.skillsWanted.filter(s => s.id !== id) }));
    }
  };

  // Update user profile details (including avatar & backend sync)
  const updateProfile = async (updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }));

    if (authUser) {
      try {
        const payload = {};
        if (updatedData.fullName !== undefined) payload.name = updatedData.fullName;
        if (updatedData.avatar !== undefined) payload.avatar = updatedData.avatar;
        if (updatedData.location !== undefined) payload.location = updatedData.location;
        if (updatedData.bio !== undefined) payload.bio = updatedData.bio;
        if (updatedData.onboardingCompleted !== undefined) payload.onboarding_completed = updatedData.onboardingCompleted;
        if (updatedData.availability !== undefined) payload.availability = updatedData.availability;

        await userApi.updateProfile(payload);
        if (refreshUser) await refreshUser();
      } catch (err) {
        console.warn('Backend profile update note:', err.message);
      }
    }

    showToast('Profile Updated', 'Your TimeBank profile has been saved.');
  };

  // View specific member profile
  const viewMemberProfile = (memberId) => {
    setSelectedMemberId(memberId);
    setCurrentView('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    await authLogout();
    setUser(buildUserState(null));
    setTransactions([]);
    setLearningTrackers([]);
    setCurrentView('landing');
    showToast('Signed Out', 'You have been logged out of TimeBank.');
  };

  const selectedMember = members.find(m => m.id === selectedMemberId) || members[0];

  return (
    <TimeBankContext.Provider
      value={{
        DEFAULT_BLANK_AVATAR,
        user,
        setUser,
        members,
        setMembers,
        transactions,
        setTransactions,
        learningTrackers,
        teachingTrackers,
        notifications,
        setNotifications,
        currentView,
        setCurrentView,
        selectedMember,
        viewMemberProfile,
        bookingModalState,
        openBookingModal,
        closeBookingModal,
        confirmBooking,
        releaseEscrowSession,
        postSkillModalOpen,
        setPostSkillModalOpen,
        postNewSkill,
        addCustomSkill,
        removeSkill,
        updateProfile,
        notificationsDrawerOpen,
        setNotificationsDrawerOpen,
        toastMessage,
        showToast,
        triggerConfetti,
        handleLogout,
        catalogSkills
      }}
    >
      {children}
    </TimeBankContext.Provider>
  );
}

export function useTimeBank() {
  const context = useContext(TimeBankContext);
  if (!context) {
    throw new Error('useTimeBank must be used within a TimeBankProvider');
  }
  return context;
}
