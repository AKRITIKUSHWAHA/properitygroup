import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Users,
  Search,
  Plus,
  CheckCircle2,
  Lock,
  PhoneCall,
  AlertTriangle,
  Eye,
  EyeOff,
  Pencil,
  ShieldCheck,
  Sliders,
  Trash2,
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Tabs } from '../../components/common/Tabs';
import { Table } from '../../components/common/Table';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../components/ToastContext';
import { ClientProfileModal } from '../../components/crm/ClientProfileModal';
import { useClientProfiles } from '../../mock/clientProfiles';
import { RolePermissionsManager } from '../../components/admin/RolePermissionsManager';
import { adminUsersAndRolesApi } from '../../api/adminApi';

// User Actions Helper Functions and UI state


export const AdminUsersPage = () => {
  const { addToast } = useToast();
  const { profiles } = useClientProfiles();
  const [selectedClientEmail, setSelectedClientEmail] = useState(null);
  const [clientModalTab, setClientModalTab] = useState('calls');

  // Sync users with backend API
  useEffect(() => {
    adminUsersAndRolesApi.getUsers()
      .then((res) => {
        if (res?.data && res.data.length > 0) {
          const roleLabelMap = { ADMIN: 'Admin', SURVEYOR: 'Surveyor', CUSTOMER: 'Customer' };
          const mapped = res.data.map((u) => ({
            id: `USR-${String(u.id).padStart(2, '0')}`,
            dbId: u.id,
            name: u.name,
            email: u.email,
            role: u.role === 'ADMIN' ? 'super_admin' : u.role.toLowerCase(),
            roleLabel: roleLabelMap[u.role] || u.role,
            org: u.role === 'ADMIN' ? 'NJS Property Group HQ' : u.role === 'SURVEYOR' ? 'Thorne Chartered Surveyors' : 'Private Client',
            status: u.status === 'ACTIVE' ? 'Active' : 'Inactive',
            phone: u.phone || '',
          }));
          setUsers(mapped);
        }
      })
      .catch(() => {});
  }, []);

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

  const [showModalPassword, setShowModalPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'surveyor',
    org: '',
  });

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      addToast({
        type: 'warning',
        title: 'Missing Fields',
        message: 'Please provide legal name, email, and a password.',
      });
      return;
    }

    const roleMap = {
      super_admin: 'Admin',
      surveyor: 'Surveyor',
      customer: 'Customer',
      partner: 'Estate Agent Partner',
    };

    setIsSubmitting(true);
    try {
      // Persist to real backend database with hashed password
      const backendRole = formData.role === 'super_admin' ? 'ADMIN' : (formData.role === 'surveyor' ? 'SURVEYOR' : 'CUSTOMER');
      await adminUsersAndRolesApi.createUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password.trim(),
        role: backendRole,
      });

      const newUser = {
        id: `USR-${String(users.length + 1).padStart(2, '0')}`,
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
        roleLabel: roleMap[formData.role] || 'User',
        org: formData.org.trim() || 'NJS Property Group',
        lastLogin: 'Never',
        status: 'Active',
      };

      setUsers((prev) => [newUser, ...prev]);
      setIsAddModalOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'surveyor', org: '' });

      addToast({
        type: 'success',
        title: 'User Account Created',
        message: `${newUser.name} created! Can now log in using ${newUser.email} and the chosen password.`,
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Account Creation Failed',
        message: err?.message || 'Could not save user to database.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const [viewingUser, setViewingUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    role: 'surveyor',
    org: '',
    status: 'Active',
  });

  const handleViewUser = (user) => {
    setViewingUser(user);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name,
      role: user.role,
      org: user.org,
      status: user.status || 'Active',
    });
  };

  const handleSaveEditUser = async (e) => {
    e.preventDefault();
    if (!editFormData.name.trim()) return;

    const roleMap = {
      super_admin: 'Admin',
      surveyor: 'Surveyor',
      customer: 'Customer',
      partner: 'Estate Agent Partner',
    };

    setUsers((prev) =>
      prev.map((u) =>
        u.id === editingUser.id
          ? {
              ...u,
              name: editFormData.name.trim(),
              role: editFormData.role,
              roleLabel: roleMap[editFormData.role] || u.roleLabel,
              org: editFormData.org.trim() || u.org,
              status: editFormData.status,
            }
          : u
      )
    );

    if (typeof editingUser.id === 'number' || /^\d+$/.test(editingUser.id)) {
      try {
        await adminUsersAndRolesApi.updateUser(editingUser.id, {
          name: editFormData.name.trim(),
          role: editFormData.role === 'super_admin' ? 'ADMIN' : (editFormData.role === 'surveyor' ? 'SURVEYOR' : 'CUSTOMER'),
          status: editFormData.status.toUpperCase(),
        });
      } catch (err) {
        console.warn('Backend update error:', err?.message || err);
      }
    }

    setEditingUser(null);
    addToast({
      type: 'success',
      title: 'User Profile Updated',
      message: `${editFormData.name} has been successfully updated.`,
    });
  };

  const handleDeleteUser = async (userId, userName) => {
    if (userId === 'USR-01' || userName === 'Alexander Sterling' || userId === 6) {
      addToast({
        type: 'warning',
        title: 'Action Protected',
        message: 'The primary Admin account cannot be deleted.',
      });
      return;
    }

    setUsers((prev) => prev.filter((u) => u.id !== userId));

    if (typeof userId === 'number' || /^\d+$/.test(userId)) {
      try {
        await adminUsersAndRolesApi.deleteUser(userId);
      } catch (err) {
        console.warn('Backend delete error:', err?.message || err);
      }
    }

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
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          {/* 1. View User */}
          <button
            type="button"
            onClick={() => handleViewUser(row)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
            title="View User Details"
            aria-label="View user"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* 2. Edit User */}
          <button
            type="button"
            onClick={() => handleEditUser(row)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
            title="Edit User"
            aria-label="Edit user"
          >
            <Pencil className="w-4 h-4" />
          </button>

          {/* 3. Delete User */}
          <button
            type="button"
            onClick={() => handleDeleteUser(row.id, row.name)}
            disabled={row.id === 'USR-01' || row.email === 'admin@demo.com'}
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors cursor-pointer"
            title={row.id === 'USR-01' || row.email === 'admin@demo.com' ? 'Primary admin cannot be deleted' : 'Delete User'}
            aria-label="Delete user"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
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
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-[#0B1F4D] text-white text-xs font-bold hover:bg-[#162E6E] disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
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

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-semibold text-slate-700">Login Password *</label>
              <button
                type="button"
                onClick={() => setShowModalPassword(!showModalPassword)}
                className="text-[11px] text-[#2563EB] hover:underline flex items-center gap-1 cursor-pointer font-medium"
              >
                {showModalPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showModalPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showModalPassword ? 'text' : 'password'}
                required
                minLength={6}
                placeholder="Enter password (e.g. Password123!)"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:border-[#2563EB]"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              User will log in using this email and password. They can change it anytime in their profile.
            </p>
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

      {/* View User Details Modal */}
      <Modal
        isOpen={!!viewingUser}
        onClose={() => setViewingUser(null)}
        title="Platform User Profile"
        subtitle={viewingUser?.email || ''}
        maxWidth="max-w-md"
        footer={
          <button
            onClick={() => setViewingUser(null)}
            className="px-5 py-2 rounded-xl bg-[#0B1F4D] text-white text-xs font-bold hover:bg-[#162E6E] cursor-pointer"
          >
            Close
          </button>
        }
      >
        {viewingUser && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-10 h-10 rounded-full bg-[#0B1F4D] text-white font-bold flex items-center justify-center text-sm">
                {(viewingUser.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-sm text-slate-900 truncate">{viewingUser.name}</div>
                <div className="text-slate-500 text-xs truncate">{viewingUser.email}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Role</span>
                <span className="font-bold text-slate-800">{viewingUser.roleLabel || viewingUser.role}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Status</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
                  {viewingUser.status || 'Active'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Organisation</span>
                <span className="font-semibold text-slate-800 truncate block">{viewingUser.org || 'NJS Property Group'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Last Login</span>
                <span className="font-semibold text-slate-600 block">{viewingUser.lastLogin || 'Never'}</span>
              </div>
            </div>

            {viewingUser.role === 'customer' && (
              <div className="pt-2 border-t border-slate-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const email = viewingUser.email;
                    setViewingUser(null);
                    setSelectedClientEmail(email);
                    setClientModalTab('calls');
                  }}
                  className="flex-1 py-2 px-3 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call Notes</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const email = viewingUser.email;
                    setViewingUser(null);
                    setSelectedClientEmail(email);
                    setClientModalTab('complaints');
                  }}
                  className="flex-1 py-2 px-3 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-amber-100 transition-colors cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Complaints</span>
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title="Edit Platform User"
        subtitle={`Update details for ${editingUser?.name || 'user'}`}
        maxWidth="max-w-md"
        footer={
          <>
            <button
              onClick={() => setEditingUser(null)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="edit-user-form"
              className="px-5 py-2 rounded-xl bg-[#0B1F4D] text-white text-xs font-bold hover:bg-[#162E6E] cursor-pointer"
            >
              Save Changes
            </button>
          </>
        }
      >
        {editingUser && (
          <form id="edit-user-form" onSubmit={handleSaveEditUser} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Legal Name *</label>
              <input
                type="text"
                required
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={editingUser.email}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Email cannot be changed directly.</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Role *</label>
                <select
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                >
                  <option value="super_admin">Admin</option>
                  <option value="surveyor">Surveyor</option>
                  <option value="customer">Customer</option>
                  <option value="partner">Estate Agent / Referral Partner</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Organisation</label>
              <input
                type="text"
                value={editFormData.org}
                onChange={(e) => setEditFormData({ ...editFormData, org: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
              />
            </div>
          </form>
        )}
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
