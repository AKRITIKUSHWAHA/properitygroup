import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Building2,
  ShieldCheck,
  Briefcase,
  UserCheck,
  User,
  Loader2,
  AlertCircle,
  ArrowRight,
  Check,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { DEFAULT_DEMO_PASSWORD } from '../../mock/users';

const ROLE_OPTIONS = [
  {
    id: 'super_admin',
    email: 'admin@demo.com',
    label: 'Super Admin',
    shortLabel: 'Admin',
    loginTitle: 'Super Admin Login',
    desc: 'Full platform & financial control (10 menus)',
    icon: ShieldCheck,
  },
  {
    id: 'admin_staff',
    email: 'staff@demo.com',
    label: 'Agent / Staff',
    shortLabel: 'Agent',
    loginTitle: 'Agent Login',
    desc: 'Operations, calendar & lead dispatch (8 menus)',
    icon: Briefcase,
  },
  {
    id: 'surveyor',
    email: 'surveyor@demo.com',
    label: 'Surveyor',
    shortLabel: 'Surveyor',
    loginTitle: 'Surveyor Login',
    desc: 'Field inspections & report upload (6 menus)',
    icon: UserCheck,
  },
  {
    id: 'customer',
    email: 'customer@demo.com',
    label: 'Customer',
    shortLabel: 'Customer',
    loginTitle: 'Customer Login',
    desc: 'Quotations, bookings & reports (8 menus)',
    icon: User,
  },
];

export const LoginPage = () => {
  const { login, getRememberedEmail } = useAuth();

  const [selectedRole, setSelectedRole] = useState('admin_staff'); // Defaults to Agent Login matching reference
  const [email, setEmail] = useState(() => getRememberedEmail() || 'staff@demo.com');
  const [password, setPassword] = useState(DEFAULT_DEMO_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const currentRoleConfig =
    ROLE_OPTIONS.find((r) => r.id === selectedRole) || ROLE_OPTIONS[1];

  const handleRoleSelect = (role) => {
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
      {/* Outer Card Container matching Reference Design (Full-screen on phone, centered card on desktop) */}
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

        {/* Top Left Brand Header matching Reference Logo */}
        <div className="relative z-20 px-5 sm:px-12 pt-5 sm:pt-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#0B1F4D] flex items-center justify-center text-white shadow-md shadow-[#0B1F4D]/20 shrink-0">
            <Building2 className="w-5 h-5 text-[#2563EB] stroke-[2.2]" />
          </div>
          <div>
            <div className="text-sm sm:text-base font-extrabold tracking-tight text-[#0B1F4D] uppercase leading-none">
              PROPERTY GROUP
            </div>
            <div className="text-[9px] sm:text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
              SURVEY PLATFORM • INDEPENDENT RICS
            </div>
          </div>
        </div>

        {/* Center Content: Floating Login Card */}
        <div className="relative z-20 px-4 sm:px-12 py-4 sm:py-8 flex items-center my-auto">
          <div className="w-full max-w-md bg-white/95 sm:backdrop-blur-md rounded-2xl sm:rounded-[28px] p-5 sm:p-8 shadow-xl shadow-slate-900/10 border border-slate-100/90 mx-auto lg:mx-0">
            {/* Header */}
            <div className="text-center mb-4 sm:mb-5">
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#1E293B] tracking-tight">
                {currentRoleConfig.loginTitle}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Please enter your details
              </p>
            </div>

            {/* All Roles Selector ('or sare roll rhe') */}
            <div className="mb-4 sm:mb-5">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1.5 px-0.5">
                <span>Select Role / Quick Demo</span>
                <span className="text-[#2563EB] font-bold">4 Roles</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-2xl">
                {ROLE_OPTIONS.map((role) => {
                  const isSelected = selectedRole === role.id;
                  const Icon = role.icon;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => handleRoleSelect(role)}
                      className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all flex flex-col items-center justify-center gap-1 min-h-[44px] cursor-pointer ${
                        isSelected
                          ? 'bg-[#0B1F4D] text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                      }`}
                      title={role.label}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="truncate w-full text-center">
                        {role.shortLabel}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-1.5 text-[10px] text-slate-400 text-center truncate">
                {currentRoleConfig.desc}
              </div>
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
              {/* Username / Email field matching Reference design */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  placeholder="jonathan_fletcher07"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/25 focus:border-[#2563EB] transition-all disabled:opacity-50"
                />
              </div>

              {/* Password field */}
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

                {/* 'forgot password?' right-aligned as in reference */}
                <div className="flex justify-end mt-1.5">
                  <Link
                    to="/forgot-password"
                    className="text-xs text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    forgot password?
                  </Link>
                </div>
              </div>

              {/* Submit Button styled as dark slate/navy in reference */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-[#2D3748] hover:bg-[#1E293B] text-white font-bold text-xs sm:text-sm shadow-md shadow-slate-900/10 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            {/* Bottom Account Creation Link matching Reference text */}
            <div className="mt-5 text-center">
              <p className="text-xs text-slate-400">
                Are you new?{' '}
                <Link
                  to="/register"
                  className="font-bold text-slate-800 hover:text-[#2563EB] transition-colors"
                >
                  Create an Account
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom subtle copyright / disclaimer */}
        <div className="relative z-20 px-6 sm:px-12 pb-5 sm:pb-6 flex items-center justify-between text-[11px] text-slate-400">
          <span>© 2026 Property Group UK. All rights reserved.</span>
          <span className="hidden sm:inline">RICS Certified Platform</span>
        </div>
      </div>
    </div>
  );
};
