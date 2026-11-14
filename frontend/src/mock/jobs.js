import { useState, useEffect } from 'react';

// Mock data for Survey Jobs, Booking Calendar and Job Details
export const SURVEYORS = [
  {
    id: 'srv-1',
    name: 'David Thorne MRICS',
    credentials: 'Experienced Surveyor (MCIOB, MRPSA, AssocRICS, LLB Hons, MEWI)',
    color: '#2563EB', // Blue
    bgLight: 'bg-blue-50 border-blue-200 text-blue-900',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80',
    postcodes: 'GU, KT, SW',
  },
  {
    id: 'srv-2',
    name: 'Oliver Hughes MRICS',
    credentials: 'Experienced Surveyor (BSC Hons Civil Engineering, MRPSA, DAE, Retrofit Assessor, SMSTS)',
    color: '#7C3AED', // Purple
    bgLight: 'bg-purple-50 border-purple-200 text-purple-900',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=128&q=80',
    postcodes: 'W, NW, WC',
  },
  {
    id: 'srv-3',
    name: 'Claire Bennet AssocRICS',
    credentials: 'Experienced Surveyor (BTEC Civil Engineering, MSC Building Surveying, MRPSA, ACABE)',
    color: '#059669', // Emerald
    bgLight: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=128&q=80',
    postcodes: 'TW, UB, SL',
  },
  {
    id: 'srv-4',
    name: 'Liam Foster',
    credentials: 'Guided Trainee Surveyor (RICS Candidate)',
    color: '#D97706', // Amber
    bgLight: 'bg-amber-50 border-amber-200 text-amber-900',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=128&q=80',
    postcodes: 'EC, SE, E',
  },
  {
    id: 'srv-5',
    name: 'Fiona Macintyre MRICS',
    credentials: 'Historic Buildings Consultant (MRICS Heritage)',
    color: '#E11D48', // Rose
    bgLight: 'bg-rose-50 border-rose-200 text-rose-900',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=128&q=80',
    postcodes: 'OX, RG, HP',
  },
];

export const INITIAL_JOBS = [];

export const syncRealCustomerJobs = (existingJobs = []) => {
  try {
    const regRaw = localStorage.getItem('property_group_registered_customers');
    const registered = regRaw ? JSON.parse(regRaw) : {};
    const leadsRaw = localStorage.getItem('propertygroup_crm_leads_v1');
    const leads = leadsRaw ? JSON.parse(leadsRaw) : [];
    const quotesRaw = localStorage.getItem('propertygroup_quotes');
    const quotes = quotesRaw ? JSON.parse(quotesRaw) : [];

    const realJobs = [];

    // Collect all emails from registered customers, leads, quotes
    const emails = new Set([
      ...Object.keys(registered),
      ...leads.map((l) => l.customerEmail || l.clientEmail).filter(Boolean),
      ...quotes.map((q) => q.clientEmail).filter(Boolean),
    ]);

    emails.forEach((emailRaw) => {
      const email = emailRaw.toLowerCase().trim();
      if (!email || email === 'customer@demo.com' || email === 'admin@demo.com' || email === 'surveyor@demo.com') return;

      const reg = registered[email] || {};
      const lead = leads.find((l) => (l.customerEmail || l.clientEmail || '').toLowerCase().trim() === email) || {};
      const quote = quotes.find((q) => (q.clientEmail || '').toLowerCase().trim() === email) || {};

      const existing = existingJobs.find(
        (j) => (j.customerEmail || j.clientEmail || '').toLowerCase().trim() === email
      );

      const jobNo = existing?.jobNo || quote.id || (lead.id ? `JOB-${lead.id.replace('LED-', '')}` : 'JOB-2026-880');
      const property = existing?.property || reg.address || lead.property || quote.property || 'HYDERABAD';
      const postcode = existing?.postcode || reg.postcode || lead.location || quote.location || 'GH12AA';
      const customer = existing?.customer || reg.name || lead.customer || quote.clientName || 'abc';
      const customerPhone = existing?.customerPhone || reg.phone || lead.customerPhone || '1234560789';
      const surveyType = existing?.surveyType || reg.serviceType || lead.surveyType || quote.surveyType || 'RICS Level 2 Home Survey';

      const isPaid = existing?.paymentStatus === 'Paid' || quote.status === 'Paid' || lead.status === 'Converted';
      const isSigned = existing?.termsStatus === 'Signed' || quote.termsStatus === 'Signed' || isPaid;

      const isScheduled = existing?.status?.toLowerCase() === 'scheduled' || (existing?.surveyor && existing.surveyor !== 'Pending Allocation' && existing.date && existing.date !== 'Pending Allocation');

      const realJob = {
        id: existing?.id || jobNo,
        jobNo: jobNo,
        date: existing?.date || 'Pending Allocation',
        timeSlot: existing?.timeSlot || '10:00 AM - 01:00 PM',
        customer,
        customerEmail: email,
        customerPhone,
        surveyType,
        property,
        location: postcode,
        postcode,
        surveyor: existing?.surveyor || 'Pending Allocation',
        surveyorId: existing?.surveyorId || 'srv-1',
        status: existing?.status || (isScheduled ? 'Scheduled' : 'Action Required'),
        termsStatus: isSigned ? 'Signed' : 'Pending',
        paymentStatus: isPaid ? 'Paid' : 'Pending',
        canBook: isPaid && isSigned,
        timelineStep: existing?.timelineStep || (isScheduled ? 6 : (isPaid ? 5 : 2)),
        accessNotes: existing?.accessNotes || 'Customer direct instruction via portal',
        backendSynced: false,
      };

      realJobs.push(realJob);
    });

    return realJobs;
  } catch (e) {
    console.error('Error syncing real customer jobs:', e);
    return [];
  }
};

