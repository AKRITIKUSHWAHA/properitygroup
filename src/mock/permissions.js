// Role-Based Access Control (RBAC) & Menu Visibility Store
// Allows Superadmin / Admin to activate or deactivate any menu for any role

import { useState, useEffect, useCallback } from 'react';
import { ROLE_NAVIGATION } from './navigation';

const STORAGE_KEY = 'property_group_role_menu_permissions_v1';
const EVENT_NAME = 'property_group_permissions_changed';

// Canonical default permissions (all menus active by default)
export const DEFAULT_ROLE_PERMISSIONS = {
  super_admin: {
    'dashboard': true,
    'users-roles': true,
    'companies': true,
    'surveyors': true,
    'crm-leads': true,
    'survey-jobs': true,
    'quotations-payments': true,
    'terms-documents': true,
    'reports-analytics': true,
    'settings': true,
  },
  admin: {
    'dashboard': true,
    'users-roles': true,
    'companies': true,
    'surveyors': true,
    'crm-leads': true,
    'survey-jobs': true,
    'quotations-payments': true,
    'terms-documents': true,
    'reports-analytics': true,
    'settings': true,
  },
  surveyor: {
    'dashboard': true,
    'my-calendar': true,
    'my-jobs': true,
    'site-visits': true,
    'upload-reports': true,
    'my-availability': true,
  },
  customer: {
    'my-dashboard': true,
    'my-bookings': true,
    'quotations': true,
    'terms-to-sign': true,
    'invoices-payments': true,
    'reports': true,
    'my-details': true,
    'support': true,
  },
};

export const MENU_DESCRIPTIONS = {
  // Admin menus
  'dashboard': 'Executive operations, KPI metrics, survey bookings pipeline, and recent activity.',
  'users-roles': 'Manage user accounts, client profiles, and RBAC menu visibility permissions.',
  'companies': 'Panel partnerships with London & UK estate agency branches and legal conveyancers.',
  'surveyors': 'Chartered surveyors panel, coverage territories, accreditation, and workload.',
  'crm-leads': 'Inbound LSD quote requests, lead status pipeline, and deal conversions.',
  'survey-jobs': 'Master register of all Level 2 and Level 3 inspection instructions and milestones.',
  'quotations-payments': 'Fee proposal dispatches, VAT invoices, and settled client payments.',
  'terms-documents': 'Letter of Engagement terms, digital signatures, and signed client contracts.',
  'reports-analytics': 'Revenue analytics, surveyor capacity performance, and turnaround metrics.',
  'settings': 'System configurations, pricing matrices, and lead channel integrations.',
  // Surveyor menus
  'my-calendar': 'Field inspection schedule, confirmed appointment slots, and site locations.',
  'my-jobs': 'Assigned surveys, property details, vendor access notes, and defect logs.',
  'site-visits': 'On-site property inspection checklist, condition ratings, and photos.',
  'upload-reports': 'RICS format PDF draft report compilation and upload release.',
  'my-availability': 'Surveyor weekly diary, blocked inspection dates, and travel radius capacity.',
  // Customer menus
  'my-dashboard': 'Client overview, instruction progress tracker, and quick status actions.',
  'my-bookings': 'Scheduled surveyor inspection date, property address, and arrival window.',
  'quotations': 'Received fee proposals, survey scope breakdown, and 1-click acceptance.',
  'terms-to-sign': 'Terms of engagement letter awaiting client digital e-signature.',
  'invoices-payments': 'Survey fee payment receipts, invoice PDF downloads, and card payments.',
  'reports': 'Finalized RICS Homebuyer / Building survey PDF report downloads.',
  'my-details': 'Client contact details, billing address, and notification preferences.',
  'support': 'Helpdesk assistance, surveyor liaison queries, and phone support hotline.',
};

