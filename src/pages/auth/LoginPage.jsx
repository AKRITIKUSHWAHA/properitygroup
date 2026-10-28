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

const CLIENT_ROLE_CONFIG = {
  id: 'customer',
  email: 'customer@demo.com',
  label: 'Customer',
  shortLabel: 'Customer',
  loginTitle: 'Client Portal Sign In',
  desc: 'Access fee proposals, booking dates, digital terms & survey reports',
  icon: User,
};

const BACKOFFICE_ROLES = [
  {
    id: 'surveyor',
    email: 'surveyor@demo.com',
    label: 'Surveyor',
    shortLabel: 'Surveyor',
    loginTitle: 'Chartered Surveyor Portal',
    desc: 'Field inspections, booking calendar & report upload',
    icon: UserCheck,
  },
  {
    id: 'super_admin',
    email: 'admin@demo.com',
    label: 'Admin',
    shortLabel: 'Admin',
    loginTitle: 'Admin & Practice Management',
    desc: 'Full business operations, CRM pipeline & management',
    icon: ShieldCheck,
  },
];

export const LoginPage = ({ initialMode = null }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login, getRememberedEmail } = useAuth();

  // Determine whether this request is for the secure back-office or front-facing client portal
  const isBackofficeRequested =
    initialMode === 'backoffice' ||
    location.pathname === '/backoffice' ||
    searchParams.get('portal') === 'backoffice';

  const [loginMode, setLoginMode] = useState(isBackofficeRequested ? 'backoffice' : 'client');
  const [selectedRole, setSelectedRole] = useState(isBackofficeRequested ? 'surveyor' : 'customer');
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
      setLoginMode('backoffice');
      setSelectedRole('surveyor');
      setEmail('surveyor@demo.com');
      setPassword(DEFAULT_DEMO_PASSWORD);
    }
  }, [isBackofficeRequested]);

  const currentRoleConfig =
    loginMode === 'client'
      ? CLIENT_ROLE_CONFIG
      : BACKOFFICE_ROLES.find((r) => r.id === selectedRole) || BACKOFFICE_ROLES[0];

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const handleSelectBackofficeRole = (role) => {
    setSelectedRole(role.id);
    setEmail(role.email);
    setPassword(DEFAULT_DEMO_PASSWORD);
    setErrorMessage('');
  };

  const handleFillClientDemo = () => {
    setEmail('customer@demo.com');
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
      setErrorMessage(
        err.message || 'Authentication failed. Please check your credentials.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#D5DAE2] flex items-center justify-center p-0 sm:p-6 lg:p-10 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Outer Card Container (Full-screen on phone, centered card on desktop) */}
      <div className="relative w-full max-w-6xl bg-white rounded-none sm:rounded-[40px] shadow-2xl shadow-slate-900/15 overflow-hidden border-0 sm:border border-white/60 min-h-screen sm:min-h-[720px] flex flex-col justify-between pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)]">
        {/* Background Architectural Image on the right */}
        <div
          className="absolute inset-y-0 right-0 w-full lg:w-[62%] bg-cover bg-right lg:bg-center pointer-events-none"
          style={{
            backgroundImage: "url('/modern_building_facade.jpg')",
          }}
        >
          {/* Subtle gradient wash to blend building with left white canvas */}
          <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-white via-white/85 lg:via-white/40 to-transparent" />
        </div>

        {/* Top Brand Header + Back Button */}
        <div className="relative z-20 px-5 sm:px-12 pt-5 sm:pt-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0B1F4D] flex items-center justify-center text-white shadow-md shadow-[#0B1F4D]/20 shrink-0">
              <Building2 className="w-5 h-5 text-white stroke-[2.2]" />
            </div>
            <div>
              <div className="text-sm sm:text-base font-extrabold tracking-tight text-[#0B1F4D] uppercase leading-none">
                UK Property Surveying Practice
              </div>
              <div className="text-[9px] sm:text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
                INDEPENDENT RICS-ALIGNED SURVEYORS
              </div>
            </div>
          </div>

          {/* Top Bar Back Button */}
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-white/90 hover:bg-white text-slate-700 hover:text-[#0B1F4D] text-xs sm:text-sm font-bold shadow-xs hover:shadow-md border border-slate-200/90 transition-all cursor-pointer backdrop-blur-md active:scale-95"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4 text-[#0B1F4D]" />
            <span>Back</span>
          </button>
        </div>

        {/* Center Content: Floating Login Card */}
        <div className="relative z-20 px-4 sm:px-12 py-4 sm:py-8 flex items-center my-auto">
          <div className="w-full max-w-md bg-white/95 sm:backdrop-blur-md rounded-2xl sm:rounded-[28px] p-5 sm:p-8 shadow-xl shadow-slate-900/10 border border-slate-100/90 mx-auto lg:mx-0">
            {/* Header depending on Login Mode */}
            <div className="text-center mb-5 sm:mb-6">
              {loginMode === 'backoffice' ? (
                <>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-amber-300 text-[10px] font-black mx-auto mb-2 tracking-wider uppercase shadow-xs">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                    <span>Practice Back-Office • Restricted</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B] tracking-tight">
                    Staff &amp; Surveyor Login
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Authorized Chartered Surveyors &amp; Operations Personnel
                  </p>
                </>
              ) : (
                <>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#2563EB] text-[10px] font-bold mx-auto mb-2 tracking-wider uppercase border border-blue-200/70">
                    <User className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>Client Self-Service Portal</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B] tracking-tight">
                    Client Portal Sign In
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Review fee proposals, e-sign terms &amp; access reports
                  </p>
                </>
              )}
            </div>

            {/* Backoffice Role Switcher (Shown ONLY in Back-Office mode) */}
            {loginMode === 'backoffice' && (
              <div className="mb-4 sm:mb-5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1.5 px-0.5">
                  <span>Select Practice Role</span>
                  <span className="text-amber-600 font-bold">2 Personnel Roles</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-2xl">
                  {BACKOFFICE_ROLES.map((role) => {
                    const isSelected = selectedRole === role.id;
                    const Icon = role.icon;
                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => handleSelectBackofficeRole(role)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 min-h-[44px] cursor-pointer ${
                          isSelected
                            ? 'bg-[#0B1F4D] text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                        <span>{role.label}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-1.5 text-[10px] text-slate-400 text-center truncate">
                  {currentRoleConfig.desc}
                </div>
              </div>
            )}

            {/* Client Mode Demo Quick Fill Helper */}
            {loginMode === 'client' && (
              <div className="mb-4 p-2.5 bg-blue-50/70 border border-blue-200/60 rounded-xl flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs text-blue-900">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="font-semibold">Demo Client Account:</span>
                </div>
                <button
                  type="button"
                  onClick={handleFillClientDemo}
                  className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition-colors cursor-pointer shrink-0"
                >
                  Quick Fill Demo
                </button>
              </div>
            )}

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
                  placeholder={loginMode === 'client' ? 'customer@demo.com' : 'surveyor@demo.com'}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/25 focus:border-[#2563EB] transition-all disabled:opacity-50"
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
                    className="w-full px-3.5 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/25 focus:border-[#2563EB] transition-all disabled:opacity-50 font-mono"
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

                <div className="flex justify-end mt-1.5">
                  <Link
                    to="/forgot-password"
                    className="text-xs text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    forgot password?
                  </Link>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] !text-white font-bold text-xs sm:text-sm shadow-md shadow-[#0B1F4D]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin !text-white" />
                    <span className="!text-white font-bold">Signing in...</span>
                  </>
                ) : (
                  <span className="!text-white font-bold">
                    {loginMode === 'client' ? 'Sign In to Client Portal' : 'Access Practice Back-Office'}
                  </span>
                )}
              </button>
            </form>

            {/* Separated Entrance Link (Customer vs Staff Back-Office) */}
            {loginMode === 'client' ? (
              <div className="mt-5 pt-4 border-t border-slate-100 text-center space-y-2">
                <p className="text-xs text-slate-400">
                  New homebuyer or client?{' '}
                  <Link
                    to="/register"
                    className="font-bold text-slate-800 hover:text-[#2563EB] transition-colors"
                  >
                    Create an Account
                  </Link>
                </p>

                {/* Discreet, secure link to Back-Office */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMode('backoffice');
                      setSelectedRole('surveyor');
                      setEmail('surveyor@demo.com');
                      setErrorMessage('');
                    }}
                    className="text-[11px] font-semibold text-slate-400 hover:text-[#0B1F4D] transition-colors inline-flex items-center gap-1.5 cursor-pointer group"
                    title="Restricted entrance for practice personnel"
                  >
                    <Lock className="w-3 h-3 text-slate-400 group-hover:text-[#0B1F4D]" />
                    <span>Practice Personnel &amp; Surveyor Back-Office Entrance →</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-5 pt-4 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMode('client');
                    setSelectedRole('customer');
                    setEmail('customer@demo.com');
                    setErrorMessage('');
                  }}
                  className="text-xs font-bold text-[#2563EB] hover:text-[#0B1F4D] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Public Client Portal</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom subtle copyright / disclaimer */}
        <div className="relative z-20 px-6 sm:px-12 pb-5 sm:pb-6 flex items-center justify-between text-[11px] text-slate-400">
          <span>© 2026 UK Property Surveying Practice. All rights reserved.</span>
          <span className="hidden sm:inline">RICS Certified Platform</span>
        </div>
      </div>
    </div>
  );
};
