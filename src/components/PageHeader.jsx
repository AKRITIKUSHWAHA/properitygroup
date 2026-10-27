import React from 'react';
import { Calendar, ChevronRight } from 'lucide-react';

export const PageHeader = ({
  title,
  subtitle,
  breadcrumb = [],
  actionLabel,
  onAction,
  actionIcon: ActionIcon,
  badge,
}) => {
  const todayUK = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200/80 mb-6">
      <div>
        {/* Breadcrumb */}
        {breadcrumb.length > 0 && (
          <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5 font-medium">
            <span>Property Group CRM</span>
            {breadcrumb.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <ChevronRight className="w-3 h-3 text-slate-300" />
                <span className={idx === breadcrumb.length - 1 ? 'text-[#2563EB] font-semibold' : ''}>
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1F4D] tracking-tight">
            {title}
          </h1>
          {badge && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-[#2563EB] border border-blue-200">
              {badge}
            </span>
          )}
        </div>
        {subtitle && <p className="text-xs sm:text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200/90 text-xs font-semibold text-slate-600 shadow-xs">
          <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>{todayUK}</span>
        </div>

        {actionLabel && (
          <button
            onClick={onAction}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white text-xs sm:text-sm font-semibold shadow-md shadow-[#0B1F4D]/20 transition-all cursor-pointer"
          >
            {ActionIcon && <ActionIcon className="w-4 h-4" />}
            <span>{actionLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
};
