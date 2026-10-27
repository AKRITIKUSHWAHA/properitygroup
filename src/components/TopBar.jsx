import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  ChevronDown,
  User,
  KeyRound,
  LogOut,
  Calendar,
  Shield,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';

export const TopBar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format today's UK date
  const todayUK = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Left: Mobile Toggle & Search */}
      <div className="flex items-center gap-3 lg:gap-6 flex-1 max-w-xl">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-slate-600 hover:text-[#0B1F4D] hover:bg-slate-100 rounded-xl transition-colors"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search */}
        <div className="relative w-full max-w-md hidden sm:block">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
            <Search className="w-4 h-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search surveys, jobs, clients, UK postcodes... (Ctrl+K)"
            className="w-full pl-10 pr-4 py-2 text-xs md:text-sm bg-[#F3F5F9] border border-slate-200/90 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:border-[#2563EB] focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Right: Date, Notifications, User Menu */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* UK Date Chip */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/90 border border-slate-200 text-xs font-semibold text-slate-600">
          <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>{todayUK}</span>
        </div>

        {/* Notification Bell Dropdown */}
        <NotificationDropdown />

        {/* Vertical divider */}
        <div className="h-6 w-px bg-slate-200" />

        {/* User Avatar Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2.5 p-1 sm:px-2 sm:py-1.5 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 group"
            aria-label="User profile and menu"
          >
            <div className="relative">
              <img
                src={user?.avatar}
                alt={user?.name || 'User'}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover ring-2 ring-[#0B1F4D]/10 group-hover:ring-[#2563EB]/50 transition-all"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>

            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 leading-tight group-hover:text-[#2563EB] transition-colors truncate max-w-[140px]">
                {user?.name}
              </span>
              <span className="text-[10px] font-semibold text-slate-400 truncate max-w-[140px]">
                {user?.roleLabel}
              </span>
            </div>

            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform duration-200" />
          </button>

          {/* User Menu Dropdown Modal */}
          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-2xl border border-slate-200/90 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Header Info */}
              <div className="px-4 py-3 border-b border-slate-100 bg-[#F3F5F9]/60">
                <p className="text-sm font-bold text-[#0B1F4D] truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#0B1F4D] text-white">
                    <Shield className="w-3 h-3 text-[#C9D3E3]" />
                    {user?.roleLabel}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium truncate">
                    {user?.company}
                  </span>
                </div>
              </div>

              {/* Menu Links */}
              <div className="py-1">
                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    navigate('/profile');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-[#2563EB] transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  My Profile
                </button>

                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    navigate('/change-password');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-[#2563EB] transition-colors"
                >
                  <KeyRound className="w-4 h-4 text-slate-400" />
                  Change Password
                </button>
              </div>

              {/* Divider */}
              <div className="my-1 border-t border-slate-100" />

              {/* Logout Option */}
              <div className="px-1 py-1">
                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-xs sm:text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
