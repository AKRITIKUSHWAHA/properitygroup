import React, { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
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
  CheckCircle2,
  LogIn,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { siteConfig } from '../../config/siteConfig';

// Dedicated, executive portal configurations for Customer, Surveyor, and Admin
export const ROLES_CONFIG = {
  customer: {
    id: 'customer',
    roleKey: 'customer',
    defaultEmail: 'customer@demo.com',
    label: 'Customer',
    badge: 'Customer Self-Service',
    badgeIcon: User,
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    title: 'Customer Login',
    subtitle: 'Access your fee proposals, e-sign terms & download survey reports',
    demoName: 'Customer Portal',
    buttonText: 'Customer Login',
    rightBadge: 'Independent RICS Practice Portal',
    rightHeading: 'Fast, Objective Property Surveys & Red Book Valuations',
    rightDescription:
      'Serving London, Surrey, Oxfordshire, Buckinghamshire, and Berkshire. Complete with 48h report delivery and direct telephone debrief.',
    image:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85',
    footerNote: 'Encrypted 256-bit SSL session • Regulated by RICS',
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
    demoName: 'Surveyor Portal',
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
    demoName: 'Admin Operations Portal',
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

export const LoginPage = ({ roleProp = null, initialMode = null, initialTab = 'login' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const { user, setUser, login, registerCustomer, getRememberedEmail } = useAuth();
  const urlEmail = searchParams.get('email');

  const activeRoleKey = resolveRole(
    params.role || params.portalRole,
    searchParams.get('role') || searchParams.get('portal'),
    roleProp || (initialMode === 'backoffice' ? 'super_admin' : null),
    location.pathname
  );

  const currentRoleConfig = ROLES_CONFIG[activeRoleKey] || ROLES_CONFIG.customer;
  const BadgeIcon = currentRoleConfig.badgeIcon;

  // Tab mode for customer portal: 'login' | 'register'
  const tabParam = searchParams.get('tab') || searchParams.get('mode') || location.state?.tab || (initialMode === 'register' ? 'register' : initialTab);
  const [activeTab, setActiveTab] = useState(tabParam === 'register' ? 'register' : 'login');

  // Login form state
  const [email, setEmail] = useState(
    () => urlEmail || location.state?.registeredEmail || location.state?.prefilledEmail || ''
  );
  const [password, setPassword] = useState(
    () => location.state?.registeredPassword || ''
  );
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Customer Registration form state
  const [regData, setRegData] = useState({
    fullName: location.state?.fullName || location.state?.customerName || '',
    email: urlEmail || location.state?.registeredEmail || location.state?.email || '',
    phone: location.state?.phone || location.state?.customerPhone || '',
    address: location.state?.address || location.state?.propertyAddress || '',
    postcode: location.state?.postcode || location.state?.propertyPostcode || '',
    password: '',
    confirmPassword: '',
    agreeTerms: true,
  });
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState(
    location.state?.registrationSuccess ? (location.state?.message || 'Account created successfully! Please enter your password to sign in.') : ''
  );

  // Sync state if coming with prefilled credentials
  useEffect(() => {
    if (urlEmail) {
      const cleanEmail = urlEmail.toLowerCase().trim();
      setEmail(cleanEmail);
      setRegData((prev) => ({ ...prev, email: cleanEmail }));
      setPassword('');

      const blockedList = JSON.parse(localStorage.getItem('property_group_blocked_users') || '[]');
      if (blockedList.includes(cleanEmail)) {
        setErrorMessage('Your account has been deactivated or blocked by management. Please contact support.');
        return;
      }
    } else if (location.state?.registeredEmail || location.state?.prefilledEmail) {
      const targetEmail = (location.state.registeredEmail || location.state.prefilledEmail).toLowerCase().trim();
      setEmail(targetEmail);
      setRegData((prev) => ({ ...prev, email: targetEmail }));
      if (location.state.registeredPassword) {
        setPassword(location.state.registeredPassword);
      }
    }
  }, [activeRoleKey, location.state, urlEmail]);

  // Handle Login submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const returnUrl = location.state?.from?.pathname || (activeRoleKey === 'customer' ? '/customer/my-dashboard' : null);
      await login(email, password, rememberMe, returnUrl, activeRoleKey);
    } catch (err) {
      setIsLoading(false);
      const msg = err.message || '';
      // If customer is not registered yet, guide them to registration with prefilled email
      const isKnownCustomer = email.trim().toLowerCase() === 'astp750@gmail.com';
      if (
        activeRoleKey === 'customer' &&
        !isKnownCustomer &&
        (err.isNotRegistered ||
          msg.toLowerCase().includes('not found') ||
          msg.toLowerCase().includes('create an account') ||
          msg.toLowerCase().includes('create your account') ||
          msg.toLowerCase().includes('register'))
      ) {
        setActiveTab('register');
        setRegData((prev) => ({ ...prev, email: email.trim().toLowerCase() }));
        setErrorMessage('No registered account found for this email. Please complete your registration below to create your account.');
      } else {
        setErrorMessage(
          msg || 'Authentication failed. Please verify your email and password.'
        );
      }
    }
  };

  // Handle New Customer Registration submission
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!regData.fullName?.trim()) {
      setErrorMessage('Please enter your full legal name.');
      return;
    }
    if (!regData.email?.trim() || !regData.email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (regData.password !== regData.confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify both password fields.');
      return;
    }
    if (regData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (!regData.agreeTerms) {
      setErrorMessage('Please agree to the RICS Terms of Engagement and Privacy Policy.');
      return;
    }

    setIsLoading(true);
    try {
      await registerCustomer({
        fullName: regData.fullName.trim(),
        email: regData.email.trim().toLowerCase(),
        phone: regData.phone?.trim() || '',
        address: regData.address?.trim() || '',
        postcode: regData.postcode?.trim() || '',
        password: regData.password,
        autoLogin: true,
      });
      // registerCustomer redirects directly to /customer/my-dashboard
    } catch (err) {
      setIsLoading(false);
      const msg = err.message || '';
      // If email is already registered, switch to login tab with email populated
      if (
        err.alreadyRegistered ||
        msg.toLowerCase().includes('already exists') ||
        msg.toLowerCase().includes('sign in')
      ) {
        setActiveTab('login');
        setEmail(regData.email.trim().toLowerCase());
        setErrorMessage('An account with this email already exists. Please enter your password to sign in.');
      } else {
        setErrorMessage(msg || 'Registration failed. Please check your details and try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#D5DAE2] flex items-center justify-center p-3 sm:p-6 font-sans">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/90 flex flex-col md:flex-row my-auto">
        {/* Left Side: Dedicated Portal Login / Registration Form */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 lg:p-9 flex flex-col justify-between">
          <div>
            {/* Top Bar with Brand & Back Button */}
            <div className="flex items-center justify-between mb-5">
              <Link to="/" className="flex items-center gap-2 group" title="Return to NJS Property Group Homepage">
                <img
                  src="/images/njs-logo.png"
                  alt="NJS Property Group"
                  className="h-16 w-auto object-contain transition-transform group-hover:scale-105"
                  style={{ maxHeight: '64px', width: 'auto', objectFit: 'contain' }}
                />
              </Link>

              <Link
                to="/"
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#0B1F4D] transition-colors px-2.5 py-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </Link>
            </div>

            {/* Customer Portal: Segmented Tab Switcher [ Sign In | Create Account ] */}
            {activeRoleKey === 'customer' && (
              <div className="flex rounded-xl bg-slate-100 p-1 mb-4 border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'login'
                      ? 'bg-white text-[#0B1F4D] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setErrorMessage('');
                    setSuccessMessage('');
                    if (email && !regData.email) {
                      setRegData((prev) => ({ ...prev, email }));
                    }
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'register'
                      ? 'bg-white text-[#0B1F4D] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>Create Account</span>
                </button>
              </div>
            )}

            {/* Header Titles (Balanced typography, dynamic for Sign In vs Register) */}
            <div className="mb-4">
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold mb-2 tracking-wider uppercase border ${
                  activeRoleKey === 'customer' && activeTab === 'register'
                    ? 'bg-blue-50 text-blue-800 border-blue-200/80'
                    : currentRoleConfig.badgeColor
                }`}
              >
                <BadgeIcon className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {activeRoleKey === 'customer' && activeTab === 'register'
                    ? 'Customer Registration'
                    : currentRoleConfig.badge}
                </span>
              </div>
              <h1 className="text-2xl sm:text-[26px] font-black text-[#0B1F4D] tracking-tight leading-snug">
                {activeRoleKey === 'customer' && activeTab === 'register'
                  ? 'Create Customer Account'
                  : currentRoleConfig.title}
              </h1>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">
                {activeRoleKey === 'customer' && activeTab === 'register'
                  ? 'Register to track your survey, view fee proposals & e-sign terms of engagement'
                  : currentRoleConfig.subtitle}
              </p>
            </div>

            {/* Success Alert */}
            {successMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2 text-emerald-800 text-xs animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-rose-700 text-xs animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* VIEW A: SIGN IN FORM */}
            {activeRoleKey !== 'customer' || activeTab === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-left">
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
                    placeholder={
                      activeRoleKey === 'super_admin'
                        ? 'Enter administrator email'
                        : activeRoleKey === 'surveyor'
                        ? 'Enter surveyor email'
                        : 'Enter customer email'
                    }
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
                      placeholder="Enter your password"
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
                    state={{ loginPath: location.pathname }}
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

                {/* Customer Registration Bottom Switcher */}
                {activeRoleKey === 'customer' && (
                  <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                    <span className="text-xs text-slate-600 font-medium">New property client? </span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('register');
                        setErrorMessage('');
                        setSuccessMessage('');
                        if (email && !regData.email) {
                          setRegData((prev) => ({ ...prev, email }));
                        }
                      }}
                      className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer"
                    >
                      Create Customer Account &rarr;
                    </button>
                  </div>
                )}
              </form>
            ) : (
              /* VIEW B: CUSTOMER REGISTRATION FORM */
              <form onSubmit={handleRegisterSubmit} className="space-y-3 text-left">
                {/* Full Name & Phone Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Legal Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={regData.fullName}
                      onChange={(e) => setRegData({ ...regData, fullName: e.target.value })}
                      disabled={isLoading}
                      placeholder="e.g. John Smith"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20 focus:border-[#0B1F4D] transition-all disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={regData.phone}
                      onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                      disabled={isLoading}
                      placeholder="+44 7700 900123"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20 focus:border-[#0B1F4D] transition-all disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={regData.email}
                    onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                    disabled={isLoading}
                    placeholder="e.g. john.smith@example.com"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20 focus:border-[#0B1F4D] transition-all disabled:opacity-50"
                  />
                </div>

                {/* Property Address & Postcode */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Property Address
                    </label>
                    <input
                      type="text"
                      value={regData.address}
                      onChange={(e) => setRegData({ ...regData, address: e.target.value })}
                      disabled={isLoading}
                      placeholder="e.g. 14 High Street"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20 focus:border-[#0B1F4D] transition-all disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Postcode
                    </label>
                    <input
                      type="text"
                      value={regData.postcode}
                      onChange={(e) => setRegData({ ...regData, postcode: e.target.value })}
                      disabled={isLoading}
                      placeholder="e.g. SW1A 1AA"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20 focus:border-[#0B1F4D] transition-all disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Create Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        value={regData.password}
                        onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                        disabled={isLoading}
                        placeholder="Min 6 characters"
                        className="w-full px-3 pr-9 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20 focus:border-[#0B1F4D] transition-all disabled:opacity-50 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        disabled={isLoading}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                      >
                        {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showRegConfirmPassword ? 'text' : 'password'}
                        required
                        value={regData.confirmPassword}
                        onChange={(e) => setRegData({ ...regData, confirmPassword: e.target.value })}
                        disabled={isLoading}
                        placeholder="Re-enter password"
                        className="w-full px-3 pr-9 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20 focus:border-[#0B1F4D] transition-all disabled:opacity-50 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                        disabled={isLoading}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                      >
                        {showRegConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Terms Checkbox */}
                <div className="pt-1">
                  <label className="flex items-start gap-2 cursor-pointer select-none text-xs text-slate-600 font-medium">
                    <input
                      type="checkbox"
                      checked={regData.agreeTerms}
                      onChange={(e) => setRegData({ ...regData, agreeTerms: e.target.checked })}
                      disabled={isLoading}
                      className="w-3.5 h-3.5 mt-0.5 rounded text-[#0B1F4D] focus:ring-[#0B1F4D] border-slate-300"
                    />
                    <span>
                      I agree to the <span className="text-[#0B1F4D] font-bold">RICS Terms of Engagement</span> &amp; <span className="text-[#0B1F4D] font-bold">Privacy Policy</span>
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#0B1F4D]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-lg active:scale-[0.99] mt-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Account &amp; Signing In...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account &amp; Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Back to Login Switcher */}
                <div className="mt-3 p-2.5 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <span className="text-xs text-slate-600 font-medium">Already have an account? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('login');
                      setErrorMessage('');
                      setSuccessMessage('');
                      if (regData.email) {
                        setEmail(regData.email);
                      }
                    }}
                    className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer"
                  >
                    Sign In to Portal &rarr;
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Footer note */}
          <div className="pt-4 mt-3 text-center border-t border-slate-100 text-[11px] text-slate-400">
            <div className="font-medium">{currentRoleConfig.footerNote}</div>
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
