import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
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
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { DEFAULT_DEMO_PASSWORD } from '../../mock/users';

// Dedicated, executive portal configurations for Customer, Surveyor, and Admin
export const ROLES_CONFIG = {
  customer: {
    id: 'customer',
    roleKey: 'customer',
    defaultEmail: 'customer@demo.com',
    label: 'Customer',
    badge: 'Client Self-Service',
    badgeIcon: User,
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    title: 'Client Portal Sign In',
    subtitle: 'Access your fee proposals, e-sign terms & download survey reports',
    demoName: 'Demo Client Account',
    buttonText: 'Sign In to Client Portal',
    rightBadge: 'Independent RICS Practice Portal',
    rightHeading: 'Fast, Objective Property Surveys & Red Book Valuations',
    rightDescription:
      'Serving London, Surrey, Oxfordshire, Buckinghamshire, and Berkshire. Complete with 48h report delivery and direct telephone debrief.',
    image:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85',
    footerNote: 'Encrypted 256-bit SSL session • RICS Regulated Firm #084920',
  },
  surveyor: {
    id: 'surveyor',
    roleKey: 'surveyor',
    defaultEmail: 'surveyor@demo.com',
    label: 'Surveyor',
    badge: 'RICS Field Surveyor Portal',
    badgeIcon: UserCheck,
    badgeColor: 'bg-amber-50 text-amber-900 border-amber-200/80',
    title: 'Surveyor Portal Sign In',
    subtitle: 'Site inspection logistics, access notes & report drafting',
    demoName: 'Demo Surveyor Account',
    buttonText: 'Sign In to Surveyor Portal',
    rightBadge: 'RICS Chartered Surveyor Access',
    rightHeading: 'Field Inspection Logistics & Defect Diagnostics',
    rightDescription:
      'Assigned surveyor access for on-site property visits, digital defect logging, and automated Level 2 & Level 3 survey report compilation.',
    image:
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=85',
    footerNote: 'Restricted RICS Assessor Portal • 256-bit Encrypted Session',
  },
  super_admin: {
    id: 'super_admin',
    roleKey: 'super_admin',
    defaultEmail: 'admin@demo.com',
    label: 'Admin',
    badge: 'Practice Governance & Back-Office',
    badgeIcon: ShieldCheck,
    badgeColor: 'bg-blue-50 text-[#0B1F4D] border-blue-200/80',
    title: 'Admin Portal Sign In',
    subtitle: 'Full operations, SurveyBooker pipeline, VAT billing & settings',
    demoName: 'Demo Administrator Account',
    buttonText: 'Sign In to Admin Portal',
    rightBadge: 'Central Practice Headquarters',
    rightHeading: 'Operations Management & Surveyor Allocation',
    rightDescription:
      'Central operations control for instruction progression, fee proposals, HMRC VAT scheduling, and client communication triggers.',
    image:
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=85',
    footerNote: 'Authorised Practice Personnel Only • Monitored Audit Log',
  },
};

/**
 * Intelligent resolver that maps route param, query param, explicit prop,
 * or URL path to either 'customer', 'surveyor', or 'super_admin'.
 * Default for `/login` is ALWAYS 'customer'.
 */
export const resolveRole = (roleParam, searchParamRole, roleProp, pathname) => {
  const candidate = (roleProp || roleParam || searchParamRole || '').toLowerCase().trim();

  if (['admin', 'super_admin', 'superadmin', 'staff', 'management', 'backoffice'].includes(candidate)) {
    return 'super_admin';
  }
  if (['surveyor', 'survey', 'field'].includes(candidate)) {
    return 'surveyor';
  }
  if (['customer', 'client', 'user'].includes(candidate)) {
    return 'customer';
  }

  const path = (pathname || '').toLowerCase();
  if (path.includes('/admin')) return 'super_admin';
  if (path.includes('/surveyor')) return 'surveyor';
  if (path.includes('/backoffice')) return 'super_admin';
  if (path.includes('/customer')) return 'customer';

  // Default is customer for public /login
  return 'customer';
};

