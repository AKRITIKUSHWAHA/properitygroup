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

// In-memory session store (no business data persisted in localStorage)
let memoryLeads = [];

export const getStoredLeads = () => memoryLeads;

export const saveStoredLeads = (leads) => {
  memoryLeads = Array.isArray(leads) ? leads : [];
  queueMicrotask(() => {
    window.dispatchEvent(new Event('propertygroup_leads_updated'));
  });
};

export const useLeads = () => {
  const [leads, setLeadsState] = useState(getStoredLeads);

  useEffect(() => {
    const onUpdate = () => {
      setLeadsState(getStoredLeads());
    };
    window.addEventListener('propertygroup_leads_updated', onUpdate);

    const token = localStorage.getItem('property_group_auth_token');
    let isAdminUser = false;
    try {
      const session = JSON.parse(localStorage.getItem('property_group_user_session') || '{}');
      const role = String(session?.role || '').toLowerCase();
      isAdminUser = role === 'admin' || role === 'super_admin';
    } catch {
      isAdminUser = false;
    }
    if (token && isAdminUser && memoryLeads.length === 0) {
      api
        .get('/crm-and-leads')
        .then((res) => {
          const raw = res?.leads || res?.data?.leads || [];
          if (Array.isArray(raw) && raw.length > 0 && memoryLeads.length === 0) {
            saveStoredLeads(
              raw.map((l) => ({
                ...l,
                dbId: l.id,
                id: formatLeadReference(l.reference || l.id, l.source),
                customerName: l.clientName || 'Private Client',
                clientName: l.clientName || 'Private Client',
                customer: l.clientName || 'Private Client',
                customerEmail: l.clientEmail || '',
                customerPhone: l.clientPhone || '',
                property: l.propertyAddress || '',
                enquiry: l.serviceType || 'Homebuyer Survey — Level 2',
                serviceType: l.serviceType || 'Homebuyer Survey — Level 2',
              }))
            );
          }
        })
        .catch((err) => {
          console.warn('Failed to load CRM leads from API:', err);
        });
    }

    return () => {
      window.removeEventListener('propertygroup_leads_updated', onUpdate);
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
    if (extraData?.skipApi) return;
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
        : undefined;

      api.patch(`/crm-and-leads/${leadId}/status`, {
        status: statusMap[newStatus] || (newStatus ? newStatus.toUpperCase() : 'NEW'),
        ...(numVal !== undefined && !isNaN(numVal) ? { estimatedValue: numVal } : {}),
      }).catch((err) => {
        console.warn('Failed to sync lead status update:', err);
      });
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
          clientName: newLead.customerName || '',
          clientEmail: newLead.customerEmail || '',
          clientPhone: newLead.customerPhone || null,
          propertyAddress: newLead.property || newLead.location || '',
          postcode: newLead.postcode || newLead.location?.split(',')?.pop()?.trim() || '',
          serviceType: newLead.enquiry || 'RICS Level 2 Home Survey',
          source: 'WEBSITE',
        }),
      }).catch((err) => {
        console.warn('Failed to sync new lead to backend:', err);
      });
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

    const token = localStorage.getItem('property_group_auth_token');
    if (token) {
      fetch(`/api/v1/crm-and-leads/${encodeURIComponent(leadId)}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).catch((err) => {
        console.warn('Failed to delete lead on backend:', err);
      });
    }
  };

  return { leads, setLeads, updateLeadStatus, addLead, deleteLead };
};
