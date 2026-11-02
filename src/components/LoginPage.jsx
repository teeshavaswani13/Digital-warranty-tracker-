import React, { useState } from 'react';
import { Shield, Eye, EyeOff, Mail, Lock, User, AlertCircle, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api.js';

export const LoginPage = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('demo@warrantytracker.com');
  const [password, setPassword] = useState('password123');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleToggleMode = (newMode) => {
    setMode(newMode);
    setErrorMessage(null);
    setSuccessMessage(null);
    if (newMode === 'signup') {
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } else {
      setEmail('demo@warrantytracker.com');
      setPassword('password123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (mode === 'signup') {
      // Validate Sign Up
      if (!name.trim()) {
        setErrorMessage('Please enter your full name.');
        return;
      }
      if (!email.trim()) {
        setErrorMessage('Please enter your email address.');
        return;
      }
      if (!password) {
        setErrorMessage('Please enter a password.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please re-enter.');
        return;
      }

      setIsLoading(true);
      try {
        const response = await api.register(name.trim(), email.trim(), password);
        setSuccessMessage('Account created successfully! Redirecting...');
        setTimeout(() => {
          onLoginSuccess(response.user);
        }, 600);
      } catch (err) {
        setErrorMessage(err.message || 'Registration failed. Please try again.');
        setIsLoading(false);
      }
    } else {
      // Validate Sign In
      if (!email.trim() || !password) {
        setErrorMessage('Please enter both your email address and password.');
        return;
      }

      setIsLoading(true);
      try {
        const response = await api.login(email.trim(), password);
        onLoginSuccess(response.user);
      } catch (err) {
        setErrorMessage(err.message || 'Invalid credentials. Please verify and try again.');
        setIsLoading(false);
      }
    }
  };

  const handleUseDemo = () => {
    setMode('login');
    setEmail('demo@warrantytracker.com');
    setPassword('password123');
    setErrorMessage(null);
  };

  return (
    <div className="login-container">
      {/* Decorative backdrop elements */}
      <div className="login-backdrop-decor-1" />
      <div className="login-backdrop-decor-2" />

      <div className="login-card">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="login-brand-icon">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Digital Warranty Tracker
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {mode === 'login'
              ? 'Sign in to monitor upcoming expiry dates and manage warranties'
              : 'Create a free account to track and protect all your product warranties'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-purple-50/80 rounded-xl mb-6 border border-purple-100">
          <button
            type="button"
            onClick={() => handleToggleMode('login')}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => handleToggleMode('signup')}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="login-error-alert" role="alert">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-sm font-medium">{errorMessage}</div>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="p-3 mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} noValidate>
          {mode === 'signup' && (
            <div className="login-input-group">
              <label className="login-label" htmlFor="register-name">
                Full Name
              </label>
              <div className="login-input-wrapper">
                <User className="login-input-icon w-4 h-4" />
                <input
                  id="register-name"
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="login-input"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
          )}

          <div className="login-input-group">
            <label className="login-label" htmlFor="auth-email">
              Email Address
            </label>
            <div className="login-input-wrapper">
              <Mail className="login-input-icon w-4 h-4" />
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login-input"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div className="login-input-group">
            <div className="flex items-center justify-between mb-1.5">
              <label className="login-label mb-0" htmlFor="auth-password">
                Password
              </label>
              {mode === 'signup' && (
                <span className="text-[11px] text-slate-400">Min 6 characters</span>
              )}
            </div>
            <div className="login-input-wrapper">
              <Lock className="login-input-icon w-4 h-4" />
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input pr-11"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="login-toggle-password"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={0}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <div className="login-input-group">
              <label className="login-label" htmlFor="auth-confirm-password">
                Confirm Password
              </label>
              <div className="login-input-wrapper">
                <Lock className="login-input-icon w-4 h-4" />
                <input
                  id="auth-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="login-input pr-11"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="login-toggle-password"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  tabIndex={0}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="login-btn mt-6"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                {mode === 'signup' ? 'Creating account...' : 'Signing in...'}
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <span>{mode === 'signup' ? 'Create Account' : 'Sign In to Dashboard'}</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </form>

        {/* Footer switch prompt */}
        <div className="mt-4 text-center text-xs text-slate-500">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => handleToggleMode('signup')}
                className="font-bold text-purple-600 hover:text-purple-800 underline cursor-pointer"
              >
                Sign up free
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => handleToggleMode('login')}
                className="font-bold text-purple-600 hover:text-purple-800 underline cursor-pointer"
              >
                Sign in
              </button>
            </p>
          )}
        </div>

        {/* Demo Credentials Helper */}
        {mode === 'login' && (
          <div className="login-demo-helper">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pre-seeded Demo Account</span>
            </div>
            <div className="p-2.5 bg-purple-50/60 border border-purple-100 rounded-xl text-left text-xs font-mono space-y-0.5 mb-2">
              <div className="text-slate-600">
                <span className="text-purple-700 font-semibold font-sans">Email:</span> demo@warrantytracker.com
              </div>
              <div className="text-slate-600">
                <span className="text-purple-700 font-semibold font-sans">Password:</span> password123
              </div>
            </div>
            <button
              type="button"
              onClick={handleUseDemo}
              className="text-xs font-semibold text-purple-600 hover:text-purple-800 transition-colors underline cursor-pointer"
            >
              Auto-fill credentials
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
