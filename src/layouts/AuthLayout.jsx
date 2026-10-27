import React from 'react';
import { Building2, ShieldCheck, MapPin } from 'lucide-react';

export const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-[#F3F5F9] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-[#2563EB]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-[#0B1F4D]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main card wrapper */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#0B1F4D] flex items-center justify-center text-white shadow-xl shadow-[#0B1F4D]/30 border border-white/20 mb-3 group hover:scale-105 transition-transform">
            <Building2 className="w-8 h-8 text-[#2563EB] stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#0B1F4D] tracking-tight text-center">
            Property Group
          </h1>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Survey Management Platform (UK)
          </p>
        </div>

        {/* Content Box */}
        <div className="bg-white py-8 px-6 sm:px-10 shadow-2xl shadow-slate-300/60 rounded-3xl border border-slate-200/80 backdrop-blur-sm">
          {title && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
              {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
            </div>
          )}
          {children}
        </div>

        {/* Footer RICS compliance note */}
        <div className="mt-8 text-center text-xs text-slate-400 flex items-center justify-center gap-4">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            RICS Aligned Workflows
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            UK Property Surveying CRM
          </span>
        </div>
      </div>
    </div>
  );
};
