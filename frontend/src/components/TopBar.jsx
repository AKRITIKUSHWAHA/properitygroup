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
  X,
  Building2,
  Briefcase,
  Users,
  FileText,
  MapPin,
  Loader2,
  Settings,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { apiRequest } from '../api/apiClient';
import { NotificationDropdown } from './NotificationDropdown';

// System Pages & Quick Navigation definitions
const SYSTEM_PAGES = [
  { name: 'Settings & Configurations', path: '/admin/settings', keywords: ['setting', 'settings', 'config', 'vat', 'pricing'], role: 'ADMIN' },
  { name: 'Chartered Surveyors Directory', path: '/admin/surveyors', keywords: ['surveyor', 'surveyors', 'chartered', 'rics', 'mrics'], role: 'ADMIN' },
  { name: 'Survey Jobs & Inspections', path: '/admin/jobs', keywords: ['job', 'jobs', 'survey', 'inspection'], role: 'ADMIN' },
  { name: 'CRM & Client Leads', path: '/admin/leads', keywords: ['lead', 'leads', 'crm', 'enquiry', 'prospect'], role: 'ADMIN' },
  { name: 'Quotations & Payments', path: '/admin/quotes', keywords: ['quote', 'quotes', 'quotation', 'payment', 'invoicing'], role: 'ADMIN' },
  { name: 'Terms of Engagement', path: '/admin/terms', keywords: ['terms', 'contract', 'agreement', 'signing'], role: 'ADMIN' },
  { name: 'Partner Agencies & Companies', path: '/admin/companies', keywords: ['company', 'companies', 'agency', 'partner'], role: 'ADMIN' },
  { name: 'Booking Calendar', path: '/admin/calendar', keywords: ['calendar', 'booking', 'schedule', 'diary'], role: 'ADMIN' },
  { name: 'Messages & Client Inbox', path: '/admin/messages', keywords: ['message', 'messages', 'chat', 'inbox'], role: 'ADMIN' },
  { name: 'Reports & Analytics', path: '/admin/reports', keywords: ['report', 'reports', 'analytics', 'revenue'], role: 'ADMIN' },
  { name: 'Users & Permissions', path: '/admin/users', keywords: ['user', 'users', 'role', 'permission'], role: 'ADMIN' },
  { name: 'My Profile', path: '/profile', keywords: ['profile', 'account', 'me', 'details'] },
  { name: 'Change Password', path: '/change-password', keywords: ['password', 'security', 'change password'] },
  { name: 'Surveyor Jobs Pipeline', path: '/surveyor/jobs', keywords: ['job', 'jobs', 'survey'], role: 'SURVEYOR' },
  { name: 'Inspection Calendar', path: '/surveyor/calendar', keywords: ['calendar', 'schedule'], role: 'SURVEYOR' },
  { name: 'Track My Survey', path: '/customer/track-survey', keywords: ['survey', 'track', 'status'], role: 'CUSTOMER' },
  { name: 'Fee Quotations', path: '/customer/quotations', keywords: ['quote', 'fee', 'proposal'], role: 'CUSTOMER' },
  { name: 'Payment Receipts & Invoices', path: '/customer/invoices', keywords: ['invoice', 'receipt', 'payment'], role: 'CUSTOMER' },
];

