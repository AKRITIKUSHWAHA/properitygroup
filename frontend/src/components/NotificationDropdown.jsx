import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Clock, FileText, PoundSterling, ShieldAlert, Check, Loader2, MessageSquare } from 'lucide-react';
import { apiRequest } from '../api/apiClient';
import { useAuth } from '../auth/AuthContext';

/**
 * Robust notification time formatter converting UTC / database timestamps
 * into the client browser's exact localized time and relative context.
 */
export const formatNotificationTime = (item) => {
  if (!item) return '';

  let dateObj = null;

  // 1. Try ISO string from item.createdAt
  if (item.createdAt) {
    const parsed = new Date(item.createdAt);
    if (!isNaN(parsed.getTime())) {
      dateObj = parsed;
    }
  }

  // 2. Try timestamp property
  if (!dateObj && item.timestamp) {
    const parsed = new Date(item.timestamp);
    if (!isNaN(parsed.getTime())) {
      dateObj = parsed;
    }
  }

  // 3. Fallback: Parse string in format "DD/MM/YYYY, HH:mm" (which server formatted in UTC)
  if (!dateObj && typeof item.time === 'string') {
    const match = item.time.match(/(\d{1,2})\/(\d{1,2})\/(\d{4}),?\s+(\d{1,2}):(\d{2})/);
    if (match) {
      const [, d, m, y, h, min] = match;
      const utc = new Date(Date.UTC(+y, +m - 1, +d, +h, +min));
      if (!isNaN(utc.getTime())) {
        dateObj = utc;
      }
    } else {
      const parsed = new Date(item.time);
      if (!isNaN(parsed.getTime())) {
        dateObj = parsed;
      }
    }
  }

  if (!dateObj) {
    return item.time || '';
  }

  // Format in user's browser local time
  const localDate = dateObj.toLocaleDateString('en-GB');
  const localTime = dateObj.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `${localDate}, ${localTime}`;
};

export const getNotificationTimeTooltip = (item) => {
  if (!item) return '';
  let dateObj = null;
  if (item.createdAt) {
    const p = new Date(item.createdAt);
    if (!isNaN(p.getTime())) dateObj = p;
  }
  if (!dateObj && typeof item.time === 'string') {
    const match = item.time.match(/(\d{1,2})\/(\d{1,2})\/(\d{4}),?\s+(\d{1,2}):(\d{2})/);
    if (match) {
      const [, d, m, y, h, min] = match;
      const utc = new Date(Date.UTC(+y, +m - 1, +d, +h, +min));
      if (!isNaN(utc.getTime())) dateObj = utc;
    }
  }
  if (!dateObj) return item.time || '';

  const now = new Date();
  const diffSec = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHour / 24);

  let relative = 'Just now';
  if (diffSec < 45) {
    relative = 'Just now';
  } else if (diffMin < 60) {
    relative = `${diffMin}m ago`;
  } else if (diffHour < 24) {
    relative = `${diffHour}h ago`;
  } else if (diffDays === 1) {
    relative = 'Yesterday';
  } else if (diffDays > 1) {
    relative = `${diffDays} days ago`;
  }

  const localDate = dateObj.toLocaleDateString('en-GB');
  const localTime = dateObj.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `${relative} • ${localDate}, ${localTime}`;
};

