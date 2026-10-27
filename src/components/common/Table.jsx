import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
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
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
      {/* Table Container */}
      <div className="overflow-x-auto min-w-full">
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
          <table className="w-full text-left text-xs sm:text-sm text-slate-600">
            <thead className="bg-[#F3F5F9]/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] tracking-wider select-none">
              <tr>
                {columns.map((col, idx) => {
                  const isSortable = col.sortable !== false && col.key;
                  const isSorted = sortKey === col.key;

                  return (
                    <th
                      key={col.key || idx}
                      onClick={() => isSortable && handleSort(col.key)}
                      className={`py-3.5 px-4 sm:px-6 ${
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
                              <ChevronsUpDown className="w-3 h-3 text-slate-300" />
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
              {paginatedData.map((row, index) => {
                const key = keyExtractor(row, index);
                return (
                  <tr
                    key={key}
                    className="hover:bg-blue-50/40 transition-colors group"
                  >
                    {columns.map((col, cIdx) => (
                      <td
                        key={col.key || cIdx}
                        className={`py-3.5 px-4 sm:px-6 align-middle font-medium ${
                          col.className || ''
                        }`}
                      >
                        {col.render ? col.render(row[col.key], row, index) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Footer */}
      {!isLoading && sortedData.length > 0 && (
        <div className="px-4 sm:px-6 py-3.5 bg-slate-50/60 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing{' '}
            <strong className="text-slate-800">
              {(effectivePage - 1) * pageSize + 1}
            </strong>{' '}
            to{' '}
            <strong className="text-slate-800">
              {Math.min(effectivePage * pageSize, sortedData.length)}
            </strong>{' '}
            of <strong className="text-slate-800">{sortedData.length}</strong> items
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={effectivePage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-2 text-xs font-semibold text-slate-700">
              Page {effectivePage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={effectivePage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
