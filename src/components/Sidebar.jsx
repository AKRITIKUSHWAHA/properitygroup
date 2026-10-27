import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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

  const role = user?.role || 'customer';
  const roleConfig = ROLE_NAVIGATION[role] || ROLE_NAVIGATION.customer;
  const menuItems = roleConfig.items || [];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-72 bg-[#0B1F4D] text-slate-200 shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-[#071534]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] flex items-center justify-center text-white shadow-lg shadow-blue-500/20 ring-1 ring-white/20 shrink-0">
              <Building2 className="w-5 h-5 text-white stroke-[2.2]" />
            </div>
            <div className="overflow-hidden">
              <div className="text-base font-bold text-white tracking-tight leading-tight truncate flex items-center gap-1.5">
                Property Group
              </div>
              <div className="text-[11px] font-medium text-[#C9D3E3]/80 uppercase tracking-wider truncate">
                Survey Platform
              </div>
            </div>
          </div>

          {/* Close button for mobile drawer */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Badge Indicator */}
        <div className="px-5 pt-4 pb-2">
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 overflow-hidden">
              <ShieldCheck className="w-4 h-4 text-[#2563EB] shrink-0" />
              <div className="text-xs font-semibold text-slate-300 truncate">
                {roleConfig.label}
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
              {menuItems.length} Menus
            </span>
          </div>
        </div>

        {/* Navigation Menu (Scrollable) */}
        <div className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          <div className="px-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Main Navigation
          </div>

          {menuItems.map((item) => {
            const IconComponent = ICON_MAP[item.icon] || Compass;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) =>
                  `group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-600/30 font-semibold'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3 truncate">
                      <IconComponent
                        className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                          isActive ? 'text-white' : 'text-[#C9D3E3]/70 group-hover:text-white'
                        }`}
                      />
                      <span className="truncate">{item.name}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-white/10 text-slate-300 group-hover:bg-white/20'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* User Footer Profile & Quick Logout */}
        <div className="p-3 border-t border-white/10 bg-[#071534]/70">
          <div className="flex items-center justify-between gap-3 p-2 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
            <button
              onClick={() => {
                navigate('/profile');
                if (window.innerWidth < 1024) onClose();
              }}
              className="flex items-center gap-3 overflow-hidden text-left flex-1"
            >
              <img
                src={user?.avatar}
                alt={user?.name || 'User'}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-[#2563EB]/40 shrink-0"
              />
              <div className="overflow-hidden">
                <div className="text-xs font-semibold text-white truncate">{user?.name}</div>
                <div className="text-[11px] text-slate-400 truncate">{user?.company || user?.email}</div>
              </div>
            </button>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors shrink-0"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
