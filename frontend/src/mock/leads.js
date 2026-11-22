import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/apiClient';

// Mock data for CRM & Leads
// Lead sources: Website, Referral, Local Surveyors Direct, Email Inquiry, Google Ads, Partner, Expert Witness form
// Tabs / Statuses: All, New, Contacted, Qualified, Quoted, Converted, Lost

export const LEAD_SOURCES = [
  'Website',
  'Local Surveyors Direct',
  'Email Inquiry',
  'Referral',
  'Google Ads',
  'Partner',
  'Expert Witness form',
];

export const LEAD_STATUSES = [
  'New',
  'Contacted',
  'Qualified',
  'Quoted',
  'Converted',
  'Lost',
];

export const formatLeadReference = (id, source) => {
  if (!id) return `NJS-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const strId = String(id).trim();
  if (strId.startsWith('LSD-') || strId.startsWith('NJS-') || strId.startsWith('JOB-')) {
    return strId;
  }
  const isLsd = (source || '').toLowerCase().includes('lsd') || (source || '').toLowerCase().includes('local');
  const numPart = strId.replace(/[^0-9]/g, '') || String(Math.floor(1000 + Math.random() * 9000));
  const prefix = isLsd ? 'LSD' : 'NJS';
  return `${prefix}-2026-${String(numPart).padStart(4, '0').slice(-4)}`;
};

export const INITIAL_LEADS = [];

const LEADS_STORAGE_KEY = 'propertygroup_crm_leads_v1';
const DELETED_LEADS_KEY = 'propertygroup_deleted_lead_ids';

export const getStoredLeads = () => {
  try {
    if (!localStorage.getItem('njs_fresh_leads_clean_v1')) {
      localStorage.removeItem(LEADS_STORAGE_KEY);
      localStorage.setItem('njs_fresh_leads_clean_v1', 'true');
      return [];
    }
    const rawDeleted = localStorage.getItem(DELETED_LEADS_KEY) || '[]';
    const deletedSet = new Set(JSON.parse(rawDeleted).map(String));

    const raw = localStorage.getItem(LEADS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((l) => {
            const name = (l.customerName || l.clientName || '').toLowerCase().trim();
            const email = (l.customerEmail || l.clientEmail || '').toLowerCase().trim();
            const addr = (l.property || l.propertyAddress || '').toLowerCase().trim();
            const idStr = String(l.id || '').trim();
            const dbIdStr = String(l.dbId || '').trim();
            const refStr = String(l.reference || '').trim();
            const formattedRef = formatLeadReference(l.reference || l.id, l.source);

            const isDeleted =
              deletedSet.has(idStr) ||
              deletedSet.has(dbIdStr) ||
              deletedSet.has(refStr) ||
              deletedSet.has(formattedRef) ||
              (email && (deletedSet.has(email) || deletedSet.has(email.toLowerCase())));

            return (
              !isDeleted &&
              !name.includes('akku') &&
              !email.includes('akku') &&
              !addr.includes('mp nagar') &&
              !addr.includes('bhopal') &&
              l.id !== 7
            );
          })
          .map((l) => {
            const emailStr = (l.customerEmail || l.clientEmail || '').toLowerCase().trim();
            const fallbackName = emailStr.includes('astp750')
              ? 'test k'
              : emailStr.includes('niamh')
              ? 'Niamh Richmond'
              : 'Private Client';
            const resolvedName = l.customerName || l.clientName || l.customer || fallbackName;
            const resolvedEnquiry = l.enquiry || l.serviceType || l.surveyType || 'Homebuyer Survey — Level 2';
            return {
              ...l,
              id: formatLeadReference(l.id, l.source),
              customerName: resolvedName,
              clientName: resolvedName,
              customer: resolvedName,
              enquiry: resolvedEnquiry,
              serviceType: resolvedEnquiry,
              surveyType: resolvedEnquiry,
            };
          });
      }
    }
  } catch (e) {
    console.error('Failed reading leads from storage', e);
  }
  return [];
};

export const saveStoredLeads = (leads) => {
  try {
    const serialized = JSON.stringify(leads);
    if (localStorage.getItem(LEADS_STORAGE_KEY) === serialized) {
      return;
    }
    localStorage.setItem(LEADS_STORAGE_KEY, serialized);
    window.dispatchEvent(new Event('propertygroup_leads_updated'));
  } catch (e) {
    console.error('Failed saving leads to storage', e);
  }
};

export const useLeads = () => {
  const [leads, setLeadsState] = useState(getStoredLeads);

  useEffect(() => {
    const onUpdate = () => {
      setLeadsState(getStoredLeads());
    };
    window.addEventListener('propertygroup_leads_updated', onUpdate);
    window.addEventListener('storage', onUpdate);
    return () => {
      window.removeEventListener('propertygroup_leads_updated', onUpdate);
      window.removeEventListener('storage', onUpdate);
    };
  }, []);

  const setLeads = useCallback((updater) => {
    setLeadsState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveStoredLeads(next);
      return next;
    });
  }, []);

  const updateLeadStatus = (leadId, newStatus, extraData = {}) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== leadId) return l;
        return {
          ...l,
          status: newStatus,
          ...extraData,
        };
      })
    );
    const token = localStorage.getItem('property_group_auth_token');
    if (token) {
      const statusMap = {
        New: 'NEW',
        Contacted: 'CONTACTED',
        Quoted: 'QUOTE_SENT',
        Converted: 'CONVERTED',
        Lost: 'LOST',
      };
      const numVal = extraData.estimatedValue
        ? parseFloat(String(extraData.estimatedValue).replace(/[^0-9.]/g, ''))
        : (newStatus === 'Converted' || newStatus === 'Quoted' ? 660.0 : undefined);

      api.patch(`/crm-and-leads/${leadId}/status`, {
        status: statusMap[newStatus] || (newStatus ? newStatus.toUpperCase() : 'NEW'),
        ...(numVal !== undefined && !isNaN(numVal) ? { estimatedValue: numVal } : {}),
      }).catch(() => {});
    }
  };

  const addLead = (newLead) => {
    setLeads((prev) => [newLead, ...prev]);
    const token = localStorage.getItem('property_group_auth_token');
    if (token) {
      fetch('/api/v1/crm-and-leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          clientName: newLead.customerName || 'Private Client',
          clientEmail: newLead.customerEmail || 'client@example.com',
          clientPhone: newLead.customerPhone || '+44 7700 900000',
          propertyAddress: newLead.property || newLead.location || 'London Property',
          postcode: newLead.location?.split(',')?.pop()?.trim() || 'W1K 2PB',
          serviceType: newLead.enquiry || 'RICS Level 2 Home Survey',
          source: 'WEBSITE',
        }),
      }).catch(() => {});
    }
  };

  const deleteLead = (leadId) => {
    const isEmail = typeof leadId === 'string' && leadId.includes('@');
    const cleanEmail = isEmail ? leadId.toLowerCase().trim() : '';

    setLeads((prev) =>
      prev.filter((l) => {
        const lEmail = (l.customerEmail || l.clientEmail || '').toLowerCase().trim();
        if (cleanEmail && lEmail === cleanEmail) return false;
        return (
          l.id !== leadId &&
          String(l.dbId) !== String(leadId) &&
          String(l.reference) !== String(leadId)
        );
      })
    );

    // Persist deleted lead ID in localStorage so refreshes never bring it back
    try {
      const raw = localStorage.getItem(DELETED_LEADS_KEY) || '[]';
      const ids = JSON.parse(raw);
      const strId = String(leadId).trim();
      if (!ids.includes(strId)) {
        ids.push(strId);
      }
      if (cleanEmail && !ids.includes(cleanEmail)) {
        ids.push(cleanEmail);
      }
      localStorage.setItem(DELETED_LEADS_KEY, JSON.stringify(ids));
    } catch (_) {}

    // Dispatch DELETE to backend API
    const token = localStorage.getItem('property_group_auth_token');
    if (token) {
      fetch(`/api/v1/crm-and-leads/${encodeURIComponent(leadId)}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).catch(() => {});
    }
  };

  return { leads, setLeads, updateLeadStatus, addLead, deleteLead };
};
