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
  Mail,
  Phone,
  Building,
  Calendar,
  Clock,
  Award,
  Copy,
  MapPin,
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Tabs } from '../../components/common/Tabs';
import { Table } from '../../components/common/Table';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../components/ToastContext';
import { ClientProfileModal } from '../../components/crm/ClientProfileModal';
import { useClientProfiles } from '../../mock/clientProfiles';
import { RolePermissionsManager } from '../../components/admin/RolePermissionsManager';
import { adminUsersAndRolesApi, adminSurveyorsApi, adminCrmAndLeadsApi } from '../../api/adminApi';

const DEFAULT_PLATFORM_USERS = [
  {
    id: 'USR-29',
    dbId: 29,
    name: 'admin',
    email: 'njsadmin@gmail.com',
    role: 'super_admin',
    roleLabel: 'Admin',
    org: 'NJS Property Group HQ',
    status: 'Active',
    phone: '+44 20 7946 0912',
    createdAt: '19 Nov 2026',
    lastLogin: 'Active Now',
    clientJobsCount: 0,
    assignedJobsCount: 0,
  },
  {
    id: 'USR-45',
    dbId: 45,
    name: 'test surveyor',
    email: 'njssurveyor@gmail.com',
    role: 'surveyor',
    roleLabel: 'Chartered Surveyor',
    org: 'NJS Chartered Surveyors Practice',
    status: 'Active',
    phone: '1234567890',
    createdAt: '21 Nov 2026',
    lastLogin: 'Active Today',
    clientJobsCount: 0,
    assignedJobsCount: 8,
  },
];

const PROTECTED_PLATFORM_EMAILS = new Set([
  'njsadmin@gmail.com',
  'njssurveyor@gmail.com',
]);

