import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  Mail,
  Phone,
  MapPin,
  Building2,
  Trash2,
  Eye,
  CheckCircle2,
  MoreVertical,
  PoundSterling,
  PhoneCall,
  AlertTriangle,
  Send,
  Target,
  TrendingUp,
  FileText,
  Clock,
  ArrowRight,
  ShieldCheck,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Tabs } from '../../components/common/Tabs';
import { StatusPill } from '../../components/common/StatusPill';
import { Modal } from '../../components/common/Modal';
import { NewLeadModal } from '../../components/crm/NewLeadModal';
import { SendQuoteModal } from '../../components/crm/SendQuoteModal';
import { useToast } from '../../components/ToastContext';
import { ClientProfileModal } from '../../components/crm/ClientProfileModal';
import { LEAD_SOURCES, LEAD_STATUSES, useLeads } from '../../mock/leads';

// 3-Dot Clean Action Dropdown Menu for each Lead
const LeadRowActions = ({
  lead,
  onView,
  onQuote,
  onConvert,
  onClientProfile,
  onStatusChange,
  onDelete,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const isQuoted = lead.status.toLowerCase() === 'quoted';
  const isConverted = lead.status.toLowerCase() === 'converted';

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
        className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-[#0B1F4D] hover:bg-slate-100 transition-colors cursor-pointer"
        title="Lead actions"
        aria-label="Lead actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
          {/* Primary Action Based on State */}
          {!isQuoted && !isConverted && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onQuote(lead);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-amber-950 bg-amber-50/70 hover:bg-amber-100/80 transition-colors cursor-pointer text-left"
            >
              <PoundSterling className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Send Fee Quote</span>
            </button>
          )}

          {isQuoted && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  onConvert(lead.id);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-emerald-950 bg-emerald-50/70 hover:bg-emerald-100/80 transition-colors cursor-pointer text-left"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Convert to Won Job</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  onQuote(lead);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left"
              >
                <PoundSterling className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Adjust / Resend Quote</span>
              </button>
            </>
          )}

          {/* View Details */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onView(lead);
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#0B1F4D] transition-colors cursor-pointer text-left"
          >
            <Eye className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>View Full Details</span>
          </button>

          {/* Client Profile with Call Notes & Complaints */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onClientProfile(lead.customerEmail, 'calls');
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#0B1F4D] transition-colors cursor-pointer text-left"
          >
            <PhoneCall className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
            <span>Call Notes &amp; Complaints</span>
          </button>

          <div className="h-px bg-slate-100 my-1" />

          {/* Quick Status Submenu */}
          <div className="px-3.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Update Status
          </div>
          {['New', 'Quoted', 'Converted', 'Lost'].map((st) => (
            <button
              key={st}
              type="button"
              disabled={lead.status === st}
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onStatusChange(lead.id, st);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-1.5 text-xs text-left transition-colors cursor-pointer ${
                lead.status === st
                  ? 'text-slate-400 font-bold bg-slate-50 cursor-default'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span>{st}</span>
              {lead.status === st && <CheckCircle2 className="w-3 h-3 text-slate-400" />}
            </button>
          ))}

          <div className="h-px bg-slate-100 my-1" />

          {/* Delete Lead */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onDelete(lead.id);
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span>Delete Lead</span>
          </button>
        </div>
      )}
    </div>
  );
};

export const AdminLeadsPage = () => {
  const { addToast } = useToast();
  const { leads, updateLeadStatus, addLead, deleteLead } = useLeads();
  const location = useLocation();

  const queryFilter = useMemo(() => {
    return new URLSearchParams(location.search).get('filter') || 'All';
  }, [location.search]);

  const [activeTab, setActiveTab] = useState(queryFilter);
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [ownerFilter, setOwnerFilter] = useState('All');
  const [pageSize] = useState(10);

  // Modals state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [viewingLead, setViewingLead] = useState(null);
  const [quotingLead, setQuotingLead] = useState(null);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [selectedClientEmail, setSelectedClientEmail] = useState(null);
  const [clientModalTab, setClientModalTab] = useState('calls');

  // Client-Focused Clean Tabs
  // Groups inbound/in-progress leads together cleanly
  const tabs = useMemo(() => {
    const newCount = leads.filter(
      (l) => l.status === 'New' || l.status === 'Contacted' || l.status === 'Qualified'
    ).length;
    const quotedCount = leads.filter((l) => l.status.toLowerCase() === 'quoted').length;
    const convertedCount = leads.filter((l) => l.status.toLowerCase() === 'converted').length;
    const lostCount = leads.filter((l) => l.status.toLowerCase() === 'lost').length;

    return [
      { id: 'All', label: 'All Leads', count: leads.length },
      { id: 'New', label: 'New / Inbound', count: newCount },
      { id: 'Quoted', label: 'Quoted', count: quotedCount },
      { id: 'Converted', label: 'Converted', count: convertedCount },
      { id: 'Lost', label: 'Lost', count: lostCount },
    ];
  }, [leads]);

  // Unique owners
  const owners = useMemo(() => {
    const set = new Set(leads.map((l) => l.owner));
    return ['All', ...Array.from(set)];
  }, [leads]);

  // Quoted pipeline calculations
  const quotedLeads = useMemo(() => {
    return leads.filter((l) => l.status.toLowerCase() === 'quoted');
  }, [leads]);

  const totalQuotedValue = useMemo(() => {
    return quotedLeads.reduce((acc, l) => {
      const num = parseFloat((l.estimatedValue || '0').replace(/[^0-9.]/g, '')) || 0;
      return acc + num;
    }, 0);
  }, [quotedLeads]);

  const convertedLeads = useMemo(() => {
    return leads.filter((l) => l.status.toLowerCase() === 'converted');
  }, [leads]);

  // Filtered dataset
  const filteredLeads = useMemo(() => {
    return leads.filter((item) => {
      // Tab filter
      if (activeTab === 'New') {
        const isNewGroup =
          item.status === 'New' || item.status === 'Contacted' || item.status === 'Qualified';
        if (!isNewGroup) return false;
      } else if (activeTab !== 'All' && item.status.toLowerCase() !== activeTab.toLowerCase()) {
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
    addLead(newLead);
    addToast({
      type: 'success',
      title: 'New Lead Registered',
      message: `${newLead.customerName} (${newLead.id}) has been added to the CRM pipeline.`,
    });
  };

  // Quick status update
  const handleStatusChange = (leadId, newStatus) => {
    updateLeadStatus(leadId, newStatus);
    addToast({
      type: 'info',
      title: 'Status Updated',
      message: `Lead ${leadId} status changed to ${newStatus}.`,
    });
  };

  // Convert deal
  const handleConvertDeal = (leadId) => {
    updateLeadStatus(leadId, 'Converted');
    addToast({
      type: 'success',
      title: 'Deal Won & Converted',
      message: `Lead ${leadId} proposal accepted! Converted to confirmed survey job.`,
    });
  };

  // Quote sent callback
  const handleQuoteSent = (leadId, quotedAmount, quoteRef) => {
    updateLeadStatus(leadId, 'Quoted', {
      estimatedValue: quotedAmount,
      quoteRef: quoteRef,
    });
    if (viewingLead && viewingLead.id === leadId) {
      setViewingLead((prev) => ({
        ...prev,
        status: 'Quoted',
        estimatedValue: quotedAmount,
        quoteRef: quoteRef,
      }));
    }
  };

  // Delete lead
  const handleDeleteLead = (leadId) => {
    if (window.confirm(`Are you sure you want to delete lead ${leadId}?`)) {
      deleteLead(leadId);
      addToast({
        type: 'error',
        title: 'Lead Deleted',
        message: `Lead ${leadId} has been removed from the platform.`,
      });
    }
  };

  // Table state & helpers
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  // Reset page when filter/search/tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, sourceFilter, ownerFilter, searchTerm]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortedLeads = useMemo(() => {
    if (!sortKey) return filteredLeads;
    return [...filteredLeads].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (valA === valB) return 0;
      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;
      const compare = String(valA).localeCompare(String(valB), undefined, {
        numeric: true,
        sensitivity: 'base',
      });
      return sortDir === 'asc' ? compare : -compare;
    });
  }, [filteredLeads, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedLeads.length / pageSize));
  const effectivePage = Math.min(currentPage, totalPages);
  const paginatedLeads = useMemo(() => {
    const start = (effectivePage - 1) * pageSize;
    return sortedLeads.slice(start, start + pageSize);
  }, [sortedLeads, effectivePage, pageSize]);

  const getSourceBadgeColor = (val) => {
    if (val === 'Website') return 'bg-blue-50 text-blue-700 border-blue-200';
    if (val === 'Referral') return 'bg-purple-50 text-purple-700 border-purple-200';
    if (val === 'Google Ads') return 'bg-slate-100 text-slate-700 border-slate-200';
    if (val === 'Partner') return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    if (val === 'Expert Witness form') return 'bg-rose-50 text-rose-700 border-rose-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <PageHeader
        title="CRM & Leads Pipeline"
        subtitle="Track incoming survey enquiries, conversion funnels, quote acceptance, and customer engagement."
        breadcrumb={['Admin', 'CRM & Leads']}
        actionLabel="New Lead"
        actionIcon={Plus}
        onAction={() => setIsNewModalOpen(true)}
      />

      {/* 3 Top Executive Metric Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Inbound Inquiries</span>
            <Target className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-[#0B1F4D]">{leads.length} Active Leads</div>
          <div className="text-xs text-slate-500">
            Local Surveyors Direct, Website, and Direct Enquiries
          </div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Quoted Deals Value</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700 font-mono">
            £{totalQuotedValue.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-500">
            {quotedLeads.length} Fee proposals dispatched to clients
          </div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Won Conversions</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">
            {convertedLeads.length} Converted Jobs
          </div>
          <div className="text-xs text-slate-500">
            {((convertedLeads.length / (leads.length || 1)) * 100).toFixed(1)}% Conversion to live
            survey instructions
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Quoted Deals Executive Pipeline Banner */}
      {activeTab === 'Quoted' && (
        <div className="p-4 bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-transparent border border-amber-300/80 rounded-2xl flex items-center justify-between flex-wrap gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0 shadow-xs">
              <PoundSterling className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Active Quoted Deals Pipeline
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Fee proposals dispatched via email or Local Surveyors Direct. Click &apos;Convert
                Deal&apos; in actions when client accepts.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Deals Quoted
              </span>
              <span className="text-base font-extrabold text-[#0B1F4D]">
                {quotedLeads.length} Proposals
              </span>
            </div>
            <div className="text-right pl-4 border-l border-amber-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Pipeline Value
              </span>
              <span className="text-base font-black text-amber-700 font-mono">
                £{totalQuotedValue.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Controls & Filter Toolbar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search input + Mobile Filter Button */}
        <div className="flex items-center gap-2 flex-1 max-w-xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by customer, property, postcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:border-[#2563EB] focus:bg-white transition-all min-h-[42px]"
            />
          </div>

          {/* Mobile Filter Button */}
          <button
            type="button"
            onClick={() => setIsMobileFiltersOpen(true)}
            className="md:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold min-h-[42px] shrink-0 cursor-pointer"
          >
            <Filter className="w-4 h-4 text-[#2563EB]" />
            <span>Filters</span>
            {(sourceFilter !== 'All' || ownerFilter !== 'All') && (
              <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
            )}
          </button>
        </div>

        {/* Desktop Inline Filters */}
        <div className="hidden md:flex flex-wrap items-center gap-2">
          {/* Source Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="text-slate-400 text-[11px] font-semibold">Source:</span>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2563EB] min-h-[40px] cursor-pointer"
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
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2563EB] min-h-[40px] cursor-pointer"
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
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors min-h-[40px] cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Mobile Filter Bottom Sheet Modal */}
      <Modal
        isOpen={isMobileFiltersOpen}
        onClose={() => setIsMobileFiltersOpen(false)}
        title="Filter Leads"
        subtitle="Narrow down survey inquiries by lead source or assigned coordinator"
        footer={
          <div className="w-full flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                setSourceFilter('All');
                setOwnerFilter('All');
                setIsMobileFiltersOpen(false);
              }}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 min-h-[44px]"
            >
              Reset All
            </button>
            <button
              type="button"
              onClick={() => setIsMobileFiltersOpen(false)}
              className="px-5 py-2.5 rounded-xl bg-[#0B1F4D] text-white text-xs font-bold min-h-[44px]"
            >
              Apply Filters
            </button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">Inquiry Lead Source</label>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold min-h-[44px]"
            >
              <option value="All">All Sources</option>
              {LEAD_SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">Survey Coordinator (Owner)</label>
            <select
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold min-h-[44px]"
            >
              {owners.map((o) => (
                <option key={o} value={o}>
                  {o === 'All' ? 'All Owners' : o}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Modal>

      {/* Main Table Component */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        {filteredLeads.length === 0 ? (
          <div className="p-12 text-center">
            <Filter className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">No leads found</p>
            <p className="text-xs text-slate-500 mt-1">
              No survey enquiries match your selected tab, search terms or filters.
            </p>
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-[#0B1F4D] text-white text-xs font-bold hover:bg-[#162E6E] cursor-pointer"
            >
              Create New Lead
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                  <tr>
                    <th
                      onClick={() => handleSort('id')}
                      className="py-3 px-4 sm:px-5 whitespace-nowrap min-w-[130px] cursor-pointer hover:bg-slate-100/60 transition-colors select-none"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Lead / Date</span>
                        {sortKey === 'id' ? (
                          sortDir === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-[#2563EB]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#2563EB]" />
                        ) : (
                          <ChevronsUpDown className="w-3 h-3 opacity-40" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('customerName')}
                      className="py-3 px-4 min-w-[210px] cursor-pointer hover:bg-slate-100/60 transition-colors select-none"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Customer</span>
                        {sortKey === 'customerName' ? (
                          sortDir === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-[#2563EB]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#2563EB]" />
                        ) : (
                          <ChevronsUpDown className="w-3 h-3 opacity-40" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('enquiry')}
                      className="py-3 px-4 min-w-[240px] cursor-pointer hover:bg-slate-100/60 transition-colors select-none"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Survey &amp; Property</span>
                        {sortKey === 'enquiry' ? (
                          sortDir === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-[#2563EB]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#2563EB]" />
                        ) : (
                          <ChevronsUpDown className="w-3 h-3 opacity-40" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('source')}
                      className="py-3 px-4 whitespace-nowrap cursor-pointer hover:bg-slate-100/60 transition-colors select-none"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Source</span>
                        {sortKey === 'source' ? (
                          sortDir === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-[#2563EB]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#2563EB]" />
                        ) : (
                          <ChevronsUpDown className="w-3 h-3 opacity-40" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('estimatedValue')}
                      className="py-3 px-4 whitespace-nowrap cursor-pointer hover:bg-slate-100/60 transition-colors select-none"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Quote / Fee</span>
                        {sortKey === 'estimatedValue' ? (
                          sortDir === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-[#2563EB]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#2563EB]" />
                        ) : (
                          <ChevronsUpDown className="w-3 h-3 opacity-40" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('status')}
                      className="py-3 px-4 whitespace-nowrap cursor-pointer hover:bg-slate-100/60 transition-colors select-none"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Status</span>
                        {sortKey === 'status' ? (
                          sortDir === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-[#2563EB]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#2563EB]" />
                        ) : (
                          <ChevronsUpDown className="w-3 h-3 opacity-40" />
                        )}
                      </div>
                    </th>
                    <th className="py-3 px-4 sm:px-5 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedLeads.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => setViewingLead(row)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* 1. Lead / Date */}
                      <td className="py-3.5 px-4 sm:px-5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingLead(row);
                          }}
                          className="text-[#2563EB] hover:text-[#0B1F4D] font-mono font-bold hover:underline cursor-pointer block text-xs"
                          title="Click to view full lead details"
                        >
                          {row.id}
                        </button>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">{row.created}</div>
                        <div className="text-[10px] text-slate-500 font-medium mt-0.5 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                          <span className="truncate max-w-[110px]">{row.owner}</span>
                        </div>
                      </td>

                      {/* 2. Customer */}
                      <td className="py-3.5 px-4 min-w-[210px]" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedClientEmail(row.customerEmail);
                            setClientModalTab('calls');
                          }}
                          className="text-left font-bold text-[#0B1F4D] hover:text-[#2563EB] hover:underline flex items-center gap-1.5 group/cust cursor-pointer text-xs"
                          title="Click to view client profile, call history & complaints"
                        >
                          <span>{row.customerName}</span>
                          <PhoneCall className="w-3 h-3 text-[#2563EB] opacity-60 group-hover/cust:opacity-100 transition-opacity shrink-0" />
                        </button>
                        <div className="text-[11px] text-slate-500 mt-0.5 break-all sm:truncate max-w-[220px]">
                          {row.customerEmail}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {row.customerPhone}
                        </div>
                      </td>

                      {/* 3. Survey & Property */}
                      <td className="py-3.5 px-4 min-w-[240px]">
                        <div className="font-bold text-[#0B1F4D] text-xs leading-snug group-hover:text-[#2563EB] transition-colors">
                          {row.enquiry}
                        </div>
                        <div className="text-[11px] text-slate-600 mt-1 flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                          <span className="leading-tight text-slate-600 font-medium">
                            {row.property}, {row.location}
                          </span>
                        </div>
                      </td>

                      {/* 4. Source */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {row.source === 'Local Surveyors Direct' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-950 border border-amber-300 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            LSD Direct
                          </span>
                        ) : row.source === 'Email Inquiry' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-100 text-sky-900 border border-sky-300">
                            <Mail className="w-3 h-3 text-sky-600" />
                            Email Inquiry
                          </span>
                        ) : (
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${getSourceBadgeColor(
                              row.source
                            )}`}
                          >
                            {row.source}
                          </span>
                        )}
                      </td>

                      {/* 5. Quote / Fee */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-mono font-bold text-xs text-slate-900">
                          {row.estimatedValue || 'Pending'}
                        </div>
                        {row.status.toLowerCase() === 'quoted' && (
                          <span className="text-[10px] text-amber-700 font-semibold block mt-0.5">
                            Proposal Out
                          </span>
                        )}
                      </td>

                      {/* 6. Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusPill status={row.status} />
                      </td>

                      {/* 7. Actions */}
                      <td
                        className="py-3.5 px-4 sm:px-5 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <LeadRowActions
                          lead={row}
                          onView={(l) => setViewingLead(l)}
                          onQuote={(l) => setQuotingLead(l)}
                          onConvert={handleConvertDeal}
                          onClientProfile={(email, tab) => {
                            setSelectedClientEmail(email);
                            setClientModalTab(tab);
                          }}
                          onStatusChange={handleStatusChange}
                          onDelete={handleDeleteLead}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Clean Pagination Footer */}
            <div className="p-3.5 sm:p-4 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
              <div className="text-[11px] text-slate-500 font-medium">
                Showing{' '}
                <span className="font-bold text-slate-800">
                  {filteredLeads.length === 0 ? 0 : (effectivePage - 1) * pageSize + 1}
                </span>{' '}
                to{' '}
                <span className="font-bold text-slate-800">
                  {Math.min(effectivePage * pageSize, filteredLeads.length)}
                </span>{' '}
                of <span className="font-bold text-slate-800">{filteredLeads.length}</span> leads
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-1.5 self-center sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={effectivePage === 1}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-700 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Prev</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                      <button
                        key={pg}
                        type="button"
                        onClick={() => setCurrentPage(pg)}
                        className={`w-7 h-7 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                          pg === effectivePage
                            ? 'bg-[#0B1F4D] text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {pg}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={effectivePage === totalPages}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-700 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

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
          subtitle={`Created on ${viewingLead.created} • Coordinator: ${viewingLead.owner}`}
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
                  className="px-2 py-1 text-xs font-bold rounded-lg border border-slate-200 bg-white cursor-pointer"
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
                className="px-4 py-2 rounded-xl bg-[#0B1F4D] text-white text-xs font-bold hover:bg-[#162E6E] cursor-pointer"
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

            {/* Quick Quotation Action Card */}
            {viewingLead.status.toLowerCase() !== 'quoted' &&
            viewingLead.status.toLowerCase() !== 'converted' ? (
              <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
                    <PoundSterling className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-amber-950 text-xs block">
                      Ready to issue quote to client?
                    </span>
                    <span className="text-[11px] text-amber-800">
                      Dispatch fee proposal to mark this lead as &quot;Quoted&quot;.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setQuotingLead(viewingLead)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black transition-all shadow-xs cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Quote &amp; Mark Quoted</span>
                </button>
              </div>
            ) : viewingLead.status.toLowerCase() === 'quoted' ? (
              <div className="p-3.5 bg-indigo-50/80 border border-indigo-200 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-indigo-950 text-xs block">
                      Fee Proposal Sent (Status: Quoted)
                    </span>
                    <span className="text-[11px] text-indigo-700">
                      Deal is live. Convert to confirmed survey booking once accepted.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleConvertDeal(viewingLead.id);
                    setViewingLead((prev) => ({ ...prev, status: 'Converted' }));
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Convert to Won Job</span>
                </button>
              </div>
            ) : null}

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
                <button
                  type="button"
                  onClick={() => {
                    setSelectedClientEmail(viewingLead.customerEmail);
                    setClientModalTab('calls');
                  }}
                  className="mt-2 w-full py-1.5 px-2 rounded-xl bg-blue-50 hover:bg-[#0B1F4D] text-[#0B1F4D] hover:text-white border border-blue-200/80 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <PhoneCall className="w-3 h-3 text-[#2563EB]" />
                  <span>View Call Notes &amp; Complaints</span>
                </button>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Property &amp; Scope
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
                Client Notes &amp; Surveyor Inspection Specifics
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">{viewingLead.notes}</p>
            </div>
          </div>
        </Modal>
      )}

      {/* Send Quote Modal */}
      <SendQuoteModal
        isOpen={!!quotingLead}
        onClose={() => setQuotingLead(null)}
        lead={quotingLead}
        onQuoteSent={handleQuoteSent}
      />

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
