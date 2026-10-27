import React from 'react';
import { PlaceholderModule } from '../../components/PlaceholderModule';

export const AdminTermsPage = () => {
  const stats = [
    { label: 'Active Standard Terms', value: '6 Templates', subtext: 'RICS compliant 2026' },
    { label: 'Digitally Executed (Oct)', value: '78 Signed', change: '+14% vs Sep', isPositive: true },
    { label: 'Client Sign Turnaround', value: '8.2 Hours', subtext: 'E-sign delivery speed' },
    { label: 'Terms Audit Passed', value: '100%', subtext: 'UK Consumer Rights Act verified' },
  ];

  const columns = [
    { header: 'Document / Agreement Title', accessor: 'title' },
    { header: 'Applicable Survey Types', accessor: 'types' },
    { header: 'Version', accessor: 'version' },
    { header: 'Last Revised', accessor: 'revised' },
    { header: 'Active Signatures', accessor: 'signatures' },
    {
      header: 'Status',
      accessor: 'status',
      render: (val) => (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
          {val}
        </span>
      ),
    },
  ];

  const data = [
    { title: 'Standard Terms of Engagement (RICS Level 2)', types: 'Level 2 Home Surveys', version: 'v3.2 UK', revised: '01/08/2026', signatures: '412', status: 'Active' },
    { title: 'Comprehensive Building Survey Terms (Level 3)', types: 'Level 3 Building Surveys', version: 'v4.0 UK', revised: '15/06/2026', signatures: '189', status: 'Active' },
    { title: 'Red Book Residential Valuation Terms', types: 'Valuations, Probate, Help to Buy', version: 'v2.8 UK', revised: '10/05/2026', signatures: '96', status: 'Active' },
    { title: 'Specific Defect & Structural Investigation Mandate', types: 'Crack, Subsidence, Dampness', version: 'v1.9 UK', revised: '20/04/2026', signatures: '64', status: 'Active' },
    { title: 'Commercial Dilapidations & Lease Terms', types: 'Commercial Landlord & Tenant', version: 'v2.1 UK', revised: '11/02/2026', signatures: '38', status: 'Active' },
  ];

  return (
    <PlaceholderModule
      roleLabel="Super Admin"
      menuTitle="Terms of Engagement & Legal Documents"
      menuDescription="Manage digital signature templates, liability disclaimers, RICS mandatory engagement terms, and client consent."
      stats={stats}
      columns={columns}
      data={data}
      actionLabel="Upload Terms Template"
    />
  );
};
