import React from 'react';

export const Tabs = ({
  tabs = [],
  activeTab,
  onChange,
  variant = 'pills', // 'pills' | 'underline'
}) => {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200/80">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const count = tab.count !== undefined ? tab.count : null;

        if (variant === 'underline') {
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold transition-all relative border-b-2 -mb-px whitespace-nowrap ${
                isActive
                  ? 'border-[#2563EB] text-[#0B1F4D]'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <span>{tab.label}</span>
              {count !== null && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-[#2563EB]'
                      : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        }

        // Default: Sleek segmented pills
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap mb-1.5 ${
              isActive
                ? 'bg-[#0B1F4D] text-white shadow-md shadow-[#0B1F4D]/20'
                : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
            }`}
          >
            <span>{tab.label}</span>
            {count !== null && (
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
