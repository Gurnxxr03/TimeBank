import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

const TimeBankContext = createContext();

const DEFAULT_BLANK_AVATAR = '/default-avatar.svg';

const INITIAL_USER = {
  id: 'usr_me',
  fullName: 'Aarav Sharma',
  role: 'Local Member',
  location: 'Indiranagar, Bengaluru, KA',
  distance: '2.4 km away',
  avatar: DEFAULT_BLANK_AVATAR,
  bio: 'Passionate about sustainable living, UI design, and community terrace gardening. Love teaching web tech and eager to learn musical instruments and languages!',
  balance: 24.5,
  inEscrow: 4.0,
  lifetimeEarned: 128.5,
  lifetimeSpent: 104.0,
  decayWarning: {
    amount: 3.0,
    expiryDate: 'Oct 15, 2026',
    reason: '12-Month Inactivity Decay Policy. Use them soon to maximize community impact!'
  },
  rating: 4.9,
  reviewsCount: 14,
  skillsOffered: [
    { id: 'sk1', name: 'UI & Web Design', category: 'Design', level: 'Expert', icon: 'design_services' },
    { id: 'sk2', name: 'Photography', category: 'Creative', level: 'Intermediate', icon: 'photo_camera' },
    { id: 'sk3', name: 'Web Dev Mentorship', category: 'Development', level: 'Expert', icon: 'code' },
    { id: 'sk4', name: 'Terrace Gardening', category: 'Lifestyle', level: 'Intermediate', icon: 'yard' },
  ],
  skillsWanted: [
    { id: 'skw1', name: 'Hindi & Spanish Tutoring', category: 'Languages', icon: 'language' },
    { id: 'skw2', name: 'Cooking Lessons', category: 'Culinary', icon: 'restaurant_menu' },
    { id: 'skw3', name: 'Harmonium & Keyboard', category: 'Music', icon: 'piano' },
    { id: 'skw4', name: 'Basic Woodworking', category: 'Crafts', icon: 'carpenter' }
  ],
  availability: ['Saturdays', 'Weekday Evenings']
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
      { id: 'rv_2', title: 'Ear Training & Melody Deconstruction', category: 'Music', level: 'Advanced', icon: 'hearing', format: 'Online', desc: 'Learn how to listen to songs and immediately identify pitch, key, chord changes, and melodies.' }
    ],
    reviews: [
      { id: 'rev_d1', author: 'Ananya Sharma', avatar: DEFAULT_BLANK_AVATAR, rating: 5, date: '3 days ago', comment: 'Rohit made scales and chord improvisation intuitive and fun. Highly recommend his sessions!' }
    ]
  },
  {
    id: 'priya_nair',
    name: 'Priya Nair',
    role: 'Brand Designer & Visual Artist',
    location: 'Hauz Khas, New Delhi, DL',
    distance: '1.2 km away',
    avatar: DEFAULT_BLANK_AVATAR,
    verified: true,
    rating: 4.9,
    swapsCount: 112,
    matchScore: 92,
    matchBreakdown: {
      availability: 'Weekday Mornings & Saturdays',
      proximity: 'Within 1.2 km',
      skillNeed: 'Design & Visual Arts'
    },
    bio: 'Visual artist and branding consultant. I exchange portrait photography, brand design reviews, and natural light editing techniques.',
    skills: [
      { id: 'pn_1', title: 'Graphic Design & Brand Identity Critiques', category: 'Design', level: 'Expert', icon: 'palette', format: 'Online', desc: 'Actionable feedback on brand marks, typography hierarchies, and portfolio presentation.' },
      { id: 'pn_2', title: 'Natural Light Portrait Photography', category: 'Photography', level: 'Expert', icon: 'camera_alt', format: 'In-Person', desc: 'Hands-on street and natural light portraiture sessions in scenic urban spots.' }
    ],
    reviews: [
      { id: 'rev_s1', author: 'Aarav Sharma', avatar: DEFAULT_BLANK_AVATAR, rating: 5, date: 'Oct 12', comment: 'Priya transformed my brand concept into a polished identity in just 1 hour!' }
    ]
  },
  {
    id: 'meera_iyer',
    name: 'Meera Iyer',
    role: 'Language Specialist & French Tutor',
    location: 'Mylapore, Chennai, TN',
    distance: '4.0 km away',
    avatar: DEFAULT_BLANK_AVATAR,
    verified: true,
    rating: 4.8,
    swapsCount: 65,
    matchScore: 82,
    matchBreakdown: {
      availability: 'Mon / Wed / Sat mornings',
      proximity: 'Online preferred',
      skillNeed: 'Conversational French'
    },
    bio: 'Certified language tutor focusing on conversational French, pronunciation, and everyday spoken fluency with cultural context.',
    skills: [
      { id: 'mi_1', title: 'Conversational French Mastery', category: 'Languages', level: 'Native', icon: 'language', format: 'Online', desc: 'Speak confidently without fear of grammar mistakes. Real-life dialogues & culture.' }
    ],
    reviews: [
      { id: 'rev_m1', author: 'Aarav Sharma', avatar: DEFAULT_BLANK_AVATAR, rating: 5, date: 'Oct 8', comment: 'Meera is energetic, patient, and makes pronunciation feel natural and intuitive.' }
    ]
  },
  {
    id: 'rajesh_kumar',
    name: 'Rajesh Kumar',
    role: 'Home Automation & Electrical Specialist',
    location: 'Whitefield, Bengaluru, KA',
    distance: '3.5 km away',
    avatar: DEFAULT_BLANK_AVATAR,
    verified: true,
    rating: 4.9,
    swapsCount: 88,
    matchScore: 78,
    matchBreakdown: {
      availability: 'Tuesdays & Thursdays',
      proximity: 'In-Person Metro Area',
      skillNeed: 'DIY & Maintenance'
    },
    bio: 'Over 20 years in residential electrical setups and smart home systems. Happy to teach DIY diagnostic skills and home maintenance.',
    skills: [
      { id: 'rk_1', title: 'Home Electrical Diagnostics & Safe DIY', category: 'DIY & Home', level: 'Master', icon: 'electrical_services', format: 'In-Person', desc: 'Learn how to troubleshoot inverter connections, switchboards, and install smart home sensors.' }
    ],
    reviews: [
      { id: 'rev_md1', author: 'Priya Nair', avatar: DEFAULT_BLANK_AVATAR, rating: 5, date: 'Oct 10', comment: 'Rajesh helped me diagnose a wiring fault in 30 minutes and taught me basic safety checks.' }
    ]
  }
];

