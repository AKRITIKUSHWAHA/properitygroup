import { useState, useEffect, useCallback } from 'react';

// Mock data for Survey Jobs, Booking Calendar and Job Details
export const SURVEYORS = [
  {
    id: 'srv-32',
    dbId: 32,
    name: 'surveyor',
    email: 'njssurveyor@gmail.com',
    credentials: 'RICS Chartered Surveyor (MRICS)',
    color: '#2563EB', // Blue
    bgLight: 'bg-blue-50 border-blue-200 text-blue-900',
    avatar: null,
    postcodes: 'W, SW, WC',
  },
];

export const INITIAL_JOBS = [];

export const syncRealCustomerJobs = () => [];

// Auto-purge any obsolete test / dummy records from browser localStorage
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    ['propertygroup_jobs', 'propertygroup_leads', 'propertygroup_quotes', 'property_group_registered_customers'].forEach((key) => {
      const raw = localStorage.getItem(key);
      if (
        raw &&
        (raw.includes('akku') ||
          raw.includes('MP Nagar') ||
          raw.includes('Bhopal') ||
          raw.includes('JOB-2026-101') ||
          raw.includes('Plot No 45') ||
          raw.includes('QUO-PENDING') ||
          raw.includes('Subject Property'))
      ) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const cleaned = parsed.filter((item) => {
              const str = JSON.stringify(item).toLowerCase();
              const prop = (item.property || item.propertyAddress || item.location || '').toLowerCase().trim();
              const id = String(item.id || '').toUpperCase().trim();
              const jobNo = String(item.jobNo || '').toUpperCase().trim();
              return (
                !str.includes('akku') &&
                !str.includes('mp nagar') &&
                !str.includes('bhopal') &&
                !str.includes('plot no 45') &&
                prop !== 'subject property' &&
                !prop.startsWith('subject property') &&
                id !== 'QUO-PENDING' &&
                jobNo !== 'QUO-PENDING' &&
                item.id !== 7 &&
                item.id !== '7'
              );
            });
            localStorage.setItem(key, JSON.stringify(cleaned));
          } else if (typeof parsed === 'object' && parsed !== null) {
            Object.keys(parsed).forEach((k) => {
              if (k.toLowerCase().includes('akku') || JSON.stringify(parsed[k]).toLowerCase().includes('akku')) {
                delete parsed[k];
              }
            });
            localStorage.setItem(key, JSON.stringify(parsed));
          }
        } catch {}
      }
    });
  } catch {}
}

export const getStoredJobs = () => {
  try {
    const raw = localStorage.getItem('propertygroup_jobs');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((j) => {
          const email = (j.customerEmail || j.clientEmail || '').toLowerCase().trim();
          const name = (j.customer || j.clientName || j.name || '').toLowerCase().trim();
          const addr = (j.property || j.propertyAddress || j.location || '').toLowerCase().trim();
          const idStr = String(j.id || '').toUpperCase().trim();
          const jobNoStr = String(j.jobNo || '').toUpperCase().trim();
          return (
            email &&
            email !== 'customer@demo.com' &&
            email !== 'customer2@demo.com' &&
            email !== 'oliver.vance@example.com' &&
            email !== 'charlotte.b@outlook.com' &&
            !email.includes('emma.watson') &&
            !email.includes('kensingtonestates') &&
            !email.includes('akku') &&
            !name.includes('akku') &&
            !addr.includes('mp nagar') &&
            !addr.includes('bhopal') &&
            !addr.includes('plot no 45') &&
            addr !== 'subject property' &&
            !addr.startsWith('subject property') &&
            idStr !== 'QUO-PENDING' &&
            jobNoStr !== 'QUO-PENDING' &&
            idStr !== '7' &&
            idStr !== 'JOB-2026-101' &&
            jobNoStr !== 'JOB-2026-101'
          );
        });
      }
    }
  } catch (e) {
    console.error(e);
  }
  return [];
};

export const saveStoredJobs = (jobs) => {
  try {
    const serialized = JSON.stringify(jobs);
    if (localStorage.getItem('propertygroup_jobs') === serialized) {
      return;
    }
    localStorage.setItem('propertygroup_jobs', serialized);
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

  const setJobs = useCallback((updater) => {
    setJobsState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveStoredJobs(next);
      return next;
    });
  }, []);

  const updateJob = useCallback((id, updates) => {
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

    setJobs((prev) => {
      let found = false;
      const next = prev.map((j) => {
        const matches =
          j.id === id ||
          String(j.id) === String(id) ||
          j.jobNo === id ||
          String(j.jobNo) === String(id) ||
          (j.reference && String(j.reference) === String(id)) ||
          (j.dbId && String(j.dbId) === String(id)) ||
          (updates.customerEmail && j.customerEmail && j.customerEmail.toLowerCase() === updates.customerEmail.toLowerCase()) ||
          (typeof id === 'string' && id.includes('@') && j.customerEmail && j.customerEmail.toLowerCase() === id.toLowerCase()) ||
          (!id && j.customerEmail);
        if (matches) {
          found = true;
          return { ...j, ...updates };
        }
        return j;
      });

      if (!found && id) {
        next.push({
          id,
          jobNo: id,
          reference: id,
          status: 'Booked',
          stage: 'BOOKED',
          timelineStep: 6,
          ...updates,
        });
      }
      return next;
    });

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
      let numericSurveyorId = updates.surveyorId;
      if (typeof numericSurveyorId === 'string') {
        numericSurveyorId = parseInt(numericSurveyorId.replace('srv-', ''), 10) || 1;
      }
      fetch(`/api/v1/survey-jobs/${id}/reschedule`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          inspectionDate: updates.inspectionDate || updates.date,
          inspectionTime: updates.inspectionTime || updates.timeSlot,
          surveyorId: numericSurveyorId,
          reason: updates.rescheduleReason || updates.reason || 'Rescheduled via CRM',
        }),
      }).catch(() => {});
    }
  }, [setJobs]);

  const addJob = useCallback((newJob) => {
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
          propertyAddress: newJob.property || newJob.propertyAddress || newJob.location || 'London Property',
          postcode: newJob.postcode || 'SW1A 1AA',
          clientName: newJob.customer || newJob.clientName || 'Private Client',
          clientEmail: newJob.customerEmail || newJob.clientEmail || 'client@example.com',
          clientPhone: newJob.customerPhone || newJob.clientPhone || '+44 7700 900000',
          baseFee: newJob.quote?.baseFee || 650.0,
          stage: newJob.timelineStep >= 5 ? 'PAID' : newJob.timelineStep === 4 ? 'ACCEPTED' : 'QUOTE',
        }),
      }).catch(() => {});
    }
  }, [setJobs]);

  return { jobs, setJobs, updateJob, addJob };
};
