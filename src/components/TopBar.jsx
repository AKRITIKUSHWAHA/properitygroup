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
  X,
  Compass,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';

export const TopBar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
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

  // Focus input when mobile search opens
  useEffect(() => {
    if (mobileSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [mobileSearchOpen]);

  // Format today's UK date
  const todayUK = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  const handleLogout = () => {
    setUserDropdownOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-3 sm:px-6 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs pt-[env(safe-area-inset-top,0px)]">
      {/* Left: Mobile Hamburger & Search / Tagline */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 text-slate-700 hover:text-[#0B1F4D] hover:bg-slate-100 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile Brand Name (when sidebar is hidden) */}
        <div className="md:hidden flex items-center gap-1.5 truncate">
          <span className="font-extrabold text-xs tracking-tight text-[#0B1F4D] truncate">
            UK Property Surveying Practice
          </span>
        </div>

        {/* Desktop Tagline: INDEPENDENT RICS-ALIGNED SURVEYORS */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-100/90 border border-slate-200/80 text-[11px] font-bold text-[#0B1F4D] tracking-wide shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>INDEPENDENT RICS-ALIGNED SURVEYORS</span>
        </div>

        {/* Global Search Bar (Tablet & Desktop) */}
        <div className="relative w-full max-w-sm hidden sm:block">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search surveys, jobs, clients, UK postcodes..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#F3F5F9] border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:border-[#2563EB] focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Right: Search Toggle (Mobile), Date, Notifications, User Menu */}
      <div className="flex items-center gap-1 sm:gap-3 shrink-0">
        {/* Mobile Search Icon Toggle */}
        <button
          onClick={() => setMobileSearchOpen(true)}
          className="sm:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          aria-label="Search surveys"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* UK Date Chip (Tablet & Desktop) */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600">
          <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>{todayUK}</span>
        </div>

        {/* Notification Bell Dropdown */}
        <NotificationDropdown />

        {/* Vertical divider */}
        <div className="h-6 w-px bg-slate-200 mx-0.5 sm:mx-1" />

        {/* User Avatar Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none min-h-[44px] min-w-[44px] cursor-pointer group"
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
              <span className="text-xs font-bold text-slate-800 leading-tight group-hover:text-[#2563EB] transition-colors truncate max-w-[120px]">
                {user?.name}
              </span>
              <span className="text-[10px] font-semibold text-slate-400 truncate max-w-[120px]">
                {user?.roleLabel}
              </span>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform hidden sm:block" />
          </button>

          {/* User Menu Dropdown */}
          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {user?.name}
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {user?.email}
                </div>
                <span className="inline-block mt-1 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-[#2563EB]">
                  {user?.roleLabel}
                </span>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    navigate('/profile');
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 min-h-[44px] cursor-pointer"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>My Profile</span>
                </button>

                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    navigate('/change-password');
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 min-h-[44px] cursor-pointer"
                >
                  <KeyRound className="w-4 h-4 text-slate-400" />
                  <span>Change Password</span>
                </button>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 min-h-[44px] cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full-width Search Overlay on Mobile */}
      {mobileSearchOpen && (
        <div className="sm:hidden fixed inset-x-0 top-0 h-16 bg-white px-4 z-50 flex items-center gap-3 border-b border-slate-200 shadow-md">
          <Search className="w-4 h-4 text-[#2563EB] shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search surveys, postcodes..."
            className="flex-1 text-sm bg-transparent border-0 outline-none text-slate-900 placeholder-slate-400 font-medium"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="p-1 text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setMobileSearchOpen(false)}
            className="p-2 text-slate-500 hover:text-slate-900 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </header>
  );
};