const INITIAL_TRANSACTIONS = [
  {
    id: 'tx_1',
    title: 'Taught Intro to Guitar',
    partner: 'Priya Nair',
    date: 'Oct 12, 2026',
    hours: 1.5,
    type: 'earned',
    status: 'Completed',
    notes: 'Covered open chords, fingerpicking, and strumming patterns.'
  },
  {
    id: 'tx_2',
    title: 'Electrical & Inverter Diagnostics',
    partner: 'Rajesh Kumar',
    date: 'Oct 10, 2026',
    hours: 2.0,
    type: 'spent',
    status: 'Completed',
    notes: 'Switchboard wiring check and power backup testing.'
  },
  {
    id: 'tx_3',
    title: 'Website Brand Design Review',
    partner: 'Priya Nair',
    date: 'Scheduled: Oct 18, 2026',
    hours: 4.0,
    type: 'escrow',
    status: 'In Escrow',
    notes: 'Design system tokens and responsive landing page audit.'
  },
  {
    id: 'tx_4',
    title: 'Python Scripting Tutoring',
    partner: 'Gurnoor Singh',
    date: 'Today, 2:30 PM',
    hours: 1.0,
    type: 'earned',
    status: 'Completed',
    notes: 'Automating CSV reports with pandas and requests.'
  },
  {
    id: 'tx_5',
    title: 'Conversational French Session 4',
    partner: 'Meera Iyer',
    date: 'Oct 5, 2026',
    hours: 1.0,
    type: 'spent',
    status: 'Completed',
    notes: 'Travel vocabulary and past tense verbs practice.'
  },
  {
    id: 'tx_6',
    title: 'Terrace Gardening & Planters Setup',
    partner: 'Ananya Sharma',
    date: 'Sep 28, 2026',
    hours: 2.0,
    type: 'spent',
    status: 'Completed',
    notes: 'Soil mix prep, cocopeat ratio, and microgreens potting setup.'
  }
];

const INITIAL_LEARNING_TRACKERS = [
  {
    id: 'lrn_1',
    title: 'Conversational French',
    partner: 'Meera Iyer',
    avatar: DEFAULT_BLANK_AVATAR,
    icon: 'language',
    bgColor: 'bg-pastel-lavender',
    currentSession: 4,
    totalSessions: 10,
    nextSession: 'Oct 12, 10:00 AM',
    status: 'Active',
    format: 'Online'
  },
  {
    id: 'lrn_2',
    title: 'Python Fundamentals',
    partner: 'Gurnoor Singh',
    avatar: DEFAULT_BLANK_AVATAR,
    icon: 'terminal',
    bgColor: 'bg-pastel-mint',
    currentSession: 1,
    totalSessions: 4,
    nextSession: 'Saturday, 5:00 PM',
    status: 'Active',
    format: 'Online'
  }
];

