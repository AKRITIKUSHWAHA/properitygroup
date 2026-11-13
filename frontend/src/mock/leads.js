import { useState, useEffect, useCallback } from 'react';

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

export const INITIAL_LEADS = [];

const LEADS_STORAGE_KEY = 'propertygroup_crm_leads_v1';

export const getStoredLeads = () => {
  try {
    if (!localStorage.getItem('njs_fresh_leads_clean_v1')) {
      localStorage.removeItem(LEADS_STORAGE_KEY);
      localStorage.setItem('njs_fresh_leads_clean_v1', 'true');
      return [];
    }
    const raw = localStorage.getItem(LEADS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed reading leads from storage', e);
  }
  return [];
};

export const saveStoredLeads = (leads) => {
  try {
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads));
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
      fetch(`/api/v1/crm-and-leads/${leadId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: statusMap[newStatus] || newStatus.toUpperCase() }),
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
    setLeads((prev) => prev.filter((l) => l.id !== leadId));
  };

  return { leads, setLeads, updateLeadStatus, addLead, deleteLead };
};
