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

export const syncRealCustomerJobs = () => [];

export const getStoredJobs = () => {
  try {
    const raw = localStorage.getItem('propertygroup_jobs');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((j) => {
          const email = (j.customerEmail || j.clientEmail || '').toLowerCase().trim();
          return (
            email &&
            email !== 'customer@demo.com' &&
            email !== 'customer2@demo.com' &&
            email !== 'astp750@gmail.com' &&
            email !== 'oliver.vance@example.com' &&
            email !== 'charlotte.b@outlook.com' &&
            !email.includes('emma.watson') &&
            !email.includes('kensingtonestates') &&
            !email.includes('harrison')
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
