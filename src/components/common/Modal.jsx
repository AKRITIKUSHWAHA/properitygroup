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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Box */}
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${maxWidth} bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 my-8`}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100 bg-[#F3F5F9]/60">
          <div>
            <h3 className="text-lg font-extrabold text-[#0B1F4D] tracking-tight">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 -mr-1 -mt-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors focus:outline-none"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[72vh] overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
