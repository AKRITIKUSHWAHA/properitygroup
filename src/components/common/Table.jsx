import React, { useState, useMemo } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronDown as ExpandIcon,
  Eye,
} from 'lucide-react';
import { TableSkeleton } from './LoadingSkeleton';
import { EmptyState } from './EmptyState';

export const Table = ({
  columns = [],
  data = [],
  isLoading = false,
  emptyTitle,
  emptyMessage,
  emptyIcon,
  onEmptyAction,
  emptyActionLabel,
  pageSize = 10,
  initialSortKey = null,
  initialSortDir = 'asc',
  keyExtractor = (item, index) => item.id || index,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState(initialSortKey);
  const [sortDir, setSortDir] = useState(initialSortDir);
  const [expandedRows, setExpandedRows] = useState({});

  // Toggle card row expansion on mobile
  const toggleRowExpand = (id) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];

      if (valA === valB) return 0;
      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      const compare = String(valA).localeCompare(String(valB), undefined, {
        numeric: true,
        sensitivity: 'base',
      });
      return sortDir === 'asc' ? compare : -compare;
    });
  }, [data, sortKey, sortDir]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const effectivePage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    const start = (effectivePage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, effectivePage, pageSize]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col w-full min-h-[360px]">
      {isLoading ? (
        <TableSkeleton rows={pageSize > 5 ? 5 : pageSize} cols={columns.length} />
      ) : paginatedData.length === 0 ? (
        <EmptyState
          icon={emptyIcon}
          title={emptyTitle}
          message={emptyMessage}
          actionLabel={emptyActionLabel}
          onAction={onEmptyAction}
        />
      ) : (
        <>
          {/* ========================================================= */}
          {/* MOBILE VIEW (< md): Responsive Stacked Cards (NO SIDEWAYS SCROLL) */}
          {/* ========================================================= */}
          <div className="md:hidden divide-y divide-slate-100">
            {paginatedData.map((row, rowIdx) => {
              const rowKey = keyExtractor(row, rowIdx);
              const isExpanded = !!expandedRows[rowKey];

              // Pick the primary columns: 1st (Identifier), 2nd (Subject/Customer), 3rd (Status/Amount)
              const firstCol = columns[0];
              const secondCol = columns[1];
              const statusCol = columns.find(
                (c) =>
                  c.key?.toLowerCase().includes('status') ||
                  c.header?.toLowerCase().includes('status')
              );
              const actionCol = columns.find(
                (c) =>
                  c.key === 'actions' ||
                  c.header?.toLowerCase().includes('action')
              );

              return (
                <div key={rowKey} className="p-3.5 space-y-2.5 bg-white hover:bg-slate-50/60 transition-colors">
                  {/* Card Header: Primary identifier + Status & Actions */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      {firstCol && (
                        <div className="font-mono text-xs font-bold text-[#0B1F4D]">
                          {firstCol.render ? firstCol.render(row[firstCol.key], row) : row[firstCol.key]}
                        </div>
                      )}
                      {secondCol && (
                        <div className="text-xs font-bold text-slate-800 mt-0.5 truncate">
                          {secondCol.render ? secondCol.render(row[secondCol.key], row) : row[secondCol.key]}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {statusCol && (
                        <div>
                          {statusCol.render ? statusCol.render(row[statusCol.key], row) : row[statusCol.key]}
                        </div>
                      )}
                      {actionCol && (
                        <div>
                          {actionCol.render ? actionCol.render(row[actionCol.key], row) : null}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 2 Key Attributes Preview */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-100/80">
                    {columns.slice(2, 4).map((col, idx) => (
                      <div key={col.key || idx} className="truncate">
                        <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                          {col.header}
                        </span>
                        <div className="font-medium text-slate-700 truncate mt-0.5">
                          {col.render ? col.render(row[col.key], row) : row[col.key] || '—'}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Expandable Details Section */}
                  {isExpanded && (
                    <div className="pt-2 border-t border-slate-100 space-y-2 text-xs animate-in fade-in duration-150">
                      {columns.slice(4).map((col, idx) => {
                        if (col === actionCol) return null;
                        return (
                          <div key={col.key || idx} className="flex items-center justify-between gap-2 py-0.5">
                            <span className="text-slate-400 text-[11px] font-semibold">
                              {col.header}:
                            </span>
                            <span className="text-slate-800 font-medium text-right truncate max-w-[200px]">
                              {col.render ? col.render(row[col.key], row) : row[col.key] || '—'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Accordion Expand / Collapse Toggle button */}
                  <button
                    type="button"
                    onClick={() => toggleRowExpand(rowKey)}
                    className="w-full mt-1 py-1.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors min-h-[40px] cursor-pointer"
                  >
                    <span>{isExpanded ? 'Hide Details' : 'View Full Details'}</span>
                    <ExpandIcon className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* ========================================================= */}
          {/* DESKTOP VIEW (md+): Responsive Sticky Header Table */}
          {/* ========================================================= */}
          <div className="hidden md:block overflow-x-auto min-w-full">
            <table className="w-full table-fixed text-left text-xs sm:text-sm text-slate-600">
              <thead className="bg-slate-100/90 sticky top-0 z-10 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] tracking-wider select-none backdrop-blur-xs">
                <tr>
                  {columns.map((col, idx) => {
                    const isSortable = col.sortable !== false && col.key;
                    const isSorted = sortKey === col.key;

                    return (
                      <th
                        key={col.key || idx}
                        onClick={() => isSortable && handleSort(col.key)}
                        className={`py-3 px-3 sm:px-3.5 lg:px-4 ${col.className || ''} ${
                          isSortable ? 'cursor-pointer hover:bg-slate-200/60 transition-colors' : ''
                        } ${col.headerClassName || ''}`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{col.header}</span>
                          {isSortable && (
                            <span className="text-slate-400">
                              {isSorted ? (
                                sortDir === 'asc' ? (
                                  <ChevronUp className="w-3.5 h-3.5 text-[#2563EB]" />
                                ) : (
                                  <ChevronDown className="w-3.5 h-3.5 text-[#2563EB]" />
                                )
                              ) : (
                                <ChevronsUpDown className="w-3.5 h-3.5 opacity-50" />
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedData.map((row, rowIdx) => {
                  const rowKey = keyExtractor(row, rowIdx);
                  return (
                    <tr
                      key={rowKey}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {columns.map((col, colIdx) => {
                        const val = col.key ? row[col.key] : null;
                        return (
                          <td
                            key={col.key || colIdx}
                            className={`py-3 px-3 sm:px-3.5 lg:px-4 text-xs text-slate-700 ${col.className || ''}`}
                          >
                            {col.render ? col.render(val, row) : val}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ========================================================= */}
      {/* PAGINATION: Compact on mobile, full on desktop */}
      {/* ========================================================= */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="text-center sm:text-left">
            Showing <strong className="text-slate-800">{(effectivePage - 1) * pageSize + 1}</strong> to{' '}
            <strong className="text-slate-800">
              {Math.min(effectivePage * pageSize, sortedData.length)}
            </strong> of <strong className="text-slate-800">{sortedData.length}</strong> entries
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={effectivePage === 1}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-700 font-semibold min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4 mr-0 sm:mr-1" />
              <span className="hidden sm:inline">Prev</span>
            </button>

            {/* Mobile compact indicator */}
            <span className="sm:hidden px-3 py-1 text-xs font-bold text-slate-700">
              {effectivePage} / {totalPages}
            </span>

            {/* Desktop page pills */}
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(Math.max(0, effectivePage - 3), effectivePage + 2)
                .map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`min-w-[36px] h-9 rounded-xl text-xs font-bold transition-all min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer ${
                      page === effectivePage
                        ? 'bg-[#0B1F4D] text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={effectivePage === totalPages}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-700 font-semibold min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              aria-label="Next page"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4 ml-0 sm:ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
