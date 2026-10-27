import React, { useState } from 'react';
import { Calendar, TrendingUp } from 'lucide-react';

const MONTHLY_DATA = [
  { month: 'Jan', bookings: 98, revenue: '£168,200' },
  { month: 'Feb', bookings: 112, revenue: '£194,500' },
  { month: 'Mar', bookings: 135, revenue: '£238,900' },
  { month: 'Apr', bookings: 124, revenue: '£215,400' },
  { month: 'May', bookings: 148, revenue: '£258,200' },
  { month: 'Jun', bookings: 162, revenue: '£282,100' },
  { month: 'Jul', bookings: 154, revenue: '£269,800' },
  { month: 'Aug', bookings: 142, revenue: '£245,600' },
  { month: 'Sep', bookings: 168, revenue: '£291,400' },
  { month: 'Oct', bookings: 176, revenue: '£298,430' },
];

export const BookingsTrendChart = () => {
  const [activePoint, setActivePoint] = useState(MONTHLY_DATA[MONTHLY_DATA.length - 1]);
  const [hoverIndex, setHoverIndex] = useState(MONTHLY_DATA.length - 1);

  // SVG dimensions
  const width = 640;
  const height = 220;
  const paddingX = 40;
  const paddingTop = 25;
  const paddingBottom = 35;

  const maxVal = 200;
  const minVal = 60;

  const points = MONTHLY_DATA.map((d, i) => {
    const x = paddingX + (i / (MONTHLY_DATA.length - 1)) * (width - paddingX * 2);
    const y = paddingTop + (1 - (d.bookings - minVal) / (maxVal - minVal)) * (height - paddingTop - paddingBottom);
    return { x, y, ...d };
  });

  // Generate SVG path for line
  const linePath = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  // Generate SVG path for gradient area
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[#0B1F4D]">
              Survey Bookings Trend (2026)
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              +12.4% MoM
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Monthly on-site property inspections booked across England & Wales.
          </p>
        </div>

        {/* Selected Month Metric Card */}
        {activePoint && (
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 px-3.5 py-1.5 rounded-xl self-start sm:self-auto">
            <div className="text-right">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {activePoint.month} 2026
              </div>
              <div className="text-xs font-bold text-slate-600">
                Revenue: <span className="text-[#0B1F4D]">{activePoint.revenue}</span>
              </div>
            </div>
            <div className="h-7 w-px bg-slate-200" />
            <div className="text-lg font-black text-[#2563EB]">
              {activePoint.bookings}{' '}
              <span className="text-[10px] font-normal text-slate-500">jobs</span>
            </div>
          </div>
        )}
      </div>

      {/* SVG Chart */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-48 sm:h-56 overflow-visible select-none"
        >
          <defs>
            <linearGradient id="bookingGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
              <stop offset="85%" stopColor="#2563EB" stopOpacity="0.0" />
            </linearGradient>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#2563EB" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Horizontal Grid lines */}
          {[80, 120, 160, 200].map((val) => {
            const y = paddingTop + (1 - (val - minVal) / (maxVal - minVal)) * (height - paddingTop - paddingBottom);
            return (
              <g key={val}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="9"
                  fill="#94A3B8"
                  fontWeight="600"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <path d={areaPath} fill="url(#bookingGradient)" />

          {/* Main stroke line */}
          <path
            d={linePath}
            fill="none"
            stroke="#2563EB"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#shadow)"
          />

          {/* Interactive Data Points */}
          {points.map((p, idx) => {
            const isHovered = hoverIndex === idx;
            return (
              <g
                key={idx}
                className="cursor-pointer transition-transform"
                onMouseEnter={() => {
                  setHoverIndex(idx);
                  setActivePoint(p);
                }}
              >
                {/* Invisible larger hover target */}
                <circle cx={p.x} cy={p.y} r="14" fill="transparent" />

                {/* Outer ring on active */}
                {isHovered && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="8"
                    fill="#2563EB"
                    fillOpacity="0.2"
                    className="animate-ping"
                  />
                )}

                {/* Point dot */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? '6' : '4'}
                  fill={isHovered ? '#0B1F4D' : '#2563EB'}
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                />

                {/* Month label */}
                <text
                  x={p.x}
                  y={height - 10}
                  textAnchor="middle"
                  fontSize="10"
                  fill={isHovered ? '#0B1F4D' : '#64748B'}
                  fontWeight={isHovered ? '700' : '500'}
                >
                  {p.month}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Footer Summary Strip */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5 font-medium">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          YTD Total: <strong className="text-slate-800">1,419 Surveys Booked</strong>
        </span>
        <span className="text-slate-400">Peak month: Oct (176 bookings)</span>
      </div>
    </div>
  );
};
