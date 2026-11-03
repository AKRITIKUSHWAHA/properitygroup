import React, { useState } from 'react';
import { PieChart } from 'lucide-react';

const STATUS_DATA = [
  { label: 'Completed', count: 92, color: '#059669', bg: 'bg-emerald-500' },
  { label: 'Scheduled', count: 38, color: '#0284C7', bg: 'bg-sky-500' },
  { label: 'In Progress', count: 24, color: '#2563EB', bg: 'bg-blue-600' },
  { label: 'On Hold', count: 14, color: '#64748B', bg: 'bg-slate-500' },
  { label: 'Cancelled', count: 8, color: '#E11D48', bg: 'bg-rose-500' },
];

export const JobsStatusDonutChart = () => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const total = STATUS_DATA.reduce((sum, item) => sum + item.count, 0);

  // SVG parameters
  const size = 180;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
      {/* Header */}
      <div className="mb-3">
        <h3 className="text-base font-bold text-[#0B1F4D] flex items-center gap-2">
          Jobs by Status
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Breakdown of current {total} survey instructions.
        </p>
      </div>

      {/* Donut Container */}
      <div className="flex flex-col items-center justify-center gap-4 my-2">
        {/* SVG Donut */}
        <div className="relative shrink-0 flex items-center justify-center">
          <svg width={size} height={size} className="transform -rotate-90">
            {STATUS_DATA.map((item, idx) => {
              const percent = item.count / total;
              const strokeDasharray = `${circumference * percent} ${circumference * (1 - percent)}`;
              const strokeDashoffset = -circumference * accumulatedPercent;
              accumulatedPercent += percent;

              const isHovered = hoveredIdx === idx;

              return (
                <circle
                  key={item.label}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              );
            })}
          </svg>

          {/* Donut Center Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            {hoveredIdx !== null ? (
              <>
                <span className="text-2xl font-black text-[#0B1F4D] leading-none">
                  {STATUS_DATA[hoveredIdx].count}
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1 truncate max-w-[90px]">
                  {STATUS_DATA[hoveredIdx].label}
                </span>
                <span className="text-[10px] font-bold text-[#2563EB]">
                  {((STATUS_DATA[hoveredIdx].count / total) * 100).toFixed(1)}%
                </span>
              </>
            ) : (
              <>
                <span className="text-2xl font-black text-[#0B1F4D] leading-none">
                  {total}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                  Active Jobs
                </span>
              </>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-1.5 w-full sm:w-auto">
          {STATUS_DATA.map((item, idx) => {
            const percent = ((item.count / total) * 100).toFixed(1);
            const isHovered = hoveredIdx === idx;

            return (
              <div
                key={item.label}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className={`flex items-center justify-between gap-4 px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                  isHovered ? 'bg-slate-100/90 shadow-2xs font-semibold' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${item.bg}`} />
                  <span className="text-xs text-slate-700">{item.label}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="font-bold text-slate-900">{item.count}</span>
                  <span className="text-[11px] text-slate-400 font-sans w-10 text-right">
                    {percent}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span>Completion Rate: <strong className="text-emerald-700">52.3%</strong></span>
        <span>Lead SLA: <strong className="text-slate-800">48h RICS Delivery</strong></span>
      </div>
    </div>
  );
};
