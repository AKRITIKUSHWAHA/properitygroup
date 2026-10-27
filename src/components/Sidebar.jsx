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
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const drawerRef = useRef(null);

  // Tablet hover expansion state
  const [isHovered, setIsHovered] = useState(false);

  const role = user?.role || 'customer';
  const roleConfig = ROLE_NAVIGATION[role] || ROLE_NAVIGATION.customer;
  const menuItems = roleConfig.items || [];

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
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#0B1F4D] text-slate-200 shadow-2xl transition-all duration-300 ease-in-out
          ${
            /* Mobile drawer toggle */
            isOpen
              ? 'translate-x-0 w-[260px] sm:w-[280px]'
              : '-translate-x-full md:translate-x-0'
          }
          ${
            /* Tablet icon rail vs hover expansion */
            isHovered
              ? 'md:w-[240px] md:z-50'
              : 'md:w-16 lg:w-[240px]'
          }
        `}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10 bg-[#071534]/70 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] flex items-center justify-center text-white shadow-md shadow-blue-500/20 ring-1 ring-white/20 shrink-0">
              <Building2 className="w-5 h-5 text-white stroke-[2.2]" />
            </div>
            {/* Brand text visible on desktop, mobile, and tablet when hovered */}
            <div className={`overflow-hidden transition-opacity duration-200 ${isHovered ? 'md:block' : 'md:hidden lg:block'}`}>
              <div className="text-sm font-extrabold text-white tracking-tight leading-none uppercase truncate">
                Property Group
              </div>
              <div className="text-[9px] font-semibold text-[#C9D3E3]/80 uppercase tracking-widest mt-0.5 truncate">
                INDEPENDENT RICS
              </div>
            </div>
          </div>

          {/* Close button for mobile drawer */}
          <button
            onClick={onClose}
            className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Badge Indicator */}
        <div className={`px-3 pt-3 pb-1 transition-opacity ${isHovered ? 'md:block' : 'md:hidden lg:block'}`}>
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-1.5 overflow-hidden">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
              <div className="text-[11px] font-semibold text-slate-300 truncate">
                {roleConfig.label}
              </div>
            </div>
            <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
              {menuItems.length}
            </span>
          </div>
        </div>

        {/* Navigation Menu (Scrollable) */}
        <div className="flex-1 px-2 py-2 space-y-1 overflow-y-auto overflow-x-hidden scrollbar-none">
          {menuItems.map((item) => {
            const IconComponent = ICON_MAP[item.icon] || Compass;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                title={item.name}
                className={({ isActive }) =>
                  `group relative flex items-center min-h-[44px] rounded-xl text-xs font-semibold transition-all duration-200 px-3 py-2 ${
                    isActive
                      ? 'bg-[#2563EB] text-white shadow-md shadow-blue-600/30 font-bold'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3 truncate w-full">
                      <IconComponent
                        className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                          isActive ? 'text-white' : 'text-[#C9D3E3]/80 group-hover:text-white'
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
                            ? 'bg-white text-[#2563EB]'
                            : 'bg-white/15 text-white'
                        } ${isHovered ? 'md:inline' : 'md:hidden lg:inline'}`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {/* Tablet Icon Rail Tooltip (when collapsed on md) */}
                    <div className="hidden md:group-hover:hidden md:block lg:hidden absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-[11px] font-bold rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl border border-white/10">
                      {item.name}
                    </div>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* User Session Footer */}
        <div className="p-3 border-t border-white/10 bg-[#071534]/50 shrink-0">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-2.5 overflow-hidden ${isHovered ? 'md:flex' : 'md:hidden lg:flex'}`}>
              <img
                src={user?.avatar}
                alt={user?.name || 'User'}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-white/20 shrink-0"
              />
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-white truncate max-w-[130px]">
                  {user?.name}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {user?.roleLabel}
                </div>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
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
