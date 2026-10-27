import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { AuthLayout } from '../../layouts/AuthLayout';

export const ForgotPasswordPage = () => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await forgotPassword(email);
    setIsLoading(false);
    setIsSubmitted(true);
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your registered survey account email and we'll send you recovery instructions."
    >
      {isSubmitted ? (
        <div className="text-center py-4 space-y-4 animate-in fade-in">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Check your inbox</h3>
            <p className="text-xs text-slate-500 mt-1">
              We've sent password reset instructions to{' '}
              <span className="font-semibold text-slate-700">{email}</span>.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Link
              to="/reset-password"
              className="py-2.5 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs transition-colors"
            >
              Simulate: Proceed to Set New Password
            </Link>
            <Link
              to="/login"
              className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Account email address
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
                placeholder="e.g. surveyor@demo.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:border-[#2563EB] focus:bg-white transition-all disabled:opacity-50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white font-semibold text-sm shadow-lg shadow-[#0B1F4D]/25 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending instructions...</span>
              </>
            ) : (
              <span>Send Reset Link</span>
            )}
          </button>

          <div className="pt-3 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Sign In
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};
