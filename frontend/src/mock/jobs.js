import { useState, useEffect, useCallback } from 'react';

// UK standard date normalizer (DD/MM/YYYY)
export const normalizeToUKDate = (dateVal) => {
  if (!dateVal) return '';
  const str = String(dateVal).split('T')[0].split(',')[0].trim();
  if (!str) return '';

  if (str.includes('/')) {
    const parts = str.split('/');
    if (parts.length === 3) {
      const d = parts[0].padStart(2, '0');
      const m = parts[1].padStart(2, '0');
      const y = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
      return `${d}/${m}/${y}`;
    }
  }

  if (str.includes('-')) {
    const parts = str.split('-');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        const y = parts[0];
        const m = parts[1].padStart(2, '0');
        const d = parts[2].padStart(2, '0');
        return `${d}/${m}/${y}`;
      } else {
        const d = parts[0].padStart(2, '0');
        const m = parts[1].padStart(2, '0');
        const y = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
        return `${d}/${m}/${y}`;
      }
    }
  }

  try {
    const dt = new Date(str);
    if (!isNaN(dt.getTime())) {
      const d = String(dt.getDate()).padStart(2, '0');
      const m = String(dt.getMonth() + 1).padStart(2, '0');
      const y = dt.getFullYear();
      return `${d}/${m}/${y}`;
    }
  } catch {}

  return str;
};

/**
 * Universal surveyor job isolation & matching helper
 * Returns true if a job belongs to the surveyor user or if viewing as Admin/Central Operations.
 */
export const isJobForSurveyor = (job, user) => {
  if (!job) return false;
  if (!user) return true;
  // If user is admin/super_admin exploring or previewing the surveyor portal, show all assigned surveyor jobs!
  if (
    user.role === 'super_admin' ||
    user.role === 'admin' ||
    user.email === 'admin@demo.com' ||
    user.email === 'njsadmin@gmail.com' ||
    (user.name && user.name.toLowerCase() === 'admin')
  ) {
    return true;
  }
  const userSrvId = String(user.surveyorId || user.id || '').replace(/^srv-/, '').replace(/^usr_/, '').toLowerCase().trim();
  const jobSrvId = String(job.surveyorId || '').replace(/^srv-/, '').replace(/^usr_/, '').toLowerCase().trim();
  if (userSrvId && jobSrvId && userSrvId === jobSrvId) {
    return true;
  }
  const userName = (user.name || '').toLowerCase().trim();
  const jobSurveyor = (job.surveyor || '').toLowerCase().trim();
  if (userName && jobSurveyor) {
    if (userName === jobSurveyor) return true;
    if (jobSurveyor.includes(userName) || userName.includes(jobSurveyor)) return true;
    if (
      (userName.includes('surveyor') || userName.includes('david')) &&
      (jobSurveyor.includes('surveyor') || jobSurveyor.includes('david'))
    ) {
      return true;
    }
  }
  const userEmail = (user.email || '').toLowerCase().trim();
  const jobSurveyorEmail = (job.surveyorEmail || '').toLowerCase().trim();
  if (userEmail && jobSurveyorEmail && userEmail === jobSurveyorEmail) return true;

  if (user.role === 'surveyor' && (!job.surveyorId || job.surveyorId === 'srv-1' || job.surveyorId === '1')) {
    return true;
  }
  return false;
};