const INITIAL_TEACHING_TRACKERS = [
  {
    id: 'tch_1',
    title: 'Intro to React & Tailwind',
    partner: 'Vikram Singh',
    avatar: DEFAULT_BLANK_AVATAR,
    icon: 'code',
    bgColor: 'bg-pastel-mint',
    currentSession: 1,
    totalSessions: 5,
    nextSession: 'Oct 14, 2:00 PM',
    status: 'Active',
    format: 'Online'
  },
  {
    id: 'tch_2',
    title: 'Street Photography Basics',
    partner: 'Rohit Verma',
    avatar: DEFAULT_BLANK_AVATAR,
    icon: 'photo_camera',
    bgColor: 'bg-pastel-peach/40',
    currentSession: 2,
    totalSessions: 3,
    nextSession: 'Sunday, 11:00 AM',
    status: 'Active',
    format: 'In-Person'
  }
];

const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif_1',
    title: 'Swap Completed!',
    desc: 'You earned 1.0 Time Credit for Python tutoring with Gurnoor Singh.',
    time: '2 hours ago',
    read: false,
    icon: 'verified',
    color: 'text-logo-sage'
  },
  {
    id: 'notif_2',
    title: 'Upcoming Session Reminder',
    desc: 'French Conversation with Meera Iyer is tomorrow at 10:00 AM.',
    time: '5 hours ago',
    read: false,
    icon: 'schedule',
    color: 'text-primary'
  },
  {
    id: 'notif_3',
    title: '12-Month Decay Warning',
    desc: '3.0 Time Credits will expire on Oct 15. Book a swap to use them!',
    time: '1 day ago',
    read: false,
    icon: 'warning',
    color: 'text-error'
  }
];

export function TimeBankProvider({ children }) {
  // Use localStorage with fresh key or fallback to updated mock
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('timebank_user_v2');
      return saved ? JSON.parse(saved) : INITIAL_USER;
    } catch {
      return INITIAL_USER;
    }
  });

  const [members, setMembers] = useState(() => {
    try {
      const saved = localStorage.getItem('timebank_members_v2');
      return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
    } catch {
      return INITIAL_MEMBERS;
    }
  });

  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem('timebank_txs_v2');
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [learningTrackers, setLearningTrackers] = useState(INITIAL_LEARNING_TRACKERS);
  const [teachingTrackers, setTeachingTrackers] = useState(INITIAL_TEACHING_TRACKERS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  // Active view state
  const [currentView, setCurrentView] = useState('landing');
  const [selectedMemberId, setSelectedMemberId] = useState('ananya_sharma');
  
  // Modal states
  const [bookingModalState, setBookingModalState] = useState({
    isOpen: false,
    member: null,
    skill: null
  });
  const [postSkillModalOpen, setPostSkillModalOpen] = useState(false);
  const [notificationsDrawerOpen, setNotificationsDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('timebank_user_v2', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('timebank_members_v2', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('timebank_txs_v2', JSON.stringify(transactions));
  }, [transactions]);

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

  // Post a new skill offering
  const postNewSkill = (skillData) => {
    const newSkill = {
      id: `sk_${Date.now()}`,
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
  const addCustomSkill = (name, type = 'teach') => {
    if (!name.trim()) return;
    const item = {
      id: `custom_${Date.now()}`,
      name: name.trim(),
      category: 'General',
      level: 'Enthusiast',
      icon: type === 'teach' ? 'volunteer_activism' : 'school'
    };

    if (type === 'teach') {
      setUser(prev => ({ ...prev, skillsOffered: [...prev.skillsOffered, item] }));
    } else {
      setUser(prev => ({ ...prev, skillsWanted: [...prev.skillsWanted, item] }));
    }
    showToast('Skill Added', `"${name}" added to your ${type === 'teach' ? 'offerings' : 'learning goals'}.`);
  };

  // Remove skill
  const removeSkill = (id, type = 'teach') => {
    if (type === 'teach') {
      setUser(prev => ({ ...prev, skillsOffered: prev.skillsOffered.filter(s => s.id !== id) }));
    } else {
      setUser(prev => ({ ...prev, skillsWanted: prev.skillsWanted.filter(s => s.id !== id) }));
    }
  };

  // Update user profile details (including avatar)
  const updateProfile = (updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }));
    showToast('Profile Updated', 'Your TimeBank profile has been saved.');
  };

  // View specific member profile
  const viewMemberProfile = (memberId) => {
    setSelectedMemberId(memberId);
    setCurrentView('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        triggerConfetti
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
