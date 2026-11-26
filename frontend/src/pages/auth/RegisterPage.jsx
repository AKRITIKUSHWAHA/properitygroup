import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Building, Lock, Eye, EyeOff, Loader2, ArrowRight, ShieldCheck, CheckCircle2, LogIn } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { AuthLayout } from '../../layouts/AuthLayout';

export const RegisterPage = () => {
  const { registerCustomer, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const stateData = location.state || {};

  // Default to 'login' tab if customer already has an account, else 'register'
  const [activeTab, setActiveTab] = useState(() => (stateData.isExistingUser ? 'login' : 'register'));

  // Registration Form State
  const [formData, setFormData] = useState({
    fullName: stateData.fullName || stateData.customerName || '',
    email: stateData.email || stateData.customerEmail || '',
    phone: stateData.phone || stateData.customerPhone || '',
    address: stateData.address || stateData.propertyAddress || '',
    postcode: stateData.postcode || stateData.propertyPostcode || '',
    password: '',
    confirmPassword: '',
    agreeTerms: true,
  });

  // Login Form State (for existing customers)
  const [loginEmail, setLoginEmail] = useState(
    stateData.email || stateData.customerEmail || ''
  );
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [isExistingCustomer, setIsExistingCustomer] = useState(Boolean(stateData.isExistingUser));
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const checkAndAutofillExisting = (inputEmail) => {
    const cleanEmail = (inputEmail || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) return;

    try {
      // 1. Check registered customers in localStorage
      const registered = JSON.parse(localStorage.getItem('property_group_registered_customers') || '{}');
      if (registered[cleanEmail]) {
        const cust = registered[cleanEmail];
        setFormData((prev) => ({
          ...prev,
          fullName: prev.fullName || cust.name || '',
          phone: prev.phone || cust.phone || '',
          address: prev.address || cust.address || '',
          postcode: prev.postcode || cust.postcode || '',
        }));
        setLoginEmail(cleanEmail);
        setIsExistingCustomer(true);
        if (cust.password || localStorage.getItem(`njs_user_pw_${cleanEmail}`)) {
          setActiveTab('login');
        }
        return;
      }

      // 2. Check CRM leads
      const leads = JSON.parse(localStorage.getItem('propertygroup_crm_leads_v1') || '[]');
      const lead = leads.find((l) => (l.customerEmail || l.clientEmail || '').toLowerCase() === cleanEmail);
      if (lead) {
        setFormData((prev) => ({
          ...prev,
          fullName: prev.fullName || lead.customer || lead.clientName || '',
          phone: prev.phone || lead.customerPhone || '',
          address: prev.address || lead.property || '',
          postcode: prev.postcode || lead.postcode || lead.location || '',
        }));
        setLoginEmail(cleanEmail);
        return;
      }
    } catch (err) {
      console.warn('Failed to autofill registration from lead lookup:', err);
    }
  };

  useEffect(() => {
    const initEmail = stateData.email || stateData.customerEmail || formData.email;
    if (initEmail) {
      checkAndAutofillExisting(initEmail);
      setLoginEmail(initEmail);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (name === 'email') {
      setLoginEmail(value);
      if (value.includes('@')) {
        checkAndAutofillExisting(value);
      }
    }
  };

  // Handle Existing Customer Direct Sign In (No recreating password)
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      await login(loginEmail, loginPassword, true, '/customer/my-dashboard', 'customer');
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please verify your credentials.');
      setIsLoading(false);
    }
  };

  // Handle New Customer Account Registration
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!formData.agreeTerms) {
      setError('Please accept the customer terms and privacy policy to continue.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      await registerCustomer({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        postcode: formData.postcode,
        password: formData.password,
      });

      // Switch to Sign In tab with email and password populated
      setLoginEmail(formData.email.trim().toLowerCase());
      setLoginPassword(formData.password);
      setActiveTab('login');
      setSuccessMsg('Account registered successfully! Click "Sign In to Customer Dashboard" below to access your portal.');
      setIsLoading(false);
    } catch (err) {
      const msg = err.message || 'Registration failed.';
      setError(msg);
      if (msg.includes('already exists') || msg.includes('existing password') || msg.includes('sign in')) {
        setLoginEmail(formData.email.trim().toLowerCase());
        setActiveTab('login');
      }
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title={activeTab === 'login' ? 'Customer Portal Sign In' : 'Create Client Account'}
      subtitle={
        activeTab === 'login'
          ? 'Sign in with your email and password to track your survey and view fee proposals.'
          : 'Register as a property owner or buyer to track quotes, book surveys, and sign documents.'
      }
    >
      {/* Quotation Logged Alert */}
      {stateData.fromQuote && (
        <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-950">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-emerald-900">
              Quotation Request Received {stateData.quoteReference ? `(${stateData.quoteReference})` : ''}
            </span>
            <span className="text-emerald-800">
              {activeTab === 'login'
                ? 'Welcome back! Enter your existing password below to sign in and view your survey.'
                : 'Your quotation details are prefilled below. Set your password to activate your customer portal.'}
            </span>
          </div>
        </div>
      )}

      {/* Two Choice Tabs: Existing Client vs New Client */}
      <div className="flex rounded-xl bg-slate-100 p-1 mb-4 border border-slate-200">
        <button
          type="button"
          onClick={() => {
            setActiveTab('login');
            setError('');
            setSuccessMsg('');
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'login'
              ? 'bg-white text-[#0B1F4D] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <LogIn className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>Existing Client (Sign In)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('register');
            setError('');
            setSuccessMsg('');
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'register'
              ? 'bg-white text-[#0B1F4D] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <User className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>New Client (Register)</span>
        </button>
      </div>

      {/* Success Alert */}
      {successMsg && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
          {error}
        </div>
      )}

      {/* OPTION 1: EXISTING CUSTOMER SIGN IN (No creating password again!) */}
      {activeTab === 'login' ? (
        <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-left">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                disabled={isLoading}
                placeholder="e.g. name@example.com"
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:border-[#2563EB] focus:bg-white transition-all disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Your Existing Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type={showLoginPassword ? 'text' : 'password'}
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                disabled={isLoading}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:border-[#2563EB] focus:bg-white transition-all disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-3 py-2.5 px-4 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white font-semibold text-sm shadow-lg shadow-[#0B1F4D]/25 transition-all flex items-center justify-center gap-2 disabled:opacity-70 group cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in to portal...</span>
              </>
            ) : (
              <>
                <span>Sign In to Customer Dashboard</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setError('');
              }}
              className="text-xs text-[#2563EB] hover:underline font-semibold cursor-pointer"
            >
              Don't have an account yet? Register here &rarr;
            </button>
          </div>
        </form>
      ) : (
        /* OPTION 2: NEW CUSTOMER REGISTRATION */
        <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-left">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <User className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="e.g. Eleanor Vance"
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:border-[#2563EB] focus:bg-white transition-all disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                onBlur={() => checkAndAutofillExisting(formData.email)}
                disabled={isLoading}
                placeholder="e.g. eleanor@example.co.uk"
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:border-[#2563EB] focus:bg-white transition-all disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Property / Contact Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Building className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="e.g. 14 High Street, Richmond"
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:border-[#2563EB] focus:bg-white transition-all disabled:opacity-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                UK Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="+44 7700 900..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:border-[#2563EB] focus:bg-white transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Property Postcode
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <input
                  type="text"
                  name="postcode"
                  required
                  value={formData.postcode}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="e.g. SW1A 1AA"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 uppercase focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:border-[#2563EB] focus:bg-white transition-all disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Create Portal Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:border-[#2563EB] focus:bg-white transition-all disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:border-[#2563EB] focus:bg-white transition-all disabled:opacity-50"
              />
            </div>
          </div>

          <div className="pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                disabled={isLoading}
                className="w-4 h-4 mt-0.5 rounded text-[#2563EB] focus:ring-[#2563EB]/40 border-slate-300"
              />
              <span className="text-xs text-slate-600 leading-snug">
                I agree to the NJS Property Group{' '}
                <span className="font-semibold text-[#0B1F4D]">Terms of Service</span> and{' '}
                <span className="font-semibold text-[#0B1F4D]">Privacy Policy</span> (UK GDPR compliant).
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-3 py-2.5 px-4 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white font-semibold text-sm shadow-lg shadow-[#0B1F4D]/25 transition-all flex items-center justify-center gap-2 disabled:opacity-70 group cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating your account...</span>
              </>
            ) : (
              <>
                <span>Register as Customer</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setError('');
              }}
              className="text-xs text-[#2563EB] hover:underline font-semibold cursor-pointer"
            >
              Already registered? Sign in with your password &rarr;
            </button>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};