// Mock data for Survey Jobs, Booking Calendar and Job Details
export const SURVEYORS = [
  {
    id: 'srv-1',
    dbId: 1,
    name: 'test surveyor',
    email: 'surveyor@njspropertygroup.com',
    credentials: 'RICS Chartered Surveyor (MRICS)',
    color: '#2563EB', // Blue
    bgLight: 'bg-blue-50 border-blue-200 text-blue-900',
    avatar: null,
    postcodes: 'SW, W, KT, GU',
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
        let needsResave = false;
        const sanitized = parsed.map((j) => {
          let updatedJob = { ...j };
          if (
            updatedJob.surveyorId === 'srv-32' ||
            updatedJob.surveyor === 'surveyor' ||
            (typeof updatedJob.surveyor === 'string' && updatedJob.surveyor.toLowerCase().startsWith('surveyor'))
          ) {
            needsResave = true;
            updatedJob.surveyorId = 'srv-1';
            updatedJob.surveyor = 'test surveyor';
            updatedJob.surveyorEmail = updatedJob.surveyorEmail || 'surveyor@njspropertygroup.com';
          }
          const isEnquiry = updatedJob.status === 'Enquiry' || updatedJob.stage === 'enquiry' || updatedJob.stage === 'ENQUIRY' || updatedJob.isNewInstruction || !updatedJob.quote;
          if (isEnquiry && (updatedJob.paymentStatus === 'Claimed (Verification Pending)' || (updatedJob.timelineStep || 0) > 2 || updatedJob.termsStatus === 'Signed')) {
            needsResave = true;
            return {
              ...updatedJob,
              paymentStatus: 'Pending',
              termsStatus: 'Pending',
              timelineStep: 1,
              stage: 'enquiry',
              status: 'Enquiry',
            };
          }
          return updatedJob;
        });

        // Deduplicate jobs by unique ID / JobNo
        const seenIds = new Set();
        const deduplicated = [];
        for (const j of sanitized) {
          const key = String(j.id || j.jobNo || j.reference || '').toUpperCase().trim();
          if (key) {
            if (seenIds.has(key)) {
              needsResave = true;
              continue;
            }
            seenIds.add(key);
          }
          deduplicated.push(j);
        }

        if (needsResave) {
          try {
            localStorage.setItem('propertygroup_jobs', JSON.stringify(deduplicated));
          } catch {}
        }
        return deduplicated.filter((j) => {
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
            name !== 'aashi saket' &&
            name !== 'dd' &&
            name !== 'test k' &&
            !addr.includes('mp nagar') &&
            !addr.includes('bhopal') &&
            !addr.includes('plot no 45') &&
            addr !== 'subject property' &&
            !addr.startsWith('subject property') &&
            idStr !== 'QUO-PENDING' &&
            jobNoStr !== 'QUO-PENDING' &&
            idStr !== '7' &&
            idStr !== '11' &&
            idStr !== '12' &&
            idStr !== '13' &&
            idStr !== 'JOB-2026-101' &&
            jobNoStr !== 'JOB-2026-101' &&
            idStr !== 'JOB-2026-702' &&
            jobNoStr !== 'JOB-2026-702' &&
            jobNoStr !== 'JOB-2026-7289' &&
            jobNoStr !== 'JOB-2026-6173' &&
            jobNoStr !== 'JOB-2026-7681'
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
      localStorage.setItem('propertygroup_payment_paid', 'true');
      if (customerEmail) {
        localStorage.setItem(`propertygroup_delivered_${customerEmail}`, 'true');
        localStorage.setItem(`propertygroup_payment_paid_${customerEmail}`, 'true');
      }
      if (!updates.paymentStatus) {
        updates.paymentStatus = 'Paid';
      }
    }

    setJobs((prev) => {
      let found = false;
      const next = prev.map((j) => {
        const cleanId = String(id || '').toUpperCase().trim();
        const cleanJId = String(j.id || '').toUpperCase().trim();
        const cleanJobNo = String(j.jobNo || '').toUpperCase().trim();
        const cleanRef = String(j.reference || '').toUpperCase().trim();

        const normId = cleanId.replace('NJS-', 'JOB-');
        const normJId = cleanJId.replace('NJS-', 'JOB-');
        const normJobNo = cleanJobNo.replace('NJS-', 'JOB-');
        const normRef = cleanRef.replace('NJS-', 'JOB-');

        const digitsId = cleanId.replace(/[^0-9]/g, '');
        const digitsJId = cleanJId.replace(/[^0-9]/g, '');
        const digitsJobNo = cleanJobNo.replace(/[^0-9]/g, '');
        const digitsRef = cleanRef.replace(/[^0-9]/g, '');
        const hasMatchingDigits = Boolean(
          digitsId &&
          digitsId.length >= 4 &&
          (digitsJId.includes(digitsId) || digitsJobNo.includes(digitsId) || digitsRef.includes(digitsId) || digitsId.includes(digitsJId) || digitsId.includes(digitsJobNo))
        );

        const matches =
          cleanJId === cleanId ||
          cleanJobNo === cleanId ||
          cleanRef === cleanId ||
          (j.dbId && String(j.dbId) === cleanId) ||
          (normId && (normJId === normId || normJobNo === normId || normRef === normId)) ||
          hasMatchingDigits ||
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
    setJobs((prev) => {
      const cleanNewId = String(newJob.id || newJob.jobNo || newJob.reference || '').toUpperCase().trim();
      const filtered = prev.filter((j) => {
        const cleanJId = String(j.id || j.jobNo || j.reference || '').toUpperCase().trim();
        return cleanJId !== cleanNewId;
      });
      return [newJob, ...filtered];
    });
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
