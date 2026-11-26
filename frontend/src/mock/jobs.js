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
  } catch (err) {
    console.warn('Failed to parse UK date:', err);
  }

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

// In-memory session store (no business data persisted in localStorage)
let memoryJobs = [];

export const getStoredJobs = () => memoryJobs;

export const saveStoredJobs = (jobs) => {
  memoryJobs = Array.isArray(jobs) ? jobs : [];
  setTimeout(() => {
    window.dispatchEvent(new Event('propertygroup_jobs_updated'));
  }, 0);
};

export const useJobs = () => {
  const [jobs, setJobsState] = useState(getStoredJobs);

  useEffect(() => {
    const onUpdate = () => {
      setJobsState(getStoredJobs());
    };
    window.addEventListener('propertygroup_jobs_updated', onUpdate);

    // Hydrate from backend API if in-memory store is empty and user is authenticated
    const token = localStorage.getItem('property_group_auth_token');
    if (token && memoryJobs.length === 0) {
      fetch('/api/v1/survey-jobs', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((res) => {
          const raw = res?.data?.jobs || res?.jobs || [];
          if (Array.isArray(raw) && raw.length > 0 && memoryJobs.length === 0) {
            saveStoredJobs(
              raw.map((j) => ({
                ...j,
                id: j.reference || `JOB-${j.id}`,
                dbId: j.id,
                jobNo: j.reference || `JOB-${j.id}`,
                customer: j.clientName,
                customerEmail: j.clientEmail,
                customerPhone: j.clientPhone,
                property: j.propertyAddress,
                surveyType: j.serviceType,
                date: j.inspectionDate ? normalizeToUKDate(j.inspectionDate) : 'Date: TBD',
                timeSlot: j.inspectionTime || 'Time: TBD',
                surveyor: j.surveyor?.name || 'Pending Allocation',
              }))
            );
          }
        })
        .catch((err) => {
          console.warn('Failed to load survey jobs from API:', err);
        });
    }

    return () => {
      window.removeEventListener('propertygroup_jobs_updated', onUpdate);
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
    if ((updates.status === 'Completed' || updates.timelineStep >= 10) && !updates.paymentStatus) {
      updates.paymentStatus = 'Paid';
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
          status: 'Enquiry',
          stage: 'ENQUIRY',
          timelineStep: 1,
          ...updates,
        });
      }
      return next;
    });

    const token = localStorage.getItem('property_group_auth_token');
    const VALID_STAGES = ['ENQUIRY', 'QUOTE_ISSUED', 'QUOTE_ACCEPTED', 'TERMS_SIGNED', 'PAID', 'BOOKED', 'INSPECTED', 'DRAFTING', 'QA_REVIEW', 'COMPLETE'];
    if (token && !updates._skipBackendSync && (updates.stage || updates.status)) {
      let stageName = (updates.stage || updates.status || '').toUpperCase().replace(/\s+/g, '_');
      if (stageName === 'PREPARING_REPORT') stageName = 'DRAFTING';
      if (stageName === 'ACCEPTED') stageName = 'QUOTE_ACCEPTED';
      if (stageName === 'QUOTE') stageName = 'QUOTE_ISSUED';
      if (['COMPLETED', 'DELIVERED'].includes(stageName)) stageName = 'COMPLETE';
      if (VALID_STAGES.includes(stageName)) {
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
        }).catch((err) => {
          console.warn('Failed to sync job stage update:', err);
        });
      }
    }
    const rawDateCandidate = String(updates.inspectionDate || updates.date || '').trim();
    const hasRealDate = Boolean(
      rawDateCandidate &&
      /\d/.test(rawDateCandidate) &&
      !rawDateCandidate.toLowerCase().includes('tbd') &&
      !rawDateCandidate.toLowerCase().includes('pending')
    );
    if (token && !updates._skipBackendSync && hasRealDate) {
      let numericSurveyorId = updates.surveyorId;
      if (typeof numericSurveyorId === 'string') {
        numericSurveyorId = parseInt(numericSurveyorId.replace('srv-', ''), 10) || undefined;
      }
      fetch(`/api/v1/survey-jobs/${id}/reschedule`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          inspectionDate: rawDateCandidate,
          inspectionTime: updates.inspectionTime || (updates.timeSlot && !String(updates.timeSlot).toLowerCase().includes('tbd') ? updates.timeSlot : undefined),
          ...(numericSurveyorId ? { surveyorId: numericSurveyorId } : {}),
          reason: updates.rescheduleReason || updates.reason || 'Rescheduled via UI',
        }),
      }).catch((err) => {
        console.warn('Failed to sync job reschedule:', err);
      });
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
    if (token && newJob._syncBackend) {
      fetch('/api/v1/survey-jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceType: newJob.surveyType || 'RICS Level 2 Home Survey',
          propertyAddress: newJob.property || newJob.propertyAddress || newJob.location || '',
          postcode: newJob.postcode || '',
          clientName: newJob.customer || newJob.clientName || '',
          clientEmail: newJob.customerEmail || newJob.clientEmail || '',
          clientPhone: newJob.customerPhone || newJob.clientPhone || '',
          baseFee: Number(newJob.quote?.baseFee || newJob.baseFee || 0),
          stage: newJob.timelineStep >= 5 ? 'PAID' : newJob.timelineStep === 4 ? 'QUOTE_ACCEPTED' : 'QUOTE_ISSUED',
        }),
      }).catch((err) => {
        console.warn('Failed to sync new job creation:', err);
      });
    }
  }, [setJobs]);

  return { jobs, setJobs, updateJob, addJob };
};
