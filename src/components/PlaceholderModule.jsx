import React, { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  ArrowUpRight,
  PoundSterling,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { PageHeader } from './PageHeader';

export const PlaceholderModule = ({
  roleLabel,
  menuTitle,
  menuDescription,
  stats = [],
  columns = [],
  data = [],
  actionLabel = 'New Entry',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filteredData = data.filter((row) => {
    if (!searchTerm) return true;
    return Object.values(row).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={menuTitle}
        subtitle={menuDescription}
        breadcrumb={[roleLabel, menuTitle]}
        actionLabel={actionLabel}
        actionIcon={Plus}
        onAction={() => alert(`Action "${actionLabel}" triggered in ${menuTitle} module.`)}
      />

      {/* KPI Stats Grid */}
      {stats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{stat.label}</span>
                {stat.change && (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
                      stat.isPositive !== false
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    <ArrowUpRight className="w-3 h-3" />
                    {stat.change}
                  </span>
                )}
              </div>
              <div className="text-2xl font-black text-[#0B1F4D] mt-2 tracking-tight">
                {stat.value}
              </div>
              {stat.subtext && (
                <div className="text-[11px] text-slate-400 mt-1">{stat.subtext}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Main Table / Data Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Controls Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/50">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Search in ${menuTitle}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:border-[#2563EB]"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => alert('Filters opened')}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>Filters</span>
            </button>
            <button
              onClick={() => alert('Exporting data as CSV (UK Format)...')}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-600">
            <thead className="bg-[#F3F5F9]/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
              <tr>
                {columns.map((col, idx) => (
                  <th key={idx} className="py-3.5 px-4 sm:px-6">
                    {col.header}
                  </th>
                ))}
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.length > 0 ? (
                filteredData.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                  >
                    {columns.map((col, cIdx) => (
                      <td key={cIdx} className="py-3.5 px-4 sm:px-6 font-medium">
                        {col.render ? (
                          col.render(row[col.accessor], row)
                        ) : (
                          <span>{row[col.accessor]}</span>
                        )}
                      </td>
                    ))}
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <button
                        onClick={() => alert(`Inspecting record: ${JSON.stringify(row)}`)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 group-hover:bg-[#0B1F4D] text-slate-600 group-hover:text-white transition-colors text-xs font-semibold"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="text-center py-12 text-slate-400 font-medium"
                  >
                    No records found matching your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination summary */}
        <div className="px-6 py-3.5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-800">{filteredData.length}</strong> of{' '}
            <strong className="text-slate-800">{data.length}</strong> survey items
          </span>
          <span className="font-medium text-slate-400">UK CRM Data Registry</span>
        </div>
      </div>
    </div>
  );
};
