import React, { useState } from 'react';
import {
  UserCheck,
  Search,
  Plus,
  ShieldCheck,
  MapPin,
  Calendar,
  CheckCircle2,
  Phone,
  Mail,
  Award,
  TrendingUp,
  MoreVertical,
  Copy,
  Edit,
  Trash2,
  Briefcase,
  Clock,
  User,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../components/ToastContext';
import { SURVEYORS } from '../../mock/jobs';

export const AdminSurveyorsPage = () => {
  const { addToast } = useToast();

  const [surveyorsList, setSurveyorsList] = useState([
    ...SURVEYORS.map((s, idx) => ({
      ...s,
      piiExpiry: idx % 2 === 0 ? '15/12/2026' : '22/01/2027',
      assignedJobs: 12 + idx * 3,
      status: 'Active Field',
      phone: `+44 7700 900${idx + 1}84`,
      email: `${s.name.toLowerCase().split(' ')[0]}@njspropertygroup.com`,
      specialism: idx === 0 ? 'Valuation & Level 2' : idx === 1 ? 'Period Structures & Level 3' : 'Damp, Timber & Defects',
    })),
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [viewingSurveyor, setViewingSurveyor] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    credentials: 'MRICS Chartered Valuation Surveyor',
    postcodes: 'SW, W, KT',
    phone: '',
    email: '',
    color: '#2563EB',
    piiExpiry: '31/12/2027',
  });

  const totalInspections = surveyorsList.reduce((acc, s) => acc + (s.assignedJobs || 0), 0);

  const handleCopy = (e, text, label) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(text);
    addToast({
      type: 'info',
      title: 'Copied to Clipboard',
      message: `${label}: ${text}`,
    });
  };

  const handleAddSurveyor = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const newSurveyor = {
      id: `srv-${surveyorsList.length + 1}`,
      name: formData.name.trim(),
      credentials: formData.credentials,
      postcodes: formData.postcodes.toUpperCase(),
      color: formData.color,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80',
      piiExpiry: formData.piiExpiry || '31/12/2027',
      assignedJobs: 0,
      status: 'Active Field',
      phone: formData.phone || '+44 7700 900999',
      email: formData.email || `${formData.name.toLowerCase().split(' ')[0]}@njspropertygroup.com`,
      specialism: 'RICS Residential Inspections',
    };

    setSurveyorsList((prev) => [...prev, newSurveyor]);
    setIsAddModalOpen(false);
    setFormData({
      name: '',
      credentials: 'MRICS Chartered Valuation Surveyor',
      postcodes: 'SW, W, KT',
      phone: '',
      email: '',
      color: '#2563EB',
      piiExpiry: '31/12/2027',
    });

    addToast({
      type: 'success',
      title: 'Chartered Surveyor Onboarded',
      message: `${newSurveyor.name} has been added to field operations network.`,
    });
  };

  const handleDeleteSurveyor = (e, id, name) => {
    e.stopPropagation();
    setActiveDropdownId(null);
    if (window.confirm(`Are you sure you want to offboard ${name} from active panel?`)) {
      setSurveyorsList((prev) => prev.filter((s) => s.id !== id));
      addToast({
        type: 'info',
        title: 'Surveyor Offboarded',
        message: `${name} has been removed from active rota.`,
      });
    }
  };

  const filtered = surveyorsList.filter((s) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.credentials.toLowerCase().includes(q) ||
      s.postcodes.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <PageHeader
        title="Chartered Surveyors Directory"
        subtitle="Manage certified MRICS / FRICS / AssocRICS surveyors, PII insurance validations, and regional UK allocations."
        breadcrumb={['Admin', 'Surveyors']}
        actionLabel="Onboard Surveyor"
        actionIcon={Plus}
        onAction={() => setIsAddModalOpen(true)}
      />

      {/* 3 Top Metric Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Accredited Panel</span>
            <UserCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-[#0B1F4D]">{surveyorsList.length} Surveyors</div>
          <div className="text-xs text-slate-500">Chartered MRICS / FRICS / AssocRICS</div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Monthly Load</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono">{totalInspections} Inspections</div>
          <div className="text-xs text-slate-500">Scheduled on-site visits across UK</div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">PII Compliance</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">100% Validated</div>
          <div className="text-xs text-slate-500">Professional Indemnity Insurance up to date</div>
        </div>
      </div>

      {/* Main Table / Directory Container */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Toolbar Header */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-[#2563EB]" />
              <span>Chartered Surveyors Operational Panel</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {filtered.length} active
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Field inspection capacity, assigned postcode territories, and RICS accreditation status.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search surveyor name, RICS credential, postcodes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
        </div>

        {/* Directory Rows */}
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-slate-50/50">
            <UserCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No chartered surveyors match your search</p>
            <p className="text-xs text-slate-500 mt-1">Try clearing your search keyword.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                <tr>
                  <th className="py-3 px-4 sm:px-5 min-w-[240px]">Chartered Surveyor</th>
                  <th className="py-3 px-4 whitespace-nowrap">Status</th>
                  <th className="py-3 px-4 min-w-[240px]">Direct Contact</th>
                  <th className="py-3 px-4 text-center whitespace-nowrap">Territory</th>
                  <th className="py-3 px-4 text-center whitespace-nowrap">Monthly Workload</th>
                  <th className="py-3 px-4 whitespace-nowrap">PII Insurance</th>
                  <th className="py-3 px-4 sm:px-5 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((surveyor) => (
                  <tr
                    key={surveyor.id}
                    onClick={() => setViewingSurveyor(surveyor)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    {/* 1. Chartered Surveyor Avatar + Name + Credentials */}
                    <td className="py-3.5 px-4 sm:px-5 min-w-[240px]">
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <img
                            src={surveyor.avatar}
                            alt={surveyor.name}
                            className="w-10 h-10 rounded-2xl object-cover ring-2 ring-white shadow-xs"
                          />
                          <span
                            className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white"
                            style={{ backgroundColor: surveyor.color || '#2563EB' }}
                            title="Calendar Color Badge"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-[#2563EB] transition-colors whitespace-nowrap">
                            {surveyor.name}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium truncate max-w-[210px] mt-0.5">
                            {surveyor.credentials}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 2. Status Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                        <span>Active Field</span>
                      </span>
                    </td>

                    {/* 3. Direct Contact (Phone & Email Pills) */}
                    <td className="py-3.5 px-4 min-w-[240px]">
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => handleCopy(e, surveyor.phone, 'Mobile')}
                          title="Click to copy phone"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-mono font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                        >
                          <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{surveyor.phone}</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleCopy(e, surveyor.email, 'Email')}
                          title={`Copy ${surveyor.email}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                        >
                          <Mail className="w-3 h-3 text-blue-600 shrink-0" />
                          <span>Email</span>
                        </button>
                      </div>
                    </td>

                    {/* 4. Coverage Territory */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="font-mono font-bold text-xs text-[#2563EB] bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-200 inline-block">
                        {surveyor.postcodes}
                      </span>
                    </td>

                    {/* 5. Monthly Workload */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200 inline-block">
                        {surveyor.assignedJobs} Inspections
                      </span>
                    </td>

                    {/* 6. PII Insurance Validation */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-[11px] font-mono font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200 inline-flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>PII Valid: {surveyor.piiExpiry}</span>
                      </span>
                    </td>

                    {/* 7. Actions Dropdown */}
                    <td className="py-3.5 px-4 sm:px-5 text-right whitespace-nowrap">
                      <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdownId(activeDropdownId === surveyor.id ? null : surveyor.id);
                          }}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Options"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {activeDropdownId === surveyor.id && (
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100 text-left">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdownId(null);
                                setViewingSurveyor(surveyor);
                              }}
                              className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                            >
                              <User className="w-3.5 h-3.5 text-blue-600" />
                              <span>View Surveyor Profile</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => handleCopy(e, surveyor.phone, 'Mobile number')}
                              className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5 text-slate-400" />
                              <span>Copy Mobile Phone</span>
                            </button>

                            <div className="my-1 border-t border-slate-100" />

                            <button
                              type="button"
                              onClick={(e) => handleDeleteSurveyor(e, surveyor.id, surveyor.name)}
                              className="w-full px-3.5 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                              <span>Offboard Surveyor</span>
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

      {/* MODAL: Onboard Chartered Surveyor Form */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Onboard Chartered Surveyor"
        subtitle="Register accredited RICS surveyor to field operations rota and postcode allocation matrix."
        maxWidth="max-w-xl"
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
              form="add-surveyor-form"
              className="px-5 py-2 rounded-xl bg-[#0B1F4D] text-white text-xs font-bold hover:bg-[#162E6E] shadow-sm cursor-pointer"
            >
              Register Surveyor
            </button>
          </>
        }
      >
        <form id="add-surveyor-form" onSubmit={handleAddSurveyor} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Full Legal Name &amp; RICS Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. David Thorne MRICS, Claire Bennet AssocRICS"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-semibold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">RICS Accreditation Designation *</label>
            <select
              value={formData.credentials}
              onChange={(e) => setFormData({ ...formData, credentials: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              <option value="MRICS Chartered Valuation Surveyor">MRICS Chartered Valuation Surveyor (Level 2 &amp; Valuations)</option>
              <option value="Senior Building Surveyor (MRICS)">Senior Building Surveyor (MRICS Level 3 Specialist)</option>
              <option value="Residential Defect Specialist (AssocRICS)">Residential Defect Specialist (AssocRICS)</option>
              <option value="Fellow Chartered Surveyor (FRICS)">Fellow Chartered Surveyor (FRICS - Dispute &amp; Expert Witness)</option>
              <option value="Historic Buildings Consultant (MRICS)">Historic Buildings Consultant (MRICS Heritage)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Assigned Postcodes (Territory) *</label>
              <input
                type="text"
                required
                placeholder="e.g. SW, KT, GU"
                value={formData.postcodes}
                onChange={(e) => setFormData({ ...formData, postcodes: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">UK Postcode areas covered without travel surcharge</span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Calendar Color Accent</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-10 h-10 p-0.5 rounded-xl border border-slate-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Mobile Phone (Direct)</label>
              <input
                type="tel"
                placeholder="+44 7700 900000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Practice Email Address</label>
              <input
                type="email"
                placeholder="surveyor@njspropertygroup.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">PII Insurance Expiry Date</label>
            <input
              type="text"
              placeholder="DD/MM/YYYY e.g. 31/12/2027"
              value={formData.piiExpiry}
              onChange={(e) => setFormData({ ...formData, piiExpiry: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">Mandatory RICS regulatory compliance check</span>
          </div>
        </form>
      </Modal>

      {/* MODAL: View Surveyor Profile & Credentials */}
      {viewingSurveyor && (
        <Modal
          isOpen={!!viewingSurveyor}
          onClose={() => setViewingSurveyor(null)}
          title={viewingSurveyor.name}
          subtitle={viewingSurveyor.credentials}
          maxWidth="max-w-lg"
          footer={
            <div className="flex justify-end w-full">
              <button
                type="button"
                onClick={() => setViewingSurveyor(null)}
                className="px-5 py-2 bg-[#0B1F4D] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            {/* Header Identity Card */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3.5">
              <img
                src={viewingSurveyor.avatar}
                alt={viewingSurveyor.name}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white shadow-sm"
              />
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{viewingSurveyor.name}</h4>
                <div className="text-xs text-[#2563EB] font-semibold">{viewingSurveyor.credentials}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Specialism: {viewingSurveyor.specialism}</div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Mobile Phone:</span>
                <span className="font-mono font-bold text-slate-800">{viewingSurveyor.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Practice Email:</span>
                <span className="font-mono text-blue-600">{viewingSurveyor.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Allocated Territory:</span>
                <span className="font-mono font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {viewingSurveyor.postcodes}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Current Month Inspections:</span>
                <span className="font-bold text-slate-900">{viewingSurveyor.assignedJobs} Surveys</span>
              </div>
            </div>

            {/* RICS Compliance Assurance */}
            <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Professional Indemnity Insurance (PII)
                </span>
                <span className="text-[11px] text-emerald-700">Validated under RICS Firm Registration #089421</span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
                Valid to {viewingSurveyor.piiExpiry}
              </span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
