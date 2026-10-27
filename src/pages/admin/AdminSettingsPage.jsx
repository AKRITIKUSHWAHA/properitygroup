import React from 'react';
import { PlaceholderModule } from '../../components/PlaceholderModule';

export const AdminSettingsPage = () => {
  const stats = [
    { label: 'Platform Environment', value: 'Production', subtext: 'UK London AWS Cluster' },
    { label: 'Default Currency', value: 'GBP (£)', subtext: 'British Pounds Sterling' },
    { label: 'Date Localization', value: 'DD/MM/YYYY', subtext: 'UK Standard (GMT/BST)' },
    { label: 'RICS Document Engine', value: 'v2026.4', subtext: 'Up to date with regulations' },
  ];

  const columns = [
    { header: 'Configuration Parameter', accessor: 'key' },
    { header: 'Current Setting', accessor: 'value' },
    { header: 'Category', accessor: 'category' },
    { header: 'Last Modified', accessor: 'updated' },
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
    { key: 'VAT Registration Rate', value: '20.0% Standard UK Rate', category: 'Taxation & Finance', updated: '01/01/2026', status: 'Enforced' },
    { key: 'Lead SLA Expiration', value: '60 minutes', category: 'CRM Automation', updated: '12/03/2026', status: 'Active' },
    { key: 'Auto Terms Dispatch', value: 'Immediately upon Quote Approval', category: 'Workflow', updated: '05/06/2026', status: 'Active' },
    { key: 'Surveyor Booking Window', value: '08:00 - 18:00 Monday to Saturday', category: 'Calendar', updated: '15/07/2026', status: 'Active' },
    { key: 'Two-Factor Authentication (2FA)', value: 'Mandatory for Super Admin & Staff', category: 'Security', updated: '20/09/2026', status: 'Enforced' },
  ];

  return (
    <PlaceholderModule
      roleLabel="Super Admin"
      menuTitle="System Settings & Governance"
      menuDescription="Manage platform-wide settings, email notification triggers, UK VAT calculations, and security policies."
      stats={stats}
      columns={columns}
      data={data}
      actionLabel="Save Configuration"
    />
  );
};
