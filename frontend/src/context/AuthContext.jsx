import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, userApi } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkAuth = useCallback(async () => {
    try {
      const profile = await userApi.getProfile();
      setUser(profile);
    } catch (_err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    setError(null);
    const res = await authApi.login({ email, password });
    const profile = await userApi.getProfile();
    setUser(profile);
    return res;
  };

  const signup = async (name, email, password) => {
    setError(null);
    const res = await authApi.signup({ name, email, password });
    const profile = await userApi.getProfile();
    setUser(profile);
    return res;
  };

  const googleLogin = async (credential) => {
    setError(null);
    const res = await authApi.googleAuth(credential);
    const profile = await userApi.getProfile();
    setUser(profile);
    return res;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const profile = await userApi.getProfile();
      setUser(profile);
      return profile;
    } catch (err) {
      console.error('Refresh user error:', err);
    }
  };

  const value = {
    user,
    loading,
    error,
    setError,
    login,
    signup,
    googleLogin,
    logout,
    refreshUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
