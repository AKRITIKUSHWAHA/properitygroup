// Role-Based Access Control (RBAC) & Menu Visibility Store
// Allows Superadmin / Admin to activate or deactivate any menu for any role

import { useState, useEffect, useCallback } from 'react';
import { ROLE_NAVIGATION } from './navigation';

const STORAGE_KEY = 'property_group_role_menu_permissions_v2';
const EVENT_NAME = 'property_group_permissions_changed';

// Canonical default permissions (all menus active by default)
export const DEFAULT_ROLE_PERMISSIONS = {
  super_admin: {
    'dashboard': true,
    'users-roles': true,
    'companies': true,
    'partner-portal': true,
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
    'partner-portal': true,
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
    'quotations': true,
    'my-bookings': true,
    'track-survey': true,
    'appointment-details': true,
    'assigned-surveyor': true,
    'terms-to-sign': true,
    'invoices-payments': true,
    'reports': true,
    'messages': true,
    'leave-review': true,
    'support': true,
    'my-details': true,
    'previous-surveys': true,
  },
  partner: {
    'partner-portal': true,
    'submit-referral': true,
    'property-intel': true,
    'specimen-report': true,
  },
};

export const MENU_DESCRIPTIONS = {
  // Admin menus
  'dashboard': 'Executive operations, KPI metrics, survey bookings pipeline, and recent activity.',
  'users-roles': 'Manage user accounts, client profiles, and RBAC menu visibility permissions.',
  'companies': 'Panel partnerships with London & UK estate agency branches and legal conveyancers.',
  'partner-portal': 'Estate Agent & Referral Partner Portal, referral commission tracking, and pipeline status.',
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
  // Customer menus (14 client portal tabs)
  'my-dashboard': 'Client overview, instruction progress tracker, and quick status actions.',
  'quotations': 'Received fee proposals, survey scope breakdown, and 1-click acceptance.',
  'my-bookings': 'Scheduled surveyor inspection date, property address, and arrival window.',
  'track-survey': 'Real-time 10-step survey progression status tracker from instruction to QA signoff.',
  'appointment-details': 'Confirmed site inspection date, arrival window, and private surveyor access coordination.',
  'assigned-surveyor': 'Assigned MRICS Chartered Surveyor profile, qualifications, and direct communication liaisons.',
  'terms-to-sign': 'Terms of engagement letter awaiting client digital e-signature.',
  'invoices-payments': 'Survey fee payment receipts, invoice PDF downloads, and card payments.',
  'reports': 'Finalized RICS Homebuyer / Building survey PDF report downloads.',
  'messages': 'Direct messaging thread between homebuyer client, surveyor, and back-office staff.',
  'leave-review': 'Verified Trustpilot feedback rating and client satisfaction testimonial.',
  'support': 'Helpdesk assistance, surveyor liaison queries, and phone support hotline.',
  'my-details': 'Client contact details, billing address, and notification preferences.',
  'previous-surveys': 'Archive history of past property survey instructions and past inspection reports.',
  // Partner / Estate Agent menus (Point 29)
  'submit-referral': 'Instant 1-click survey instruction referral submission modal with property preview.',
  'property-intel': 'UK Postcode Property Intelligence with EPC Energy Ratings, floor area (sqm), and Land Registry sold prices.',
  'specimen-report': 'Buyer sample RICS PDF specimen survey report download for estate agency clients.',
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
        partner: { ...DEFAULT_ROLE_PERMISSIONS.partner, ...(parsed.partner || {}) },
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
      if (item.id === 'dashboard' || item.id === 'my-dashboard' || (normalizedRole === 'partner' && item.id === 'partner-portal')) {
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

