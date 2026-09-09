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
} from 'lucide-react';

export default function AdminPage() {
  const { user: currentAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Users Table State
  const [usersData, setUsersData] = useState({ items: [], total: 0, page: 1, page_size: 10, total_pages: 1 });
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);

  // User Detail Modal
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [userDetail, setUserDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const data = await adminApi.getStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const data = await adminApi.getUsers({
        page,
        pageSize: 10,
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
  }, []);

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
      await adminApi.updateUserStatus(userId, newStatus);
      await fetchUsers();
      await fetchStats();

      if (userDetail && userDetail.user_id === userId) {
        setUserDetail({ ...userDetail, status: newStatus });
      }
    } catch (err) {
      alert(err.message || `Failed to ${actionLabel} user.`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const openUserDetail = async (id) => {
    setSelectedUserId(id);
    try {
      setLoadingDetail(true);
      const detail = await adminApi.getUserDetail(id);
      setUserDetail(detail);
    } catch (err) {
      alert(err.message || 'Failed to fetch user details.');
      setSelectedUserId(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
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
                Monitor system metrics, review community members, and manage access privileges.
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
        {/* Total Users */}
        <div className="glass-panel p-5 rounded-2xl border border-white/60 dark:border-white/10 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Total Users</p>
            <p className="text-2xl font-black text-on-surface">
              {loadingStats ? '...' : stats?.total_users ?? 0}
            </p>
          </div>
        </div>

        {/* Active Members */}
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

        {/* Banned Users */}
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

        {/* Skills in Catalog */}
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
      </div>

      {/* Users Table Section */}
      <div className="glass-panel p-6 rounded-3xl border border-white/60 dark:border-white/10 shadow-lg space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-on-surface">Registered Members</h2>
            <p className="text-xs text-on-surface-variant">View user accounts, verify roles, and toggle access status</p>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search name or email..."
                className="glass-input w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/5"
              />
            </div>

            {/* Status Filter */}
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

            {/* Role Filter */}
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
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Auth Provider</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Skills (Offered / Sought)</th>
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
                    Loading members...
                  </td>
                </tr>
              ) : usersData.items.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-on-surface-variant">
                    No members match the current search filters.
                  </td>
                </tr>
              ) : (
                usersData.items.map((u) => (
                  <tr key={u.user_id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                    {/* Member Name & Email */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-xs">
                          {u.name ? u.name[0].toUpperCase() : 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-on-surface">{u.name}</p>
                          <p className="text-[10px] text-on-surface-variant">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Auth Provider */}
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase bg-black/5 dark:bg-white/10 text-on-surface-variant">
                        {u.auth_provider}
                      </span>
                    </td>

                    {/* Role */}
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          u.role === 'admin'
                            ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300'
                            : 'bg-black/5 dark:bg-white/10 text-on-surface-variant'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          u.status === 'active'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                            : 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>

                    {/* Skills Count */}
                    <td className="py-3 px-4 font-medium">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">{u.offering_count}</span>{' '}
                      offered /{' '}
                      <span className="text-blue-600 dark:text-blue-400 font-bold">{u.seeking_count}</span> sought
                    </td>

                    {/* Rating */}
                    <td className="py-3 px-4">
                      {u.rating ? (
                        <span className="font-bold text-amber-500">★ {u.rating.toFixed(1)}</span>
                      ) : (
                        <span className="text-on-surface-variant/50">N/A</span>
                      )}
                    </td>

                    {/* Joined Date */}
                    <td className="py-3 px-4 text-on-surface-variant">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openUserDetail(u.user_id)}
                          className="p-1.5 rounded-lg text-on-surface-variant hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                          title="View Details"
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
                          {actionLoadingId === u.user_id
                            ? '...'
                            : u.status === 'active'
                            ? 'Ban'
                            : 'Unban'}
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
            <span className="font-bold text-on-surface">{usersData.total_pages}</span> ({usersData.total} members)
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
          <div className="w-full max-w-lg glass-panel-elevated p-6 rounded-3xl bg-white dark:bg-[#181c1a] border border-white/60 dark:border-white/10 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
              <span className="font-bold text-lg text-on-surface">Member Detail</span>
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
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/5 dark:bg-white/5">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                    {userDetail.name ? userDetail.name[0].toUpperCase() : 'U'}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-on-surface">{userDetail.name}</h3>
                    <p className="text-xs text-on-surface-variant">{userDetail.email}</p>
                    <div className="flex items-center gap-2 mt-1">
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
                    </div>
                  </div>
                </div>

                {/* Skills Associated */}
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-on-surface-variant mb-2">
                    Member Skills ({userDetail.skills?.length || 0})
                  </h4>
                  {userDetail.skills?.length === 0 ? (
                    <p className="text-xs text-on-surface-variant italic">No skills listed yet.</p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
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

                {/* Status Toggle Action in Modal */}
                <div className="pt-4 border-t border-black/10 dark:border-white/10 flex items-center justify-between">
                  <span className="text-xs text-on-surface-variant">Account Status Action:</span>
                  <button
                    onClick={() => handleStatusToggle(userDetail.user_id, userDetail.status)}
                    disabled={userDetail.user_id === currentAdmin?.user_id}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
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
