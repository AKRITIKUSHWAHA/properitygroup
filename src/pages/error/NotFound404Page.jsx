import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';

export const NotFound404Page = () => {
  const { user, getRoleDashboard } = useAuth();
  const navigate = useNavigate();

  const handleReturn = () => {
    if (user) {
      navigate(getRoleDashboard(user.role));
    } else {
      navigate('/login');
    }
  };

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

        <div className="mt-6">
          <button
            onClick={handleReturn}
            className="w-full py-2.5 px-4 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#0B1F4D]/20"
          >
            <Home className="w-4 h-4" />
            {user ? 'Return to Dashboard' : 'Go to Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
};
