import React, { useState } from 'react';
import {
  ShieldCheck,
  UserCheck,
  User,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  RotateCcw,
  Sparkles,
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
  Sliders,
  Check,
  AlertTriangle
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
};

const ROLES_LIST = [
  {
    id: 'super_admin',
    name: 'Admin',
    badge: 'HQ Management & Back-Office',
    description: 'Executive survey operations, CRM lead pipelines, financial VAT tracking, surveyor allocation, and practice settings.',
    icon: ShieldCheck,
    color: 'from-blue-600 to-[#0B1F4D]',
    badgeColor: 'bg-blue-100 text-[#0B1F4D] border-blue-200',
  },
  {
    id: 'surveyor',
    name: 'Surveyor',
    badge: 'RICS Chartered Field Surveyor',
    description: 'Field inspection bookings, site appointments diary, property defect notes, and RICS PDF draft upload.',
    icon: UserCheck,
    color: 'from-purple-600 to-indigo-900',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  {
    id: 'customer',
    name: 'Customer',
    badge: 'Client Self-Service Portal',
    description: 'Homebuyer & property client portal for reviewing quotations, e-signing terms of engagement, and downloading finalized reports.',
    icon: User,
    color: 'from-emerald-600 to-teal-900',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
];

export const RolePermissionsManager = () => {
  const [selectedRole, setSelectedRole] = useState('super_admin');
  const [matrixView, setMatrixView] = useState(false);
  const { isMenuPermitted, togglePermission, setAllForRole, resetToDefault } = useRolePermissions();
  const { addToast } = useToast();

  const currentRoleObj = ROLES_LIST.find((r) => r.id === selectedRole) || ROLES_LIST[0];
  const roleNavItems = ROLE_NAVIGATION[selectedRole]?.items || [];

  const handleToggle = (menuItem) => {
    // Prevent disabling primary dashboard
    if (menuItem.id === 'dashboard' || menuItem.id === 'my-dashboard') {
      addToast({
        type: 'warning',
        title: 'Core Menu Protected',
        message: 'The primary Dashboard menu cannot be disabled as it serves as the home landing view.',
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
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Info Card */}
      <div className="bg-gradient-to-r from-[#0B1F4D] to-[#1E3A8A] rounded-3xl p-6 text-white shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-white backdrop-blur-xs">
              RBAC Menu Visibility Control
            </span>
            <span className="text-white/60 text-xs">• Live Sidebar Sync</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Role Permissions & Navigation Visibility
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            Superadmin can control which menus are displayed to each role. Toggling an item Active or Inactive updates the navigation sidebar in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setMatrixView(!matrixView)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border cursor-pointer ${
              matrixView
                ? 'bg-white text-[#0B1F4D] border-white shadow-md'
                : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{matrixView ? 'Card View' : 'Full Matrix View'}</span>
          </button>

          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            title="Reset all role permissions to factory defaults"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-300" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Role Selection Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                isSelected
                  ? 'bg-white border-[#0B1F4D] shadow-lg shadow-[#0B1F4D]/10 ring-2 ring-[#0B1F4D]/10'
                  : 'bg-white/90 border-slate-200/90 hover:border-slate-300 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                    isSelected
                      ? 'bg-[#0B1F4D] text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <RoleIcon className="w-4 h-4" />
                </div>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    isSelected
                      ? 'bg-[#0B1F4D] text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {activeInRole} / {items.length} Active
                </span>
              </div>

              <div className="font-extrabold text-sm text-[#0B1F4D] flex items-center gap-1.5">
                <span>{role.name} Role</span>
                {isSelected && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5 truncate">
                {role.badge}
              </div>
            </button>
          );
        })}
      </div>

      {/* Matrix View vs Cards View */}
      {matrixView ? (
        /* Full Comparison Matrix View */
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Cross-Role Menu Permission Matrix
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Overview of all menu modules and their active/inactive status across all 3 roles.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Click any toggle to switch visibility
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Menu Module</th>
                  <th className="py-3 px-4">Route Path</th>
                  <th className="py-3 px-4 text-center">Admin (HQ)</th>
                  <th className="py-3 px-4 text-center">Surveyor</th>
                  <th className="py-3 px-4 text-center">Customer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* Aggregate all unique menus across the three roles */}
                {[
                  ...ROLE_NAVIGATION.super_admin.items.map((m) => ({ ...m, roleGroup: 'admin' })),
                  ...ROLE_NAVIGATION.surveyor.items.map((m) => ({ ...m, roleGroup: 'surveyor' })),
                  ...ROLE_NAVIGATION.customer.items.map((m) => ({ ...m, roleGroup: 'customer' })),
                ].map((item, idx) => {
                  const Icon = ICON_MAP[item.icon] || LayoutDashboard;
                  const adminPerm = item.roleGroup === 'admin' ? isMenuPermitted('super_admin', item.id) : null;
                  const surveyorPerm = item.roleGroup === 'surveyor' ? isMenuPermitted('surveyor', item.id) : null;
                  const customerPerm = item.roleGroup === 'customer' ? isMenuPermitted('customer', item.id) : null;

                  return (
                    <tr key={`${item.id}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 text-[#0B1F4D] flex items-center justify-center shrink-0">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{item.name}</div>
                            <div className="text-[10px] text-slate-400 capitalize">
                              Designed for {item.roleGroup}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                        {item.path}
                      </td>
                      {/* Admin column */}
                      <td className="py-3 px-4 text-center">
                        {adminPerm !== null ? (
                          <button
                            type="button"
                            onClick={() => togglePermission('super_admin', item.id)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all ${
                              adminPerm
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                          >
                            {adminPerm ? <Check className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            <span>{adminPerm ? 'Active' : 'Hidden'}</span>
                          </button>
                        ) : (
                          <span className="text-slate-300 font-bold">—</span>
                        )}
                      </td>
                      {/* Surveyor column */}
                      <td className="py-3 px-4 text-center">
                        {surveyorPerm !== null ? (
                          <button
                            type="button"
                            onClick={() => togglePermission('surveyor', item.id)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all ${
                              surveyorPerm
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                          >
                            {surveyorPerm ? <Check className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            <span>{surveyorPerm ? 'Active' : 'Hidden'}</span>
                          </button>
                        ) : (
                          <span className="text-slate-300 font-bold">—</span>
                        )}
                      </td>
                      {/* Customer column */}
                      <td className="py-3 px-4 text-center">
                        {customerPerm !== null ? (
                          <button
                            type="button"
                            onClick={() => togglePermission('customer', item.id)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all ${
                              customerPerm
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                          >
                            {customerPerm ? <Check className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            <span>{customerPerm ? 'Active' : 'Hidden'}</span>
                          </button>
                        ) : (
                          <span className="text-slate-300 font-bold">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Selected Role Interactive Cards View */
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-6">
          {/* Role Header Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-slate-100 gap-4">
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
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Enable All</span>
              </button>
              <button
                type="button"
                onClick={handleDisableOptional}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                <span>Hide Optional</span>
              </button>
            </div>
          </div>

          {/* Menus Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roleNavItems.map((item) => {
              const isPermitted = isMenuPermitted(selectedRole, item.id);
              const isCore = item.id === 'dashboard' || item.id === 'my-dashboard';
              const Icon = ICON_MAP[item.icon] || LayoutDashboard;
              const desc = MENU_DESCRIPTIONS[item.id] || 'Core surveying platform module';

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                    isPermitted
                      ? 'bg-white border-slate-200 shadow-2xs hover:border-[#2563EB]/40'
                      : 'bg-slate-50/70 border-slate-200/80 opacity-70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          isPermitted
                            ? 'bg-blue-50 text-[#0B1F4D]'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        <Icon className="w-5 h-5 stroke-[2.2]" />
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm text-slate-900">
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
                        <div className="text-[11px] font-mono text-slate-400">
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
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
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
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            isPermitted ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100 leading-relaxed">
                    {desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
