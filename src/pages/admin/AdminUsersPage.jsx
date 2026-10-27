import React from 'react';
import { PlaceholderModule } from '../../components/PlaceholderModule';

export const AdminUsersPage = () => {
  const stats = [
    { label: 'Total Platform Users', value: '148', change: '+12 this month', isPositive: true },
    { label: 'Super Admins', value: '3', subtext: 'Full root permissions' },
    { label: 'Admin / Operations', value: '18', subtext: 'Job management & dispatch' },
    { label: 'External Surveyors', value: '42', subtext: 'Chartered & AssocRICS' },
  ];

  const columns = [
    { header: 'Full Name', accessor: 'name' },
    { header: 'Email Address', accessor: 'email' },
    {
      header: 'Assigned Role',
      accessor: 'role',
      render: (val) => (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#0B1F4D] text-white">
          {val}
        </span>
      ),
    },
    { header: 'Organisation', accessor: 'org' },
    { header: 'Last Login', accessor: 'lastLogin' },
    {
      header: 'Status',
      accessor: 'status',
      render: (val) => (
        <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800">
          {val}
        </span>
      ),
    },
  ];

  const data = [
    { name: 'Alexander Sterling', email: 'admin@demo.com', role: 'Super Admin', org: 'Property Group HQ', lastLogin: '27/10/2026, 15:45', status: 'Active' },
    { name: 'Sarah Jenkins', email: 'staff@demo.com', role: 'Admin / Staff', org: 'Property Group UK', lastLogin: '27/10/2026, 14:10', status: 'Active' },
    { name: 'David Thorne MRICS', email: 'surveyor@demo.com', role: 'Surveyor', org: 'Thorne Chartered Surveyors', lastLogin: '27/10/2026, 09:30', status: 'Active' },
    { name: 'Emma Watson', email: 'customer@demo.com', role: 'Customer', org: 'Watson Holdings UK', lastLogin: '26/10/2026, 18:20', status: 'Active' },
    { name: 'Marcus Bell FRICS', email: 'marcus.bell@surveys.co.uk', role: 'Surveyor', org: 'Bell & Co Surveyors', lastLogin: '25/10/2026, 11:05', status: 'Active' },
  ];

  return (
    <PlaceholderModule
      roleLabel="Super Admin"
      menuTitle="Users & Roles"
      menuDescription="Manage system credentials, role-based access control, security rules, and user provisioning."
      stats={stats}
      columns={columns}
      data={data}
      actionLabel="Add User"
    />
  );
};
