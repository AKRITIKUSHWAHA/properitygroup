import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { AuthLayout } from '../../layouts/AuthLayout';
import { useToast } from '../../components/ToastContext';
import { authApi } from '../../api/authApi';

export const ActivatePage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

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

    if (!token) {
      setError('Activation token is missing from the link. Please check the link from your email.');
      return;
    }

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
      const res = await authApi.activate(token, password);
      setIsSuccess(true);

      // If auth token returned, store session token
      if (res?.token) {
        localStorage.setItem('property_group_auth_token', res.token);
      }
      if (res?.user) {
        localStorage.setItem('property_group_auth_user', JSON.stringify(res.user));
      }

      addToast({
        type: 'success',
        title: 'Portal Activated',
        message: 'Your Client Portal has been activated. Welcome to NJS Property Group!',
      });

      setTimeout(() => {
        navigate('/customer/dashboard', { replace: true });
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Activation failed. The link may have expired or is invalid.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Activate Your Client Portal"
      subtitle="Set your secure password to access your survey quotations, agreements, invoices, and live inspection tracking."
    >
      {!token ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Invalid or Missing Activation Link</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              This activation page requires a secure token. Please click the activation link directly from your email invitation.
            </p>
          </div>
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-[#0B1F4D] text-white text-xs font-semibold"
          >
            Go to Sign In <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : isSuccess ? (
        <div className="text-center py-6 space-y-4 animate-in fade-in">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Account Activated Successfully!</h3>
            <p className="text-xs text-slate-500 mt-1">
              Your password has been saved. Redirecting to your personal Customer Portal...
            </p>
          </div>
          <Link
            to="/customer/dashboard"
            className="inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-[#0B1F4D] text-white text-xs font-bold"
          >
            Enter Customer Portal <ArrowRight className="w-3.5 h-3.5" />
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
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Create Portal Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B1F4D] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {password && (
              <div className="mt-1.5 flex items-center gap-1.5">
                <div className="flex gap-1 flex-1">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`h-1 flex-1 rounded-full ${
                        strength >= step
                          ? strength <= 2
                            ? 'bg-amber-400'
                            : 'bg-emerald-500'
                          : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-slate-500 font-medium">
                  {strength <= 1 ? 'Weak' : strength <= 3 ? 'Medium' : 'Strong'}
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B1F4D] transition-all"
              />
            </div>
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-[11px] text-blue-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-blue-950">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Personal Data Protection</span>
            </div>
            <p className="text-blue-800 leading-relaxed">
              Your password is encrypted with industry-standard bcrypt hashing. NJS staff will never ask you for your password.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-[#0B1F4D] hover:bg-blue-900 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Activating Portal...</span>
              </>
            ) : (
              <>
                <span>Set Password &amp; Activate Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="text-center pt-2">
            <Link to="/login" className="text-xs text-slate-500 hover:text-[#0B1F4D] font-medium">
              Already have an activated account? <span className="font-bold text-[#0B1F4D]">Sign In</span>
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};