export const NotificationDropdown = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const dropdownRef = useRef(null);

  // Fetch role-based notifications from backend API
  const fetchNotifications = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await apiRequest('/notifications');
      let notifs = res?.notifications || res?.data?.notifications || (Array.isArray(res) ? res : []);
      
      // Merge with locally stored read flags
      try {
        const readSet = new Set(JSON.parse(localStorage.getItem('njs_read_notifs') || '[]'));
        notifs = notifs.map((n) => ({
          ...n,
          read: n.read || readSet.has(String(n.id)),
        }));
      } catch {}

      setNotifications(notifs);
    } catch (err) {
      console.warn('Could not load notifications from API:', err?.message || err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [user?.role]);

  // Fetch notifications on mount & periodically when document is visible
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchNotifications(true);
      }
    }, 45000);
    return () => clearInterval(interval);
  }, [fetchNotifications, user?.id]);

  // Listen for instant message notifications & instant lifecycle action events dispatched anywhere
  useEffect(() => {
    const handleNewMessage = () => {
      fetchNotifications(true);
    };
    const handleNewAction = (event) => {
      if (event?.detail) {
        setNotifications((prev) => {
          const detail = event.detail;
          const exists = prev.some((n) => n.id === detail.id || (n.title === detail.title && n.desc === detail.desc));
          if (exists) return prev;
          return [detail, ...prev];
        });
      } else {
        fetchNotifications(true);
      }
    };

    window.addEventListener('njs_new_message_notification', handleNewMessage);
    window.addEventListener('njs_new_action_notification', handleNewAction);
    return () => {
      window.removeEventListener('njs_new_message_notification', handleNewMessage);
      window.removeEventListener('njs_new_action_notification', handleNewAction);
    };
  }, [fetchNotifications]);

  // Refetch when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications(true);
    }
  }, [isOpen, fetchNotifications]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const isSurveyor = (user?.role || '').toLowerCase() === 'surveyor';

  // Strict Privacy Shield: Hide payments, receipts, invoices, and terms signatures from surveyors
  const visibleNotifications = notifications.filter((item) => {
    if (!isSurveyor) return true;
    if (item.type === 'payment') return false;
    if (item.amount) return false;
    const title = (item.title || '').toLowerCase();
    const desc = (item.desc || '').toLowerCase();
    if (
      title.includes('payment') ||
      desc.includes('payment') ||
      title.includes('invoice') ||
      desc.includes('invoice') ||
      title.includes('paid') ||
      title.includes('£') ||
      desc.includes('£')
    ) {
      return false;
    }
    if (
      (title.includes('terms') || title.includes('contract')) &&
      (title.includes('signed') || desc.includes('signed'))
    ) {
      return false;
    }
    return true;
  });

  const unreadCount = visibleNotifications.filter((n) => !n.read).length;

  const markAllAsRead = async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      try {
        const readSet = new Set(JSON.parse(localStorage.getItem('njs_read_notifs') || '[]'));
        visibleNotifications.forEach((n) => readSet.add(String(n.id)));
        localStorage.setItem('njs_read_notifs', JSON.stringify(Array.from(readSet)));
      } catch {}
      await apiRequest('/notifications/mark-all-read', { method: 'PATCH' });
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const markSingle = async (id, link) => {
    try {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      try {
        const readSet = new Set(JSON.parse(localStorage.getItem('njs_read_notifs') || '[]'));
        readSet.add(String(id));
        localStorage.setItem('njs_read_notifs', JSON.stringify(Array.from(readSet)));
      } catch {}
      if (typeof id === 'number' || (typeof id === 'string' && (id.startsWith('msg-') || id.startsWith('live-')))) {
        await apiRequest(`/notifications/${id}/read`, { method: 'PATCH' }).catch(() => {});
      }
      if (link) {
        navigate(link);
        setIsOpen(false);
      }
    } catch (err) {
      console.error('Error toggling notification read status:', err);
      if (link) {
        navigate(link);
        setIsOpen(false);
      }
    }
  };

  // Filter based on active category pill
  const filteredNotifications = visibleNotifications.filter((item) => {
    if (activeFilter === 'all') return true;
    const type = (item.type || '').toLowerCase();
    const isMsg = type === 'message';
    const isPay = type === 'payment';
    const isBook = type === 'booking' || type === 'inspection';
    const isTerms = type === 'terms';
    const isQuote = type === 'quote' || type === 'enquiry';
    const isRep = type === 'report';

    if (activeFilter === 'surveys') return isBook || isRep;
    if (activeFilter === 'finance') return isQuote || isTerms || isPay;
    if (activeFilter === 'messages') return isMsg;
    return true;
  });

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl text-slate-600 hover:text-[#0B1F4D] hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40"
        aria-label="View notifications"
      >
        <Bell className="w-5 h-5 text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-200/80 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#0B1F4D] text-white">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-blue-500 text-white">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-[#C9D3E3] hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* Category Filter Switcher */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50/90 border-b border-slate-100 text-[11px] font-semibold overflow-x-auto">
            {[
              { id: 'all', label: `All (${visibleNotifications.length})` },
              { id: 'surveys', label: 'Surveys & Rota' },
              { id: 'finance', label: 'Quotes & Billing' },
              { id: 'messages', label: 'Messages' },
            ].map((tab) => {
              const isTabActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    isTabActive
                      ? 'bg-[#0B1F4D] text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Notifications List */}
          <div className="divide-y divide-slate-100 max-h-[360px] overflow-y-auto">
            {isLoading && visibleNotifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="text-xs font-medium">Checking live notifications...</span>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Check className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-600">No notifications in this view</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Switch category or wait for new live events.</p>
              </div>
            ) : (
              filteredNotifications.map((item) => {
                const type = (item.type || '').toLowerCase();
                const isMsg = type === 'message';
                const isPay = type === 'payment';
                const isBook = type === 'booking' || type === 'inspection';
                const isTerms = type === 'terms';
                const isQuote = type === 'quote' || type === 'enquiry';
                const isRep = type === 'report';

                return (
                  <div
                    key={item.id}
                    onClick={() => markSingle(item.id, item.link)}
                    className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer hover:bg-slate-50 ${
                      !item.read ? 'bg-blue-50/60' : 'bg-white'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isMsg
                          ? 'bg-blue-100 text-blue-700'
                          : isPay
                          ? 'bg-emerald-100 text-emerald-700'
                          : isBook
                          ? 'bg-blue-100 text-blue-700'
                          : isTerms
                          ? 'bg-amber-100 text-amber-700'
                          : isQuote
                          ? 'bg-indigo-100 text-indigo-700'
                          : isRep
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {isMsg && <MessageSquare className="w-4 h-4" />}
                      {isPay && <PoundSterling className="w-4 h-4" />}
                      {isBook && <Clock className="w-4 h-4" />}
                      {isTerms && <FileText className="w-4 h-4" />}
                      {isQuote && <FileText className="w-4 h-4" />}
                      {isRep && <FileText className="w-4 h-4" />}
                      {!isMsg && !isPay && !isBook && !isTerms && !isQuote && !isRep && (
                        <Bell className="w-4 h-4" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p
                          className={`text-xs font-semibold truncate ${
                            !item.read ? 'text-[#0B1F4D]' : 'text-slate-700'
                          }`}
                        >
                          {item.title}
                        </p>
                        <span
                          className="text-[10px] text-slate-400 shrink-0 font-medium select-none"
                          title={getNotificationTimeTooltip(item)}
                        >
                          {formatNotificationTime(item)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 leading-snug line-clamp-2">
                        {item.desc}
                      </p>
                      {!isSurveyor && item.amount && (
                        <span className="inline-block mt-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          Amount: {typeof item.amount === 'number' ? `£${item.amount.toLocaleString('en-GB', { minimumFractionDigits: 2 })}` : item.amount}
                        </span>
                      )}
                    </div>

                    {!item.read && (
                      <span className="w-2 h-2 rounded-full bg-[#2563EB] shrink-0 mt-1.5" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-500 font-medium">
              Real-time Survey & RICS Compliance Alerts
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
