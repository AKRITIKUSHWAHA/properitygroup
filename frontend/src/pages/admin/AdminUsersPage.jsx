import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  ShieldCheck,
  Sliders,
  Trash2,
  MoreVertical,
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Tabs } from '../../components/common/Tabs';
import { Table } from '../../components/common/Table';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../components/ToastContext';
import { ClientProfileModal } from '../../components/crm/ClientProfileModal';
import { useClientProfiles } from '../../mock/clientProfiles';
import { RolePermissionsManager } from '../../components/admin/RolePermissionsManager';

// 3-Dot Action Menu Component for Table Rows
const UserRowActions = ({ row, onSelectClientModal, onDeleteUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const isPrimaryAdmin = row.id === 'USR-01' || row.email === 'admin@demo.com';

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-[#0B1F4D] hover:bg-slate-100 transition-colors cursor-pointer"
        title="More Actions"
        aria-label="User actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
          {row.role === 'customer' && (
            <>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onSelectClientModal(row.email, 'calls');
                }}
                className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#0B1F4D] transition-colors cursor-pointer text-left"
              >
                <PhoneCall className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Call Notes</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onSelectClientModal(row.email, 'complaints');
                }}
                className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#0B1F4D] transition-colors cursor-pointer text-left"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span>Complaints</span>
              </button>
              <div className="h-px bg-slate-100 my-1" />
            </>
          )}

          {!isPrimaryAdmin ? (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onDeleteUser(row.id, row.name);
              }}
              className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete User</span>
            </button>
          ) : (
            <div className="px-3.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left">
              Primary Admin
            </div>
          )}
        </div>
      )}
    </div>
  );
};

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
      org: 'NJS Property Group HQ',
      status: 'Active',
    },
    {
      id: 'USR-02',
      name: 'David Thorne MRICS',
      email: 'surveyor@demo.com',
      role: 'surveyor',
      roleLabel: 'Surveyor',
      org: 'Thorne Chartered Surveyors',
      status: 'Active',
    },
    {
      id: 'USR-03',
      name: 'Oliver Hughes MRICS',
      email: 'oliver.hughes@njspropertygroup.com',
      role: 'surveyor',
      roleLabel: 'Surveyor',
      org: 'Hughes Building Surveyors',
      status: 'Active',
    },
    {
      id: 'USR-04',
      name: 'Claire Bennet AssocRICS',
      email: 'claire.bennet@njspropertygroup.com',
      role: 'surveyor',
      roleLabel: 'Surveyor',
      org: 'Bennet Defect Specialists',
      status: 'Active',
    },
    {
      id: 'USR-05',
      name: 'Emma Watson',
      email: 'customer@demo.com',
      role: 'customer',
      roleLabel: 'Customer',
      org: 'Watson Holdings UK',
      status: 'Active',
    },
    {
      id: 'USR-06',
      name: 'Lord Gregory Cavendish',
      email: 'cavendish.holdings@uknet.co.uk',
      role: 'customer',
      roleLabel: 'Customer',
      org: 'Private Client',
      status: 'Active',
    },
    {
      id: 'USR-07',
      name: 'Sarah Croft',
      email: 'partner@demo.com',
      role: 'partner',
      roleLabel: 'Estate Agent Partner',
      org: 'Foxtons Mayfair Branch',
      status: 'Active',
    },
  ]);

  const [searchParams] = useSearchParams();
  const initialView = searchParams.get('view') === 'permissions' || searchParams.get('tab') === 'permissions' ? 'permissions' : 'users';
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [mainView, setMainView] = useState(initialView); // 'users' | 'permissions'

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
      surveyor: 'Surveyor',
      customer: 'Customer',
      partner: 'Estate Agent Partner',
    };

    const newUser = {
      id: `USR-${String(users.length + 1).padStart(2, '0')}`,
      name: formData.name.trim(),
      email: formData.email.trim(),
      role: formData.role,
      roleLabel: roleMap[formData.role],
      org: formData.org.trim() || 'NJS Property Group',
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

  const handleDeleteUser = (userId, userName) => {
    if (userId === 'USR-01' || userName === 'Alexander Sterling') {
      addToast({
        type: 'warning',
        title: 'Action Protected',
        message: 'The primary Admin account cannot be deleted.',
      });
      return;
    }
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    addToast({
      type: 'info',
      title: 'User Removed',
      message: `${userName} has been removed from platform users.`,
    });
  };

  const tabs = useMemo(() => {
    return [
      { id: 'All', label: 'All Users', count: users.length },
      { id: 'super_admin', label: 'Admins', count: users.filter((u) => u.role === 'super_admin').length },
      { id: 'surveyor', label: 'Surveyors', count: users.filter((u) => u.role === 'surveyor').length },
      { id: 'customer', label: 'Customers', count: users.filter((u) => u.role === 'customer').length },
      { id: 'partner', label: 'Estate Agents', count: users.filter((u) => u.role === 'partner').length },
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
      header: 'Actions',
      sortable: false,
      className: 'text-right whitespace-nowrap',
      render: (_, row) => (
        <UserRowActions
          row={row}
          onSelectClientModal={(email, tab) => {
            setSelectedClientEmail(email);
            setClientModalTab(tab);
          }}
          onDeleteUser={handleDeleteUser}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <PageHeader
        title="Users & Access Roles"
        subtitle={
          mainView === 'permissions'
            ? 'Superadmin RBAC control: Activate or deactivate specific menu items for Admin, Surveyor, and Customer roles.'
            : 'Provision employee logins, define RBAC permissions, and manage chartered surveyor accounts across the UK.'
        }
        breadcrumb={['Admin', 'Users & Roles']}
        actionLabel={mainView === 'users' ? 'Add New User' : null}
        actionIcon={mainView === 'users' ? Plus : null}
        onAction={mainView === 'users' ? () => setIsAddModalOpen(true) : null}
      />

      {/* Main View Switcher: User Accounts vs Role Permissions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setMainView('users')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mainView === 'users'
                ? 'bg-white text-[#0B1F4D] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>User Accounts & Directory</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-700 font-semibold">
              {users.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMainView('permissions')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mainView === 'permissions'
                ? 'bg-[#0B1F4D] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>View Permissions</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-700 font-bold uppercase tracking-wider">
              Active / Inactive
            </span>
          </button>
        </div>

        {mainView === 'users' && (
          <div className="flex items-center gap-2 px-2">
            <button
              type="button"
              onClick={() => setMainView('permissions')}
              className="text-xs font-bold text-[#2563EB] hover:text-[#1d4ed8] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Sliders className="w-3 h-3" />
              <span>View Permissions</span>
            </button>
          </div>
        )}
      </div>

      {mainView === 'permissions' ? (
        /* Role Permissions & Visibility Manager */
        <RolePermissionsManager />
      ) : (
        /* User Accounts & Directory View */
        <div className="space-y-6">
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
        </div>
      )}

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
              placeholder="fiona@njspropertygroup.com"
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
                <option value="surveyor">Surveyor</option>
                <option value="customer">Customer</option>
                <option value="partner">Estate Agent / Referral Partner</option>
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
