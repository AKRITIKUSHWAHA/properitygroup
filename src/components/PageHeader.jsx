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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-slate-300/80 mb-4 sm:mb-6">
      <div className="min-w-0 flex-1">
        {/* Breadcrumb (horizontally scrollable on small mobile) */}
        {breadcrumb.length > 0 && (
          <nav className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1 font-medium overflow-x-auto scrollbar-none whitespace-nowrap">
            <span>UK Property Surveying Practice</span>
            {breadcrumb.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                <span className={idx === breadcrumb.length - 1 ? 'text-[#2563EB] font-bold' : ''}>
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </nav>
        )}

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <h1 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-[#0B1F4D] tracking-tight">
            {title}
          </h1>
          {badge && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-blue-100 text-[#2563EB] border border-blue-200 shrink-0">
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5 sm:mt-1 max-w-3xl leading-relaxed font-medium">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0 w-full sm:w-auto">
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-300/80 text-xs font-semibold text-slate-700 shadow-2xs">
          <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>{todayUK}</span>
        </div>

        {actionLabel && (
          <button
            onClick={onAction}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#0B1F4D]/20 transition-all min-h-[44px] cursor-pointer"
          >
            {ActionIcon && <ActionIcon className="w-4 h-4 shrink-0" />}
            <span>{ActionIcon ? actionLabel.replace(/^\+\s*/, '') : actionLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
};
