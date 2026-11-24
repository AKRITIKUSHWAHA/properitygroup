// Client Profiles Mock Store with Call Communication Notes & Dedicated Complaints Log
// Matches exact NJS Property Group specifications

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'property_group_client_profiles_v1';

export const INITIAL_CLIENT_PROFILES = {};

// React hook for reading and updating client profiles with call logs & complaints
export function useClientProfiles() {
  const [profiles, setProfiles] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse client profiles from localStorage:', e);
    }
    return INITIAL_CLIENT_PROFILES;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    } catch (e) {
      console.warn('Failed to save client profiles to localStorage:', e);
    }
  }, [profiles]);

  // Add call log
  const addCallLog = (clientEmail, callData) => {
    setProfiles((prev) => {
      const existing = prev[clientEmail] || {
        id: `CLT-${Date.now().toString().slice(-4)}`,
        name: callData.clientName || 'Client',
        email: clientEmail,
        phone: callData.clientPhone || '',
        address: callData.clientAddress || '',
        clientType: 'Private Client',
        status: 'Active Client',
        totalSpent: '£0.00',
        activeJobs: [],
        calls: [],
        complaints: [],
      };

      const newCall = {
        id: `CALL-${Date.now().toString().slice(-4)}`,
        timestamp: callData.timestamp || new Date().toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        direction: callData.direction || 'Inbound',
        staff: callData.staff || 'Sarah Jenkins',
        duration: callData.duration || '5 mins',
        subject: callData.subject || 'Telephone Inquiry',
        notes: callData.notes || '',
        tags: callData.tags || ['Call Log'],
      };

      return {
        ...prev,
        [clientEmail]: {
          ...existing,
          calls: [newCall, ...(existing.calls || [])],
        },
      };
    });
  };

  // Add complaint
  const addComplaint = (clientEmail, complaintData) => {
    setProfiles((prev) => {
      const existing = prev[clientEmail] || {
        id: `CLT-${Date.now().toString().slice(-4)}`,
        name: complaintData.clientName || 'Client',
        email: clientEmail,
        phone: complaintData.clientPhone || '',
        address: complaintData.clientAddress || '',
        clientType: 'Private Client',
        status: 'Active Client',
        totalSpent: '£0.00',
        activeJobs: [],
        calls: [],
        complaints: [],
      };

      const newComplaint = {
        id: `CMP-${Date.now().toString().slice(-4)}`,
        loggedAt: complaintData.loggedAt || new Date().toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        category: complaintData.category || 'General Service',
        severity: complaintData.severity || 'Medium',
        status: complaintData.status || 'Open',
        subject: complaintData.subject || 'Client Complaint',
        description: complaintData.description || '',
        assignedTo: complaintData.assignedTo || 'Sarah Jenkins',
        resolvedAt: null,
        resolutionNotes: null,
      };

      return {
        ...prev,
        [clientEmail]: {
          ...existing,
          complaints: [newComplaint, ...(existing.complaints || [])],
        },
      };
    });
  };

  // Update complaint status / resolution
  const updateComplaint = (clientEmail, complaintId, updateData) => {
    setProfiles((prev) => {
      const existing = prev[clientEmail];
      if (!existing || !existing.complaints) return prev;

      const updatedComplaints = existing.complaints.map((c) => {
        if (c.id === complaintId) {
          return {
            ...c,
            ...updateData,
            resolvedAt: updateData.status === 'Resolved' && !c.resolvedAt ? new Date().toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : c.resolvedAt,
          };
        }
        return c;
      });

      return {
        ...prev,
        [clientEmail]: {
          ...existing,
          complaints: updatedComplaints,
        },
      };
    });
  };

  return {
    profiles,
    addCallLog,
    addComplaint,
    updateComplaint,
  };
}

