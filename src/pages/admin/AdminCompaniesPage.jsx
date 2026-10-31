import React, { useState } from 'react';
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

export const AdminCompaniesPage = () => {
  const { addToast } = useToast();

  const [companies, setCompanies] = useState([
    {
      id: 'CMP-01',
      name: 'Foxtons Residential Surveys',
      code: 'FX',
      branch: 'Mayfair & Westminster',
      address: '92 Park Lane, London W1K 7TA',
      contact: 'Marcus Bell',
      role: 'Branch Lettings & Sales Director',
      phone: '+44 20 7946 0888',
      email: 'mayfair@foxtons.co.uk',
      leads: 34,
      status: 'Active Partner',
      keyHolding: 'Keys held at front desk for all W1/SW1 instructions',
    },
    {
      id: 'CMP-02',
      name: 'Dexters Estate Agents',
      code: 'DX',
      branch: 'Kensington & Chelsea',
      address: '160 Kensington High St, London W8 7RG',
      contact: 'Sarah Croft',
      role: 'Senior Negotiator & Keyholder',
      phone: '+44 20 7590 9580',
      email: 'kensington@dexters.co.uk',
      leads: 52,
      status: 'Active Partner',
      keyHolding: 'Key collection between 09:00 - 17:30 with valid surveyor RICS ID',
    },
    {
      id: 'CMP-03',
      name: 'Savills Residential',
      code: 'SV',
      branch: 'Guildford & Surrey Hills',
      address: '244 High St, Guildford GU1 3JF',
      contact: 'James Wright',
      role: 'Head of Residential Sales',
      phone: '+44 1483 796800',
      email: 'guildford@savills.com',
      leads: 28,
      status: 'Active Partner',
      keyHolding: 'Call 30 mins prior to arrival for Surrey rural instructions',
    },
    {
      id: 'CMP-04',
      name: 'Knight Frank Mayfair',
      code: 'KF',
      branch: 'West End & Central London',
      address: '55 Baker Street, London W1U 8EW',
      contact: 'Victoria Sterling',
      role: 'Prime Central London Partner',
      phone: '+44 20 7629 8171',
      email: 'mayfair@knightfrank.com',
      leads: 41,
      status: 'Active Partner',
      keyHolding: 'Concierge desk handles key sign-out (Ref: KF-PCL)',
    },
    {
      id: 'CMP-05',
      name: 'Hamptons International',
      code: 'HA',
      branch: 'Battersea & Clapham',
      address: '108 Battersea Rise, London SW11 1EJ',
      contact: 'Lucy Henderson',
      role: 'Sales Operations Manager',
      phone: '+44 20 7498 8686',
      email: 'battersea@hamptons.co.uk',
      leads: 22,
      status: 'Active Partner',
      keyHolding: 'Keys available on lockbox code provided upon booking confirmation',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
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

  const handleAddCompany = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.branch.trim()) return;

    const initials = formData.name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    const newCompany = {
      id: `CMP-${String(companies.length + 1).padStart(2, '0')}`,
      code: initials || 'AG',
      ...formData,
      leads: 0,
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
      message: `${newCompany.name} (${newCompany.branch}) has been added to the directory.`,
    });
  };

  const handleDeleteCompany = (e, id, name) => {
    e.stopPropagation();
    setActiveDropdownId(null);
    if (window.confirm(`Are you sure you want to remove ${name} from partner panels?`)) {
      setCompanies((prev) => prev.filter((c) => c.id !== id));
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

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Partner Agencies</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-[#0B1F4D]">{companies.length} Branches</div>
          <div className="text-xs text-slate-500">London &amp; Home Counties Network</div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Referred Survey Instructions</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono">{totalLeads} Instructions</div>
          <div className="text-xs text-slate-500">B2B Agency Referral Inbound</div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Key Access Protocol</span>
            <Key className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">100% Verified</div>
          <div className="text-xs text-slate-500">Surveyor RICS Photo ID Mandated</div>
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
                  <th className="py-3 px-4 sm:px-5 min-w-[230px]">Agency &amp; Branch</th>
                  <th className="py-3 px-4 whitespace-nowrap">Status</th>
                  <th className="py-3 px-4 min-w-[230px]">Key Contact Person</th>
                  <th className="py-3 px-4 min-w-[250px]">Branch Address &amp; Keyholding</th>
                  <th className="py-3 px-4 text-center whitespace-nowrap">Referred Volume</th>
                  <th className="py-3 px-4 sm:px-5 text-right whitespace-nowrap">Actions</th>
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
                    <td className="py-3.5 px-4 sm:px-5 min-w-[230px]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0B1F4D] to-[#1E3A8A] text-white flex items-center justify-center font-extrabold text-xs shadow-xs shrink-0">
                          {company.code}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-[#2563EB] transition-colors">
                            {company.name}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium">
                            {company.branch}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 2. Status Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                        <span>Active Partner</span>
                      </span>
                    </td>

                    {/* 3. Key Contact Person (Clean & Spacious) */}
                    <td className="py-3.5 px-4 min-w-[230px]">
                      <div>
                        <div className="font-bold text-slate-900 text-xs whitespace-nowrap">
                          {company.contact}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium truncate max-w-[220px] mt-0.5">
                          {company.role}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => handleCopy(e, company.phone, 'Phone')}
                          title="Click to copy phone"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-mono font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                        >
                          <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{company.phone}</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleCopy(e, company.email, 'Email')}
                          title={`Copy ${company.email}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                        >
                          <Mail className="w-3 h-3 text-blue-600 shrink-0" />
                          <span>Email</span>
                        </button>
                      </div>
                    </td>

                    {/* 4. Address & Key Access Note */}
                    <td className="py-3.5 px-4 min-w-[250px] max-w-sm">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs text-slate-700 font-medium leading-tight">
                            {company.address}
                          </div>
                          {company.keyHolding && (
                            <div className="text-[10.5px] text-slate-400 mt-0.5 truncate max-w-[260px]" title={company.keyHolding}>
                              {company.keyHolding}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* 5. Referred Volume */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="font-mono font-bold text-xs text-[#0B1F4D] bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200 inline-block">
                        {company.leads} Referred Surveys
                      </span>
                    </td>

                    {/* 6. Actions Dropdown */}
                    <td className="py-3.5 px-4 sm:px-5 text-right whitespace-nowrap">
                      <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdownId(activeDropdownId === company.id ? null : company.id);
                          }}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Options"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {activeDropdownId === company.id && (
                          <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100 text-left">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdownId(null);
                                setViewingCompany(company);
                              }}
                              className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Building className="w-3.5 h-3.5 text-blue-600" />
                              <span>View Branch Details</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => handleCopy(e, company.phone, 'Phone number')}
                              className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5 text-slate-400" />
                              <span>Copy Contact</span>
                            </button>

                            <div className="my-1 border-t border-slate-100" />

                            <button
                              type="button"
                              onClick={(e) => handleDeleteCompany(e, company.id, company.name)}
                              className="w-full px-3.5 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                              <span>Remove Branch</span>
                            </button>
                          </div>
                        )}
                      </div>
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
              className="px-5 py-2 rounded-xl bg-[#0B1F4D] text-white text-xs font-bold hover:bg-[#162E6E] shadow-sm cursor-pointer"
            >
              Save Partner Branch
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
