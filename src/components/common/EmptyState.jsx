import React from 'react';
import { Search, Plus } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Search,
  title = 'No records found',
  message = 'Try adjusting your search queries or active filters to find what you are looking for.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-4 border border-slate-200 shadow-xs">
        <Icon className="w-7 h-7 stroke-[1.8]" />
      </div>
      <h4 className="text-base font-bold text-[#0B1F4D] tracking-tight">
        {title}
      </h4>
      <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-1 leading-relaxed">
        {message}
      </p>
      {actionLabel && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-[#0B1F4D]/20"
        >
          <Plus className="w-4 h-4" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};