export const TopBar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);
  const navigate = useNavigate();

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleSearchClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSearchDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleSearchClickOutside);
    return () => document.removeEventListener('mousedown', handleSearchClickOutside);
  }, []);

  // Live debounced search across database AND platform pages
  useEffect(() => {
    const cleanTerm = searchTerm.toLowerCase().trim();
    if (!cleanTerm || cleanTerm.length < 2) {
      setSearchResults(null);
      setIsSearching(false);
      setSearchDropdownOpen(false);
      return;
    }

    // 1. Instant client-side check for system pages/menus (e.g. "setting", "surveyor", "jobs")
    const matchingPages = SYSTEM_PAGES.filter((p) => {
      if (p.role && p.role !== user?.role && user?.role !== 'ADMIN') return false;
      return (
        p.name.toLowerCase().includes(cleanTerm) ||
        p.keywords.some((k) => k.includes(cleanTerm) || cleanTerm.includes(k))
      );
    });

    // 2. Debounced API call for database records
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await apiRequest(`/search?q=${encodeURIComponent(cleanTerm)}`);
        // Note: apiRequest automatically returns data.data if available
        const payload = res?.results ? res : (res?.data || { results: {}, total: 0 });
        const dbTotal = payload?.total || 0;
        const total = dbTotal + matchingPages.length;

        setSearchResults({
          results: payload.results || {},
          pages: matchingPages,
          total,
          query: cleanTerm,
        });
        setSearchDropdownOpen(true);
      } catch (err) {
        // Fallback: at least show matched pages if offline/error
        setSearchResults({
          results: {},
          pages: matchingPages,
          total: matchingPages.length,
          query: cleanTerm,
        });
        setSearchDropdownOpen(true);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchTerm, user?.role]);

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
  };

  const handleSelectResult = (type, item) => {
    setSearchDropdownOpen(false);
    setMobileSearchOpen(false);
    setSearchTerm('');

    if (type === 'page' && item?.path) {
      navigate(item.path);
    } else if (type === 'job') {
      if (user?.role === 'ADMIN') {
        navigate('/admin/jobs');
      } else if (user?.role === 'SURVEYOR') {
        navigate('/surveyor/jobs');
      } else {
        navigate('/customer/track-survey');
      }
    } else if (type === 'lead') {
      navigate('/admin/leads');
    } else if (type === 'client') {
      navigate('/admin/users');
    } else if (type === 'quote') {
      navigate('/admin/quotes');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setSearchDropdownOpen(false);
    } else if (e.key === 'Enter') {
      if (searchResults?.pages?.length > 0) {
        handleSelectResult('page', searchResults.pages[0]);
      } else if (user?.role === 'ADMIN') {
        setSearchDropdownOpen(false);
        navigate('/admin/jobs');
      }
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-3 sm:px-6 bg-white/95 backdrop-blur-md border-b border-slate-300/80 shadow-2xs pt-[env(safe-area-inset-top,0px)] shrink-0">
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
            NJS Property Group
          </span>
        </div>

        {/* Desktop Tagline */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-100/90 border border-slate-300/80 text-[11px] font-bold text-[#0B1F4D] tracking-wide shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>INDEPENDENT RICS-ALIGNED SURVEYORS</span>
        </div>

        {/* Global Search Bar (Tablet & Desktop) */}
        <div className="relative w-full max-w-md hidden sm:block" ref={searchContainerRef}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              {isSearching ? (
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
              ) : (
                <Search className="w-4 h-4 text-slate-400" />
              )}
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => {
                if (searchTerm.trim().length >= 2) setSearchDropdownOpen(true);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search surveys, settings, clients, UK postcodes..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-100/90 border border-slate-300/80 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:border-[#2563EB] focus:bg-white transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSearchResults(null);
                  setSearchDropdownOpen(false);
                }}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Desktop Search Results Dropdown */}
          {searchDropdownOpen && searchTerm.trim().length >= 2 && (
            <div className="absolute left-0 top-full mt-2 w-full sm:w-[480px] bg-white rounded-2xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2.5 bg-[#0B1F4D] text-white flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-blue-400" />
                  Search Results for "{searchTerm}"
                </span>
                <span className="text-[11px] font-normal text-slate-300">
                  {searchResults?.total || 0} found
                </span>
              </div>

              <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
                {isSearching && !searchResults ? (
                  <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    <span className="text-xs">Searching records & pages...</span>
                  </div>
                ) : !searchResults || searchResults.total === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    <p className="text-xs font-semibold">No records found</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Try searching with another word, postcode (e.g. GU2), name (David), or menu (Settings).
                    </p>
                  </div>
                ) : (
                  <>
                    {/* 1. System Pages & Settings Category */}
                    {searchResults.pages?.length > 0 && (
                      <div className="p-2">
                        <div className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                          Pages & System Menus ({searchResults.pages.length})
                        </div>
                        {searchResults.pages.map((p) => (
                          <div
                            key={`p-${p.path}`}
                            onClick={() => handleSelectResult('page', p)}
                            className="p-2.5 rounded-xl hover:bg-indigo-50/80 cursor-pointer flex items-center justify-between gap-3 transition-colors"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg shrink-0">
                                <Settings className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-slate-900 truncate">
                                  {p.name}
                                </div>
                                <div className="text-[11px] text-slate-400 truncate">{p.path}</div>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 shrink-0">
                              Open Page
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 2. Jobs Category */}
                    {searchResults.results?.jobs?.length > 0 && (
                      <div className="p-2">
                        <div className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                          Survey Jobs ({searchResults.results.jobs.length})
                        </div>
                        {searchResults.results.jobs.map((job) => (
                          <div
                            key={`job-${job.id}`}
                            onClick={() => handleSelectResult('job', job)}
                            className="p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer flex items-center justify-between gap-3 transition-colors"
                          >
                            <div className="flex items-start gap-2.5 min-w-0">
                              <div className="p-2 bg-blue-50 text-blue-700 rounded-lg shrink-0 mt-0.5">
                                <Building2 className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-slate-900 truncate">
                                  {job.reference} • {job.propertyAddress}
                                </div>
                                <div className="text-[11px] text-slate-500 truncate mt-0.5 flex items-center gap-1.5">
                                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span>{job.postcode}</span>
                                  <span>•</span>
                                  <span>{job.serviceType}</span>
                                </div>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 shrink-0">
                              {job.stage}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 3. Leads Category */}
                    {searchResults.results?.leads?.length > 0 && (
                      <div className="p-2">
                        <div className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                          CRM Leads ({searchResults.results.leads.length})
                        </div>
                        {searchResults.results.leads.map((lead) => (
                          <div
                            key={`lead-${lead.id}`}
                            onClick={() => handleSelectResult('lead', lead)}
                            className="p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer flex items-center justify-between gap-3 transition-colors"
                          >
                            <div className="flex items-start gap-2.5 min-w-0">
                              <div className="p-2 bg-amber-50 text-amber-700 rounded-lg shrink-0 mt-0.5">
                                <Briefcase className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-slate-900 truncate">
                                  {lead.clientName} ({lead.reference})
                                </div>
                                <div className="text-[11px] text-slate-500 truncate mt-0.5">
                                  {lead.serviceType} • {lead.postcode}
                                </div>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 shrink-0">
                              {lead.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 4. Clients & Users Category */}
                    {searchResults.results?.clients?.length > 0 && (
                      <div className="p-2">
                        <div className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                          Users & Clients ({searchResults.results.clients.length})
                        </div>
                        {searchResults.results.clients.map((u) => (
                          <div
                            key={`user-${u.id}`}
                            onClick={() => handleSelectResult('client', u)}
                            className="p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer flex items-center justify-between gap-3 transition-colors"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg shrink-0">
                                <Users className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-slate-900 truncate">
                                  {u.name}
                                </div>
                                <div className="text-[11px] text-slate-500 truncate">{u.email}</div>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 shrink-0">
                              {u.role}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 5. Quotes Category */}
                    {searchResults.results?.quotes?.length > 0 && (
                      <div className="p-2">
                        <div className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                          Quotations ({searchResults.results.quotes.length})
                        </div>
                        {searchResults.results.quotes.map((q) => (
                          <div
                            key={`quote-${q.id}`}
                            onClick={() => handleSelectResult('quote', q)}
                            className="p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer flex items-center justify-between gap-3 transition-colors"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="p-2 bg-purple-50 text-purple-700 rounded-lg shrink-0">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-slate-900 truncate">
                                  {q.reference}
                                </div>
                                <div className="text-[11px] text-slate-500 truncate">
                                  Amount: £{q.totalAmount?.toFixed(2)}
                                </div>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 shrink-0">
                              {q.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Dropdown footer */}
              <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                <span>Press Enter to select</span>
                <span className="text-[#2563EB] font-bold">Esc to close</span>
              </div>
            </div>
          )}
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
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/90 border border-slate-300/80 text-xs font-semibold text-slate-700">
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
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user?.name || 'User'}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover ring-2 ring-[#0B1F4D]/10 group-hover:ring-[#2563EB]/50 transition-all"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-[#0B1F4D] to-[#2563EB] text-white font-bold text-xs flex items-center justify-center ring-2 ring-[#0B1F4D]/10">
                  {(user?.name || 'U')
                    .split(' ')
                    .filter(Boolean)
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase()}
                </div>
              )}
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
                <div className="text-xs font-bold text-slate-900 truncate">{user?.name}</div>
                <div className="text-[11px] text-slate-500 truncate">{user?.email}</div>
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
        <div className="sm:hidden fixed inset-x-0 top-0 bg-white z-50 flex flex-col border-b border-slate-200 shadow-xl max-h-[80vh]">
          <div className="h-16 px-4 flex items-center gap-3 border-b border-slate-100 shrink-0">
            {isSearching ? (
              <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
            ) : (
              <Search className="w-4 h-4 text-[#2563EB] shrink-0" />
            )}
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search surveys, settings, postcodes..."
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
              onClick={() => {
                setMobileSearchOpen(false);
                setSearchTerm('');
              }}
              className="p-2 text-slate-500 hover:text-slate-900 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              aria-label="Close search"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Results */}
          {searchTerm.trim().length >= 2 && searchResults && (
            <div className="overflow-y-auto max-h-[calc(80vh-4rem)] p-2 divide-y divide-slate-100">
              {searchResults.pages?.map((p) => (
                <div
                  key={`m-p-${p.path}`}
                  onClick={() => handleSelectResult('page', p)}
                  className="p-3 text-xs flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-900">{p.name}</div>
                    <div className="text-slate-400">{p.path}</div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                    Open
                  </span>
                </div>
              ))}
              {searchResults.results?.jobs?.map((job) => (
                <div
                  key={`m-job-${job.id}`}
                  onClick={() => handleSelectResult('job', job)}
                  className="p-3 text-xs flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-900">{job.reference}</div>
                    <div className="text-slate-500">{job.propertyAddress} ({job.postcode})</div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                    {job.stage}
                  </span>
                </div>
              ))}
              {searchResults.results?.leads?.map((lead) => (
                <div
                  key={`m-lead-${lead.id}`}
                  onClick={() => handleSelectResult('lead', lead)}
                  className="p-3 text-xs flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-900">{lead.clientName}</div>
                    <div className="text-slate-500">{lead.serviceType} • {lead.postcode}</div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                    {lead.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </header>
  );
};