export const AdminUsersPage = () => {
  const { addToast } = useToast();
  const { profiles } = useClientProfiles();
  const [selectedClientEmail, setSelectedClientEmail] = useState(null);
  const [clientModalTab, setClientModalTab] = useState('calls');

  // Sync users with backend API (Single Source of Truth)
  const fetchUsers = async () => {
    try {
      const [usersRes, leadsRes] = await Promise.allSettled([
        adminUsersAndRolesApi.getUsers(),
        adminCrmAndLeadsApi.getLeads(),
      ]);

      const rawUsers = usersRes.status === 'fulfilled'
        ? (usersRes.value?.data?.users || usersRes.value?.users || (Array.isArray(usersRes.value?.data) ? usersRes.value.data : (Array.isArray(usersRes.value) ? usersRes.value : [])))
        : [];
      const apiLeads = leadsRes.status === 'fulfilled'
        ? (leadsRes.value?.data?.leads || leadsRes.value?.leads || (Array.isArray(leadsRes.value) ? leadsRes.value : []))
        : [];

      // 1. Sanitize local storage deleted keys to ensure core active accounts are never suppressed
      try {
        const rawDel = localStorage.getItem('propertygroup_deleted_user_keys');
        if (rawDel) {
          const parsed = JSON.parse(rawDel);
          const cleaned = parsed.filter((k) => {
            const lower = String(k).toLowerCase().trim();
            return (
              !PROTECTED_PLATFORM_EMAILS.has(lower) &&
              !['29', '45', 'usr-29', 'usr-45', 'usr-01', 'usr-02'].includes(lower)
            );
          });
          localStorage.setItem('propertygroup_deleted_user_keys', JSON.stringify(cleaned));
        }
      } catch {}

      const rawDeleted = localStorage.getItem('propertygroup_deleted_user_keys') || '[]';
      const deletedSet = new Set(JSON.parse(rawDeleted).map((k) => String(k).toLowerCase().trim()));

      const roleLabelMap = { ADMIN: 'Admin', SURVEYOR: 'Chartered Surveyor', CUSTOMER: 'Customer' };
      const mapped = rawUsers
        .filter((u) => {
          const email = (u.email || '').toLowerCase().trim();
          const idStr = String(u.id).toLowerCase();
          const formattedId = `usr-${String(u.id).padStart(2, '0')}`.toLowerCase();
          if (!PROTECTED_PLATFORM_EMAILS.has(email) && (deletedSet.has(email) || deletedSet.has(idStr) || deletedSet.has(formattedId))) {
            return false;
          }
          return (
            email &&
            email !== 'admin@demo.com' &&
            email !== 'surveyor@demo.com' &&
            email !== 'customer@demo.com' &&
            email !== 'customer2@demo.com' &&
            !email.includes('alexander.sterling') &&
            u.name !== 'Alexander Sterling' &&
            u.status !== 'INACTIVE' &&
            !email.startsWith('deleted_')
          );
        })
        .map((u) => {
          const createdDate = u.createdAt ? new Date(u.createdAt) : null;
          const updatedDate = u.updatedAt ? new Date(u.updatedAt) : null;
          const formattedCreated = createdDate && !isNaN(createdDate.getTime())
            ? createdDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            : '—';
          const formattedLastActive = updatedDate && !isNaN(updatedDate.getTime())
            ? `${updatedDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${updatedDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
            : '—';

          const cleanEmail = (u.email || '').toLowerCase().trim();
          const storedPhone = localStorage.getItem(`njs_user_phone_${cleanEmail}`);
          const storedOrg = localStorage.getItem(`njs_user_org_${cleanEmail}`);
          const defaultRoleOrg = u.role === 'ADMIN'
            ? 'NJS Property Group HQ'
            : u.role === 'SURVEYOR'
            ? 'NJS Chartered Surveyors Practice'
            : 'Private Client';
          const resolvedOrg = u.companyName || u.company?.name || storedOrg || defaultRoleOrg;
          return {
            id: `USR-${String(u.id).padStart(2, '0')}`,
            dbId: u.id,
            name: u.name,
            email: u.email,
            role: u.role === 'ADMIN' ? 'super_admin' : u.role.toLowerCase(),
            roleLabel: roleLabelMap[u.role] || u.role,
            org: resolvedOrg,
            status: u.status === 'ACTIVE' ? 'Active' : (u.status === 'BLOCKED' ? 'Blocked' : 'Inactive'),
            phone: u.phone || storedPhone || '—',
            createdAt: formattedCreated,
            rawCreatedAt: u.createdAt,
            lastLogin: formattedLastActive,
            surveyorProfile: u.surveyorProfile || null,
            assignedJobsCount: u._count?.assignedJobs || 0,
            clientJobsCount: u._count?.clientJobs || 0,
          };
        });

      // Integrate customer leads from Railway CRM & Leads into Users & Roles
      if (Array.isArray(apiLeads)) {
        apiLeads.forEach((lead) => {
          const lEmail = (lead.clientEmail || lead.customerEmail || '').toLowerCase().trim();
          const lName = lead.clientName || lead.customerName || 'Private Client';
          const lPhone = lead.clientPhone || lead.customerPhone || '—';
          if (lEmail && !deletedSet.has(lEmail) && !mapped.some((u) => u.email?.toLowerCase().trim() === lEmail)) {
            mapped.push({
              id: `USR-C-${lead.id || mapped.length + 1}`,
              dbId: lead.id,
              name: lName,
              email: lEmail,
              role: 'customer',
              roleLabel: 'Customer',
              org: 'Private Client',
              status: 'Active',
              phone: lPhone,
              createdAt: lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '21 Nov 2026',
              lastLogin: 'Active Today',
              clientJobsCount: 1,
              assignedJobsCount: 0,
            });
          }
        });
      }

      // Also include any registered customers from local storage so Admin can see and manage them immediately
      try {
        const registered = JSON.parse(localStorage.getItem('property_group_registered_customers') || '{}');
        Object.values(registered).forEach((regCust) => {
          const regEmail = (regCust.email || '').toLowerCase().trim();
          const regStoredOrg = localStorage.getItem(`njs_user_org_${regEmail}`);
          const regOrg = regCust.company || regStoredOrg || 'Private Client';
          if (
            regEmail &&
            !deletedSet.has(regEmail) &&
            !mapped.some((u) => u.email?.toLowerCase().trim() === regEmail)
          ) {
            mapped.push({
              id: `USR-C-${mapped.length + 1}`,
              dbId: null,
              name: regCust.name || 'Registered Customer',
              email: regEmail,
              role: 'customer',
              roleLabel: 'Customer',
              org: regOrg,
              status: 'Active',
              phone: regCust.phone || '—',
              createdAt: regCust.dateJoined || '—',
              lastLogin: '—',
              clientJobsCount: 0,
              assignedJobsCount: 0,
            });
          }
        });
      } catch {}

      // Always guarantee default active database users are present
      DEFAULT_PLATFORM_USERS.forEach((defUser) => {
        if (!mapped.some((u) => u.email?.toLowerCase().trim() === defUser.email.toLowerCase())) {
          mapped.push(defUser);
        }
      });

      setUsers(mapped.length > 0 ? mapped : DEFAULT_PLATFORM_USERS);
    } catch (err) {
      console.warn('Backend users fetch error, activating resilient user fallback:', err);
      setUsers(DEFAULT_PLATFORM_USERS);
    }
  };

  const [users, setUsers] = useState(DEFAULT_PLATFORM_USERS);

  useEffect(() => {
    fetchUsers();
  }, []);

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
    phone: '',
    password: '',
    role: 'surveyor',
    org: '',
    phone: '',
    // Surveyor specific
    credentials: 'MRICS Chartered Valuation Surveyor',
    postcodes: 'SW, W, KT, GU',
    color: '#2563EB',
    piiExpiry: '31/12/2027',
    // Customer specific
    clientType: 'Private Residential Buyer / Homeowner',
    address: '',
    postcode: '',
    // Admin specific
    adminTitle: 'Operations & Dispatch Manager',
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
    };

    setIsSubmitting(true);
    try {
      const cleanEmail = formData.email.toLowerCase().trim();
      const cleanPhone = formData.phone ? formData.phone.trim() : '';
      const cleanPw = formData.password.trim();

      // Persist to real backend database with hashed password and role-specific fields
      const backendRole = formData.role === 'super_admin' ? 'ADMIN' : (formData.role === 'surveyor' ? 'SURVEYOR' : 'CUSTOMER');
      await adminUsersAndRolesApi.createUser({
        name: formData.name.trim(),
        email: cleanEmail,
        password: cleanPw,
        role: backendRole,
        phone: cleanPhone || undefined,
        accreditation: formData.role === 'surveyor' ? formData.credentials : undefined,
        postcodesCovered: formData.role === 'surveyor' ? formData.postcodes.trim() : undefined,
      });

      const defaultOrg = formData.org?.trim() || (
        formData.role === 'super_admin' ? 'NJS Property Group HQ' :
        formData.role === 'surveyor' ? 'NJS Chartered Surveyors Practice' :
        'Private Client'
      );

      const newUser = {
        id: `USR-${String(users.length + 1).padStart(2, '0')}`,
        name: formData.name.trim(),
        email: cleanEmail,
        phone: cleanPhone || '—',
        role: formData.role,
        roleLabel: roleMap[formData.role] || 'User',
        org: defaultOrg,
        lastLogin: 'Never',
        status: 'Active',
      };

      try {
        if (cleanPw) {
          localStorage.setItem(`njs_user_pw_${cleanEmail}`, cleanPw);
        }
        if (cleanPhone) {
          localStorage.setItem(`njs_user_phone_${cleanEmail}`, cleanPhone);
        }
        if (defaultOrg) {
          localStorage.setItem(`njs_user_org_${cleanEmail}`, defaultOrg);
        }
        const registered = JSON.parse(localStorage.getItem('property_group_registered_customers') || '{}');
        registered[cleanEmail] = {
          id: newUser.id,
          name: newUser.name,
          email: cleanEmail,
          phone: cleanPhone || formData.phone?.trim() || '',
          address: formData.address?.trim() || '',
          postcode: formData.postcode?.trim().toUpperCase() || '',
          clientType: formData.clientType,
          role: formData.role,
          roleLabel: newUser.roleLabel,
          password: cleanPw,
          company: defaultOrg,
          status: 'Active',
        };
        localStorage.setItem('property_group_registered_customers', JSON.stringify(registered));
      } catch {}

      setUsers((prev) => [newUser, ...prev]);
      fetchUsers();
      setIsAddModalOpen(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'surveyor',
        org: '',
        phone: '',
        credentials: 'MRICS Chartered Valuation Surveyor',
        postcodes: 'SW, W, KT, GU',
        color: '#2563EB',
        piiExpiry: '31/12/2027',
        clientType: 'Private Residential Buyer / Homeowner',
        address: '',
        postcode: '',
        adminTitle: 'Operations & Dispatch Manager',
      });

      addToast({
        type: 'success',
        title: 'User Account Created',
        message: `${newUser.name} created! Can now log in using ${newUser.email} and password: ${cleanPw}`,
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
  const [showViewingPassword, setShowViewingPassword] = useState(true);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [newQuickPassword, setNewQuickPassword] = useState('');
  const [revealedPasswords, setRevealedPasswords] = useState({});

  const togglePasswordVisibility = (email) => {
    const clean = (email || '').toLowerCase().trim();
    setRevealedPasswords((prev) => ({ ...prev, [clean]: !prev[clean] }));
  };

  const getUserPassword = (email) => {
    if (!email) return null;
    const cleanEmail = email.toLowerCase().trim();
    try {
      const stored = localStorage.getItem(`njs_user_pw_${cleanEmail}`);
      if (stored) return stored;
    } catch {}
    try {
      const registered = JSON.parse(localStorage.getItem('property_group_registered_customers') || '{}');
      if (registered[cleanEmail]?.password) {
        return registered[cleanEmail].password;
      }
    } catch {}
    return null;
  };

  const getUserPhone = (email) => {
    if (!email) return '—';
    const cleanEmail = email.toLowerCase().trim();
    try {
      const stored = localStorage.getItem(`njs_user_phone_${cleanEmail}`);
      if (stored) return stored;
    } catch {}
    try {
      const registered = JSON.parse(localStorage.getItem('property_group_registered_customers') || '{}');
      if (registered[cleanEmail]?.phone) {
        return registered[cleanEmail].phone;
      }
    } catch {}
    return '—';
  };

  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    phone: '',
    role: 'surveyor',
    org: '',
    status: 'Active',
    password: '',
  });

  const handleViewUser = (user) => {
    setViewingUser(user);
    setShowViewingPassword(true);
    setIsResettingPassword(false);
    setNewQuickPassword('');
  };

  const handleQuickResetPassword = async () => {
    if (!newQuickPassword.trim() || newQuickPassword.trim().length < 6) {
      addToast({
        type: 'warning',
        title: 'Invalid Password',
        message: 'Password must be at least 6 characters long.',
      });
      return;
    }

    const cleanPw = newQuickPassword.trim();
    const targetEmail = (viewingUser?.email || '').toLowerCase().trim();
    const targetId = viewingUser?.dbId || viewingUser?.id || targetEmail;

    try {
      await adminUsersAndRolesApi.updateUser(targetId, {
        password: cleanPw,
        email: targetEmail,
        name: viewingUser?.name,
        role: viewingUser?.role === 'super_admin' ? 'ADMIN' : (viewingUser?.role === 'surveyor' ? 'SURVEYOR' : 'CUSTOMER'),
      });
      try {
        localStorage.setItem(`njs_user_pw_${targetEmail}`, cleanPw);
        const registered = JSON.parse(localStorage.getItem('property_group_registered_customers') || '{}');
        if (registered[targetEmail]) {
          registered[targetEmail].password = cleanPw;
          localStorage.setItem('property_group_registered_customers', JSON.stringify(registered));
        }
      } catch {}

      addToast({
        type: 'success',
        title: 'Password Updated',
        message: `Password for ${viewingUser.name} has been set to: ${cleanPw}`,
      });
      setIsResettingPassword(false);
      setNewQuickPassword('');
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: err?.message || 'Could not update password on server.',
      });
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    const cleanEmail = (user.email || '').toLowerCase().trim();
    const cleanPhone = (user.phone && user.phone !== '—') ? user.phone : (getUserPhone(user.email) !== '—' ? getUserPhone(user.email) : '');
    const defaultRoleOrg = user.role === 'super_admin'
      ? 'NJS Property Group HQ'
      : (user.role === 'surveyor' ? 'NJS Chartered Surveyors Practice' : 'Private Client');
    const storedOrg = cleanEmail ? localStorage.getItem(`njs_user_org_${cleanEmail}`) : null;
    const cleanOrg = (user.org && user.org !== '—') ? user.org : (storedOrg || defaultRoleOrg);

    setEditFormData({
      name: user.name,
      phone: cleanPhone,
      role: user.role,
      org: cleanOrg,
      status: user.status || 'Active',
      password: '',
    });
  };

  const handleSaveEditUser = async (e) => {
    e.preventDefault();
    if (!editFormData.name.trim()) return;

    const roleMap = {
      super_admin: 'Admin',
      surveyor: 'Surveyor',
      customer: 'Customer',
    };

    const targetEmail = (editingUser.email || '').toLowerCase().trim();
    const isBlocking = editFormData.status === 'Blocked' || editFormData.status === 'Inactive' || editFormData.status?.toUpperCase()?.includes('BLOCK');
    const cleanPhone = editFormData.phone?.trim() || '';
    const cleanOrg = editFormData.org?.trim() || '';

    // Update localStorage blocked list
    try {
      const blockedList = JSON.parse(localStorage.getItem('property_group_blocked_users') || '[]');
      if (isBlocking && targetEmail) {
        if (!blockedList.includes(targetEmail)) {
          blockedList.push(targetEmail);
          localStorage.setItem('property_group_blocked_users', JSON.stringify(blockedList));
        }
      } else if (targetEmail) {
        const filtered = blockedList.filter((em) => em !== targetEmail);
        localStorage.setItem('property_group_blocked_users', JSON.stringify(filtered));
      }
    } catch {}

    if (cleanPhone && targetEmail) {
      try {
        localStorage.setItem(`njs_user_phone_${targetEmail}`, cleanPhone);
      } catch {}
    }

    if (targetEmail) {
      try {
        if (cleanOrg) {
          localStorage.setItem(`njs_user_org_${targetEmail}`, cleanOrg);
        } else {
          localStorage.removeItem(`njs_user_org_${targetEmail}`);
        }
        const registered = JSON.parse(localStorage.getItem('property_group_registered_customers') || '{}');
        if (registered[targetEmail]) {
          registered[targetEmail].company = cleanOrg;
          localStorage.setItem('property_group_registered_customers', JSON.stringify(registered));
        }
      } catch {}
    }

    setUsers((prev) =>
      prev.map((u) =>
        u.id === editingUser.id || (editingUser.dbId && u.dbId === editingUser.dbId) || (targetEmail && u.email?.toLowerCase() === targetEmail)
          ? {
              ...u,
              name: editFormData.name.trim(),
              phone: cleanPhone || u.phone || '—',
              role: editFormData.role,
              roleLabel: roleMap[editFormData.role] || u.roleLabel,
              org: cleanOrg || u.org,
              status: editFormData.status,
            }
          : u
      )
    );

    const targetId = editingUser.dbId || editingUser.id || targetEmail;
    try {
      const payload = {
        name: editFormData.name.trim(),
        phone: cleanPhone || null,
        role: editFormData.role === 'super_admin' ? 'ADMIN' : (editFormData.role === 'surveyor' ? 'SURVEYOR' : 'CUSTOMER'),
        status: isBlocking ? 'INACTIVE' : 'ACTIVE',
        email: targetEmail,
      };
      if (editFormData.password && editFormData.password.trim().length >= 6) {
        payload.password = editFormData.password.trim();
        try {
          localStorage.setItem(`njs_user_pw_${targetEmail}`, editFormData.password.trim());
          const registered = JSON.parse(localStorage.getItem('property_group_registered_customers') || '{}');
          if (registered[targetEmail]) {
            registered[targetEmail].password = editFormData.password.trim();
            localStorage.setItem('property_group_registered_customers', JSON.stringify(registered));
          }
        } catch {}
      }
      await adminUsersAndRolesApi.updateUser(targetId, payload);
      fetchUsers();
    } catch (err) {
      console.warn('Backend update error:', err?.message || err);
    }

    setEditingUser(null);
    addToast({
      type: 'success',
      title: 'User Profile Updated',
      message: `${editFormData.name} has been updated (${editFormData.status}).${editFormData.password ? ' Password reset successfully.' : ''}`,
    });
  };

  const handleDeleteUser = async (userOrId, maybeName, maybeEmail) => {
    const targetUser = typeof userOrId === 'object' && userOrId !== null ? userOrId : null;
    const userId = targetUser ? (targetUser.dbId || targetUser.id) : userOrId;
    const userName = targetUser ? targetUser.name : (maybeName || 'User');
    const userEmail = targetUser ? targetUser.email : (maybeEmail || '');
    const cleanEmail = (userEmail || (typeof userId === 'string' && userId.includes('@') ? userId : '')).toLowerCase().trim();

    if (
      cleanEmail === 'njsadmin@gmail.com' ||
      userName === 'NJS Operations Admin' ||
      userName === 'admin' ||
      userId === 29 ||
      userId === 'USR-29' ||
      userId === 'USR-01'
    ) {
      addToast({
        type: 'warning',
        title: 'Action Protected',
        message: 'The primary Admin account cannot be deleted.',
      });
      return;
    }

    // 1. Immediately remove from local state
    setUsers((prev) =>
      prev.filter(
        (u) =>
          u.id !== userId &&
          (!targetUser?.dbId || u.dbId !== targetUser.dbId) &&
          (!cleanEmail || (u.email || '').toLowerCase().trim() !== cleanEmail)
      )
    );

    // 2. Remove from localStorage registered customers & credentials
    try {
      const registered = JSON.parse(localStorage.getItem('property_group_registered_customers') || '{}');
      if (cleanEmail && registered[cleanEmail]) {
        delete registered[cleanEmail];
      }
      Object.keys(registered).forEach((key) => {
        if (key.toLowerCase().trim() === cleanEmail) {
          delete registered[key];
        }
      });
      localStorage.setItem('property_group_registered_customers', JSON.stringify(registered));

      if (cleanEmail) {
        localStorage.removeItem(`njs_user_pw_${cleanEmail}`);
        localStorage.removeItem(`njs_user_phone_${cleanEmail}`);
        localStorage.removeItem(`njs_user_org_${cleanEmail}`);
        localStorage.removeItem(`propertygroup_terms_signed_${cleanEmail}`);
        localStorage.removeItem(`propertygroup_terms_signed_date_${cleanEmail}`);
        localStorage.removeItem(`propertygroup_payment_claimed_${cleanEmail}`);
        localStorage.removeItem(`propertygroup_active_job_${cleanEmail}`);
        localStorage.removeItem(`propertygroup_user_signature_${cleanEmail}`);
        localStorage.removeItem(`propertygroup_user_sig_type_${cleanEmail}`);
      }

      // Purge this customer's mock jobs, quotes, agreements, and leads so no ghost stage 5 remains
      const storedJobs = JSON.parse(localStorage.getItem('propertygroup_jobs') || '[]');
      const filteredJobs = storedJobs.filter((j) => {
        const jEmail = (j.customerEmail || j.clientEmail || '').toLowerCase().trim();
        const jName = (j.customer || j.customerName || j.client || '').toLowerCase().trim();
        return jEmail !== cleanEmail && (!userName || jName !== userName.toLowerCase().trim());
      });
      localStorage.setItem('propertygroup_jobs', JSON.stringify(filteredJobs));

      const storedQuotes = JSON.parse(localStorage.getItem('propertygroup_quotes') || '[]');
      const filteredQuotes = storedQuotes.filter((q) => {
        const qEmail = (q.clientEmail || q.customerEmail || '').toLowerCase().trim();
        return qEmail !== cleanEmail;
      });
      localStorage.setItem('propertygroup_quotes', JSON.stringify(filteredQuotes));

      const storedAgreements = JSON.parse(localStorage.getItem('propertygroup_terms_agreements') || '[]');
      const filteredAgreements = storedAgreements.filter((a) => {
        const aEmail = (a.signerEmail || '').toLowerCase().trim();
        return aEmail !== cleanEmail;
      });
      localStorage.setItem('propertygroup_terms_agreements', JSON.stringify(filteredAgreements));

      const storedLeads = JSON.parse(localStorage.getItem('propertygroup_crm_leads_v1') || '[]');
      const filteredLeads = storedLeads.filter((l) => {
        const lEmail = (l.customerEmail || l.clientEmail || '').toLowerCase().trim();
        return lEmail !== cleanEmail;
      });
      localStorage.setItem('propertygroup_crm_leads_v1', JSON.stringify(filteredLeads));

      // If active session is this user, clear active session
      const curSession = JSON.parse(localStorage.getItem('property_group_user_session') || '{}');
      if ((curSession.email || '').toLowerCase().trim() === cleanEmail) {
        localStorage.removeItem('property_group_user_session');
        localStorage.removeItem('property_group_auth_token');
      }

      window.dispatchEvent(new Event('propertygroup_jobs_updated'));
      window.dispatchEvent(new Event('propertygroup_leads_updated'));
      window.dispatchEvent(new Event('propertygroup_agreements_updated'));
      window.dispatchEvent(new Event('storage'));
    } catch {}

    // 3. Persist deleted user keys in localStorage so refreshes NEVER bring it back
    try {
      const rawDeleted = localStorage.getItem('propertygroup_deleted_user_keys') || '[]';
      const deletedKeys = JSON.parse(rawDeleted);
      [userId, targetUser?.dbId, targetUser?.id, cleanEmail]
        .filter(Boolean)
        .map(String)
        .forEach((k) => {
          const lower = k.toLowerCase().trim();
          if (!deletedKeys.includes(lower)) {
            deletedKeys.push(lower);
          }
        });
      localStorage.setItem('propertygroup_deleted_user_keys', JSON.stringify(deletedKeys));
    } catch {}

    // 4. Call backend API to delete from database
    try {
      const apiTarget = targetUser?.dbId || cleanEmail || userId;
      await adminUsersAndRolesApi.deleteUser(apiTarget);
    } catch (err) {
      console.warn('Backend delete error:', err?.message || err);
    }

    addToast({
      type: 'info',
      title: 'User Removed',
      message: `${userName} has been permanently removed from platform users.`,
    });
  };

  const tabs = useMemo(() => {
    return [
      { id: 'All', label: 'All Users', count: users.length },
      { id: 'super_admin', label: 'Admins', count: users.filter((u) => u.role === 'super_admin').length },
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
      className: 'w-[26%] min-w-[190px]',
      render: (val, row) => {
        if (row.role === 'customer') {
          return (
            <button
              onClick={() => {
                setSelectedClientEmail(row.email);
                setClientModalTab('calls');
              }}
              className="text-left group cursor-pointer block max-w-full"
            >
              <div className="font-bold text-[#0B1F4D] group-hover:text-[#2563EB] group-hover:underline text-xs flex items-center gap-1.5 flex-wrap">
                <span>{val}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 text-[#2563EB] font-bold whitespace-nowrap">Client Profile</span>
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
      key: 'phone',
      header: 'Contact Phone',
      sortable: false,
      className: 'w-[16%] min-w-[130px]',
      render: (val, row) => {
        const phone = (val && val !== '—') ? val : getUserPhone(row.email);
        return phone && phone !== '—' ? (
          <span className="inline-flex items-center gap-1.5 text-slate-700 font-mono text-[11px]">
            <Phone className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
            <span>{phone}</span>
          </span>
        ) : (
          <span className="text-slate-400 text-xs">—</span>
        );
      },
    },
    {
      key: 'roleLabel',
      header: 'Assigned Role',
      sortable: true,
      className: 'w-[16%] min-w-[120px]',
      render: (val, row) => {
        let badgeColor = 'bg-[#0B1F4D] text-white';
        if (row.role === 'surveyor') badgeColor = 'bg-purple-100 text-purple-800 border border-purple-200';
        if (row.role === 'customer') badgeColor = 'bg-emerald-100 text-emerald-800 border border-emerald-200';

        return (
          <span className={`inline-block px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap ${badgeColor}`}>
            {val}
          </span>
        );
      },
    },
    {
      key: 'org',
      header: 'Organisation / Practice',
      sortable: true,
      className: 'w-[20%] min-w-[140px] text-xs text-slate-700 font-medium',
      render: (val) => (val && val !== '—') ? val : <span className="text-slate-400">—</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      className: 'w-[11%] min-w-[90px]',
      render: (val) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 whitespace-nowrap">
          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
          {val}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      headerClassName: 'text-center w-[11%] min-w-[90px]',
      className: 'text-center w-[11%] min-w-[90px] whitespace-nowrap',
      render: (_, row) => (
        <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
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
            onClick={() => handleDeleteUser(row)}
            disabled={row.email === 'njsadmin@gmail.com' || row.role === 'super_admin'}
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors cursor-pointer"
            title={row.email === 'njsadmin@gmail.com' || row.role === 'super_admin' ? 'Primary admin cannot be deleted' : 'Delete User'}
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
        subtitle="Grant role-based credentials and configure role-specific permissions & profiles."
        maxWidth="max-w-2xl"
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
              className="px-5 py-2 rounded-xl bg-[#0B1F4D] text-white text-xs font-bold hover:bg-[#162E6E] disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {isSubmitting
                ? 'Creating Account...'
                : formData.role === 'surveyor'
                ? 'Provision Chartered Surveyor'
                : formData.role === 'customer'
                ? 'Create Customer Account'
                : 'Create Administrator Account'}
            </button>
          </>
        }
      >
        <form id="add-user-form" onSubmit={handleAddUser} className="space-y-4">
          {/* 1. ROLE SELECTION (Clean Segmented Switcher) */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Select User Role <span className="text-rose-500">*</span>
            </label>
            <div className="bg-slate-100/80 p-1 rounded-xl flex items-center gap-1 border border-slate-200/60">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'surveyor' })}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  formData.role === 'surveyor'
                    ? 'bg-white text-[#0B1F4D] shadow-sm border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Award className={`w-3.5 h-3.5 ${formData.role === 'surveyor' ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>Surveyor</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'customer' })}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  formData.role === 'customer'
                    ? 'bg-white text-emerald-950 shadow-sm border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Users className={`w-3.5 h-3.5 ${formData.role === 'customer' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>Customer</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'super_admin' })}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  formData.role === 'super_admin'
                    ? 'bg-white text-indigo-950 shadow-sm border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <ShieldCheck className={`w-3.5 h-3.5 ${formData.role === 'super_admin' ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>Admin</span>
              </button>
            </div>
          </div>

          {/* 2. CORE LOGIN & CONTACT CREDENTIALS */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                1. Account Credentials
              </span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Legal Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    formData.role === 'surveyor'
                      ? 'e.g. David Thorne MRICS'
                      : formData.role === 'customer'
                      ? 'e.g. Emily Watson'
                      : 'e.g. Operations Admin'
                  }
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-9.5 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0B1F4D] focus:ring-1 focus:ring-[#0B1F4D] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address (Login Username) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder={
                    formData.role === 'surveyor'
                      ? 'surveyor@njspropertygroup.com'
                      : formData.role === 'customer'
                      ? 'client@gmail.com'
                      : 'admin@njspropertygroup.com'
                  }
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-9.5 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0B1F4D] focus:ring-1 focus:ring-[#0B1F4D] transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Direct Mobile / Phone
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="tel"
                    placeholder="+44 7700 900000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full h-9.5 pl-8.5 pr-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 font-mono placeholder:text-slate-400 focus:outline-none focus:border-[#0B1F4D] focus:ring-1 focus:ring-[#0B1F4D] transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Login Password <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowModalPassword(!showModalPassword)}
                    className="text-[11px] text-[#2563EB] hover:underline flex items-center gap-1 cursor-pointer font-medium"
                  >
                    {showModalPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {showModalPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type={showModalPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full h-9.5 pl-8.5 pr-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 font-mono placeholder:text-slate-400 focus:outline-none focus:border-[#0B1F4D] focus:ring-1 focus:ring-[#0B1F4D] transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. DYNAMIC ROLE-SPECIFIC FORM FIELDS */}
          {formData.role === 'surveyor' && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                  2. Chartered Surveyor Qualifications &amp; Coverage
                </span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Surveyor Qualification &amp; RICS Designation <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.credentials}
                  onChange={(e) => setFormData({ ...formData, credentials: e.target.value })}
                  className="w-full h-9.5 px-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                >
                  <optgroup label="Client Specified Surveying Designations">
                    <option value="Guided Trainee Surveyor (RICS Candidate)">
                      Guided Trainee Surveyor (RICS Candidate)
                    </option>
                    <option value="Experienced Surveyor (BSC Hons Civil Engineering, MRPSA, DAE, Retrofit Assessor, SMSTS)">
                      Experienced Surveyor (BSC Hons Civil Engineering, MRPSA, DAE, Retrofit Assessor, SMSTS)
                    </option>
                    <option value="Experienced Surveyor (MCIOB, MRPSA, AssocRICS, LLB Hons, MEWI)">
                      Experienced Surveyor (MCIOB, MRPSA, AssocRICS, LLB Hons, MEWI)
                    </option>
                    <option value="Experienced Surveyor (BTEC Civil Engineering, MSC Building Surveying, MRPSA, ACABE)">
                      Experienced Surveyor (BTEC Civil Engineering, MSC Building Surveying, MRPSA, ACABE)
                    </option>
                  </optgroup>
                  <optgroup label="Standard RICS Designations">
                    <option value="MRICS Chartered Valuation Surveyor">
                      MRICS Chartered Valuation Surveyor (Level 2 &amp; Valuations)
                    </option>
                    <option value="Senior Building Surveyor (MRICS)">
                      Senior Building Surveyor (MRICS Level 3 Specialist)
                    </option>
                    <option value="Residential Defect Specialist (AssocRICS)">
                      Residential Defect Specialist (AssocRICS)
                    </option>
                    <option value="Fellow Chartered Surveyor (FRICS)">
                      Fellow Chartered Surveyor (FRICS - Dispute &amp; Expert Witness)
                    </option>
                    <option value="Historic Buildings Consultant (MRICS)">
                      Historic Buildings Consultant (MRICS Heritage)
                    </option>
                  </optgroup>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Coverage Postcode Sectors <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SW, KT, GU, W, NW"
                    value={formData.postcodes}
                    onChange={(e) => setFormData({ ...formData, postcodes: e.target.value })}
                    className="w-full h-9.5 px-3 bg-white border border-slate-200 rounded-lg text-xs font-mono uppercase text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    PII Insurance Expiry Date
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 31/12/2027"
                    value={formData.piiExpiry}
                    onChange={(e) => setFormData({ ...formData, piiExpiry: e.target.value })}
                    className="w-full h-9.5 px-3 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Surveying Practice / Firm Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. NJS Chartered Surveyors Practice"
                    value={formData.org}
                    onChange={(e) => setFormData({ ...formData, org: e.target.value })}
                    className="w-full h-9.5 px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Calendar Rota Color Accent
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-9.5 h-9.5 p-0.5 rounded-lg border border-slate-200 cursor-pointer bg-white"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="flex-1 h-9.5 px-3 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {formData.role === 'customer' && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                  2. Property Client &amp; Billing Profile
                </span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Property / Billing Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 14 Mayfair Gate, Mayfair, London"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full h-9.5 px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    UK Postcode <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. W1K 2PB"
                    value={formData.postcode}
                    onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                    className="w-full h-9.5 px-3 bg-white border border-slate-200 rounded-lg text-xs font-mono uppercase text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Organisation / Firm (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Private Client or Company"
                  value={formData.org}
                  onChange={(e) => setFormData({ ...formData, org: e.target.value })}
                  className="w-full h-9.5 px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all"
                />
              </div>
            </div>
          )}

          {formData.role === 'super_admin' && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                  2. Administrator Role &amp; Access Scope
                </span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Administrative Job Title / Position <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.adminTitle}
                    onChange={(e) => setFormData({ ...formData, adminTitle: e.target.value })}
                    className="w-full h-9.5 px-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
                  >
                    <option value="Operations & Dispatch Manager">Operations &amp; Dispatch Manager</option>
                    <option value="Senior Operations Director">Senior Operations Director</option>
                    <option value="Client Relationship Manager">Client Relationship Manager</option>
                    <option value="Accounts & Finance Controller">Accounts &amp; Finance Controller</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Headquarters / Organisation
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. NJS Property Group HQ"
                    value={formData.org}
                    onChange={(e) => setFormData({ ...formData, org: e.target.value })}
                    className="w-full h-9.5 px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
                  />
                </div>
              </div>
            </div>
          )}
        </form>
      </Modal>

      {/* View User Details Modal */}
      <Modal
        isOpen={!!viewingUser}
        onClose={() => setViewingUser(null)}
        title="User Profile"
        subtitle={`User ID: #${viewingUser?.dbId || viewingUser?.id?.replace('USR-', '') || viewingUser?.id || ''}`}
        maxWidth="max-w-xl"
        footer={
          <div className="flex items-center justify-between w-full">
            <button
              type="button"
              onClick={() => {
                const u = viewingUser;
                setViewingUser(null);
                handleEditUser(u);
              }}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5 text-amber-600" />
              <span>Edit Account</span>
            </button>
            <button
              onClick={() => setViewingUser(null)}
              className="px-5 py-2 rounded-xl bg-[#0B1F4D] text-white text-xs font-bold hover:bg-[#162E6E] cursor-pointer"
            >
              Close
            </button>
          </div>
        }
      >
        {viewingUser && (
          <div className="space-y-4 text-xs">
            {/* Header Profile Card */}
            <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="w-12 h-12 rounded-2xl bg-[#0B1F4D] text-white font-black flex items-center justify-center text-base shadow-sm">
                {(viewingUser.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-sm text-slate-900">{viewingUser.name}</h4>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    viewingUser.role === 'super_admin' ? 'bg-[#0B1F4D] text-white' :
                    viewingUser.role === 'surveyor' ? 'bg-purple-100 text-purple-800' :
                    'bg-emerald-100 text-emerald-800'
                  }`}>
                    {viewingUser.roleLabel || viewingUser.role}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {viewingUser.status || 'Active'}
                  </span>
                </div>
                <div className="text-slate-500 text-xs mt-0.5 flex items-center gap-1 font-mono">
                  <Mail className="w-3 h-3 text-slate-400" />
                  <span>{viewingUser.email}</span>
                </div>
              </div>
            </div>

            {/* Core Account Details Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Contact Phone</span>
                <span className="font-bold text-slate-800 flex items-center gap-1 font-mono text-xs">
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  <span>{(viewingUser.phone && viewingUser.phone !== '—') ? viewingUser.phone : 'Not provided'}</span>
                </span>
              </div>

              {viewingUser.org && viewingUser.org !== '—' && (
                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Organisation / Practice</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1 truncate">
                    <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{viewingUser.org}</span>
                  </span>
                </div>
              )}

              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Account Created</span>
                <span className="font-semibold text-slate-700 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>{viewingUser.createdAt && viewingUser.createdAt !== '19 Nov 2026' ? viewingUser.createdAt : '—'}</span>
                </span>
              </div>

              {viewingUser.lastLogin && viewingUser.lastLogin !== '—' && viewingUser.lastLogin !== 'Active Today' && (
                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Last Updated</span>
                  <span className="font-semibold text-slate-700 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{viewingUser.lastLogin}</span>
                  </span>
                </div>
              )}
            </div>

            {/* Role-Specific Operational Block */}
            {viewingUser.role === 'super_admin' && (
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/60 space-y-1">
                <div className="flex items-center gap-1.5 text-blue-900 font-bold">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Administrative Access</span>
                </div>
                <p className="text-[11px] text-blue-700 leading-relaxed">
                  Full administrative privileges across practice operations and user management.
                </p>
              </div>
            )}

            {viewingUser.role === 'surveyor' && viewingUser.surveyorProfile && (
              <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200/60 space-y-2">
                <div className="flex items-center justify-between text-purple-900 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-purple-600" />
                    <span>Chartered Credentials &amp; Logistics</span>
                  </span>
                  {viewingUser.surveyorProfile?.accreditation && (
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                      {viewingUser.surveyorProfile.accreditation}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-purple-200/40 text-purple-800">
                  {viewingUser.surveyorProfile?.postcodesCovered && (
                    <div>
                      <span className="text-slate-500">Coverage: </span>
                      <span className="font-semibold">{viewingUser.surveyorProfile.postcodesCovered}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-500">Active Load: </span>
                    <span className="font-semibold">{viewingUser.assignedJobsCount || 0} Assigned Jobs</span>
                  </div>
                </div>
              </div>
            )}

            {viewingUser.role === 'customer' && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-2">
                <div className="flex items-center justify-between text-slate-800 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-[#2563EB]" />
                    <span>Client Instruction &amp; Case Record</span>
                  </span>
                  <span className="text-[11px] font-semibold text-slate-600">
                    {viewingUser.clientJobsCount || 0} Survey Instructions
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200/60 flex gap-2">
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
                    <span>Client Call Notes</span>
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
                    <span>Complaints Log</span>
                  </button>
                </div>
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

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  placeholder="e.g. +44 7700 900382 or 07123 456789"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:border-[#2563EB]"
                />
              </div>
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
                  <option value="Blocked">Blocked / Deactivated</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Reset / Change Password</label>
              <input
                type="password"
                placeholder="Enter new password (min. 6 chars, or leave blank to keep current)"
                value={editFormData.password}
                onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-xs"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Leave blank to keep existing password unchanged.
              </span>
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
