import React, { useRef, useEffect } from 'react';

export const Tabs = ({
  tabs = [],
  activeTab,
  onChange,
  variant = 'pills', // 'pills' | 'underline'
}) => {
  const containerRef = useRef(null);
  const activeTabRef = useRef(null);

  // Auto-scroll active tab into view smoothly
  useEffect(() => {
    if (activeTabRef.current && containerRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [activeTab]);

  return (
    <div className="relative w-full">
      {/* Left Fade Edge */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-[#D5DAE2] to-transparent z-10 md:hidden" />

      {/* Horizontally scrollable container with snap */}
      <div
        ref={containerRef}
        className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory border-b border-slate-200/80 px-1"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const count = tab.count !== undefined ? tab.count : null;

          if (variant === 'underline') {
            return (
              <button
                key={tab.id}
                ref={isActive ? activeTabRef : null}
                onClick={() => onChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-3 text-xs sm:text-sm font-semibold transition-all relative border-b-2 -mb-px whitespace-nowrap min-h-[44px] snap-center shrink-0 cursor-pointer ${
                  isActive
                    ? 'border-[#2563EB] text-[#0B1F4D] font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <span>{tab.label}</span>
                {count !== null && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-[#2563EB]'
                        : 'bg-slate-100 text-slate-500'
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
              ref={isActive ? activeTabRef : null}
              onClick={() => onChange(tab.id)}
              className={`flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap mb-1.5 min-h-[44px] snap-center shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-[#0B1F4D] text-white shadow-md shadow-[#0B1F4D]/20 font-bold'
                  : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
              }`}
            >
              <span>{tab.label}</span>
              {count !== null && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
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

      {/* Right Fade Edge */}
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-[#D5DAE2] to-transparent z-10 md:hidden" />
    </div>
  );
};
