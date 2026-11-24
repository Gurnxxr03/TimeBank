const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const TOKEN_STORAGE_KEY = 'timebank_access_token';

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

/**
 * Universal fetch wrapper with credentials: 'include' for HttpOnly cookie sessions
 * plus optional Bearer token fallback for cross-origin deployments.
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
    credentials: 'include',
  };

  let response;
  try {
    response = await fetch(url, config);
  } catch (_err) {
    throw new Error('Unable to connect to server. Please check your connection.');
  }

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401) {
      setAuthToken(null);
    }
    let errorMessage = 'An unexpected error occurred';
    if (data && data.detail) {
      if (Array.isArray(data.detail)) {
        errorMessage = data.detail.map((d) => d.msg || d.message).join(', ');
      } else {
        errorMessage = data.detail;
      }
    } else if (data && data.message) {
      errorMessage = data.message;
    }
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const authApi = {
  signup: (payload) => request('/auth/signup', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  googleAuth: (credential) => request('/auth/google', { method: 'POST', body: JSON.stringify({ credential }) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
};

export const userApi = {
  getCommunityMembers: () => request('/users'),
  getMember: (id) => request(`/users/${id}`),
  getProfile: () => request('/users/me'),
  updateProfile: (payload) => request('/users/me', { method: 'PUT', body: JSON.stringify(payload) }),
  addSkill: (payload) => request('/users/me/skills', { method: 'POST', body: JSON.stringify(payload) }),
  removeSkill: (id) => request(`/users/me/skills/${id}`, { method: 'DELETE' }),
};

export const skillsApi = {
  getCatalog: (category) => {
    const q = category ? `?category=${encodeURIComponent(category)}` : '';
    return request(`/skills${q}`);
  },
  createSkill: (payload) => request('/skills', { method: 'POST', body: JSON.stringify(payload) }),
};

export const bookingsApi = {
  getMyBookings: () => request('/bookings/me'),
  createBooking: (payload) => request('/bookings', { method: 'POST', body: JSON.stringify(payload) }),
  completeBooking: (id) => request(`/bookings/${id}/complete`, { method: 'POST' }),
  cancelBooking: (id) => request(`/bookings/${id}/cancel`, { method: 'POST' }),
};

export const adminApi = {
  getStats: () => request('/admin/stats'),
  getUsers: ({ page = 1, pageSize = 25, search = '', status = '', role = '' } = {}) => {
    const params = new URLSearchParams();
    params.set('page', page);
    params.set('page_size', pageSize);
    if (search) params.set('search', search);
    if (status) params.set('status_filter', status);
    if (role) params.set('role_filter', role);
    return request(`/admin/users?${params.toString()}`);
  },
  getUserDetail: (id) => request(`/admin/users/${id}`),
  updateUserStatus: (id, status) => request(`/admin/users/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),
  updateUserRole: (id, role) => request(`/admin/users/${id}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  }),
  adjustUserCredits: (id, time_credits) => request(`/admin/users/${id}/credits`, {
    method: 'PUT',
    body: JSON.stringify({ time_credits }),
  }),
};
