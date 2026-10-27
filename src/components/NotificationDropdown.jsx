import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, Clock, FileText, PoundSterling, ShieldAlert, Check } from 'lucide-react';

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    title: 'RICS Level 2 Survey Booked',
    desc: 'Property inspection scheduled for 18 Highfield Ave, Surrey GU2 7YZ',
    time: '27/10/2026, 14:30',
    read: false,
    type: 'booking',
    amount: '£650.00',
  },
  {
    id: 2,
    title: 'Terms & Conditions Signed',
    desc: 'Client Emma Watson digitally signed contract for quotation #KQ-9042',
    time: '27/10/2026, 11:15',
    read: false,
    type: 'terms',
  },
  {
    id: 3,
    title: 'Payment Received',
    desc: 'Full advance payment received for Building Survey (Commercial, Mayfair)',
    time: '26/10/2026, 16:40',
    read: true,
    type: 'payment',
    amount: '£1,450.00',
  },
  {
    id: 4,
    title: 'Survey Report Uploaded',
    desc: 'Chartered Surveyor David Thorne uploaded preliminary defect schedule',
    time: '25/10/2026, 09:20',
    read: true,
    type: 'report',
  },
];

export const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

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

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markSingle = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

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
            {unreadCount}
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
                className="text-xs text-[#C9D3E3] hover:text-white flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="divide-y divide-slate-100 max-h-[360px] overflow-y-auto">
            {notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => markSingle(item.id)}
                className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer hover:bg-slate-50 ${
                  !item.read ? 'bg-blue-50/60' : 'bg-white'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    item.type === 'payment'
                      ? 'bg-emerald-100 text-emerald-700'
                      : item.type === 'booking'
                      ? 'bg-blue-100 text-blue-700'
                      : item.type === 'terms'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-purple-100 text-purple-700'
                  }`}
                >
                  {item.type === 'payment' && <PoundSterling className="w-4 h-4" />}
                  {item.type === 'booking' && <Clock className="w-4 h-4" />}
                  {item.type === 'terms' && <FileText className="w-4 h-4" />}
                  {item.type === 'report' && <FileText className="w-4 h-4" />}
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
                    <span className="text-[10px] text-slate-400 shrink-0">{item.time}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-snug line-clamp-2">
                    {item.desc}
                  </p>
                  {item.amount && (
                    <span className="inline-block mt-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      Amount: {item.amount}
                    </span>
                  )}
                </div>

                {!item.read && (
                  <span className="w-2 h-2 rounded-full bg-[#2563EB] shrink-0 mt-1.5" />
                )}
              </div>
            ))}
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
