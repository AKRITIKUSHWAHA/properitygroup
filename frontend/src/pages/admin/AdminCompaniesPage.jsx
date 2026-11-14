import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Building2,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Users,
  Key,
  TrendingUp,
  MoreVertical,
  Copy,
  Edit,
  Trash2,
  Briefcase,
  ExternalLink,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../components/ToastContext';
import { adminCompaniesApi } from '../../api/adminApi';

// Clean floating 3-dot action dropdown using React Portal (zero clipping / z-index issues)
const CompanyRowActions = ({
  company,
  onView,
  onCopyPhone,
  onDelete,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: null, bottom: null, left: null });
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const handleToggle = (e) => {
    e.stopPropagation();
    if (isOpen) {
      setIsOpen(false);
      return;
    }
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuWidth = 190;
      const menuHeight = 150;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const openUpward = spaceBelow < menuHeight && spaceAbove >= menuHeight;

      let top = null;
      let bottom = null;
      if (openUpward) {
        bottom = Math.max(8, Math.round(window.innerHeight - rect.top + 6));
      } else {
        top = Math.max(8, Math.round(rect.bottom + 6));
      }

      const left = Math.max(12, Math.min(Math.round(rect.right - menuWidth), window.innerWidth - menuWidth - 12));

      setCoords({ top, bottom, left });
      setIsOpen(true);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleResize = () => {
      setIsOpen(false);
    };

    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('resize', handleResize);
    }, 50);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className={`p-1.5 rounded-xl transition-colors cursor-pointer select-none ${
          isOpen ? 'bg-blue-100 text-[#0B1F4D] ring-2 ring-blue-300' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
        }`}
        title="Options"
      >
        <MoreVertical className="w-4 h-4 pointer-events-none" />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: coords.top !== null ? `${coords.top}px` : 'auto',
              bottom: coords.bottom !== null ? `${coords.bottom}px` : 'auto',
              left: `${coords.left}px`,
              width: '190px',
              zIndex: 999999,
              maxHeight: 'calc(100vh - 20px)',
            }}
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 py-1.5 animate-in fade-in zoom-in-95 duration-100 text-left overflow-y-auto"
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onView(company);
              }}
              className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
            >
              <Building className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>View Branch Details</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onCopyPhone(e, company.phone, 'Phone number');
              }}
              className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Copy Contact</span>
            </button>

            <div className="my-1 border-t border-slate-100" />

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onDelete(e, company.id, company.name, company.dbId);
              }}
              className="w-full px-3.5 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span>Remove Branch</span>
            </button>
          </div>,
          document.body
        )}
    </div>
  );
};

