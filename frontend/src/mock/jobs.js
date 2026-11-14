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

    const isDummyEmail = (em) => {
      const e = (em || '').toLowerCase().trim();
      return (
        !e ||
        e === 'customer@demo.com' ||
        e === 'customer2@demo.com' ||
        e === 'admin@demo.com' ||
        e === 'surveyor@demo.com' ||
        e.includes('emma.watson') ||
        e.includes('kensingtonestates') ||
        e.includes('harrison') ||
        e.includes('oliver.vance') ||
        e.includes('charlotte.b')
      );
    };

    let sessionEmail = '';
    try {
      const sess = JSON.parse(localStorage.getItem('property_group_user_session') || '{}');
      if (sess.email && !isDummyEmail(sess.email)) sessionEmail = sess.email.toLowerCase().trim();
    } catch {}

    // Collect all emails from registered customers, leads, quotes (filtering out all demo dummies)
    const emails = new Set([
      'astp750@gmail.com',
      ...(sessionEmail ? [sessionEmail] : []),
      ...Object.keys(registered).filter((em) => !isDummyEmail(em)),
      ...leads.map((l) => l.customerEmail || l.clientEmail).filter((em) => !isDummyEmail(em)),
      ...quotes.map((q) => q.clientEmail).filter((em) => !isDummyEmail(em)),
    ]);

    emails.forEach((emailRaw) => {
      const email = emailRaw.toLowerCase().trim();
      if (isDummyEmail(email)) return;

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

      // When customer signs terms & pays, they are fully verified
      const isPaid = true;
      const isSigned = true;

      const hasSurveyor = existing?.surveyor && existing.surveyor !== 'Pending Allocation';
      const assignedSurveyor = hasSurveyor ? existing.surveyor : 'David Thorne MRICS';
      const assignedDate = existing?.date && existing.date !== 'Pending Allocation' ? existing.date : '16 Nov 2026';

      const isInspected =
        existing?.status?.toLowerCase() === 'inspected' ||
        (existing?.timelineStep || 0) >= 7 ||
        localStorage.getItem('propertygroup_inspection_completed') === 'true' ||
        localStorage.getItem(`propertygroup_inspection_completed_${email}`) === 'true';

      const isDrafting =
        existing?.status?.toLowerCase() === 'drafting' ||
        (existing?.timelineStep || 0) >= 8 ||
        localStorage.getItem('propertygroup_drafting') === 'true' ||
        localStorage.getItem(`propertygroup_drafting_${email}`) === 'true';

      const isQAReview =
        existing?.status?.toLowerCase() === 'qa_review' ||
        existing?.status?.toLowerCase() === 'qa review' ||
        (existing?.timelineStep || 0) >= 9 ||
        localStorage.getItem('propertygroup_qareview') === 'true' ||
        localStorage.getItem(`propertygroup_qareview_${email}`) === 'true';

      const isCompleted =
        existing?.status?.toLowerCase() === 'completed' ||
        (existing?.timelineStep || 0) >= 10 ||
        localStorage.getItem('propertygroup_delivered') === 'true' ||
        localStorage.getItem(`propertygroup_delivered_${email}`) === 'true';

      let currentJobStatus = 'Booked';
      let currentTimelineStep = 6;

      if (isCompleted) {
        currentJobStatus = 'Completed';
        currentTimelineStep = 10;
      } else if (isQAReview) {
        currentJobStatus = 'QA_Review';
        currentTimelineStep = 9;
      } else if (isDrafting) {
        currentJobStatus = 'Drafting';
        currentTimelineStep = 8;
      } else if (isInspected) {
        currentJobStatus = 'Inspected';
        currentTimelineStep = 7;
      } else if (existing?.status && existing.status !== 'Booked') {
        currentJobStatus = existing.status;
        currentTimelineStep = existing.timelineStep || 6;
      }

      const realJob = {
        id: existing?.id || jobNo,
        jobNo: jobNo,
        date: assignedDate,
        timeSlot: existing?.timeSlot || '10:00 AM - 01:00 PM',
        customer,
        customerEmail: email,
        customerPhone,
        surveyType,
        property,
        location: postcode,
        postcode,
        surveyor: assignedSurveyor,
        surveyorId: existing?.surveyorId || 'srv-1',
        status: currentJobStatus,
        stage: currentJobStatus === 'Completed' ? 'COMPLETE' : (currentJobStatus === 'Inspected' || currentJobStatus === 'Drafting' ? 'PREPARING_REPORT' : 'BOOKED'),
        termsStatus: 'Signed',
        paymentStatus: 'Paid',
        canBook: true,
        timelineStep: currentTimelineStep,
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

    // Filter out dummy demo jobs (Emma Watson, Kensington Estates, Oliver Vance, etc.)
    const nonDummyStored = stored.filter((j) => {
      const email = (j.customerEmail || j.clientEmail || '').toLowerCase().trim();
      return (
        email &&
        email !== 'customer@demo.com' &&
        email !== 'customer2@demo.com' &&
        email !== 'oliver.vance@example.com' &&
        email !== 'charlotte.b@outlook.com' &&
        !email.includes('emma.watson') &&
        !email.includes('kensingtonestates') &&
        !email.includes('harrison')
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
    // Synchronize persistent milestone progress flags
    const customerEmail = (updates.customerEmail || '').toLowerCase().trim();
    if (updates.status === 'Inspected' || updates.timelineStep === 7) {
      localStorage.setItem('propertygroup_inspection_completed', 'true');
      if (customerEmail) localStorage.setItem(`propertygroup_inspection_completed_${customerEmail}`, 'true');
    }
    if (updates.status === 'Drafting' || updates.timelineStep === 8) {
      localStorage.setItem('propertygroup_drafting', 'true');
      if (customerEmail) localStorage.setItem(`propertygroup_drafting_${customerEmail}`, 'true');
    }
    if (updates.status === 'QA_Review' || updates.timelineStep === 9) {
      localStorage.setItem('propertygroup_qareview', 'true');
      if (customerEmail) localStorage.setItem(`propertygroup_qareview_${customerEmail}`, 'true');
    }
    if (updates.status === 'Completed' || updates.timelineStep >= 10) {
      localStorage.setItem('propertygroup_delivered', 'true');
      if (customerEmail) localStorage.setItem(`propertygroup_delivered_${customerEmail}`, 'true');
    }

    setJobs((prev) =>
      prev.map((j) => {
        const matches =
          j.id === id ||
          j.jobNo === id ||
          (updates.customerEmail && j.customerEmail && j.customerEmail.toLowerCase() === updates.customerEmail.toLowerCase()) ||
          (typeof id === 'string' && id.includes('@') && j.customerEmail && j.customerEmail.toLowerCase() === id.toLowerCase()) ||
          (!id && j.customerEmail);
        return matches ? { ...j, ...updates } : j;
      })
    );
    const token = localStorage.getItem('property_group_auth_token');
    if (token && (updates.stage || updates.status)) {
      let stageName = (updates.stage || updates.status || '').toUpperCase().replace(/\s+/g, '_');
      if (['INSPECTED', 'DRAFTING', 'QA_REVIEW'].includes(stageName)) {
        stageName = 'PREPARING_REPORT';
      } else if (['COMPLETED', 'DELIVERED'].includes(stageName)) {
        stageName = 'COMPLETE';
      }
      fetch(`/api/v1/survey-jobs/${id}/stage`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          newStage: stageName,
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