// Retrieve stored permissions or initialize with defaults
export const getStoredPermissions = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_ROLE_PERMISSIONS,
        ...parsed,
        super_admin: { ...DEFAULT_ROLE_PERMISSIONS.super_admin, ...(parsed.super_admin || parsed.admin || {}) },
        admin: { ...DEFAULT_ROLE_PERMISSIONS.admin, ...(parsed.admin || parsed.super_admin || {}) },
        surveyor: { ...DEFAULT_ROLE_PERMISSIONS.surveyor, ...(parsed.surveyor || {}) },
        customer: { ...DEFAULT_ROLE_PERMISSIONS.customer, ...(parsed.customer || {}) },
      };
    }
  } catch {
    // ignore
  }
  return DEFAULT_ROLE_PERMISSIONS;
};

// Save permissions to localStorage and trigger global sync
export const persistPermissions = (newPermissions) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPermissions));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: newPermissions }));
  } catch (err) {
    console.error('Failed to persist permissions', err);
  }
};

// React hook to subscribe to permission changes in any component
export const useRolePermissions = () => {
  const [permissions, setPermissions] = useState(getStoredPermissions);

  useEffect(() => {
    const handleUpdate = () => {
      setPermissions(getStoredPermissions());
    };
    window.addEventListener(EVENT_NAME, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(EVENT_NAME, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const isMenuPermitted = useCallback((roleKey, menuId) => {
    const normalizedRole = (roleKey === 'super_admin' || roleKey === 'admin') ? 'super_admin' : roleKey;
    const roleMap = permissions[normalizedRole] || permissions[roleKey];
    if (!roleMap) return true;
    return roleMap[menuId] !== false; // Default to true unless explicitly disabled
  }, [permissions]);

  const togglePermission = useCallback((roleKey, menuId) => {
    const normalizedRole = (roleKey === 'super_admin' || roleKey === 'admin') ? 'super_admin' : roleKey;
    const current = getStoredPermissions();
    const currentVal = current[normalizedRole]?.[menuId] !== false;
    const newVal = !currentVal;

    const updated = {
      ...current,
      [normalizedRole]: {
        ...(current[normalizedRole] || {}),
        [menuId]: newVal,
      },
    };

    if (normalizedRole === 'super_admin') {
      updated.admin = { ...(updated.admin || {}), [menuId]: newVal };
    }

    persistPermissions(updated);
    setPermissions(updated);
    return newVal;
  }, []);

  const setAllForRole = useCallback((roleKey, active) => {
    const normalizedRole = (roleKey === 'super_admin' || roleKey === 'admin') ? 'super_admin' : roleKey;
    const current = getStoredPermissions();
    const roleItems = ROLE_NAVIGATION[normalizedRole]?.items || [];
    
    const roleUpdated = {};
    roleItems.forEach(item => {
      // Keep dashboard active to prevent lockout
      if (item.id === 'dashboard' || item.id === 'my-dashboard') {
        roleUpdated[item.id] = true;
      } else {
        roleUpdated[item.id] = active;
      }
    });

    const updated = {
      ...current,
      [normalizedRole]: roleUpdated,
    };

    if (normalizedRole === 'super_admin') {
      updated.admin = { ...roleUpdated };
    }

    persistPermissions(updated);
    setPermissions(updated);
  }, []);

  const resetToDefault = useCallback(() => {
    persistPermissions(DEFAULT_ROLE_PERMISSIONS);
    setPermissions(DEFAULT_ROLE_PERMISSIONS);
  }, []);

  const getPermittedItemsCount = useCallback((roleKey) => {
    const normalizedRole = (roleKey === 'super_admin' || roleKey === 'admin') ? 'super_admin' : roleKey;
    const items = ROLE_NAVIGATION[normalizedRole]?.items || [];
    return items.filter(item => isMenuPermitted(normalizedRole, item.id)).length;
  }, [isMenuPermitted]);

  return {
    permissions,
    isMenuPermitted,
    togglePermission,
    setAllForRole,
    resetToDefault,
    getPermittedItemsCount,
  };
};
