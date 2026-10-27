import React, { useState } from 'react';
import {
  Building2,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Table } from '../../components/common/Table';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../components/ToastContext';

export const AdminCompaniesPage = () => {
  const { addToast } = useToast();

  const [companies, setCompanies] = useState([
    {
      id: 'CMP-01',
      name: 'Foxtons Residential Surveys',
      branch: 'Mayfair & Westminster',
      address: '92 Park Lane, London W1K 7TA',
      contact: 'Marcus Bell',
      phone: '+44 20 7946 0888',
      email: 'mayfair@foxtons.co.uk',
      leads: 34,
      status: 'Active Partner',
    },
    {
      id: 'CMP-02',
      name: 'Dexters Estate Agents',
      branch: 'Kensington & Chelsea',
      address: '160 Kensington High St, W8 7RG',
      contact: 'Sarah Croft',
      phone: '+44 20 7590 9580',
      email: 'kensington@dexters.co.uk',
      leads: 52,
      status: 'Active Partner',
    },
    {
      id: 'CMP-03',
      name: 'Savills Residential',
      branch: 'Guildford & Surrey Hills',
      address: '244 High St, Guildford GU1 3JF',
      contact: 'James Wright',
      phone: '+44 1483 796800',
      email: 'guildford@savills.com',
      leads: 28,
      status: 'Active Partner',
    },
    {
      id: 'CMP-04',
      name: 'Knight Frank Mayfair',
      branch: 'West End & Central London',
      address: '55 Baker Street, London W1U 8EW',
      contact: 'Victoria Sterling',
      phone: '+44 20 7629 8171',
      email: 'mayfair@knightfrank.com',
      leads: 41,
      status: 'Active Partner',
    },
    {
      id: 'CMP-05',
      name: 'Hamptons International',
      branch: 'Battersea & Clapham',
      address: '108 Battersea Rise, SW11 1EJ',
      contact: 'Lucy Henderson',
      phone: '+44 20 7498 8686',
      email: 'battersea@hamptons.co.uk',
      leads: 22,
      status: 'Active Partner',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    branch: '',
    address: '',
    contact: '',
    phone: '',
    email: '',
  });

  const handleAddCompany = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.branch.trim()) return;

    const newCompany = {
      id: `CMP-${String(companies.length + 1).padStart(2, '0')}`,
      ...formData,
      leads: 0,
      status: 'Active Partner',
    };

    setCompanies((prev) => [newCompany, ...prev]);
    setIsAddModalOpen(false);
    setFormData({ name: '', branch: '', address: '', contact: '', phone: '', email: '' });

    addToast({
      type: 'success',
      title: 'Partner Branch Added',
      message: `${newCompany.name} (${newCompany.branch}) registered in directory.`,
    });
  };

  const filtered = companies.filter((c) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.branch.toLowerCase().includes(q) ||
      c.contact.toLowerCase().includes(q)
    );
  });

  const columns = [
    {
      key: 'name',
      header: 'Practice / Agency',
      sortable: true,
      render: (val, row) => (
        <div>
          <div className="font-bold text-slate-900 text-xs">{val}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">{row.branch}</div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Primary Contact Person',
      sortable: true,
      render: (val, row) => (
        <div className="text-xs">
          <div className="font-bold text-slate-800">{val}</div>
          <div className="text-slate-400 font-mono text-[11px]">{row.phone}</div>
        </div>
      ),
    },
    {
      key: 'address',
      header: 'Branch Address',
      sortable: true,
      render: (val) => (
        <div className="text-xs text-slate-600 flex items-center gap-1 truncate max-w-[200px]">
          <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
          <span className="truncate">{val}</span>
        </div>
      ),
    },
    {
      key: 'leads',
      header: 'Referred Surveys',
      sortable: true,
      render: (val) => (
        <span className="font-mono font-bold text-xs text-[#0B1F4D] bg-slate-100 px-2.5 py-0.5 rounded-lg">
          {val} Leads
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Panel Status',
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
        title="Companies & Estate Agency Panels"
        subtitle="Manage referral partnerships with London and Home Counties estate agency branches and law firms."
        breadcrumb={['Super Admin', 'Companies']}
        actionLabel="+ Add Agency Branch"
        actionIcon={Plus}
        onAction={() => setIsAddModalOpen(true)}
      />

      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search agency, branch, or contact..."
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
        emptyTitle="No companies found"
        emptyMessage="No partner agencies match the search term."
      />

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register Estate Agent Branch"
        subtitle="Add a new partner office for key collections and inbound survey leads."
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
              className="px-5 py-2 rounded-xl bg-[#0B1F4D] text-white text-xs font-bold hover:bg-[#162E6E] cursor-pointer"
            >
              Save Partner Firm
            </button>
          </>
        }
      >
        <form id="add-company-form" onSubmit={handleAddCompany} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Company / Agency Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Knight Frank"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Branch Office *</label>
              <input
                type="text"
                required
                placeholder="e.g. Chelsea & Fulham"
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Primary Contact *</label>
              <input
                type="text"
                required
                placeholder="e.g. Victoria Sterling"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Telephone</label>
              <input
                type="tel"
                placeholder="+44 20 7000 0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="branch@agency.co.uk"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Office Address</label>
            <input
              type="text"
              placeholder="e.g. 15 Kings Road, London SW3 4RP"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
