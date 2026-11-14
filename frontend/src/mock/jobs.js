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

export const INITIAL_JOBS = [
  {
    id: '1',
    jobNo: 'JOB-2026-080',
    date: '14 Nov 2026',
    timeSlot: '10:00 AM - 01:00 PM',
    customer: 'Emma Watson',
    customerEmail: 'customer@demo.com',
    customerPhone: '+44 7911 123456',
    surveyType: 'RICS Level 2 Home Survey',
    property: '14 Mayfair Gate',
    location: 'Mayfair, London',
    postcode: 'W1K 2PB',
    surveyor: 'David Thorne MRICS',
    surveyorId: 'srv-1',
    status: 'Scheduled',
    termsStatus: 'Signed',
    paymentStatus: 'Paid',
    canBook: true,
    accessNotes: 'Keys held at Foxtons Mayfair under branch reference FX-402',
    keyProtocol: 'AGENT_PICKUP',
  },
  {
    id: '2',
    jobNo: 'JOB-2026-081',
    date: '18 Oct 2026',
    timeSlot: '02:00 PM - 05:30 PM',
    customer: 'Emma Watson',
    customerEmail: 'customer@demo.com',
    customerPhone: '+44 7911 123456',
    surveyType: 'RICS Level 3 Building Survey',
    property: '88 Belgrave Square',
    location: 'Belgravia, London',
    postcode: 'SW1X 8PH',
    surveyor: 'David Thorne MRICS',
    surveyorId: 'srv-1',
    status: 'Completed',
    termsStatus: 'Signed',
    paymentStatus: 'Paid',
    canBook: true,
    accessNotes: 'Vendor present on site. Full loft & basement inspection completed.',
    reportUrl: 'https://storage.googleapis.com/property-group-reports/JOB-2026-081-L3-Final.pdf',
  },
  {
    id: '3',
    jobNo: 'JOB-2026-082',
    date: '16 Nov 2026',
    timeSlot: '11:00 AM - 02:00 PM',
    customer: 'Harrison Sterling',
    customerEmail: 'customer2@demo.com',
    customerPhone: '+44 7700 900333',
    surveyType: 'RICS Level 3 Building Survey',
    property: '27 Kensington Church St',
    location: 'Kensington, London',
    postcode: 'W8 4LL',
    surveyor: 'Oliver Hughes MRICS',
    surveyorId: 'srv-2',
    status: 'Action Required',
    termsStatus: 'Sent',
    paymentStatus: 'Awaiting Payment',
    canBook: false,
    accessNotes: 'Dexters Kensington key lockbox 4912 on side entrance',
  },
  {
    id: '4',
    jobNo: 'JOB-2026-083',
    date: '12 Nov 2026',
    timeSlot: '09:30 AM - 12:30 PM',
    customer: 'Oliver Vance',
    customerEmail: 'oliver.vance@example.com',
    customerPhone: '+44 7700 900555',
    surveyType: 'RICS Red Book Valuation',
    property: '12 Richmond Hill',
    location: 'Richmond, London',
    postcode: 'TW10 6QX',
    surveyor: 'Jonathan Cross FRICS',
    surveyorId: 'srv-4',
    status: 'In Progress',
    termsStatus: 'Signed',
    paymentStatus: 'Paid',
    canBook: true,
    accessNotes: 'Access arranged via Savills Residential Richmond',
  },
  {
    id: '5',
    jobNo: 'JOB-2026-084',
    date: '15 Nov 2026',
    timeSlot: '01:00 PM - 04:00 PM',
    customer: 'Charlotte Bronte',
    customerEmail: 'charlotte.b@outlook.com',
    customerPhone: '+44 7700 900666',
    surveyType: 'New Build Snagging Survey',
    property: '5 The Courtyard, Highgate',
    location: 'Highgate, London',
    postcode: 'N6 4BA',
    surveyor: 'Claire Bennet AssocRICS',
    surveyorId: 'srv-3',
    status: 'Scheduled',
    termsStatus: 'Signed',
    paymentStatus: 'Paid',
    canBook: true,
    accessNotes: 'Site manager customer care office at plot 5',
  },
];

export const getStoredJobs = () => {
  try {
    if (!localStorage.getItem('njs_fresh_jobs_v2')) {
      localStorage.setItem('njs_fresh_jobs_v2', 'true');
      localStorage.setItem('propertygroup_jobs', JSON.stringify(INITIAL_JOBS));
      return INITIAL_JOBS;
    }
    const raw = localStorage.getItem('propertygroup_jobs');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error(e);
  }
  return INITIAL_JOBS;
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
      prev.map((j) => (j.id === id ? { ...j, ...updates } : j))
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
