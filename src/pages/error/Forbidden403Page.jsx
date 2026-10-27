import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';

export const Forbidden403Page = () => {
  const { user, getRoleDashboard, logout } = useAuth();
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    if (user) {
      navigate(getRoleDashboard(user.role));
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F5F9] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-200">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <span className="text-xs font-bold tracking-widest uppercase text-rose-600 px-3 py-1 bg-rose-50 rounded-full border border-rose-200">
          Error 403 • Access Denied
        </span>

        <h1 className="text-2xl font-extrabold text-[#0B1F4D] mt-4 tracking-tight">
          Restricted Survey Area
        </h1>

        <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
          You don't have the required permissions to view this survey module. Your current role is{' '}
          <strong className="text-slate-800">{user?.roleLabel || 'Guest'}</strong>.
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          <button
            onClick={handleBackToDashboard}
            className="w-full py-2.5 px-4 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#0B1F4D]/20"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Dashboard
          </button>

          <button
            onClick={logout}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 text-sm font-semibold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4 text-slate-400" />
            Sign in as Different User
          </button>
        </div>
      </div>
    </div>
  );
};
