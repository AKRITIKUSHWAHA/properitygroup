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
      {/* Toast Render Container */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl border backdrop-blur-md transition-all duration-300 animate-in slide-in-from-top-3 fade-in ${
                isSuccess
                  ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-50 shadow-emerald-950/30'
                  : isError
                  ? 'bg-rose-950/90 border-rose-500/40 text-rose-50 shadow-rose-950/30'
                  : 'bg-[#0B1F4D]/95 border-blue-400/40 text-white shadow-[#0B1F4D]/40'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {isError && <AlertCircle className="w-5 h-5 text-rose-400" />}
                {!isSuccess && !isError && <Info className="w-5 h-5 text-blue-400" />}
              </div>
              <div className="flex-1 pr-2">
                {toast.title && <div className="text-sm font-semibold leading-tight">{toast.title}</div>}
                <div className="text-xs text-slate-200 mt-0.5 leading-relaxed">{toast.message}</div>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded-md -mr-1 -mt-1"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
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
