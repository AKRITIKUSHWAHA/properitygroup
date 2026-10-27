import React from 'react';
import { PlaceholderModule } from '../../components/PlaceholderModule';

export const AdminCompaniesPage = () => {
  const stats = [
    { label: 'Registered Survey Firms', value: '38', change: '+3 this quarter', isPositive: true },
    { label: 'Corporate Clients', value: '94', subtext: 'Estate agencies & conveyancers' },
    { label: 'Active Service Contracts', value: '£310,000', subtext: 'Annual retainers (GBP)' },
    { label: 'Compliance Rating', value: '100%', subtext: 'RICS certified firms' },
  ];

  const columns = [
    { header: 'Company Name', accessor: 'company' },
    { header: 'Type', accessor: 'type' },
    { header: 'Location / City', accessor: 'location' },
    { header: 'Contact Person', accessor: 'contact' },
    { header: 'Total Surveys Conducted', accessor: 'surveys' },
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
    { company: 'Property Group Services Ltd', type: 'Parent Group', location: 'London EC2V', contact: 'Sarah Jenkins', surveys: '420', status: 'Active' },
    { company: 'Thorne Chartered Surveyors', type: 'Surveyor Practice', location: 'Surrey GU1', contact: 'David Thorne MRICS', surveys: '185', status: 'Active' },
    { company: 'Savills Residential Panel', type: 'Corporate Partner', location: 'London W1G', contact: 'Jonathan Ward', surveys: '94', status: 'Active' },
    { company: 'Knight Frank Surveying', type: 'Corporate Partner', location: 'London SW1A', contact: 'Helena Croft', surveys: '142', status: 'Active' },
    { company: 'Watson Holdings UK', type: 'Commercial Client', location: 'Mayfair W1K', contact: 'Emma Watson', surveys: '12', status: 'Active' },
  ];

  return (
    <PlaceholderModule
      roleLabel="Super Admin"
      menuTitle="Companies & Panel Practices"
      menuDescription="Manage surveying partnerships, corporate estate agency panels, panel agreements, and billing entities."
      stats={stats}
      columns={columns}
      data={data}
      actionLabel="Register Company"
    />
  );
};
