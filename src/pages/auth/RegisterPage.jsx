import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Lock, Eye, EyeOff, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { AuthLayout } from '../../layouts/AuthLayout';

export const RegisterPage = () => {
  const { registerCustomer } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    postcode: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

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
        postcode: formData.postcode,
        password: formData.password,
      });
    } catch (err) {
      setError(err.message || 'Registration failed.');
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create Client Account"
      subtitle="Register as a property owner or buyer to request quotes, book surveys, and sign documents."
    >
      {/* Notice Banner */}
      <div className="mb-4 p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 flex items-center gap-2.5 text-xs text-blue-900">
        <ShieldCheck className="w-4 h-4 text-[#2563EB] shrink-0" />
        <span>
          Customer Portal Registration only. Staff and Surveyors are invited by the Super Admin.
        </span>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
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
              disabled={isLoading}
              placeholder="e.g. eleanor@example.co.uk"
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
            Create Password
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
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
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
              I agree to the UK Property Surveying Practice{' '}
              <span className="font-semibold text-[#0B1F4D]">Terms of Service</span> and{' '}
              <span className="font-semibold text-[#0B1F4D]">Privacy Policy</span> (UK GDPR compliant).
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-3 py-2.5 px-4 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white font-semibold text-sm shadow-lg shadow-[#0B1F4D]/25 transition-all flex items-center justify-center gap-2 disabled:opacity-70 group"
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
      </form>

      <div className="mt-5 pt-4 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-500">
          Already registered?{' '}
          <Link
            to="/login"
            className="font-bold text-[#2563EB] hover:text-[#1D4ED8] transition-colors ml-1"
          >
            Sign In here
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};
