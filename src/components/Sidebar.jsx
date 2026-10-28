import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  UserCheck,
  Target,
  ClipboardCheck,
  CreditCard,
  FileSignature,
  BarChart3,
  Settings,
  CalendarDays,
  FileText,
  Calendar,
  Briefcase,
  MapPin,
  UploadCloud,
  Clock,
  CalendarCheck,
  Receipt,
  PenTool,
  FileSpreadsheet,
  User,
  HelpCircle,
  LogOut,
  X,
  Compass,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { ROLE_NAVIGATION } from '../mock/navigation';

// Icon map for dynamically rendering Lucide icons by string name
const ICON_MAP = {
  LayoutDashboard,
  Users,
  Building2,
  UserCheck,
  Target,
  ClipboardCheck,
  CreditCard,
  FileSignature,
  BarChart3,
  Settings,
  CalendarDays,
  FileText,
  Calendar,
  Briefcase,
  MapPin,
  UploadCloud,
  Clock,
  CalendarCheck,
  Receipt,
  PenTool,
  FileSpreadsheet,
  User,
  HelpCircle,
};

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout, switchRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const drawerRef = useRef(null);
  const roleDropdownRef = useRef(null);

  // Tablet hover expansion state
  const [isHovered, setIsHovered] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  // Derive active role from URL path prefix so opening any role's menu shows that role and its menus
  const getActiveRole = () => {
    if (location.pathname.startsWith('/superadmin') || location.pathname.startsWith('/admin')) return 'super_admin';
    if (location.pathname.startsWith('/staff')) return 'admin_staff';
    if (location.pathname.startsWith('/surveyor')) return 'surveyor';
    if (location.pathname.startsWith('/customer')) return 'customer';
    return user?.role || 'super_admin';
  };

  const activeRole = getActiveRole();
  const roleConfig = ROLE_NAVIGATION[activeRole] || ROLE_NAVIGATION.super_admin;
  const menuItems = roleConfig.items || [];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(e.target)) {
        setRoleDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectRole = (roleKey) => {
    setRoleDropdownOpen(false);
    if (switchRole) {
      switchRole(roleKey);
    }
    const targetPath = ROLE_NAVIGATION[roleKey]?.defaultPath || '/superadmin/dashboard';
    navigate(targetPath);
  };

  // Close mobile drawer on route change
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [location.pathname]);

  // Close on Escape key & trap focus
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop (below md) */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm md:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* 
        Sidebar Container:
        - Mobile (< md): Off-canvas drawer (w-[260px] or w-[280px], translated)
        - Tablet (md to lg): Icon rail w-16, expands to w-[240px] on hover
        - Desktop (lg+): Fixed w-[240px] (15rem)
      */}
      <aside
        ref={drawerRef}
        role="dialog"
        aria-modal={isOpen ? 'true' : 'false'}
        aria-label="Navigation Sidebar"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white text-slate-700 shadow-xl border-r border-slate-300/80 transition-all duration-300 ease-in-out
          ${
            /* Mobile drawer toggle */
            isOpen
              ? 'translate-x-0 w-[270px] sm:w-[280px]'
              : '-translate-x-full md:translate-x-0'
          }
          ${
            /* Tablet icon rail vs hover expansion */
            isHovered
              ? 'md:w-[260px] md:z-50'
              : 'md:w-16 lg:w-[260px]'
          }
        `}
      >
        {/* Brand Header matching Login Page */}
        <div className="flex items-center justify-between min-h-[66px] px-3.5 py-2.5 border-b border-slate-200/90 bg-white shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-xl bg-[#0B1F4D] flex items-center justify-center text-white shadow-md shadow-[#0B1F4D]/20 shrink-0">
              <Building2 className="w-5 h-5 text-white stroke-[2.2]" />
            </div>
            {/* Brand text visible on desktop, mobile, and tablet when hovered */}
            <div className={`min-w-0 flex-1 transition-opacity duration-200 ${isHovered ? 'md:block' : 'md:hidden lg:block'}`}>
              <div className="text-[11px] font-black text-[#0B1F4D] tracking-tight leading-[1.25] uppercase">
                UK Property Surveying Practice
              </div>
              <div className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 leading-tight">
                INDEPENDENT RICS-ALIGNED SURVEYORS
              </div>
            </div>
          </div>

          {/* Close button for mobile drawer */}
          <button
            onClick={onClose}
            className="md:hidden p-2 text-slate-500 hover:text-[#0B1F4D] hover:bg-slate-100 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Badge & Quick Switcher */}
        <div ref={roleDropdownRef} className={`relative px-3 pt-3 pb-1 transition-opacity ${isHovered ? 'md:block' : 'md:hidden lg:block'}`}>
          <button
            type="button"
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200/90 transition-all cursor-pointer group"
            title="Click to switch role and menus"
          >
            <div className="flex items-center gap-1.5 overflow-hidden">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0B1F4D] shrink-0" />
              <div className="text-[11px] font-bold text-slate-800 truncate">
                {roleConfig.label}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#0B1F4D] text-white">
                {menuItems.length}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-transform ${roleDropdownOpen ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {/* Role Switcher Dropdown */}
          {roleDropdownOpen && (
            <div className="absolute left-3 right-3 top-full mt-1.5 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                Switch Role / Menus
              </div>
              {[
                { id: 'customer', label: 'Customer', count: 8 },
                { id: 'surveyor', label: 'Surveyor', count: 6 },
                { id: 'super_admin', label: 'Admin', count: 10 },
              ].map((r) => {
                const isCurrent = activeRole === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleSelectRole(r.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                      isCurrent
                        ? 'bg-[#0B1F4D] text-white font-bold'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-[#0B1F4D]'
                    }`}
                  >
                    <span className="truncate">{r.label}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isCurrent ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {r.count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Navigation Menu (Scrollable) */}
        <div className="flex-1 px-2.5 py-2 space-y-1 overflow-y-auto overflow-x-hidden scrollbar-none">
          {menuItems.map((item) => {
            const IconComponent = ICON_MAP[item.icon] || Compass;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                title={item.name}
                className={({ isActive }) =>
                  `group relative flex items-center min-h-[44px] rounded-xl text-xs font-semibold transition-all duration-200 px-3 py-2.5 ${
                    isActive
                      ? 'bg-[#0B1F4D] text-white shadow-md shadow-[#0B1F4D]/25 font-bold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-[#0B1F4D]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3 truncate w-full">
                      <IconComponent
                        className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-105 ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-[#0B1F4D]'
                        }`}
                      />
                      {/* Name label shown on mobile, desktop, and tablet when hovered */}
                      <span
                        className={`truncate transition-opacity duration-200 ${
                          isHovered ? 'md:inline' : 'md:hidden lg:inline'
                        }`}
                      >
                        {item.name}
                      </span>
                    </div>

                    {/* Badge */}
                    {item.badge && (
                      <span
                        className={`ml-auto px-1.5 py-0.5 rounded-full text-[9px] font-bold shrink-0 transition-opacity ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-600'
                        } ${isHovered ? 'md:inline' : 'md:hidden lg:inline'}`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {/* Tablet Icon Rail Tooltip (when collapsed on md) */}
                    <div className="hidden md:group-hover:hidden md:block lg:hidden absolute left-full ml-2 px-2.5 py-1 bg-[#0B1F4D] text-white text-[11px] font-bold rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl border border-slate-700">
                      {item.name}
                    </div>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* User Session Footer */}
        <div className="p-3 border-t border-slate-200/90 bg-slate-50/90 shrink-0">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-2.5 overflow-hidden ${isHovered ? 'md:flex' : 'md:hidden lg:flex'}`}>
              <img
                src={user?.avatar}
                alt={user?.name || 'User'}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-200 shrink-0"
              />
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-[#0B1F4D] truncate max-w-[130px]">
                  {user?.name}
                </div>
                <div className="text-[10px] font-medium text-slate-500 truncate">
                  {user?.roleLabel}
                </div>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