export const AdminCompaniesPage = () => {
  const { addToast } = useToast();
  const [companies, setCompanies] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync companies from backend API
  useEffect(() => {
    let isMounted = true;
    adminCompaniesApi.getCompanies()
      .then((res) => {
        const raw = res?.companies || res?.data?.companies || (Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []));
        if (isMounted && raw && raw.length > 0) {
          setCompanies(raw.map((c) => ({
            id: `CMP-${String(c.id).padStart(2, '0')}`,
            dbId: c.id,
            name: c.name,
            code: (c.name || 'AG').slice(0, 2).toUpperCase(),
            branch: c.branchName || 'London HQ',
            address: c.address || 'London, UK',
            contact: c.contactName || 'Branch Contact',
            role: 'Partner Contact & Keyholder',
            phone: c.contactPhone || '+44 20 7946 0888',
            email: c.contactEmail || 'office@partner.com',
            leads: c.totalInstructions || c._count?.jobs || 0,
            status: c.status === 'ACTIVE' ? 'Active Partner' : (c.status || 'Active Partner'),
            keyHolding: c.keyCollectionProtocol || 'Key protocol on file',
          })));
        }
      })
      .catch((err) => {
        console.warn('Failed to load companies from backend:', err?.message || err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [viewingCompany, setViewingCompany] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    branch: '',
    address: '',
    contact: '',
    role: 'Branch Manager',
    phone: '',
    email: '',
    keyHolding: '',
  });

  const totalLeads = companies.reduce((acc, c) => acc + c.leads, 0);

  const handleCopy = (e, text, label) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(text);
    addToast({
      type: 'info',
      title: 'Copied to Clipboard',
      message: `${label}: ${text}`,
    });
  };

  const handleAddCompany = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.branch.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await adminCompaniesApi.createCompany({
        name: formData.name.trim(),
        branchName: formData.branch.trim(),
        address: formData.address.trim(),
        contactName: formData.contact.trim(),
        contactEmail: formData.email.trim(),
        contactPhone: formData.phone.trim(),
        keyCollectionProtocol: formData.keyHolding.trim(),
      });

      const saved = res?.company || res?.data?.company;
      const initials = formData.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

      const newCompany = {
        id: saved?.id ? `CMP-${String(saved.id).padStart(2, '0')}` : `CMP-${String(companies.length + 1).padStart(2, '0')}`,
        dbId: saved?.id,
        code: initials || 'AG',
        ...formData,
        leads: saved?.totalInstructions || 0,
        status: 'Active Partner',
      };

      setCompanies((prev) => [newCompany, ...prev]);
      setIsAddModalOpen(false);
      setFormData({
        name: '',
        branch: '',
        address: '',
        contact: '',
        role: 'Branch Manager',
        phone: '',
        email: '',
        keyHolding: '',
      });

      addToast({
        type: 'success',
        title: 'Partner Branch Registered',
        message: `${newCompany.name} (${newCompany.branch}) has been saved to database.`,
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Error Saving Partner',
        message: err?.message || 'Could not save company branch to database.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCompany = async (e, id, name, dbId) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to remove ${name} from partner panels?`)) {
      setCompanies((prev) => prev.filter((c) => c.id !== id));
      const targetId = dbId || (typeof id === 'number' ? id : parseInt(String(id).replace('CMP-', ''), 10));
      if (targetId) {
        try {
          await adminCompaniesApi.deleteCompany(targetId);
        } catch (err) {
          console.warn('Backend delete error:', err?.message || err);
        }
      }
      addToast({
        type: 'info',
        title: 'Partner Removed',
        message: `${name} has been removed from active panels.`,
      });
    }
  };

  const filtered = companies.filter((c) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.branch.toLowerCase().includes(q) ||
      c.contact.toLowerCase().includes(q) ||
      c.address.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <PageHeader
        title="Companies & Estate Agency Panels"
        subtitle="Manage B2B referral partnerships, estate agency branch contacts, and surveyor key-collection logistics."
        breadcrumb={['Admin', 'Companies']}
        actionLabel="Add Agency Branch"
        actionIcon={Plus}
        onAction={() => setIsAddModalOpen(true)}
      />

      {/* 3 Compact Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Card 1: Partner Agencies */}
        <div className="p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Partner Agencies
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
              <Building2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#0B1F4D]">
              {companies.length}
            </span>
            <span className="text-xs font-semibold text-slate-500">Branches</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5 truncate">
            London &amp; Home Counties Network
          </p>
        </div>

        {/* Card 2: Referred Survey Instructions */}
        <div className="p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Referred Instructions
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-700">
              {totalLeads}
            </span>
            <span className="text-xs font-semibold text-slate-500">Instructions</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5 truncate">
            B2B Agency Referral Inbound
          </p>
        </div>

        {/* Card 3: Key Access Protocol */}
        <div className="p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Key Access Protocol
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Key className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              100%
            </span>
            <span className="text-xs font-semibold text-slate-500">Verified</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5 truncate">
            Surveyor RICS Photo ID Mandated
          </p>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Toolbar Header */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#2563EB]" />
              <span>Estate Agency &amp; Solicitor Directory</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {filtered.length} active
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Contact persons and keyholding branch addresses for on-site surveyor visits.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search agency, branch, or contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
        </div>

        {/* Directory Table Form */}
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-slate-50/50">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No estate agencies match your search</p>
            <p className="text-xs text-slate-500 mt-1">Try clearing your search keyword.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                <tr>
                  <th className="py-3.5 px-4 sm:px-5 min-w-[210px]">Agency &amp; Branch</th>
                  <th className="py-3.5 px-3.5 whitespace-nowrap">Status</th>
                  <th className="py-3.5 px-4 min-w-[170px]">Key Contact Person</th>
                  <th className="py-3.5 px-4 min-w-[170px] whitespace-nowrap">Direct Telephone</th>
                  <th className="py-3.5 px-4 min-w-[200px] whitespace-nowrap">Branch Email</th>
                  <th className="py-3.5 px-4 min-w-[240px]">Branch Address &amp; Keyholding</th>
                  <th className="py-3.5 px-3.5 text-center whitespace-nowrap">Referred Volume</th>
                  <th className="py-3.5 px-4 sm:px-5 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((company) => (
                  <tr
                    key={company.id}
                    onClick={() => setViewingCompany(company)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    {/* 1. Agency Logo Badge + Name + Branch */}
                    <td className="py-3.5 px-4 sm:px-5 min-w-[210px]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0B1F4D] to-[#1E3A8A] text-white flex items-center justify-center font-extrabold text-xs shadow-xs shrink-0">
                          {company.code}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 group-hover:text-[#2563EB] transition-colors truncate">
                            {company.name}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium truncate">
                            {company.branch}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 2. Status Badge */}
                    <td className="py-3.5 px-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                        <span>Active Partner</span>
                      </span>
                    </td>

                    {/* 3. Key Contact Person (Name & Role Only - Clean & Focused) */}
                    <td className="py-3.5 px-4 min-w-[170px] whitespace-nowrap">
                      <div>
                        <div className="font-bold text-slate-900 text-xs">
                          {company.contact}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                          {company.role || 'Branch Manager'}
                        </div>
                      </div>
                    </td>

                    {/* 4. Direct Telephone (Separate Dedicated Column) */}
                    <td className="py-3.5 px-4 min-w-[170px] whitespace-nowrap">
                      {company.phone ? (
                        <button
                          type="button"
                          onClick={(e) => handleCopy(e, company.phone, 'Phone number')}
                          title="Click to copy telephone"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-900 hover:border-emerald-300 border border-slate-200/90 text-slate-800 text-xs font-mono font-semibold transition-all cursor-pointer group shadow-2xs"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform shrink-0" />
                          <span>{company.phone}</span>
                          <Copy className="w-3 h-3 text-slate-400 group-hover:text-emerald-700 ml-0.5 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs italic">—</span>
                      )}
                    </td>

                    {/* 5. Branch Email (Separate Dedicated Column) */}
                    <td className="py-3.5 px-4 min-w-[200px] whitespace-nowrap">
                      {company.email ? (
                        <button
                          type="button"
                          onClick={(e) => handleCopy(e, company.email, 'Email address')}
                          title={`Click to copy ${company.email}`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-900 hover:border-blue-300 border border-slate-200/90 text-slate-700 text-xs font-medium transition-all cursor-pointer group max-w-[220px] shadow-2xs"
                        >
                          <Mail className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition-transform shrink-0" />
                          <span className="truncate">{company.email}</span>
                          <Copy className="w-3 h-3 text-slate-400 group-hover:text-blue-700 ml-0.5 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs italic">—</span>
                      )}
                    </td>

                    {/* 6. Branch Address & Key Access Note */}
                    <td className="py-3.5 px-4 min-w-[240px] max-w-sm">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs text-slate-800 font-semibold leading-snug">
                            {company.address}
                          </div>
                          {company.keyHolding && (
                            <div className="text-[10.5px] text-slate-500 mt-1 line-clamp-1" title={company.keyHolding}>
                              {company.keyHolding}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* 7. Referred Volume */}
                    <td className="py-3.5 px-3.5 text-center whitespace-nowrap">
                      <span className="font-mono font-bold text-xs text-[#0B1F4D] bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200 inline-block shadow-2xs">
                        {company.leads} Referred Surveys
                      </span>
                    </td>

                    {/* 8. Actions Dropdown */}
                    <td className="py-3.5 px-4 sm:px-5 text-right whitespace-nowrap">
                      <CompanyRowActions
                        company={company}
                        onView={(c) => setViewingCompany(c)}
                        onCopyPhone={(e, phone, label) => handleCopy(e, phone, label)}
                        onDelete={(e, id, name, dbId) => handleDeleteCompany(e, id, name, dbId)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: Register New Estate Agent Branch */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register Estate Agent Partner Branch"
        subtitle="Add a new partner office for key collections and inbound survey referrals."
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
              form="add-company-form"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-[#0B1F4D] text-white text-xs font-bold hover:bg-[#162E6E] shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : 'Save Partner Branch'}
            </button>
          </>
        }
      >
        <form id="add-company-form" onSubmit={handleAddCompany} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Company / Agency Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Knight Frank, Foxtons, Savills"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Branch Office *</label>
              <input
                type="text"
                required
                placeholder="e.g. Chelsea & Fulham"
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Primary Contact Person *</label>
              <input
                type="text"
                required
                placeholder="e.g. Victoria Sterling"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Direct Telephone</label>
              <input
                type="tel"
                placeholder="+44 20 7000 0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Branch Email</label>
              <input
                type="email"
                placeholder="branch@agency.co.uk"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Branch Office Address</label>
            <input
              type="text"
              placeholder="e.g. 15 Kings Road, London SW3 4RP"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Key Collection Instructions for Surveyors</label>
            <textarea
              rows="2"
              placeholder="e.g. Keys held at reception. Surveyors must produce RICS accreditation photo ID."
              value={formData.keyHolding}
              onChange={(e) => setFormData({ ...formData, keyHolding: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
        </form>
      </Modal>

      {/* MODAL: View Company Details */}
      {viewingCompany && (
        <Modal
          isOpen={!!viewingCompany}
          onClose={() => setViewingCompany(null)}
          title={viewingCompany.name}
          subtitle={`Branch: ${viewingCompany.branch}`}
          maxWidth="max-w-lg"
          footer={
            <div className="flex justify-end w-full">
              <button
                type="button"
                onClick={() => setViewingCompany(null)}
                className="px-5 py-2 bg-[#0B1F4D] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Primary Contact:</span>
                <span className="font-bold text-slate-900">{viewingCompany.contact} ({viewingCompany.role})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Phone:</span>
                <span className="font-mono font-bold text-slate-800">{viewingCompany.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Email:</span>
                <span className="font-mono text-blue-600">{viewingCompany.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Office Address:</span>
                <span className="text-slate-800 font-medium text-right max-w-xs">{viewingCompany.address}</span>
              </div>
            </div>

            <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200/80 space-y-1.5">
              <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-blue-600" />
                Key Collection Protocol for Surveyors
              </span>
              <p className="text-slate-700 leading-relaxed">
                {viewingCompany.keyHolding || 'Collect keys from front desk reception during normal business hours.'}
              </p>
            </div>

            <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-950 block">Cumulative Survey Instructions</span>
                <span className="text-[11px] text-emerald-700">Client referrals received from this agency</span>
              </div>
              <span className="text-lg font-black font-mono text-emerald-800">
                {viewingCompany.leads} Leads
              </span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
