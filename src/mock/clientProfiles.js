// Client Profiles Mock Store with Call Communication Notes & Dedicated Complaints Log
// Matches exact UK Property Surveying Practice specifications

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'property_group_client_profiles_v1';

export const INITIAL_CLIENT_PROFILES = {
  'customer@demo.com': {
    id: 'CLT-1001',
    name: 'Emma Watson',
    email: 'customer@demo.com',
    phone: '+44 7700 900147',
    address: '14 Mayfair Gate, Mayfair, London W1K 2PB',
    clientType: 'First-Time Residential Buyer',
    status: 'Active Client',
    totalSpent: '£650.00',
    activeJobs: ['JOB-2026-084'],
    calls: [
      {
        id: 'CALL-501',
        timestamp: '28/10/2026, 11:15 AM',
        direction: 'Inbound',
        staff: 'Sarah Jenkins',
        duration: '5 mins',
        subject: 'Inquiry on Surveyor arrival time window',
        notes: 'Client called asking for exact surveyor arrival window for 14 Mayfair Gate inspection. Informed her David Thorne MRICS is scheduled between 09:30 AM - 11:30 AM tomorrow. Client confirmed estate agent has key ready.',
        tags: ['Access Confirmation', 'Schedule'],
      },
      {
        id: 'CALL-502',
        timestamp: '26/10/2026, 03:45 PM',
        direction: 'Outbound',
        staff: 'Sarah Jenkins',
        duration: '7 mins',
        subject: 'Terms of Engagement follow-up',
        notes: 'Called client to assist with e-signing the RICS Level 2 Home Survey terms and answering payment portal queries. Client completed payment via card during the call.',
        tags: ['Payment', 'Terms Signed'],
      },
      {
        id: 'CALL-503',
        timestamp: '25/10/2026, 10:20 AM',
        direction: 'Inbound',
        staff: 'Alexander Sterling',
        duration: '8 mins',
        subject: 'Initial quotation discussion (Level 2 vs Level 3)',
        notes: 'Client called after receiving quote online. Discussed differences between Level 2 and Level 3 surveys. Given property is 1930s purpose-built flat in reasonable order, recommended Level 2 with valuation. Client accepted quote of £650.',
        tags: ['Quotation', 'Scope Advice'],
      },
    ],
    complaints: [
      {
        id: 'CMP-201',
        loggedAt: '27/10/2026, 04:30 PM',
        category: 'Booking Reschedule',
        severity: 'Medium',
        status: 'Resolved',
        subject: 'Initial inspection slot changed due to surveyor court attendance',
        description: 'Client called dissatisfied that Monday inspection slot was moved by 24 hours. She had taken time off work to be at the property with the surveyor.',
        assignedTo: 'Sarah Jenkins',
        resolvedAt: '27/10/2026, 05:45 PM',
        resolutionNotes: 'Spoke with client directly, apologised for the unavoidable court summons delay for David Thorne. Arranged priority first slot Wednesday morning and provided complimentary aerial drone roof imagery upgrade worth £95. Client expressed appreciation and marked satisfied.',
      },
    ],
  },

  'cavendish.holdings@uknet.co.uk': {
    id: 'CLT-1002',
    name: 'Lord Gregory Cavendish',
    email: 'cavendish.holdings@uknet.co.uk',
    phone: '+44 20 7946 0912',
    address: '19 Eaton Place, Belgravia, London SW1X 8BN',
    clientType: 'High-Net-Worth Portfolio Investor',
    status: 'VIP Client',
    totalSpent: '£2,800.00',
    activeJobs: ['JOB-2026-081'],
    calls: [
      {
        id: 'CALL-504',
        timestamp: '27/10/2026, 02:10 PM',
        direction: 'Outbound',
        staff: 'Alexander Sterling',
        duration: '12 mins',
        subject: 'Heritage listed building consent query',
        notes: 'Director called client private office to debrief on Grade II* listed building alterations discovered during preliminary search. Instructed surveyor to verify English Heritage approvals during inspection.',
        tags: ['Heritage Consent', 'Executive'],
      },
    ],
    complaints: [],
  },

  'harrison.croft@example.co.uk': {
    id: 'CLT-1003',
    name: 'Harrison Croft',
    email: 'harrison.croft@example.co.uk',
    phone: '+44 7700 900512',
    address: '12 Pembroke Square, Kensington, London W8 6PA',
    clientType: 'Residential Homebuyer',
    status: 'Prospect / Quoted',
    totalSpent: '£0.00',
    activeJobs: [],
    calls: [
      {
        id: 'CALL-505',
        timestamp: '27/10/2026, 04:15 PM',
        direction: 'Inbound',
        staff: 'Sarah Jenkins',
        duration: '6 mins',
        subject: 'Basement dampness survey scope',
        notes: 'Client called after LSD quote was sent. Explained that our Level 3 Building Survey includes comprehensive electronic moisture profiling with Protimeter Surveymaster across all subterranean walls.',
        tags: ['Damp Inspection', 'Pre-Sale'],
      },
    ],
    complaints: [
      {
        id: 'CMP-202',
        loggedAt: '28/10/2026, 09:15 AM',
        category: 'Quote Pricing Query',
        severity: 'Low',
        status: 'Under Investigation',
        subject: 'Competitor quote matching request on Level 3 survey',
        description: 'Client phoned questioning why our proposal of £1,450 is higher than an online panel quote of £1,200. Client prefers our chartered MRICS credentials but requested a fee review.',
        assignedTo: 'Alexander Sterling',
        resolvedAt: null,
        resolutionNotes: 'Currently reviewing surveyor mileage and schedule to assess if a £75 courtesy discount can be extended.',
      },
    ],
  },

  'priya.s@sharmainvest.com': {
    id: 'CLT-1004',
    name: 'Priya Sharma',
    email: 'priya.s@sharmainvest.com',
    phone: '+44 7700 900891',
    address: '45 Park Mansions, Battersea, London SW11 4HG',
    clientType: 'Buy-To-Let Purchaser',
    status: 'Active Client',
    totalSpent: '£595.00',
    activeJobs: ['JOB-2026-083'],
    calls: [
      {
        id: 'CALL-506',
        timestamp: '27/10/2026, 05:05 PM',
        direction: 'Outbound',
        staff: 'Sarah Jenkins',
        duration: '4 mins',
        subject: 'Key collection from Dexters Battersea confirmed',
        notes: 'Phoned client as requested after 5 PM to confirm key collection from local agent Dexters has been authorised and inspection is scheduled for Friday 10 AM.',
        tags: ['Key Collection', 'Scheduling'],
      },
    ],
    complaints: [],
  },
};

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