export const LoginPage = ({ roleProp = null, initialMode = null }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const { login, getRememberedEmail } = useAuth();

  const activeRoleKey = resolveRole(
    params.role || params.portalRole,
    searchParams.get('role') || searchParams.get('portal'),
    roleProp || (initialMode === 'backoffice' ? 'super_admin' : null),
    location.pathname
  );

  const currentRoleConfig = ROLES_CONFIG[activeRoleKey] || ROLES_CONFIG.customer;
  const BadgeIcon = currentRoleConfig.badgeIcon;

  const getInitialEmail = (roleKey) => {
    const config = ROLES_CONFIG[roleKey] || ROLES_CONFIG.customer;
    const remembered = getRememberedEmail ? getRememberedEmail(roleKey) : '';
    if (roleKey === 'customer') {
      if (remembered && !remembered.includes('surveyor') && !remembered.includes('admin') && remembered !== 'surveyor@demo.com' && remembered !== 'admin@demo.com') {
        return remembered;
      }
      return config.defaultEmail;
    }
    if (roleKey === 'surveyor') {
      if (remembered && !remembered.includes('customer') && !remembered.includes('admin') && remembered !== 'customer@demo.com' && remembered !== 'admin@demo.com') {
        return remembered;
      }
      return config.defaultEmail;
    }
    if (roleKey === 'super_admin' || roleKey === 'admin') {
      if (remembered && !remembered.includes('customer') && !remembered.includes('surveyor') && remembered !== 'customer@demo.com' && remembered !== 'surveyor@demo.com') {
        return remembered;
      }
      return config.defaultEmail;
    }
    return config.defaultEmail;
  };

  const [email, setEmail] = useState(() => getInitialEmail(activeRoleKey));
  const [password, setPassword] = useState(DEFAULT_DEMO_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Keep state synchronized whenever the route or active role changes
  useEffect(() => {
    setEmail(getInitialEmail(activeRoleKey));
    setPassword(DEFAULT_DEMO_PASSWORD);
    setErrorMessage('');
  }, [activeRoleKey]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const returnUrl = location.state?.from?.pathname;
      await login(email, password, rememberMe, returnUrl);
    } catch (err) {
      setErrorMessage(
        err.message || 'Authentication failed. Please verify your email and password.'
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#D5DAE2] flex items-center justify-center p-3 sm:p-6 font-sans">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/90 flex flex-col md:flex-row my-auto">
        {/* Left Side: Dedicated Portal Login Form */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 lg:p-9 flex flex-col justify-between">
          <div>
            {/* Top Bar with Brand & Back Button */}
            <div className="flex items-center justify-between mb-5">
              <Link to="/" className="flex items-center gap-2.5 text-slate-800 group">
                <div className="w-8 h-8 rounded-xl bg-[#0B1F4D] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="font-extrabold text-[11px] tracking-tight block text-[#0B1F4D] leading-none">
                    NJS PROPERTY GROUP
                  </span>
                  <span className="text-[9px] font-semibold tracking-wider text-slate-400 block mt-1 uppercase">
                    RICS REGULATED PRACTICE
                  </span>
                </div>
              </Link>

              <Link
                to="/"
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#0B1F4D] transition-colors px-2.5 py-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </Link>
            </div>

            {/* Header Titles (Balanced typography, no orphan word wrapping) */}
            <div className="mb-4">
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold mb-2 tracking-wider uppercase border ${currentRoleConfig.badgeColor}`}
              >
                <BadgeIcon className="w-3.5 h-3.5 shrink-0" />
                <span>{currentRoleConfig.badge}</span>
              </div>
              <h1 className="text-2xl sm:text-[26px] font-black text-[#0B1F4D] tracking-tight leading-snug">
                {currentRoleConfig.title}
              </h1>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">
                {currentRoleConfig.subtitle}
              </p>
            </div>

            {/* Demo Quick Fill Helper - Modern SaaS layout */}
            <div className="mb-4 p-2.5 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl flex items-center justify-between gap-2.5 transition-colors">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-[#0B1F4D]/5 text-[#0B1F4D] flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">
                    {currentRoleConfig.demoName}
                  </div>
                  <div className="text-xs font-semibold text-slate-700 truncate">
                    {currentRoleConfig.defaultEmail}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEmail(currentRoleConfig.defaultEmail);
                  setPassword(DEFAULT_DEMO_PASSWORD);
                  setErrorMessage('');
                }}
                className="px-3 py-1.5 rounded-lg bg-[#0B1F4D] hover:bg-[#162E6E] text-white text-[11px] font-bold transition-all cursor-pointer shrink-0 shadow-xs active:scale-95"
              >
                Quick Fill
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
            <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  placeholder={currentRoleConfig.defaultEmail}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20 focus:border-[#0B1F4D] transition-all disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
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
                    className="w-full px-3.5 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20 focus:border-[#0B1F4D] transition-all disabled:opacity-50 font-mono"
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
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 font-medium">
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
                  className="text-xs font-bold text-[#0B1F4D] hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#0B1F4D]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-lg active:scale-[0.99]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in to {currentRoleConfig.label}...</span>
                  </>
                ) : (
                  <>
                    <span>{currentRoleConfig.buttonText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Optional Customer Registration Link (only shown for Customer portal) */}
            {activeRoleKey === 'customer' && (
              <div className="mt-3 text-center">
                <span className="text-xs text-slate-500 font-medium">Need a client survey account? </span>
                <Link to="/register" className="text-xs font-bold text-[#0B1F4D] hover:underline">
                  Register online
                </Link>
              </div>
            )}
          </div>

          {/* Footer note with discreet links between portals */}
          <div className="pt-4 mt-3 text-center border-t border-slate-100 text-[11px] text-slate-400 space-y-1">
            <div className="font-medium">{currentRoleConfig.footerNote}</div>
            {activeRoleKey === 'customer' ? (
              <div className="text-[10.5px] text-slate-400 font-medium">
                Practice surveyor or administrator?{' '}
                <Link
                  to="/login/surveyor"
                  className="text-slate-600 hover:text-[#0B1F4D] font-semibold underline"
                >
                  Surveyor Sign In
                </Link>
                {' · '}
                <Link
                  to="/login/admin"
                  className="text-slate-600 hover:text-[#0B1F4D] font-semibold underline"
                >
                  Admin Sign In
                </Link>
              </div>
            ) : activeRoleKey === 'surveyor' ? (
              <div className="text-[10.5px] text-slate-400 font-medium">
                Switch portal:{' '}
                <Link
                  to="/login"
                  className="text-slate-600 hover:text-[#0B1F4D] font-semibold underline"
                >
                  Customer Portal
                </Link>
                {' · '}
                <Link
                  to="/login/admin"
                  className="text-slate-600 hover:text-[#0B1F4D] font-semibold underline"
                >
                  Admin Sign In
                </Link>
              </div>
            ) : (
              <div className="text-[10.5px] text-slate-400 font-medium">
                Switch portal:{' '}
                <Link
                  to="/login"
                  className="text-slate-600 hover:text-[#0B1F4D] font-semibold underline"
                >
                  Customer Portal
                </Link>
                {' · '}
                <Link
                  to="/login/surveyor"
                  className="text-slate-600 hover:text-[#0B1F4D] font-semibold underline"
                >
                  Surveyor Sign In
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Architectural Residential / Practice Image Column */}
        <div className="hidden md:block md:w-1/2 relative bg-slate-900 overflow-hidden">
          <img
            src={currentRoleConfig.image}
            alt="British Architecture Practice"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F4D]/95 via-[#0B1F4D]/50 to-transparent" />

          {/* Floating Trust Badge */}
          <div className="absolute bottom-8 left-8 right-8 text-white space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold border border-white/25 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{currentRoleConfig.rightBadge}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black leading-tight tracking-tight">
              {currentRoleConfig.rightHeading}
            </h2>
            <p className="text-xs text-slate-200/90 leading-relaxed font-normal">
              {currentRoleConfig.rightDescription}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