export const getStoredJobs = () => {
  try {
    let stored = [];
    const raw = localStorage.getItem('propertygroup_jobs');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        stored = parsed;
      }
    }

    const realCustomerJobs = syncRealCustomerJobs(stored);

    // Filter out dummy demo jobs (Emma Watson, Oliver Vance, etc.)
    const nonDummyStored = stored.filter((j) => {
      const email = (j.customerEmail || j.clientEmail || '').toLowerCase().trim();
      return (
        email !== 'customer@demo.com' &&
        email !== 'customer2@demo.com' &&
        email !== 'oliver.vance@example.com' &&
        email !== 'charlotte.b@outlook.com'
      );
    });

    // Merge: real customer jobs first, followed by non-dummy stored
    const merged = [...realCustomerJobs];
    nonDummyStored.forEach((j) => {
      if (!merged.some((m) => m.jobNo === j.jobNo || m.id === j.id)) {
        merged.push(j);
      }
    });

    if (merged.length > 0) {
      return merged;
    }
    return realCustomerJobs;
  } catch (e) {
    console.error(e);
  }
  return [];
};

export const saveStoredJobs = (jobs) => {
  try {
    localStorage.setItem('propertygroup_jobs', JSON.stringify(jobs));
    window.dispatchEvent(new Event('propertygroup_jobs_updated'));
  } catch (e) {
    console.error(e);
  }
};

export const useJobs = () => {
  const [jobs, setJobsState] = useState(getStoredJobs);

  useEffect(() => {
    const onUpdate = () => {
      setJobsState(getStoredJobs());
    };
    window.addEventListener('propertygroup_jobs_updated', onUpdate);
    window.addEventListener('storage', onUpdate);
    return () => {
      window.removeEventListener('propertygroup_jobs_updated', onUpdate);
      window.removeEventListener('storage', onUpdate);
    };
  }, []);

  const setJobs = (updater) => {
    setJobsState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveStoredJobs(next);
      return next;
    });
  };

  const updateJob = (id, updates) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === id || j.jobNo === id ? { ...j, ...updates } : j))
    );
    const token = localStorage.getItem('property_group_auth_token');
    if (token && (updates.stage || updates.status)) {
      fetch(`/api/v1/survey-jobs/${id}/stage`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          newStage: (updates.stage || updates.status || '').toUpperCase().replace(/\s+/g, '_'),
          reason: updates.reason || 'Status updated via UI',
        }),
      }).catch(() => {});
    }
    if (token && (updates.date || updates.inspectionDate || updates.timeSlot)) {
      fetch(`/api/v1/survey-jobs/${id}/reschedule`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          inspectionDate: updates.inspectionDate || updates.date,
          inspectionTime: updates.inspectionTime || updates.timeSlot,
          surveyorId: updates.surveyorId,
          reason: updates.rescheduleReason || updates.reason || 'Rescheduled via CRM',
        }),
      }).catch(() => {});
    }
  };

  const addJob = (newJob) => {
    setJobs((prev) => [newJob, ...prev]);
    const token = localStorage.getItem('property_group_auth_token');
    if (token) {
      fetch('/api/v1/survey-jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceType: newJob.surveyType || 'RICS Level 2 Home Survey',
          propertyAddress: newJob.property || newJob.location || 'London Property',
          postcode: newJob.postcode || 'SW1A 1AA',
          clientName: newJob.customer || newJob.clientName || 'Private Client',
          clientEmail: newJob.customerEmail || 'client@example.com',
          clientPhone: newJob.customerPhone || '+44 7700 900000',
          baseFee: 650.0,
        }),
      }).catch(() => {});
    }
  };

  return { jobs, setJobs, updateJob, addJob };
};
