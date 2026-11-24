import React, { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Users,
  UserCheck,
  UserX,
  BookOpen,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  RefreshCw,
  Coins,
  Lock,
  Handshake,
  MapPin,
  Calendar,
} from 'lucide-react';

export default function AdminPage() {
  const { user: currentAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const [usersData, setUsersData] = useState({ items: [], total: 0, page: 1, page_size: 25, total_pages: 1 });
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);

  const [selectedUserId, setSelectedUserId] = useState(null);
  const [userDetail, setUserDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [creditInput, setCreditInput] = useState('');
  const [savingCredits, setSavingCredits] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const data = await adminApi.getStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const data = await adminApi.getUsers({
        page,
        pageSize: 25,
        search,
        status: statusFilter,
        role: roleFilter,
      });
      setUsersData(data);
    } catch (err) {
      console.error('Error fetching admin users:', err);
    } finally {
      setLoadingUsers(false);
    }
  }, [page, search, statusFilter, roleFilter]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleStatusToggle = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'banned' : 'active';
    const actionLabel = newStatus === 'banned' ? 'ban' : 'unban';

    if (userId === currentAdmin?.user_id && newStatus === 'banned') {
      alert('You cannot ban your own administrator account.');
      return;
    }

    if (!window.confirm(`Are you sure you want to ${actionLabel} this user account?`)) {
      return;
    }

    try {
      setActionLoadingId(userId);
      const updated = await adminApi.updateUserStatus(userId, newStatus);
      await Promise.all([fetchUsers(), fetchStats()]);
      if (userDetail && userDetail.user_id === userId) {
        setUserDetail(updated);
      }
    } catch (err) {
      alert(err.message || `Failed to ${actionLabel} user.`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRoleToggle = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (userId === currentAdmin?.user_id && newRole !== 'admin') {
      alert('You cannot remove admin privileges from your own account.');
      return;
    }
    if (!window.confirm(`Change this user's role to "${newRole}"?`)) {
      return;
    }
    try {
      setActionLoadingId(userId);
      const updated = await adminApi.updateUserRole(userId, newRole);
      await Promise.all([fetchUsers(), fetchStats()]);
      if (userDetail && userDetail.user_id === userId) {
        setUserDetail(updated);
      }
    } catch (err) {
      alert(err.message || 'Failed to update user role.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleAdjustCredits = async (e) => {
    e.preventDefault();
    if (!userDetail) return;
    const parsed = parseFloat(creditInput);
    if (Number.isNaN(parsed) || parsed < 0) {
      alert('Please enter a valid non-negative credit amount.');
      return;
    }
    try {
      setSavingCredits(true);
      const updated = await adminApi.adjustUserCredits(userDetail.user_id, parsed);
      setUserDetail(updated);
      setCreditInput(String(updated.time_credits));
      await Promise.all([fetchUsers(), fetchStats()]);
    } catch (err) {
      alert(err.message || 'Failed to update credits.');
    } finally {
      setSavingCredits(false);
    }
  };

  const openUserDetail = async (id) => {
    setSelectedUserId(id);
    try {
      setLoadingDetail(true);
      const detail = await adminApi.getUserDetail(id);
      setUserDetail(detail);
      setCreditInput(String(detail.time_credits ?? 10));
    } catch (err) {
      alert(err.message || 'Failed to fetch user details.');
      setSelectedUserId(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div className="pt-24 lg:pt-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-8">
      {/* Admin Banner */}
      <div className="glass-panel-elevated p-6 sm:p-8 rounded-3xl border border-indigo-500/20 shadow-xl bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">Admin Management Portal</h1>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Monitor system metrics, inspect all registered user profiles & wallets, and manage access privileges.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              fetchStats();
              fetchUsers();
            }}
            className="px-4 py-2 rounded-xl bg-white/60 dark:bg-white/10 hover:bg-white/90 text-xs font-bold text-on-surface flex items-center gap-2 transition-all self-start sm:self-auto border border-black/5 dark:border-white/10"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-white/60 dark:border-white/10 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Total Users</p>
            <p className="text-2xl font-black text-on-surface">{loadingStats ? '...' : stats?.total_users ?? 0}</p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/60 dark:border-white/10 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Active Members</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {loadingStats ? '...' : stats?.active_users ?? 0}
            </p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/60 dark:border-white/10 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center">
            <UserX className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Banned Users</p>
            <p className="text-2xl font-black text-red-600 dark:text-red-400">
              {loadingStats ? '...' : stats?.banned_users ?? 0}
            </p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/60 dark:border-white/10 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Skills Catalog</p>
            <p className="text-2xl font-black text-purple-600 dark:text-purple-400">
              {loadingStats ? '...' : stats?.total_skills_catalog ?? 0}
            </p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/60 dark:border-white/10 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Credits Active</p>
            <p className="text-2xl font-black text-amber-600">
              {loadingStats ? '...' : (stats?.total_credits_in_circulation ?? 0).toFixed(1)}
            </p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/60 dark:border-white/10 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">In Escrow</p>
            <p className="text-2xl font-black text-teal-600">
              {loadingStats ? '...' : (stats?.total_credits_in_escrow ?? 0).toFixed(1)}
            </p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/60 dark:border-white/10 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
            <Handshake className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Swaps Completed</p>
            <p className="text-2xl font-black text-indigo-600">
              {loadingStats ? '...' : `${stats?.completed_bookings ?? 0} / ${stats?.total_bookings ?? 0}`}
            </p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/60 dark:border-white/10 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-slate-500/10 text-slate-600 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Admins</p>
            <p className="text-2xl font-black text-on-surface">
              {loadingStats ? '...' : stats?.admin_users ?? 0}
            </p>
          </div>
        </div>
      </div>

      {/* Users Table Section */}
      <div className="glass-panel p-6 rounded-3xl border border-white/60 dark:border-white/10 shadow-lg space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-on-surface">All Registered Users ({usersData.total})</h2>
            <p className="text-xs text-on-surface-variant">
              Complete directory of registered accounts, balances, skills, onboarding status, and moderation controls
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search name, email, location..."
                className="glass-input w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/5"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="glass-input py-1.5 px-3 text-xs rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#1f2422] text-on-surface"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="banned">Banned</option>
            </select>

            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="glass-input py-1.5 px-3 text-xs rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#1f2422] text-on-surface"
            >
              <option value="">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-black/10 dark:border-white/10">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/5 dark:bg-white/5 border-b border-black/10 dark:border-white/10 font-bold text-on-surface-variant uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Member & Location</th>
                <th className="py-3 px-4">Auth / Onboarding</th>
                <th className="py-3 px-4">Role & Status</th>
                <th className="py-3 px-4">Time Wallet</th>
                <th className="py-3 px-4">Skills & Swaps</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Joined</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {loadingUsers ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-on-surface-variant">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading registered users...
                  </td>
                </tr>
              ) : usersData.items.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-on-surface-variant">
                    No registered users match the current filters.
                  </td>
                </tr>
              ) : (
                usersData.items.map((u) => (
                  <tr key={u.user_id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={u.avatar || '/default-avatar.svg'}
                          alt={u.name}
                          className="w-8 h-8 rounded-xl object-cover border border-black/10 flex-shrink-0"
                        />
                        <div>
                          <p className="font-bold text-on-surface">
                            {u.name} <span className="text-[10px] text-on-surface-variant font-normal">#{u.user_id}</span>
                          </p>
                          <p className="text-[10px] text-on-surface-variant">{u.email}</p>
                          <p className="text-[10px] text-on-surface-variant/80">{u.location || 'Community Member'}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 space-y-1">
                      <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase bg-black/5 dark:bg-white/10 text-on-surface-variant">
                        {u.auth_provider}
                      </span>
                      <div>
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                            u.onboarding_completed
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {u.onboarding_completed ? 'Onboarded' : 'Pending Setup'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 space-y-1">
                      <div>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            u.role === 'admin'
                              ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300'
                              : 'bg-black/5 dark:bg-white/10 text-on-surface-variant'
                          }`}
                        >
                          {u.role}
                        </span>
                      </div>
                      <div>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            u.status === 'active'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                              : 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300'
                          }`}
                        >
                          {u.status}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-bold text-primary">{(u.time_credits ?? 0).toFixed(1)} Cr</p>
                      <p className="text-[10px] text-on-surface-variant">
                        Escrow: {(u.in_escrow ?? 0).toFixed(1)} | +{u.lifetime_earned ?? 0} / -{u.lifetime_spent ?? 0}
                      </p>
                    </td>

                    <td className="py-3 px-4 font-medium">
                      <div>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">{u.offering_count}</span> offered /{' '}
                        <span className="text-blue-600 dark:text-blue-400 font-bold">{u.seeking_count}</span> sought
                      </div>
                      <p className="text-[10px] text-on-surface-variant">{u.bookings_count || 0} swaps</p>
                    </td>

                    <td className="py-3 px-4">
                      {u.rating ? (
                        <span className="font-bold text-amber-500">★ {u.rating.toFixed(1)}</span>
                      ) : (
                        <span className="text-on-surface-variant/50">N/A</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-on-surface-variant">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openUserDetail(u.user_id)}
                          className="p-1.5 rounded-lg text-on-surface-variant hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                          title="View Full Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleStatusToggle(u.user_id, u.status)}
                          disabled={actionLoadingId === u.user_id || u.user_id === currentAdmin?.user_id}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all disabled:opacity-40 ${
                            u.status === 'active'
                              ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 hover:bg-red-100'
                              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
                          }`}
                        >
                          {actionLoadingId === u.user_id ? '...' : u.status === 'active' ? 'Ban' : 'Unban'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-on-surface-variant">
            Showing Page <span className="font-bold text-on-surface">{usersData.page}</span> of{' '}
            <span className="font-bold text-on-surface">{usersData.total_pages}</span> ({usersData.total} registered users)
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loadingUsers}
              className="p-1.5 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(usersData.total_pages, p + 1))}
              disabled={page >= usersData.total_pages || loadingUsers}
              className="p-1.5 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl glass-panel-elevated p-6 rounded-3xl bg-white dark:bg-[#181c1a] border border-white/60 dark:border-white/10 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
              <span className="font-bold text-lg text-on-surface">Full Member Details</span>
              <button
                onClick={() => setSelectedUserId(null)}
                className="p-1 rounded-xl text-on-surface-variant hover:bg-black/5 dark:hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingDetail ? (
              <div className="py-8 text-center text-on-surface-variant">
                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Loading member details...
              </div>
            ) : userDetail ? (
              <div className="space-y-6">
                {/* Profile Snapshot */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl bg-black/5 dark:bg-white/5">
                  <img
                    src={userDetail.avatar || '/default-avatar.svg'}
                    alt={userDetail.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-sm flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-base text-on-surface">{userDetail.name}</h3>
                      <span className="text-xs text-on-surface-variant">ID #{userDetail.user_id}</span>
                    </div>
                    <p className="text-xs text-on-surface-variant">{userDetail.email}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px] text-on-surface-variant">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {userDetail.location || 'Community Member'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Joined {new Date(userDetail.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-black/10 dark:bg-white/10">
                        {userDetail.role}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          userDetail.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                        }`}
                      >
                        {userDetail.status}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-indigo-100 text-indigo-800">
                        Auth: {userDetail.auth_provider}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                        ★ {(userDetail.rating ?? 5.0).toFixed(1)}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-black/5">
                        {userDetail.onboarding_completed ? 'Onboarding Done' : 'Onboarding Pending'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bio & Availability */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-black/[0.03] border border-black/5">
                    <h4 className="font-bold text-[11px] uppercase tracking-wider text-on-surface-variant mb-1">Bio</h4>
                    <p className="text-xs text-on-surface leading-relaxed">
                      {userDetail.bio || <span className="italic text-on-surface-variant">No bio provided yet.</span>}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-black/[0.03] border border-black/5">
                    <h4 className="font-bold text-[11px] uppercase tracking-wider text-on-surface-variant mb-1">
                      Availability
                    </h4>
                    {userDetail.availability?.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {userDetail.availability.map((slot) => (
                          <span key={slot} className="px-2 py-0.5 rounded-md bg-white text-[11px] font-medium border border-black/10">
                            {slot}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs italic text-on-surface-variant">No availability slots set.</p>
                    )}
                  </div>
                </div>

                {/* Wallet Breakdown & Credit Adjustment */}
                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-2.5 rounded-xl bg-white/70">
                      <p className="text-[10px] font-bold uppercase text-on-surface-variant">Balance</p>
                      <p className="text-base font-black text-primary">{(userDetail.time_credits ?? 0).toFixed(1)}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/70">
                      <p className="text-[10px] font-bold uppercase text-on-surface-variant">In Escrow</p>
                      <p className="text-base font-black text-amber-600">{(userDetail.in_escrow ?? 0).toFixed(1)}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/70">
                      <p className="text-[10px] font-bold uppercase text-on-surface-variant">Earned</p>
                      <p className="text-base font-black text-emerald-600">+{(userDetail.lifetime_earned ?? 0).toFixed(1)}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/70">
                      <p className="text-[10px] font-bold uppercase text-on-surface-variant">Spent</p>
                      <p className="text-base font-black text-on-surface">-{(userDetail.lifetime_spent ?? 0).toFixed(1)}</p>
                    </div>
                  </div>

                  <form onSubmit={handleAdjustCredits} className="flex items-center gap-2 pt-1">
                    <label className="text-xs font-semibold text-on-surface-variant whitespace-nowrap">
                      Set Time Credits:
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={creditInput}
                      onChange={(e) => setCreditInput(e.target.value)}
                      className="w-28 px-3 py-1.5 rounded-xl text-xs border border-black/15 bg-white"
                    />
                    <button
                      type="submit"
                      disabled={savingCredits}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold disabled:opacity-50"
                    >
                      {savingCredits ? 'Saving...' : 'Update Credits'}
                    </button>
                  </form>
                </div>

                {/* Skills Associated */}
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-on-surface-variant mb-2">
                    Member Skills ({userDetail.skills?.length || 0})
                  </h4>
                  {userDetail.skills?.length === 0 ? (
                    <p className="text-xs text-on-surface-variant italic">No skills listed yet.</p>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {userDetail.skills.map((s) => (
                        <div
                          key={s.id}
                          className="p-3 rounded-xl bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-on-surface">{s.skill.name}</span>
                            <span className="text-[10px] text-on-surface-variant ml-2">({s.skill.category})</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                s.type === 'offering'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              }`}
                            >
                              {s.type}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] bg-black/5 dark:bg-white/10">
                              {s.proficiency || 'Intermediate'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bookings / Swaps History */}
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-on-surface-variant mb-2">
                    Recent Swaps & Bookings ({userDetail.bookings?.length || 0})
                  </h4>
                  {!userDetail.bookings || userDetail.bookings.length === 0 ? (
                    <p className="text-xs text-on-surface-variant italic">No skill swap bookings yet.</p>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {userDetail.bookings.map((b) => (
                        <div
                          key={b.booking_id}
                          className="p-3 rounded-xl bg-white/50 border border-black/5 flex items-center justify-between text-xs"
                        >
                          <div>
                            <p className="font-bold text-on-surface">{b.skill_title}</p>
                            <p className="text-[10px] text-on-surface-variant">
                              {b.requester?.name || `#${b.requester_id}`} → {b.provider?.name || `#${b.provider_id}`} •{' '}
                              {b.scheduled_date}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-primary block">{b.credits} Cr</span>
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-black/5">
                              {b.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Status & Role Actions in Modal */}
                <div className="pt-4 border-t border-black/10 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() => handleRoleToggle(userDetail.user_id, userDetail.role)}
                    disabled={userDetail.user_id === currentAdmin?.user_id || actionLoadingId === userDetail.user_id}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 disabled:opacity-40 transition-all"
                  >
                    {userDetail.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                  </button>

                  <button
                    onClick={() => handleStatusToggle(userDetail.user_id, userDetail.status)}
                    disabled={userDetail.user_id === currentAdmin?.user_id || actionLoadingId === userDetail.user_id}
                    className={`px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-40 transition-all ${
                      userDetail.status === 'active'
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {userDetail.status === 'active' ? 'Ban User Account' : 'Activate User Account'}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
