import React from 'react';

export const Skeleton = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-slate-200/80 rounded-md ${className}`} />
  );
};

export const TableSkeleton = ({ rows = 5, cols = 6 }) => {
  return (
    <div className="w-full animate-pulse">
      {/* Header skeleton */}
      <div className="bg-slate-100 py-3.5 px-6 border-b border-slate-200 flex items-center gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 bg-slate-200 rounded flex-1" />
        ))}
      </div>
      {/* Rows skeleton */}
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="py-4 px-6 flex items-center gap-4">
            {Array.from({ length: cols }).map((_, cIdx) => (
              <div
                key={cIdx}
                className="h-3.5 bg-slate-100 rounded flex-1"
                style={{ width: `${Math.floor(60 + (cIdx * 7) % 40)}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const CardSkeleton = () => {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs animate-pulse space-y-3">
      <div className="flex justify-between items-center">
        <div className="h-3 bg-slate-200 rounded w-1/3" />
        <div className="w-8 h-8 bg-slate-200 rounded-xl" />
      </div>
      <div className="h-7 bg-slate-200 rounded w-1/2" />
      <div className="h-3 bg-slate-100 rounded w-2/3" />
    </div>
  );
};
