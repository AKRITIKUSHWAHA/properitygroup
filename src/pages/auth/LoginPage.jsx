import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Loader2, AlertCircle, ArrowRight, ShieldCheck, UserCheck, Briefcase, User } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { AuthLayout } from '../../layouts/AuthLayout';
import { DEMO_USERS, DEFAULT_DEMO_PASSWORD } from '../../mock/users';

const DEMO_ACCOUNTS = [
  {
    email: 'admin@demo.com',
    roleLabel: 'Super Admin',
    desc: 'Full platform access (10 menus)',
    icon: ShieldCheck,
    color: 'hover:border-purple-500 hover:bg-purple-50 text-purple-700 bg-purple-50/50 border-purple-200',
    activeColor: 'border-purple-600 bg-purple-100/70 text-purple-900 ring-2 ring-purple-500/20',
  },
  {
    email: 'staff@demo.com',
    roleLabel: 'Admin / Staff',
    desc: 'Operations & Calendar (8 menus)',
    icon: Briefcase,
    color: 'hover:border-blue-500 hover:bg-blue-50 text-blue-700 bg-blue-50/50 border-blue-200',
    activeColor: 'border-blue-600 bg-blue-100/70 text-blue-900 ring-2 ring-blue-500/20',
  },
  {
    email: 'surveyor@demo.com',
    roleLabel: 'Surveyor',
    desc: 'Site visits & Reports (6 menus)',
    icon: UserCheck,
    color: 'hover:border-emerald-500 hover:bg-emerald-50 text-emerald-700 bg-emerald-50/50 border-emerald-200',
    activeColor: 'border-emerald-600 bg-emerald-100/70 text-emerald-900 ring-2 ring-emerald-500/20',
  },
  {
    email: 'customer@demo.com',
    roleLabel: 'Customer',
    desc: 'Quotes, Bookings & Pay (8 menus)',
    icon: User,
    color: 'hover:border-amber-500 hover:bg-amber-50 text-amber-700 bg-amber-50/50 border-amber-200',
    activeColor: 'border-amber-600 bg-amber-100/70 text-amber-900 ring-2 ring-amber-500/20',
  },
];

export const LoginPage = () => {
  const { login, getRememberedEmail } = useAuth();
  const [email, setEmail] = useState(() => getRememberedEmail() || 'admin@demo.com');
  const [password, setPassword] = useState(DEFAULT_DEMO_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSelectDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword(DEFAULT_DEMO_PASSWORD);
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      await login(email, password, rememberMe);
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Sign in to your account"
      subtitle="Enter your credentials or choose a quick demo account below"
    >
      {/* Quick Demo Account Chips */}
      <div className="mb-6">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Demo Quick Sign-In
        </label>
        <div className="grid grid-cols-2 gap-2">
          {DEMO_ACCOUNTS.map((demo) => {
            const Icon = demo.icon;
            const isSelected = email.toLowerCase() === demo.email.toLowerCase();
            return (
              <button
                key={demo.email}
                type="button"
                onClick={() => handleSelectDemo(demo.email)}
                className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isSelected ? demo.activeColor : `${demo.color} border-slate-200`
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs font-bold flex items-center gap-1.5 truncate">
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    {demo.roleLabel}
                  </span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-current shrink-0" />
                  )}
                </div>
                <span className="text-[10px] text-slate-500 truncate block">
                  {demo.email}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error state alert */}
      {errorMessage && (
        <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="text-xs font-medium leading-relaxed">{errorMessage}</div>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Email address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Mail className="w-4 h-4 text-slate-400" />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              placeholder="e.g. admin@demo.com"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:border-[#2563EB] focus:bg-white transition-all disabled:opacity-50"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Lock className="w-4 h-4 text-slate-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:border-[#2563EB] focus:bg-white transition-all disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Remember me */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isLoading}
              className="w-4 h-4 rounded text-[#2563EB] focus:ring-[#2563EB]/40 border-slate-300"
            />
            <span className="text-xs font-medium text-slate-600">Remember me</span>
          </label>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-2.5 px-4 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white font-semibold text-sm shadow-lg shadow-[#0B1F4D]/25 transition-all flex items-center justify-center gap-2 disabled:opacity-70 group"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <span>Sign In to CRM</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>
      </form>

      {/* Customer Registration Callout */}
      <div className="mt-6 pt-5 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-500">
          Are you a property client looking to book a survey?{' '}
          <Link
            to="/register"
            className="font-bold text-[#2563EB] hover:text-[#1D4ED8] transition-colors ml-1"
          >
            Create Customer Account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};
