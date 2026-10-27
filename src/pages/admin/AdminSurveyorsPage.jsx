import React from 'react';
import { PlaceholderModule } from '../../components/PlaceholderModule';

export const AdminSurveyorsPage = () => {
  const stats = [
    { label: 'Chartered Surveyors (MRICS/FRICS)', value: '34', change: '+4 this quarter', isPositive: true },
    { label: 'AssocRICS Specialists', value: '18', subtext: 'Residential defect assessors' },
    { label: 'Avg Report Turnaround', value: '2.3 Days', change: '-0.4d faster', isPositive: true },
    { label: 'Surveyor Satisfaction', value: '4.9 / 5.0', subtext: 'Client feedback score' },
  ];

  const columns = [
    { header: 'Surveyor Name', accessor: 'name' },
    { header: 'RICS Designation', accessor: 'credentials' },
    { header: 'Postcode Coverage', accessor: 'coverage' },
    { header: 'Assigned Jobs (Mo)', accessor: 'jobs' },
    { header: 'PII Insurance Expiry', accessor: 'piiExpiry' },
    {
      header: 'Availability',
      accessor: 'availability',
      render: (val) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
          val === 'Available' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
        }`}>
          {val}
        </span>
      ),
    },
  ];

  const data = [
    { name: 'David Thorne MRICS', credentials: 'MRICS Valuation & Building', coverage: 'GU, KT, SW Postcodes', jobs: '16', piiExpiry: '15/12/2026', availability: 'On Site' },
    { name: 'Oliver Hughes MRICS', credentials: 'MRICS Residential', coverage: 'W, NW, WC Postcodes', jobs: '14', piiExpiry: '08/11/2026', availability: 'Available' },
    { name: 'Claire Bennet AssocRICS', credentials: 'AssocRICS Home Surveys', coverage: 'TW, UB, SL Postcodes', jobs: '12', piiExpiry: '22/01/2027', availability: 'Available' },
    { name: 'Jonathan Cross FRICS', credentials: 'FRICS Commercial & Dilapidations', coverage: 'EC, SE, E Postcodes', jobs: '9', piiExpiry: '30/03/2027', availability: 'On Site' },
    { name: 'Fiona Macintyre MRICS', credentials: 'MRICS Historic Buildings', coverage: 'OX, RG, HP Postcodes', jobs: '11', piiExpiry: '19/09/2026', availability: 'Available' },
  ];

  return (
    <PlaceholderModule
      roleLabel="Super Admin"
      menuTitle="Surveyors Directory & Accreditation"
      menuDescription="Review RICS accreditations, Professional Indemnity Insurance (PII) renewals, regional postcode coverage, and allocations."
      stats={stats}
      columns={columns}
      data={data}
      actionLabel="Onboard Surveyor"
    />
  );
};
