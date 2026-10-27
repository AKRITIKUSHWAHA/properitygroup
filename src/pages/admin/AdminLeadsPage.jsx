import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Building2,
  Trash2,
  Eye,
  CheckCircle2,
  MoreVertical,
  PoundSterling,
  User,
  Tag,
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Tabs } from '../../components/common/Tabs';
import { Table } from '../../components/common/Table';
import { StatusPill } from '../../components/common/StatusPill';
import { Modal } from '../../components/common/Modal';
import { NewLeadModal } from '../../components/crm/NewLeadModal';
import { useToast } from '../../components/ToastContext';
import { INITIAL_LEADS, LEAD_SOURCES, LEAD_STATUSES } from '../../mock/leads';

export const AdminLeadsPage = () => {
  const { addToast } = useToast();
  const [leads, setLeads] = useState(INITIAL_LEADS);
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [ownerFilter, setOwnerFilter] = useState('All');
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  // Modals state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [viewingLead, setViewingLead] = useState(null);

  // Tab count calculations
  const tabs = useMemo(() => {
    const list = [
      { id: 'All', label: 'All', count: leads.length },
      ...LEAD_STATUSES.map((st) => ({
        id: st,
        label: st,
        count: leads.filter((l) => l.status.toLowerCase() === st.toLowerCase()).length,
      })),
    ];
    return list;
  }, [leads]);

  // Unique owners
  const owners = useMemo(() => {
    const set = new Set(leads.map((l) => l.owner));
    return ['All', ...Array.from(set)];
  }, [leads]);

  // Filtered dataset
  const filteredLeads = useMemo(() => {
    return leads.filter((item) => {
      // Tab filter
      if (activeTab !== 'All' && item.status.toLowerCase() !== activeTab.toLowerCase()) {
        return false;
      }
      // Source filter
      if (sourceFilter !== 'All' && item.source !== sourceFilter) {
        return false;
      }
      // Owner filter
      if (ownerFilter !== 'All' && item.owner !== ownerFilter) {
        return false;
      }
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const match =
          item.id.toLowerCase().includes(query) ||
          item.customerName.toLowerCase().includes(query) ||
          item.customerEmail.toLowerCase().includes(query) ||
          item.property.toLowerCase().includes(query) ||
          item.location.toLowerCase().includes(query) ||
          item.enquiry.toLowerCase().includes(query);
        if (!match) return false;
      }
      return true;
    });
  }, [leads, activeTab, sourceFilter, ownerFilter, searchTerm]);

  // Handle new lead creation
  const handleCreateLead = (newLead) => {
    setLeads((prev) => [newLead, ...prev]);
    addToast({
      type: 'success',
      title: 'New Lead Registered',
      message: `${newLead.customerName} (${newLead.id}) has been added to the CRM pipeline.`,
    });
  };

  // Quick status update
  const handleStatusChange = (leadId, newStatus) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
    );
    addToast({
      type: 'info',
      title: 'Status Updated',
      message: `Lead ${leadId} status changed to ${newStatus}.`,
    });
  };

  // Delete lead
  const handleDeleteLead = (leadId) => {
    if (window.confirm(`Are you sure you want to delete lead ${leadId}?`)) {
      setLeads((prev) => prev.filter((l) => l.id !== leadId));
      addToast({
        type: 'error',
        title: 'Lead Deleted',
        message: `Lead ${leadId} has been removed from the platform.`,
      });
    }
  };

  // Simulate loading skeleton
  const handleSimulateLoading = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 900);
  };

  // Table columns definition
  // User spec: table (Lead ID, Customer, Enquiry/Property, Location, Source, Status pill, Created, Owner, Actions)
  const columns = [
    {
      key: 'id',
      header: 'Lead ID',
      sortable: true,
      className: 'font-mono font-bold text-[#0B1F4D] whitespace-nowrap',
      render: (val, row) => (
        <button
          onClick={() => setViewingLead(row)}
          className="text-[#2563EB] hover:text-[#0B1F4D] font-bold hover:underline"
        >
          {val}
        </button>
      ),
    },
    {
      key: 'customerName',
      header: 'Customer',
      sortable: true,
      render: (_, row) => (
        <div className="min-w-[150px]">
          <div className="font-bold text-slate-800 leading-tight">
            {row.customerName}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[170px]">
            {row.customerEmail}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            {row.customerPhone}
          </div>
        </div>
      ),
    },
    {
      key: 'enquiry',
      header: 'Enquiry / Property',
      sortable: true,
      render: (_, row) => (
        <div className="min-w-[180px] max-w-[240px]">
          <div className="font-bold text-[#0B1F4D] text-xs truncate">
            {row.enquiry}
          </div>
          <div className="text-[11px] text-slate-600 mt-0.5 truncate">
            {row.property}
          </div>
          {row.estimatedValue && (
            <div className="text-[10px] font-bold text-emerald-700">
              Est. Value: {row.estimatedValue}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      sortable: true,
      className: 'whitespace-nowrap',
      render: (val) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-700">
          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          <span className="truncate max-w-[140px]">{val}</span>
        </div>
      ),
    },
    {
      key: 'source',
      header: 'Source',
      sortable: true,
      render: (val) => {
        let badgeColor = 'bg-slate-100 text-slate-700 border-slate-200';
        if (val === 'Website') badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
        if (val === 'Referral') badgeColor = 'bg-purple-50 text-purple-700 border-purple-200';
        if (val === 'Google Ads') badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
        if (val === 'Local Surveyors Direct') badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        if (val === 'Partner') badgeColor = 'bg-indigo-50 text-indigo-700 border-indigo-200';
        if (val === 'Expert Witness form') badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';

        return (
          <span
            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${badgeColor}`}
          >
            {val}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (val) => <StatusPill status={val} />,
    },
    {
      key: 'created',
      header: 'Created',
      sortable: true,
      className: 'whitespace-nowrap font-mono text-xs text-slate-600',
    },
    {
      key: 'owner',
      header: 'Owner',
      sortable: true,
      render: (val) => (
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <div className="w-5 h-5 rounded-full bg-[#0B1F4D] text-white text-[9px] font-bold flex items-center justify-center shrink-0">
            {val.split(' ').map((n) => n[0]).join('')}
          </div>
          <span className="text-xs text-slate-700 font-medium">{val}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      className: 'text-right whitespace-nowrap',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => setViewingLead(row)}
            title="View Details"
            className="p-1.5 text-slate-400 hover:text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>

          <select
            value={row.status}
            onChange={(e) => handleStatusChange(row.id, e.target.value)}
            className="text-[10px] font-bold bg-slate-50 border border-slate-200 rounded-lg px-1.5 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
          >
            {LEAD_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          <button
            onClick={() => handleDeleteLead(row.id)}
            title="Delete Lead"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="CRM & Leads Pipeline"
        subtitle="Track incoming survey enquiries, conversion funnels, quote acceptance, and customer engagement."
        breadcrumb={['Super Admin', 'CRM & Leads']}
        actionLabel="+ New Lead"
        actionIcon={Plus}
        onAction={() => setIsNewModalOpen(true)}
      />

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Controls & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer, property, postcode, or lead ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:border-[#2563EB] focus:bg-white transition-all"
          />
        </div>

        {/* Right: Filters & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Source Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="text-slate-400 text-[11px] font-semibold">Source:</span>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
            >
              <option value="All">All Sources</option>
              {LEAD_SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Owner Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="text-slate-400 text-[11px] font-semibold">Owner:</span>
            <select
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
            >
              {owners.map((o) => (
                <option key={o} value={o}>
                  {o === 'All' ? 'All Owners' : o}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters */}
          {(searchTerm || sourceFilter !== 'All' || ownerFilter !== 'All' || activeTab !== 'All') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSourceFilter('All');
                setOwnerFilter('All');
                setActiveTab('All');
              }}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
            >
              Reset
            </button>
          )}

          {/* Simulate Loading Skeleton Button */}
          <button
            onClick={handleSimulateLoading}
            title="Test loading skeleton"
            className="p-2 rounded-xl text-slate-500 hover:text-[#0B1F4D] hover:bg-slate-100 border border-slate-200 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Table Component */}
      <Table
        columns={columns}
        data={filteredLeads}
        isLoading={isLoading}
        pageSize={pageSize}
        emptyTitle="No leads found"
        emptyMessage="No survey enquiries match your selected tab, search terms or filters."
        emptyActionLabel="Create New Lead"
        onEmptyAction={() => setIsNewModalOpen(true)}
      />

      {/* New Lead Modal */}
      <NewLeadModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSubmit={handleCreateLead}
      />

      {/* Lead Details Modal */}
      {viewingLead && (
        <Modal
          isOpen={!!viewingLead}
          onClose={() => setViewingLead(null)}
          title={`Lead Details: ${viewingLead.id}`}
          subtitle={`Created on ${viewingLead.created} • Owner: ${viewingLead.owner}`}
          footer={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-semibold">Change Status:</span>
                <select
                  value={viewingLead.status}
                  onChange={(e) => {
                    handleStatusChange(viewingLead.id, e.target.value);
                    setViewingLead((prev) => ({ ...prev, status: e.target.value }));
                  }}
                  className="px-2 py-1 text-xs font-bold rounded-lg border border-slate-200 bg-white"
                >
                  {LEAD_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setViewingLead(null)}
                className="px-4 py-2 rounded-xl bg-[#0B1F4D] text-white text-xs font-bold hover:bg-[#162E6E]"
              >
                Close
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="flex items-center gap-3">
                <StatusPill status={viewingLead.status} />
                <span className="text-xs font-semibold text-slate-500">
                  Source: <strong className="text-slate-800">{viewingLead.source}</strong>
                </span>
              </div>
              <div className="text-sm font-black text-emerald-700 font-mono">
                {viewingLead.estimatedValue}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Client Contact
                </span>
                <div className="text-sm font-bold text-slate-900">{viewingLead.customerName}</div>
                <div className="text-xs text-slate-600 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {viewingLead.customerEmail}
                </div>
                <div className="text-xs text-slate-600 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {viewingLead.customerPhone}
                </div>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Property & Scope
                </span>
                <div className="text-xs font-bold text-[#0B1F4D]">{viewingLead.enquiry}</div>
                <div className="text-xs text-slate-700 flex items-start gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  {viewingLead.property}
                </div>
                <div className="text-xs text-slate-600 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  {viewingLead.location}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Client Notes & Surveyor Inspection Specifics
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">
                {viewingLead.notes}
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
