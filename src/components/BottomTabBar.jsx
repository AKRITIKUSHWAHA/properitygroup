import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  Receipt,
  FileSpreadsheet,
  Menu,
  Target,
  ClipboardCheck,
  CalendarDays,
  CreditCard,
  Calendar,
  Briefcase,
  UploadCloud,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

// 4 primary menus per role + "More" (opens full drawer)
const BOTTOM_NAV_CONFIG = {
  customer: [
    { id: 'dash', name: 'Dashboard', path: '/customer/my-dashboard', icon: LayoutDashboard },
    { id: 'bookings', name: 'Bookings', path: '/customer/my-bookings', icon: CalendarCheck },
    { id: 'quotes', name: 'Quotes', path: '/customer/quotations', icon: Receipt },
    { id: 'reports', name: 'Reports', path: '/customer/reports', icon: FileSpreadsheet },
  ],
  surveyor: [
    { id: 'dash', name: 'Dashboard', path: '/surveyor/dashboard', icon: LayoutDashboard },
    { id: 'calendar', name: 'Calendar', path: '/surveyor/my-calendar', icon: Calendar },
    { id: 'jobs', name: 'Jobs', path: '/surveyor/my-jobs', icon: Briefcase },
    { id: 'reports', name: 'Reports', path: '/surveyor/upload-reports', icon: UploadCloud },
  ],
  admin_staff: [
    { id: 'dash', name: 'Dashboard', path: '/staff/dashboard', icon: LayoutDashboard },
    { id: 'leads', name: 'Leads', path: '/staff/crm-and-leads', icon: Target },
    { id: 'jobs', name: 'Jobs', path: '/staff/survey-jobs', icon: ClipboardCheck },
    { id: 'calendar', name: 'Calendar', path: '/staff/booking-calendar', icon: CalendarDays },
  ],
  super_admin: [
    { id: 'dash', name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { id: 'leads', name: 'Leads', path: '/admin/crm-and-leads', icon: Target },
    { id: 'jobs', name: 'Jobs', path: '/admin/survey-jobs', icon: ClipboardCheck },
    { id: 'quotes', name: 'Quotes', path: '/admin/quotations-and-payments', icon: CreditCard },
  ],
};

export const BottomTabBar = ({ onOpenMore }) => {
  const { user } = useAuth();
  const role = user?.role || 'customer';
  const tabs = BOTTOM_NAV_CONFIG[role] || BOTTOM_NAV_CONFIG.customer;

  return (
    <nav
      aria-label="Mobile bottom navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B1F4D]/95 backdrop-blur-lg border-t border-white/10 px-2 pt-1 pb-[max(0.375rem,env(safe-area-inset-bottom,0px))] flex items-center justify-around shadow-2xl"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.id}
            to={tab.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-2 py-1 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-[#2563EB] font-bold'
                  : 'text-slate-400 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-white' : ''}`} />
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#2563EB] rounded-full" />
                  )}
                </div>
                <span className={`text-[10px] mt-1 tracking-tight truncate max-w-[62px] ${isActive ? 'text-white font-bold' : ''}`}>
                  {tab.name}
                </span>
              </>
            )}
          </NavLink>
        );
      })}

      {/* "More" button opens sidebar drawer */}
      <button
        type="button"
        onClick={onOpenMore}
        className="flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-2 py-1 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer"
        aria-label="Open full menu"
      >
        <Menu className="w-5 h-5" />
        <span className="text-[10px] mt-1 tracking-tight">More</span>
      </button>
    </nav>
  );
};
