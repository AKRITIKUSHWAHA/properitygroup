import React, { useState } from 'react';
import {
  ShieldCheck,
  UserCheck,
  User,
  CheckCircle2,
  EyeOff,
  RotateCcw,
  LayoutDashboard,
  Users,
  Building2,
  Target,
  ClipboardCheck,
  CreditCard,
  FileSignature,
  BarChart3,
  Settings,
  CalendarDays,
  Calendar,
  Briefcase,
  MapPin,
  UploadCloud,
  Clock,
  CalendarCheck,
  Receipt,
  PenTool,
  FileSpreadsheet,
  HelpCircle,
  Check,
  Handshake,
  Compass,
  MessageSquare,
  Star,
  History,
  Search,
  FileDown,
  Send,
  FileText,
} from 'lucide-react';
import { ROLE_NAVIGATION } from '../../mock/navigation';
import { useRolePermissions, MENU_DESCRIPTIONS } from '../../mock/permissions';
import { useToast } from '../ToastContext';

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
  Handshake,
  Compass,
  MessageSquare,
  Star,
  History,
  Search,
  FileDown,
  Send,
  FileText,
};

const ROLES_LIST = [
  {
    id: 'super_admin',
    name: 'Admin',
    badge: 'HQ Management & Back-Office',
    description: 'Executive survey operations, CRM lead pipelines, financial VAT tracking, surveyor allocation, and practice settings.',
    icon: ShieldCheck,
    badgeColor: 'bg-blue-100 text-[#0B1F4D] border-blue-200',
  },
  {
    id: 'surveyor',
    name: 'Surveyor',
    badge: 'RICS Chartered Field Surveyor',
    description: 'Field inspection bookings, site appointments diary, property defect notes, and RICS PDF draft upload.',
    icon: UserCheck,
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  {
    id: 'customer',
    name: 'Customer',
    badge: 'Client Self-Service Portal (14 Tabs)',
    description: 'Homebuyer & property client portal for tracking inspections, reviewing quotations, e-signing terms of engagement, and downloading finalized reports.',
    icon: User,
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  {
    id: 'partner',
    name: 'Estate Agent / Partner',
    badge: 'Referral Partner Portal (Point 29)',
    description: 'Estate agency branches (Foxtons, Savills, Dexters) submitting buyer survey referrals, tracking milestones, and monitoring £50 BACS commissions.',
    icon: Handshake,
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
  },
];

export const RolePermissionsManager = () => {
  const [selectedRole, setSelectedRole] = useState('super_admin');
  const { isMenuPermitted, togglePermission, setAllForRole, resetToDefault } = useRolePermissions();
  const { addToast } = useToast();

  const currentRoleObj = ROLES_LIST.find((r) => r.id === selectedRole) || ROLES_LIST[0];
  const roleNavItems = ROLE_NAVIGATION[selectedRole]?.items || [];

  const handleToggle = (menuItem) => {
    // Prevent disabling primary dashboard / home landing view
    if (
      menuItem.id === 'dashboard' ||
      menuItem.id === 'my-dashboard' ||
      (selectedRole === 'partner' && menuItem.id === 'partner-portal')
    ) {
      addToast({
        type: 'warning',
        title: 'Core Menu Protected',
        message: 'The primary Dashboard / Portal home cannot be disabled as it serves as the home landing view.',
      });
      return;
    }

    const nextState = togglePermission(selectedRole, menuItem.id);
    addToast({
      type: nextState ? 'success' : 'info',
      title: `${menuItem.name} ${nextState ? 'Activated' : 'Deactivated'}`,
      message: `${menuItem.name} is now ${nextState ? 'visible' : 'hidden'} in the navigation sidebar for ${currentRoleObj.name} users.`,
    });
  };

  const handleEnableAll = () => {
    setAllForRole(selectedRole, true);
    addToast({
      type: 'success',
      title: 'All Menus Enabled',
      message: `All navigation menu items are now active for the ${currentRoleObj.name} role.`,
    });
  };

  const handleDisableOptional = () => {
    setAllForRole(selectedRole, false);
    addToast({
      type: 'info',
      title: 'Optional Menus Hidden',
      message: `Optional navigation menus are now inactive for ${currentRoleObj.name}. (Core Dashboard remains active).`,
    });
  };

  const handleResetDefaults = () => {
    resetToDefault();
    addToast({
      type: 'success',
      title: 'Permissions Reset to Defaults',
      message: 'All role menus have been restored to their standard system configuration.',
    });
  };

  const activeCount = roleNavItems.filter((item) => isMenuPermitted(selectedRole, item.id)).length;
  const totalCount = roleNavItems.length;

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Simple Clean Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-1 gap-2">
        <div>
          <h3 className="text-sm sm:text-base font-extrabold text-[#0B1F4D] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Role Menu Permissions</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Select a role below to view and toggle active / inactive menus for that role.
          </p>
        </div>
        <button
          type="button"
          onClick={handleResetDefaults}
          className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
          title="Reset all role permissions to factory defaults"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* Role Selection Tabs (4 Roles: Admin, Surveyor, Customer, Estate Agent Partner) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {ROLES_LIST.map((role) => {
          const isSelected = selectedRole === role.id;
          const RoleIcon = role.icon;
          const items = ROLE_NAVIGATION[role.id]?.items || [];
          const activeInRole = items.filter((it) => isMenuPermitted(role.id, it.id)).length;

          return (
            <button
              key={role.id}
              type="button"
              onClick={() => setSelectedRole(role.id)}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                isSelected
                  ? 'bg-white border-[#0B1F4D] shadow-md ring-2 ring-[#0B1F4D]/10'
                  : 'bg-white border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                    isSelected
                      ? 'bg-[#0B1F4D] text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <RoleIcon className="w-4 h-4" />
                </div>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    isSelected
                      ? 'bg-[#0B1F4D] text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {activeInRole} / {items.length} Active
                </span>
              </div>

              <div className="font-extrabold text-xs sm:text-sm text-[#0B1F4D] flex items-center gap-1.5">
                <span>{role.name}</span>
                {isSelected && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
              </div>
              <div className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                {role.badge}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Role Menus Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 space-y-5">
        {/* Role Header Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${currentRoleObj.badgeColor}`}>
                {currentRoleObj.name} Role
              </span>
              <span className="text-xs font-bold text-slate-500">
                {activeCount} of {totalCount} Menus Active
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              {currentRoleObj.description}
            </p>
          </div>

          {/* Quick Bulk Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleEnableAll}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Enable All</span>
            </button>
            <button
              type="button"
              onClick={handleDisableOptional}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <EyeOff className="w-3.5 h-3.5 text-slate-500" />
              <span>Hide Optional</span>
            </button>
          </div>
        </div>

        {/* Menus Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {roleNavItems.map((item) => {
            const isPermitted = isMenuPermitted(selectedRole, item.id);
            const isCore =
              item.id === 'dashboard' ||
              item.id === 'my-dashboard' ||
              (selectedRole === 'partner' && item.id === 'partner-portal');
            const Icon = ICON_MAP[item.icon] || LayoutDashboard;
            const desc = MENU_DESCRIPTIONS[item.id] || 'Core surveying platform module';

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                  isPermitted
                    ? 'bg-white border-slate-200/90 shadow-2xs hover:border-[#2563EB]/40'
                    : 'bg-slate-50/70 border-slate-200/80 opacity-70'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isPermitted
                          ? 'bg-blue-50 text-[#0B1F4D]'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      <Icon className="w-4 h-4 stroke-[2.2]" />
                    </div>

                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                          {item.name}
                        </h4>
                        {isCore ? (
                          <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-slate-100 text-slate-600">
                            Core Home
                          </span>
                        ) : (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.2 rounded-full flex items-center gap-1 ${
                              isPermitted
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-200/80 text-slate-600'
                            }`}
                          >
                            {isPermitted ? <Check className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
                            <span>{isPermitted ? 'Active' : 'Inactive'}</span>
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 truncate">
                        {item.path}
                      </div>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <div className="shrink-0 flex items-center pt-0.5">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isPermitted}
                      disabled={isCore}
                      onClick={() => handleToggle(item)}
                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isCore
                          ? 'bg-slate-300 opacity-60 cursor-not-allowed'
                          : isPermitted
                          ? 'bg-[#0B1F4D]'
                          : 'bg-slate-300 hover:bg-slate-400'
                      }`}
                      title={
                        isCore
                          ? 'Core Dashboard is always active'
                          : isPermitted
                          ? 'Click to deactivate / hide from sidebar'
                          : 'Click to activate / show in sidebar'
                      }
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          isPermitted ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 mt-2.5 pt-2.5 border-t border-slate-100 leading-relaxed">
                  {desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
