import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  Shield,
  UserCheck,
  UserX,
  Mail,
  Building,
  Key,
  CheckCircle2,
  Lock,
  PhoneCall,
  AlertTriangle,
  Eye,
  ShieldAlert,
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Tabs } from '../../components/common/Tabs';
import { Table } from '../../components/common/Table';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../components/ToastContext';
import { ClientProfileModal } from '../../components/crm/ClientProfileModal';
import { useClientProfiles } from '../../mock/clientProfiles';

export const AdminUsersPage = () => {
  const { addToast } = useToast();
  const { profiles } = useClientProfiles();
  const [selectedClientEmail, setSelectedClientEmail] = useState(null);
  const [clientModalTab, setClientModalTab] = useState('calls');

  const [users, setUsers] = useState([
    {
      id: 'USR-01',
      name: 'Alexander Sterling',
      email: 'admin@demo.com',
      role: 'super_admin',
      roleLabel: 'Admin',
      org: 'UK Property Surveying Practice HQ',
      lastLogin: '27/10/2026, 17:40',
      status: 'Active',
    },
    {
      id: 'USR-02',
      name: 'Sarah Jenkins',
      email: 'staff@demo.com',
      role: 'admin_staff',
      roleLabel: 'Admin / Staff',
      org: 'UK Property Surveying Practice',
      lastLogin: '27/10/2026, 16:15',
      status: 'Active',
    },
    {
      id: 'USR-03',
      name: 'David Thorne MRICS',
      email: 'surveyor@demo.com',
      role: 'surveyor',
      roleLabel: 'Surveyor',
      org: 'Thorne Chartered Surveyors',
      lastLogin: '27/10/2026, 14:30',
      status: 'Active',
    },
    {
      id: 'USR-04',
      name: 'Oliver Hughes MRICS',
      email: 'oliver.hughes@propertygroup.co.uk',
      role: 'surveyor',
      roleLabel: 'Surveyor',
      org: 'Hughes Building Surveyors',
      lastLogin: '26/10/2026, 18:20',
      status: 'Active',
    },
    {
      id: 'USR-05',
      name: 'Claire Bennet AssocRICS',
      email: 'claire.bennet@propertygroup.co.uk',
      role: 'surveyor',
      roleLabel: 'Surveyor',
      org: 'Bennet Defect Specialists',
      lastLogin: '26/10/2026, 11:05',
      status: 'Active',
    },
    {
      id: 'USR-06',
      name: 'Emma Watson',
      email: 'customer@demo.com',
      role: 'customer',
      roleLabel: 'Customer',
      org: 'Watson Holdings UK',
      lastLogin: '27/10/2026, 12:45',
      status: 'Active',
    },
    {
      id: 'USR-07',
      name: 'Lord Gregory Cavendish',
      email: 'cavendish.holdings@uknet.co.uk',
      role: 'customer',
      roleLabel: 'Customer',
      org: 'Private Client',
      lastLogin: '25/10/2026, 09:12',
      status: 'Active',
    },
  ]);

  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'surveyor',
    org: '',
    tempPassword: '',
  });

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;

    const roleMap = {
      super_admin: 'Admin',
      admin_staff: 'Admin / Staff',
      surveyor: 'Surveyor',
      customer: 'Customer',
    };

    const newUser = {
      id: `USR-${String(users.length + 1).padStart(2, '0')}`,
      name: formData.name.trim(),
      email: formData.email.trim(),
      role: formData.role,
      roleLabel: roleMap[formData.role],
      org: formData.org.trim() || 'UK Property Surveying Practice',
      lastLogin: 'Never',
      status: 'Active',
    };

    setUsers((prev) => [newUser, ...prev]);
    setIsAddModalOpen(false);
    setFormData({ name: '', email: '', role: 'surveyor', org: '', tempPassword: '' });

    addToast({
      type: 'success',
      title: 'User Provisioned',
      message: `${newUser.name} added as ${newUser.roleLabel}. Welcome credentials dispatched.`,
    });
  };

  const tabs = useMemo(() => {
    return [
      { id: 'All', label: 'All Users', count: users.length },
      { id: 'super_admin', label: 'Admins', count: users.filter((u) => u.role === 'super_admin').length },
      { id: 'admin_staff', label: 'Staff', count: users.filter((u) => u.role === 'admin_staff').length },
      { id: 'surveyor', label: 'Surveyors', count: users.filter((u) => u.role === 'surveyor').length },
      { id: 'customer', label: 'Customers', count: users.filter((u) => u.role === 'customer').length },
    ];
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (activeTab !== 'All' && u.role !== activeTab) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.org.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [users, activeTab, searchTerm]);

  const columns = [
    {
      key: 'name',
      header: 'Full Legal Name',
      sortable: true,
      render: (val, row) => {
        if (row.role === 'customer') {
          return (
            <button
              onClick={() => {
                setSelectedClientEmail(row.email);
                setClientModalTab('calls');
              }}
              className="text-left group cursor-pointer"
            >
              <div className="font-bold text-[#0B1F4D] group-hover:text-[#2563EB] group-hover:underline text-xs flex items-center gap-1.5">
                <span>{val}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 text-[#2563EB] font-bold">Client Profile</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">{row.email}</div>
            </button>
          );
        }
        return (
          <div>
            <div className="font-bold text-slate-900 text-xs">{val}</div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">{row.email}</div>
          </div>
        );
      },
    },
    {
      key: 'roleLabel',
      header: 'Assigned Role',
      sortable: true,
      render: (val, row) => {
        let badgeColor = 'bg-[#0B1F4D] text-white';
        if (row.role === 'admin_staff') badgeColor = 'bg-blue-100 text-[#2563EB] border border-blue-200';
        if (row.role === 'surveyor') badgeColor = 'bg-purple-100 text-purple-800 border border-purple-200';
        if (row.role === 'customer') badgeColor = 'bg-emerald-100 text-emerald-800 border border-emerald-200';

        return (
          <span className={`px-2.5 py-1 rounded-xl text-xs font-bold ${badgeColor}`}>
            {val}
          </span>
        );
      },
    },
    {
      key: 'org',
      header: 'Organisation / Practice',
      sortable: true,
      className: 'text-xs text-slate-700 font-medium',
    },
    {
      key: 'lastLogin',
      header: 'Last Authentication',
      sortable: true,
      className: 'font-mono text-xs text-slate-500',
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (val) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          {val}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Client History & Logs',
      sortable: false,
      className: 'text-right whitespace-nowrap',
      render: (_, row) => {
        if (row.role === 'customer') {
          const profile = profiles[row.email];
          const callsCount = profile?.calls?.length || 0;
          const complaints = profile?.complaints || [];
          const openComplaintsCount = complaints.filter(
            (c) => c.status === 'Open' || c.status === 'Under Investigation'
          ).length;

          return (
            <div className="flex items-center justify-end gap-1.5">
              <button
                onClick={() => {
                  setSelectedClientEmail(row.email);
                  setClientModalTab('calls');
                }}
                title="View & Log Call Notes with exact timestamps"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 hover:bg-[#0B1F4D] text-[#2563EB] hover:text-white text-[11px] font-bold transition-all border border-blue-200/80 cursor-pointer"
              >
                <PhoneCall className="w-3 h-3" />
                <span>Call Notes ({callsCount})</span>
              </button>

              <button
                onClick={() => {
                  setSelectedClientEmail(row.email);
                  setClientModalTab('complaints');
                }}
                title="Dedicated Client Complaints Register"
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer border ${
                  openComplaintsCount > 0
                    ? 'bg-rose-100 hover:bg-rose-600 text-rose-800 hover:text-white border-rose-300 animate-pulse'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
              >
                <AlertTriangle className="w-3 h-3" />
                <span>Complaints ({complaints.length})</span>
              </button>
            </div>
          );
        }

        return (
          <span className="text-[11px] font-medium text-slate-400">
            Internal Staff
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <PageHeader
        title="Users & Access Roles"
        subtitle="Provision employee logins, define RBAC permissions, and manage chartered surveyor accounts across the UK."
        breadcrumb={['Admin', 'Users & Roles']}
        actionLabel="Add New User"
        actionIcon={Plus}
        onAction={() => setIsAddModalOpen(true)}
      />

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Search Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, or practice..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:bg-white"
          />
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={filteredUsers}
        pageSize={10}
        emptyTitle="No users found"
        emptyMessage="No platform users match the chosen role or search term."
      />

      {/* Add User Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Provision Platform User"
        subtitle="Grant role-based credentials and send onboarding invitation."
        maxWidth="max-w-lg"
        footer={
          <>
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="add-user-form"
              className="px-5 py-2 rounded-xl bg-[#0B1F4D] text-white text-xs font-bold hover:bg-[#162E6E] cursor-pointer"
            >
              Create Account
            </button>
          </>
        }
      >
        <form id="add-user-form" onSubmit={handleAddUser} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Legal Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Fiona Macintyre MRICS"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
            <input
              type="email"
              required
              placeholder="fiona@propertygroup.co.uk"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assigned Role *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
              >
                <option value="super_admin">Admin</option>
                <option value="admin_staff">Admin / Staff</option>
                <option value="surveyor">Surveyor</option>
                <option value="customer">Customer</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Organisation</label>
              <input
                type="text"
                placeholder="e.g. Macintyre Surveying"
                value={formData.org}
                onChange={(e) => setFormData({ ...formData, org: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Client Profile, Call Notes & Complaints Modal */}
      <ClientProfileModal
        isOpen={!!selectedClientEmail}
        onClose={() => setSelectedClientEmail(null)}
        clientEmail={selectedClientEmail}
        initialTab={clientModalTab}
      />
    </div>
  );
};
