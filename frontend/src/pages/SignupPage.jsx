import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import GoogleSignInButton from '../components/GoogleSignInButton';
import { User, Mail, Lock, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

export default function SignupPage({ onNavigate }) {
  const { signup, googleLogin } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await signup(name, email, password);
      onNavigate('onboarding');
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credential) => {
    try {
      setLoading(true);
      setError(null);
      await googleLogin(credential);
      onNavigate('onboarding');
    } catch (err) {
      setError(err.message || 'Google signup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        <div className="glass-panel-elevated p-8 rounded-3xl border border-white/60 dark:border-white/10 shadow-2xl bg-white/70 dark:bg-[#141716]/80 backdrop-blur-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-lg shadow-emerald-600/30 mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">Create your Account</h1>
            <p className="text-xs text-on-surface-variant mt-1">
              Join your local time-exchange network and start sharing skills.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-3 text-red-700 dark:text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jordan Smith"
                  required
                  className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-black/10 dark:border-white/10 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white/50 dark:bg-white/5 text-on-surface placeholder:text-on-surface-variant/40 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-black/10 dark:border-white/10 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white/50 dark:bg-white/5 text-on-surface placeholder:text-on-surface-variant/40 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-black/10 dark:border-white/10 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white/50 dark:bg-white/5 text-on-surface placeholder:text-on-surface-variant/40 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="border-t border-black/10 dark:border-white/10 w-full" />
            <span className="bg-white/80 dark:bg-[#141716] px-3 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider absolute">
              or
            </span>
          </div>

          {/* Google Sign In */}
          <GoogleSignInButton onGoogleSuccess={handleGoogleSuccess} onError={setError} />

          {/* Footer link */}
          <p className="text-center text-xs text-on-surface-variant mt-6">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="font-bold text-emerald-600 hover:text-emerald-700 underline underline-offset-2"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
