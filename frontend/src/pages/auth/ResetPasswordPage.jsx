import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { AuthLayout } from '../../layouts/AuthLayout';
import { useToast } from '../../components/ToastContext';

export const ResetPasswordPage = () => {
  const { resetPassword } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Simple password strength calculation
  const getStrength = (pass) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = getStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(password);
      setIsSuccess(true);
      addToast({
        type: 'success',
        title: 'Password Updated',
        message: 'Your password has been changed. You can now sign in.',
      });
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1500);
    } catch (err) {
      setError('Failed to update password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create new password"
      subtitle="Your new password must be at least 8 characters long and include numbers/symbols."
    >
      {isSuccess ? (
        <div className="text-center py-4 space-y-4 animate-in fade-in">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Password reset successful</h3>
            <p className="text-xs text-slate-500 mt-1">
              Redirecting you to the sign in page...
            </p>
          </div>
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-[#0B1F4D] text-white text-xs font-semibold"
          >
            Go to Sign In <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              New Password
            </label>
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
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:border-[#2563EB] focus:bg-white transition-all disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password strength bar */}
            {password && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1 h-1">
                  <div
                    className={`flex-1 rounded-full ${
                      strength >= 1 ? 'bg-rose-500' : 'bg-slate-200'
                    }`}
                  />
                  <div
                    className={`flex-1 rounded-full ${
                      strength >= 2 ? 'bg-amber-500' : 'bg-slate-200'
                    }`}
                  />
                  <div
                    className={`flex-1 rounded-full ${
                      strength >= 3 ? 'bg-blue-500' : 'bg-slate-200'
                    }`}
                  />
                  <div
                    className={`flex-1 rounded-full ${
                      strength >= 4 ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  />
                </div>
                <div className="text-[10px] text-slate-400 text-right">
                  {strength <= 1 && 'Weak'}
                  {strength === 2 && 'Fair'}
                  {strength === 3 && 'Good'}
                  {strength >= 4 && 'Strong'}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                placeholder="••••••••••••"
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
                <span>Updating password...</span>
              </>
            ) : (
              <span>Reset Password</span>
            )}
          </button>
        </form>
      )}
    </AuthLayout>
  );
};
