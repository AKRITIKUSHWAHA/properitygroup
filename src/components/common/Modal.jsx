import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'max-w-2xl',
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog / Bottom Sheet on Mobile */}
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${maxWidth} bg-white rounded-t-[28px] sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200 flex flex-col max-h-[92vh] sm:max-h-[90vh] my-0 sm:my-8`}
      >
        {/* Mobile touch drag handle */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center bg-[#F3F5F9]/60 shrink-0">
          <div className="w-10 h-1 bg-slate-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-5 sm:px-6 py-4 border-b border-slate-100 bg-[#F3F5F9]/60 shrink-0">
          <div className="pr-2 min-w-0">
            <h3 className="text-base sm:text-lg font-extrabold text-[#0B1F4D] tracking-tight truncate">
              {title}
            </h3>
            {subtitle && (
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-1 -mt-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {children}
        </div>

        {/* Fixed Footer for actions (with safe area inset on mobile) */}
        {footer && (
          <div className="px-5 sm:px-6 py-3.5 bg-slate-50/95 backdrop-blur border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0 pb-[max(0.875rem,env(safe-area-inset-bottom,0px))]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
