import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from './AuthContext';
import { userApi, skillsApi, bookingsApi } from '../api/client';

const TimeBankContext = createContext();

export const DEFAULT_BLANK_AVATAR = '/default-avatar.svg';

const CATEGORY_ICON_MAP = {
  'Technology & Coding': 'terminal',
  Development: 'terminal',
  'Academics & Tutoring': 'school',
  Languages: 'translate',
  'Creative & Media': 'palette',
  Design: 'brush',
  'Practical & Career': 'work',
  Music: 'piano',
  Gardening: 'yard',
  Culinary: 'restaurant',
  'DIY & Home': 'handyman',
  Wellness: 'self_improvement',
};

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
      availability: ['Saturdays', 'Weekday Evenings'],
    };
  }

  const offered = Array.isArray(authUser.skills)
    ? authUser.skills
        .filter((s) => s.type === 'offering')
        .map((s) => ({
          id: s.id,
          userSkillId: s.id,
          skillId: s.skill_id,
          name: s.skill?.name || 'Skill',
          category: s.skill?.category || 'General',
          level: s.proficiency || 'Intermediate',
          icon: CATEGORY_ICON_MAP[s.skill?.category] || 'school',
        }))
    : [];

  const wanted = Array.isArray(authUser.skills)
    ? authUser.skills
        .filter((s) => s.type === 'seeking')
        .map((s) => ({
          id: s.id,
          userSkillId: s.id,
          skillId: s.skill_id,
          name: s.skill?.name || 'Skill',
          category: s.skill?.category || 'General',
          level: s.proficiency || 'Beginner',
          icon: 'search',
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
    distance: authUser.location || 'Community Member',
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
    availability,
  };
};

function mapBackendMember(u, currentUser) {
  const offeringSkills = (u.skills || [])
    .filter((s) => s.type === 'offering')
    .map((s) => {
      const cat = s.skill?.category || 'General';
      return {
        id: s.id,
        skillId: s.skill_id,
        title: s.skill?.name || 'Skill',
        name: s.skill?.name || 'Skill',
        category: cat,
        level: s.proficiency || 'Intermediate',
        icon: CATEGORY_ICON_MAP[cat] || 'school',
        format: 'Online & In-Person',
        desc: `1-to-1 ${s.skill?.name || 'skill'} session (${s.proficiency || 'Intermediate'} level).`,
      };
    });

  const seekingSkills = (u.skills || [])
    .filter((s) => s.type === 'seeking')
    .map((s) => ({
      id: s.id,
      skillId: s.skill_id,
      title: s.skill?.name || 'Skill',
      name: s.skill?.name || 'Skill',
      category: s.skill?.category || 'General',
      level: s.proficiency || 'Beginner',
    }));

  const wantedNames = new Set((currentUser?.skillsWanted || []).map((w) => w.name.toLowerCase()));
  const hasDirectMatch = offeringSkills.some((s) => wantedNames.has(s.name.toLowerCase()));
  const sharedAvailability = (u.availability || []).filter((a) =>
    (currentUser?.availability || []).includes(a)
  );
  const matchScore = Math.min(
    99,
    72 + (hasDirectMatch ? 18 : 0) + Math.min(9, sharedAvailability.length * 4)
  );

  return {
    id: u.user_id,
    user_id: u.user_id,
    name: u.name,
    role: u.role === 'admin' ? 'Platform Admin' : 'Community Member',
    location: u.location || 'Community Member',
    distance: u.location || 'Community Member',
    avatar: u.avatar || DEFAULT_BLANK_AVATAR,
    verified: true,
    rating: typeof u.rating === 'number' ? u.rating : 5.0,
    swapsCount: u.swaps_count || 0,
    availability: Array.isArray(u.availability) ? u.availability : [],
    matchScore,
    matchBreakdown: {
      availability:
        sharedAvailability.length > 0
          ? `Shared (${sharedAvailability[0]})`
          : (u.availability && u.availability[0]) || 'Flexible',
      proximity: u.location || 'Community Member',
      skillNeed: hasDirectMatch
        ? 'Direct Skill Match'
        : offeringSkills.length > 0
        ? `${offeringSkills.length} Skill${offeringSkills.length > 1 ? 's' : ''} Offered`
        : 'New Member',
    },
    bio: u.bio || 'Registered TimeBank community member ready to exchange skills.',
    skills: offeringSkills,
    skillsSeeking: seekingSkills,
    reviews: [],
  };
}

export function TimeBankProvider({ children }) {
  const { user: authUser, logout: authLogout, refreshUser } = useAuth();

  const user = useMemo(() => buildUserState(authUser), [authUser]);

  const [rawMembers, setRawMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [readNotificationIds, setReadNotificationIds] = useState([]);
  const [catalogSkills, setCatalogSkills] = useState([]);

  const [currentView, setCurrentView] = useState('landing');
  const [selectedMemberId, setSelectedMemberId] = useState(null);

  const [bookingModalState, setBookingModalState] = useState({
    isOpen: false,
    member: null,
    skill: null,
  });
  const [postSkillModalOpen, setPostSkillModalOpen] = useState(false);
  const [notificationsDrawerOpen, setNotificationsDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const refreshMembers = useCallback(async () => {
    try {
      setMembersLoading(true);
      const data = await userApi.getCommunityMembers();
      setRawMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading registered members:', err);
      setRawMembers([]);
    } finally {
      setMembersLoading(false);
    }
  }, []);

  const refreshBookings = useCallback(async () => {
    if (!authUser?.user_id) {
      setBookings([]);
      return;
    }
    try {
      const data = await bookingsApi.getMyBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading bookings:', err);
      setBookings([]);
    }
  }, [authUser?.user_id]);

  const refreshCatalog = useCallback(async () => {
    try {
      const data = await skillsApi.getCatalog();
      setCatalogSkills(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading skills catalog:', err);
    }
  }, []);

  useEffect(() => {
    refreshMembers();
    refreshCatalog();
  }, [refreshMembers, refreshCatalog]);

  useEffect(() => {
    refreshBookings();
  }, [refreshBookings]);

  const members = useMemo(
    () => rawMembers.map((m) => mapBackendMember(m, user)),
    [rawMembers, user]
  );

  // Derive transactions, learningTrackers, teachingTrackers, and notifications from real bookings
  const transactions = useMemo(() => {
    if (!authUser?.user_id) return [];
    return bookings.map((b) => {
      const isRequester = b.requester_id === authUser.user_id;
      const partnerName = isRequester
        ? b.provider?.name || 'Member'
        : b.requester?.name || 'Member';
      let type = 'escrow';
      let statusLabel = 'In Escrow';
      if (b.status === 'completed') {
        type = isRequester ? 'spent' : 'earned';
        statusLabel = 'Completed';
      } else if (b.status === 'cancelled') {
        type = 'cancelled';
        statusLabel = 'Cancelled';
      } else if (!isRequester) {
        statusLabel = 'Pending Escrow';
      }
      return {
        id: b.booking_id,
        bookingId: b.booking_id,
        title: b.skill_title,
        partner: partnerName,
        date: `${b.scheduled_date} • ${b.scheduled_time}`,
        hours: b.credits,
        type,
        status: statusLabel,
        isRequester,
        notes: b.notes || `${b.format} session`,
        createdAt: b.created_at,
      };
    });
  }, [bookings, authUser?.user_id]);

  const learningTrackers = useMemo(() => {
    if (!authUser?.user_id) return [];
    return bookings
      .filter((b) => b.requester_id === authUser.user_id && b.status !== 'cancelled')
      .map((b) => ({
        id: b.booking_id,
        title: b.skill_title,
        partner: b.provider?.name || 'Member',
        avatar: b.provider?.avatar || DEFAULT_BLANK_AVATAR,
        icon: 'school',
        bgColor: 'bg-pastel-mint',
        currentSession: b.status === 'completed' ? 1 : 0,
        totalSessions: 1,
        nextSession: `${b.scheduled_date}, ${b.scheduled_time}`,
        status: b.status === 'completed' ? 'Completed' : 'In Escrow',
        format: b.format,
      }));
  }, [bookings, authUser?.user_id]);

  const teachingTrackers = useMemo(() => {
    if (!authUser?.user_id) return [];
    return bookings
      .filter((b) => b.provider_id === authUser.user_id && b.status !== 'cancelled')
      .map((b) => ({
        id: b.booking_id,
        title: b.skill_title,
        partner: b.requester?.name || 'Member',
        avatar: b.requester?.avatar || DEFAULT_BLANK_AVATAR,
        icon: 'design_services',
        bgColor: 'bg-pastel-peach',
        currentSession: b.status === 'completed' ? 1 : 0,
        totalSessions: 1,
        nextSession: `${b.scheduled_date}, ${b.scheduled_time}`,
        status: b.status === 'completed' ? 'Completed' : 'In Escrow',
        format: b.format,
      }));
  }, [bookings, authUser?.user_id]);

  const notifications = useMemo(() => {
    if (!authUser?.user_id) return [];
    const list = [];
    if (!user.onboardingCompleted) {
      list.push({
        id: 'notif_onboarding',
        title: 'Complete Your Profile',
        desc: 'Add your bio, location, and skills so neighbors can discover and book swaps with you.',
        time: 'Action needed',
        read: readNotificationIds.includes('notif_onboarding'),
        icon: 'manage_accounts',
        color: 'text-primary',
      });
    }
    bookings.forEach((b) => {
      const isRequester = b.requester_id === authUser.user_id;
      const partner = isRequester ? b.provider?.name : b.requester?.name;
      const notifId = `notif_booking_${b.booking_id}_${b.status}`;
      if (b.status === 'in_escrow') {
        list.push({
          id: notifId,
          title: isRequester ? 'Escrow Secured for Session' : 'New Skill Swap Request',
          desc: isRequester
            ? `${b.credits} Time Credit held in escrow for "${b.skill_title}" with ${partner}.`
            : `${partner} booked "${b.skill_title}" (${b.credits} Credit in escrow).`,
          time: b.scheduled_date,
          read: readNotificationIds.includes(notifId),
          icon: 'lock_clock',
          color: 'text-tertiary',
        });
      } else if (b.status === 'completed') {
        list.push({
          id: notifId,
          title: isRequester ? 'Session Completed' : 'Time Credits Earned!',
          desc: isRequester
            ? `Released ${b.credits} Time Credit to ${partner} for "${b.skill_title}".`
            : `Received +${b.credits} Time Credit from ${partner} for "${b.skill_title}".`,
          time: b.scheduled_date,
          read: readNotificationIds.includes(notifId),
          icon: 'check_circle',
          color: 'text-primary',
        });
      }
    });
    return list;
  }, [authUser?.user_id, user.onboardingCompleted, bookings, readNotificationIds]);

  const markAllNotificationsRead = () => {
    setReadNotificationIds(notifications.map((n) => n.id));
  };

  const showToast = (title, message, type = 'success') => {
    setToastMessage({ title, message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#28695c', '#87A96B', '#98d8c8', '#FFDAB9', '#E6E6FA'],
      });
    } catch (e) {
      console.error(e);
    }
  };

  const openBookingModal = (member, skill = null) => {
    if (!authUser) {
      showToast('Sign In Required', 'Please sign in to book a skill swap session.', 'info');
      setCurrentView('login');
      return;
    }
    if (member.user_id === authUser.user_id) {
      showToast('Own Profile', 'You cannot book a session with yourself.', 'info');
      return;
    }
    const targetSkill = skill || (member.skills && member.skills[0]);
    setBookingModalState({
      isOpen: true,
      member,
      skill: targetSkill,
    });
  };

  const closeBookingModal = () => {
    setBookingModalState({
      isOpen: false,
      member: null,
      skill: null,
    });
  };

  const confirmBooking = async ({ member, skill, date, time, format, cost = 1.0 }) => {
    if (!authUser) {
      setCurrentView('login');
      return false;
    }
    if (user.balance < cost) {
      showToast(
        'Insufficient Balance',
        'You need at least 1 credit to book a session. Earn credits by offering skills!',
        'error'
      );
      return false;
    }

    try {
      await bookingsApi.createBooking({
        provider_id: member.user_id || member.id,
        skill_id: skill?.skillId || null,
        skill_title: skill?.title || skill?.name || 'Skill Exchange Session',
        scheduled_date: date,
        scheduled_time: time,
        format,
        credits: cost,
      });
      await Promise.all([refreshUser(), refreshBookings()]);
      closeBookingModal();
      triggerConfetti();
      showToast('Booking Confirmed!', `${cost} Credit held in Escrow for ${member.name}.`);
      return true;
    } catch (err) {
      showToast('Booking Failed', err.message || 'Could not create booking.', 'error');
      return false;
    }
  };

  const releaseEscrowSession = async (bookingId) => {
    try {
      const updated = await bookingsApi.completeBooking(bookingId);
      await Promise.all([refreshUser(), refreshBookings(), refreshMembers()]);
      triggerConfetti();
      showToast(
        'Session Completed!',
        `${updated.credits} Credit released to ${updated.provider?.name || 'provider'}.`
      );
    } catch (err) {
      showToast('Error', err.message || 'Could not release escrow.', 'error');
    }
  };

  const cancelBookingSession = async (bookingId) => {
    try {
      const updated = await bookingsApi.cancelBooking(bookingId);
      await Promise.all([refreshUser(), refreshBookings()]);
      showToast('Booking Cancelled', `${updated.credits} Credit refunded to your balance.`);
    } catch (err) {
      showToast('Error', err.message || 'Could not cancel booking.', 'error');
    }
  };

  const postNewSkill = async (skillData) => {
    if (!authUser) {
      setCurrentView('login');
      return;
    }
    try {
      let match = catalogSkills.find(
        (s) => s.name.toLowerCase() === skillData.title.trim().toLowerCase()
      );
      if (!match) {
        try {
          match = await skillsApi.createSkill({
            name: skillData.title.trim(),
            category: skillData.category || 'General',
          });
          setCatalogSkills((prev) => [...prev, match]);
        } catch (_e) {
          const cat = await skillsApi.getCatalog();
          setCatalogSkills(cat);
          match = cat.find(
            (s) => s.name.toLowerCase() === skillData.title.trim().toLowerCase()
          );
        }
      }

      if (match) {
        await userApi.addSkill({
          skill_id: match.skill_id,
          type: 'offering',
          proficiency: skillData.level || 'Intermediate',
        });
        await Promise.all([refreshUser(), refreshMembers()]);
        setPostSkillModalOpen(false);
        triggerConfetti();
        showToast('Skill Published!', `"${match.name}" is now visible to the TimeBank community.`);
      }
    } catch (err) {
      showToast('Could Not Publish Skill', err.message || 'Please try again.', 'error');
    }
  };

  const addCustomSkill = async (name, type = 'teach') => {
    if (!name.trim() || !authUser) return;
    const cleanName = name.trim();

    try {
      let match = catalogSkills.find((s) => s.name.toLowerCase() === cleanName.toLowerCase());
      if (!match) {
        try {
          match = await skillsApi.createSkill({ name: cleanName, category: 'General' });
          setCatalogSkills((prev) => [...prev, match]);
        } catch (_e) {
          const cat = await skillsApi.getCatalog();
          setCatalogSkills(cat);
          match = cat.find((s) => s.name.toLowerCase() === cleanName.toLowerCase());
        }
      }
      if (match) {
        await userApi.addSkill({
          skill_id: match.skill_id,
          type: type === 'teach' ? 'offering' : 'seeking',
          proficiency: type === 'teach' ? 'Intermediate' : 'Beginner',
        });
        await Promise.all([refreshUser(), refreshMembers()]);
        showToast(
          'Skill Added',
          `"${cleanName}" added to your ${type === 'teach' ? 'offerings' : 'learning goals'}.`
        );
      }
    } catch (err) {
      showToast('Skill Error', err.message || 'Could not add skill.', 'error');
    }
  };

  const removeSkill = async (id) => {
    if (!authUser) return;
    try {
      await userApi.removeSkill(id);
      await Promise.all([refreshUser(), refreshMembers()]);
      showToast('Skill Removed', 'Updated your skills profile.');
    } catch (err) {
      showToast('Error', err.message || 'Could not remove skill.', 'error');
    }
  };

  const updateProfile = async (updatedData) => {
    if (!authUser) return;
    try {
      const payload = {};
      if (updatedData.fullName !== undefined) payload.name = updatedData.fullName;
      if (updatedData.avatar !== undefined) payload.avatar = updatedData.avatar;
      if (updatedData.location !== undefined) payload.location = updatedData.location;
      if (updatedData.bio !== undefined) payload.bio = updatedData.bio;
      if (updatedData.onboardingCompleted !== undefined) {
        payload.onboarding_completed = updatedData.onboardingCompleted;
      }
      if (updatedData.availability !== undefined) payload.availability = updatedData.availability;

      await userApi.updateProfile(payload);
      await Promise.all([refreshUser(), refreshMembers()]);
      showToast('Profile Updated', 'Your TimeBank profile has been saved.');
    } catch (err) {
      showToast('Update Failed', err.message || 'Could not save profile.', 'error');
    }
  };

  const viewMemberProfile = (memberId) => {
    setSelectedMemberId(memberId);
    setCurrentView('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    await authLogout();
    setBookings([]);
    setCurrentView('landing');
    showToast('Signed Out', 'You have been logged out of TimeBank.');
  };

  const selectedMember =
    members.find((m) => m.id === selectedMemberId) ||
    members.find((m) => m.id !== user.id) ||
    members[0] ||
    null;

  return (
    <TimeBankContext.Provider
      value={{
        DEFAULT_BLANK_AVATAR,
        user,
        members,
        membersLoading,
        refreshMembers,
        transactions,
        learningTrackers,
        teachingTrackers,
        notifications,
        markAllNotificationsRead,
        currentView,
        setCurrentView,
        selectedMember,
        viewMemberProfile,
        bookingModalState,
        openBookingModal,
        closeBookingModal,
        confirmBooking,
        releaseEscrowSession,
        cancelBookingSession,
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
        catalogSkills,
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
