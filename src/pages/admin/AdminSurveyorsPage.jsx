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
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Table } from '../../components/common/Table';
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
      phone: `+44 7700 900${idx}84`,
      email: `${s.name.toLowerCase().split(' ')[0]}@propertygroup.co.uk`,
    })),
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    credentials: 'MRICS Chartered Valuation Surveyor',
    postcodes: 'SW, W, KT',
    phone: '',
    email: '',
    color: '#2563EB',
  });

  const handleAddSurveyor = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const newSurveyor = {
      id: `srv-${surveyorsList.length + 1}`,
      name: formData.name.trim(),
      credentials: formData.credentials,
      postcodes: formData.postcodes,
      color: formData.color,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80',
      piiExpiry: '31/12/2027',
      assignedJobs: 0,
      status: 'Active Field',
      phone: formData.phone || '+44 7700 900999',
      email: formData.email || 'surveyor@propertygroup.co.uk',
    };

    setSurveyorsList((prev) => [...prev, newSurveyor]);
    setIsAddModalOpen(false);
    setFormData({ name: '', credentials: 'MRICS Chartered Valuation Surveyor', postcodes: 'SW, W, KT', phone: '', email: '', color: '#2563EB' });

    addToast({
      type: 'success',
      title: 'Surveyor Registered',
      message: `${newSurveyor.name} onboarded into surveyor directory.`,
    });
  };

  const filtered = surveyorsList.filter((s) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.credentials.toLowerCase().includes(q) ||
      s.postcodes.toLowerCase().includes(q)
    );
  });

  const columns = [
    {
      key: 'name',
      header: 'Surveyor Name',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.avatar}
            alt={val}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-xs"
          />
          <div>
            <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <span>{val}</span>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: row.color }} />
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'credentials',
      header: 'RICS Accreditation',
      sortable: true,
      render: (val) => (
        <span className="font-semibold text-xs text-slate-800">
          {val}
        </span>
      ),
    },
    {
      key: 'postcodes',
      header: 'Postcode Coverage',
      sortable: true,
      render: (val) => (
        <span className="font-mono font-bold text-xs text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
          {val}
        </span>
      ),
    },
    {
      key: 'assignedJobs',
      header: 'Active Load (Mo)',
      sortable: true,
      render: (val) => (
        <span className="font-mono font-bold text-slate-900 text-xs">
          {val} Inspections
        </span>
      ),
    },
    {
      key: 'piiExpiry',
      header: 'PII Insurance',
      sortable: true,
      render: (val) => (
        <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-semibold">
          Valid to {val}
        </span>
      ),
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
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <PageHeader
        title="Chartered Surveyors Directory"
        subtitle="Manage certified MRICS / FRICS / AssocRICS surveyors, PII insurance validations, and regional UK allocations."
        breadcrumb={['Super Admin', 'Surveyors']}
        actionLabel="Onboard Surveyor"
        actionIcon={Plus}
        onAction={() => setIsAddModalOpen(true)}
      />

      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by surveyor name, RICS credential, or postcodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:bg-white"
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={filtered}
        pageSize={10}
        emptyTitle="No surveyors found"
        emptyMessage="No surveyors match the search query."
      />

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Onboard Chartered Surveyor"
        subtitle="Add accredited professional to field inspection allocation network."
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
              form="add-surveyor-form"
              className="px-5 py-2 rounded-xl bg-[#0B1F4D] text-white text-xs font-bold hover:bg-[#162E6E] cursor-pointer"
            >
              Register Surveyor
            </button>
          </>
        }
      >
        <form id="add-surveyor-form" onSubmit={handleAddSurveyor} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Name & Honorifics *</label>
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
            <label className="block font-semibold text-slate-700 mb-1">RICS Accreditation Designation *</label>
            <select
              value={formData.credentials}
              onChange={(e) => setFormData({ ...formData, credentials: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900"
            >
              <option value="MRICS Chartered Valuation Surveyor">MRICS Chartered Valuation Surveyor</option>
              <option value="Senior Building Surveyor (MRICS)">Senior Building Surveyor (MRICS)</option>
              <option value="Residential Defect Specialist (AssocRICS)">Residential Defect Specialist (AssocRICS)</option>
              <option value="Fellow Chartered Surveyor (FRICS)">Fellow Chartered Surveyor (FRICS)</option>
              <option value="Historic Buildings Consultant (MRICS)">Historic Buildings Consultant (MRICS)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assigned Postcodes *</label>
              <input
                type="text"
                required
                placeholder="e.g. OX, RG, HP"
                value={formData.postcodes}
                onChange={(e) => setFormData({ ...formData, postcodes: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Calendar Color Hex</label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mobile Phone</label>
              <input
                type="tel"
                placeholder="+44 7700 900000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="surveyor@propertygroup.co.uk"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
