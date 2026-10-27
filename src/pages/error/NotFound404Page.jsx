import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FileQuestion, Home, LogIn, LayoutDashboard, ArrowRight } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';

export const NotFound404Page = () => {
  const { user, getRoleDashboard } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F3F5F9] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-200">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center mx-auto mb-4 border border-blue-200">
          <FileQuestion className="w-8 h-8" />
        </div>

        <span className="text-xs font-bold tracking-widest uppercase text-[#2563EB] px-3 py-1 bg-blue-50 rounded-full border border-blue-200">
          404 Not Found
        </span>

        <h1 className="text-2xl font-extrabold text-[#0B1F4D] mt-4 tracking-tight">
          Page Does Not Exist
        </h1>

        <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
          The survey record, report, or page you are attempting to access could not be found or has moved.
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          <button
            onClick={() => navigate('/')}
            className="w-full py-2.5 px-4 rounded-xl bg-[#142A43] hover:bg-[#1E3A5F] text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#142A43]/20"
          >
            <Home className="w-4 h-4" />
            Return to Homepage
          </button>

          {user ? (
            <button
              onClick={() => navigate(getRoleDashboard(user.role))}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#142A43] text-sm font-semibold transition-all flex items-center justify-center gap-2 border border-slate-200"
            >
              <LayoutDashboard className="w-4 h-4" />
              Go to Dashboard
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#142A43] text-sm font-semibold transition-all flex items-center justify-center gap-2 border border-slate-200"
            >
              <LogIn className="w-4 h-4" />
              Portal Sign In
            </button>
          )}
        </div>

        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-4 text-xs text-slate-500">
          <Link to="/redirects" className="hover:text-[#142A43] hover:underline flex items-center gap-1">
            Production Redirects <ArrowRight className="w-3 h-3" />
          </Link>
          <span>&bull;</span>
          <Link to="/contact" className="hover:text-[#142A43] hover:underline">
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
};
