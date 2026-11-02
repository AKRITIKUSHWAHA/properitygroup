import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 7);
    const newToast = { id, type, title, message };
    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast Render Container: Bottom-center on mobile (above bottom bar), top-right on desktop */}
      <div className="fixed bottom-20 md:bottom-auto md:top-5 left-3 right-3 md:left-auto md:right-5 z-50 flex flex-col gap-2 max-w-sm w-auto sm:w-full mx-auto md:mx-0 pointer-events-none pb-[env(safe-area-inset-bottom,0px)]">
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-2.5 p-3.5 rounded-2xl shadow-xl border backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-2 md:slide-in-from-top-2 fade-in ${
                isSuccess
                  ? 'bg-emerald-950/95 border-emerald-500/40 text-emerald-50 shadow-emerald-950/30'
                  : isError
                  ? 'bg-rose-950/95 border-rose-500/40 text-rose-50 shadow-rose-950/30'
                  : 'bg-[#0B1F4D]/95 border-blue-400/40 text-white shadow-[#0B1F4D]/40'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                {isError && <AlertCircle className="w-4 h-4 text-rose-400" />}
                {!isSuccess && !isError && <Info className="w-4 h-4 text-blue-400" />}
              </div>
              <div className="flex-1 pr-1 min-w-0">
                {toast.title && <div className="text-xs font-bold leading-tight">{toast.title}</div>}
                <div className="text-[11px] text-slate-200 mt-0.5 leading-relaxed">{toast.message}</div>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded-md min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
                aria-label="Close notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
