import React from 'react';
import { Building2, ShieldCheck, MapPin, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const AuthLayout = ({ children, title, subtitle }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#D5DAE2] flex items-center justify-center p-3 sm:p-6 lg:p-10 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Outer Card Container matching Reference Design */}
      <div className="relative w-full max-w-6xl bg-white rounded-[32px] sm:rounded-[40px] shadow-2xl shadow-slate-900/15 overflow-hidden border border-white/60 min-h-[640px] lg:min-h-[720px] flex flex-col justify-between">
        {/* Background Architectural Image on the right */}
        <div
          className="absolute inset-y-0 right-0 w-full lg:w-[60%] bg-cover bg-right lg:bg-center pointer-events-none"
          style={{
            backgroundImage: "url('/modern_building_facade.jpg')",
          }}
        >
          {/* Subtle gradient wash to blend building with left white canvas */}
          <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-white via-white/85 lg:via-white/40 to-transparent" />
        </div>

        {/* Top Left Brand Header matching Reference Logo + Back Button */}
        <div className="relative z-20 px-6 sm:px-12 pt-6 sm:pt-10 flex items-center justify-between">
          <Link to="/login" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-[#0B1F4D] flex items-center justify-center text-white shadow-md shadow-[#0B1F4D]/20 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5 text-[#2563EB] stroke-[2.2]" />
            </div>
            <div>
              <div className="text-sm sm:text-base font-extrabold tracking-tight text-[#0B1F4D] leading-none">
                UK Property Surveying Practice
              </div>
              <div className="text-[9px] sm:text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-1">
                INDEPENDENT RICS-ALIGNED SURVEYORS
              </div>
            </div>
          </Link>

          {/* Top Bar Back Button */}
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/90 hover:bg-white text-slate-700 hover:text-[#0B1F4D] text-xs font-bold shadow-xs hover:shadow-md border border-slate-200/90 transition-all cursor-pointer backdrop-blur-md active:scale-95"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4 text-[#0B1F4D]" />
            <span>Back</span>
          </button>
        </div>

        {/* Center Content: Floating White Card */}
        <div className="relative z-20 px-4 sm:px-12 py-6 sm:py-8 flex items-center my-auto">
          <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-[28px] p-6 sm:p-8 shadow-xl shadow-slate-900/10 border border-slate-100/90 mx-auto lg:mx-0">
            {title && (
              <div className="text-center mb-5">
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#1E293B] tracking-tight">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
                )}
              </div>
            )}
            {children}
          </div>
        </div>

        {/* Bottom subtle copyright / disclaimer */}
        <div className="relative z-20 px-6 sm:px-12 pb-5 sm:pb-6 flex items-center justify-between text-[11px] text-slate-400">
          <span>© 2026 UK Property Surveying Practice. All rights reserved.</span>
          <span className="hidden sm:inline">RICS Certified Platform</span>
        </div>
      </div>
    </div>
  );
};
