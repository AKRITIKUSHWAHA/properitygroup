import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Building2,
  ShieldCheck,
  UserCheck,
  User,
  Loader2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Check,
  Lock,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { DEFAULT_DEMO_PASSWORD } from '../../mock/users';

// Client Explicit Order (Audio 2):
// 1. Customer first, 2. Surveyor second, 3. Admin third. (No Agent login anywhere!)
export const ROLES_CONFIG = [
  {
    id: 'customer',
    email: 'customer@demo.com',
    label: 'Customer',
    shortLabel: 'Customer',
    badge: 'Client Self-Service',
    loginTitle: 'Client Portal Sign In',
    desc: 'Review fee proposals, e-sign terms & access reports',
    icon: User,
  },
  {
    id: 'surveyor',
    email: 'surveyor@demo.com',
    label: 'Surveyor',
    shortLabel: 'Surveyor',
    badge: 'RICS Field Surveyor',
    loginTitle: 'Surveyor Portal Sign In',
    desc: 'Field inspections, booking calendar & report upload',
    icon: UserCheck,
  },
  {
    id: 'super_admin',
    email: 'admin@demo.com',
    label: 'Admin',
    shortLabel: 'Admin',
    badge: 'HQ Management & Back-Office',
    loginTitle: 'Admin & Practice Sign In',
    desc: 'Full operations, CRM pipeline, finances & settings',
    icon: ShieldCheck,
  },
];

export const LoginPage = ({ initialMode = null }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login, getRememberedEmail } = useAuth();

  // If backoffice is explicitly requested or path is /backoffice, default to surveyor or admin
  const isBackofficeRequested =
    initialMode === 'backoffice' ||
    location.pathname === '/backoffice' ||
    location.pathname === '/admin-login' ||
    location.pathname === '/staff-login' ||
    searchParams.get('portal') === 'backoffice';

  const defaultRole = isBackofficeRequested ? 'surveyor' : 'customer';

  const [selectedRole, setSelectedRole] = useState(defaultRole);
  const [email, setEmail] = useState(() => {
    if (isBackofficeRequested) return 'surveyor@demo.com';
    return getRememberedEmail() || 'customer@demo.com';
  });
  const [password, setPassword] = useState(DEFAULT_DEMO_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Keep state in sync if navigated with URL parameters
  useEffect(() => {
    if (isBackofficeRequested) {
      setSelectedRole('surveyor');
      setEmail('surveyor@demo.com');
      setPassword(DEFAULT_DEMO_PASSWORD);
    }
  }, [isBackofficeRequested]);

  const currentRoleConfig =
    ROLES_CONFIG.find((r) => r.id === selectedRole) || ROLES_CONFIG[0];

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const handleSelectRole = (role) => {
    setSelectedRole(role.id);
    setEmail(role.email);
    setPassword(DEFAULT_DEMO_PASSWORD);
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      await login(email, password, rememberMe);
      // Navigation is handled inside AuthContext getRoleDashboard
    } catch (err) {
      setErrorMessage(
        err.message || 'Authentication failed. Please verify your email and password.'
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#D5DAE2] flex items-center justify-center p-3 sm:p-6 font-sans">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200/80 flex flex-col md:flex-row min-h-[580px]">
        {/* Left Side: Login Form Column */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            {/* Top Bar with Brand & Back Button */}
            <div className="flex items-center justify-between mb-5">
              <Link to="/" className="flex items-center gap-2 text-slate-800 group">
                <div className="w-8 h-8 rounded-xl bg-[#0B1F4D] text-white flex items-center justify-center font-bold text-xs">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-extrabold text-xs tracking-tight block text-[#0B1F4D]">
                    UK PROPERTY SURVEYING
                  </span>
                  <span className="text-[10px] text-slate-400 block -mt-0.5">
                    RICS REGULATED PRACTICE
                  </span>
                </div>
              </Link>

              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            </div>

            {/* Header Titles */}
            <div className="mb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#0284C7] text-[10px] font-bold mb-2 tracking-wider uppercase border border-blue-200/70">
                <span>{currentRoleConfig.badge}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1F4D] tracking-tight">
                {currentRoleConfig.loginTitle}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {currentRoleConfig.desc}
              </p>
            </div>

            {/* 3 ROLES SELECTOR TABS (Client Sequence: 1. Customer -> 2. Surveyor -> 3. Admin) */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1.5 px-0.5">
                <span>Select Login Role:</span>
                <span className="text-slate-400 font-medium">Customer &bull; Surveyor &bull; Admin</span>
              </div>

              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl">
                {ROLES_CONFIG.map((role) => {
                  const isSelected = selectedRole === role.id;
                  const Icon = role.icon;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => handleSelectRole(role)}
                      className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer ${
                        isSelected
                          ? 'bg-[#0B1F4D] text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                      <span>{role.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Demo Quick Fill Helper for Current Role */}
            <div className="mb-4 p-2.5 bg-blue-50/70 border border-blue-200/60 rounded-xl flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs text-blue-900">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="font-semibold truncate">
                  Demo {currentRoleConfig.label} Account:
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEmail(currentRoleConfig.email);
                  setPassword(DEFAULT_DEMO_PASSWORD);
                  setErrorMessage('');
                }}
                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition-colors cursor-pointer shrink-0"
              >
                Quick Fill Demo
              </button>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-rose-700 text-xs animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  placeholder={currentRoleConfig.email}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/25 focus:border-[#0B1F4D] transition-all disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/25 focus:border-[#0B1F4D] transition-all disabled:opacity-50 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
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

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isLoading}
                    className="w-3.5 h-3.5 rounded text-[#0B1F4D] focus:ring-[#0B1F4D] border-slate-300"
                  />
                  <span>Remember me</span>
                </label>

                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-slate-500 hover:text-[#0B1F4D] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#0B1F4D]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in to {currentRoleConfig.label}...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to {currentRoleConfig.label} Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer note */}
          <div className="pt-4 text-center border-t border-slate-100 text-[11px] text-slate-400">
            <span>Encrypted 256-bit SSL session &bull; RICS Regulated Firm #084920</span>
          </div>
        </div>

        {/* Right Side: Architectural Residential Image Column */}
        <div className="hidden md:block md:w-1/2 relative bg-slate-900 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85"
            alt="British Architecture Residential Property"
            className="w-full h-full object-cover opacity-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F4D] via-[#0B1F4D]/40 to-transparent" />

          {/* Floating Trust Badge */}
          <div className="absolute bottom-8 left-8 right-8 text-white space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold border border-white/20">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Independent RICS Practice Portal</span>
            </div>
            <h2 className="text-xl font-bold leading-tight">
              Fast, Objective Property Surveys &amp; Red Book Valuations
            </h2>
            <p className="text-xs text-slate-200 leading-relaxed">
              Serving London, Surrey, Oxfordshire, Buckinghamshire, and Berkshire. Complete with 48h report delivery and direct telephone debrief.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
