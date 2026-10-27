import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  CreditCard,
  PoundSterling,
  Receipt,
  Clock,
  CheckCircle2,
  Send,
  Download,
  ExternalLink,
  SlidersHorizontal,
  Building,
  User,
  MapPin,
  Eye,
  FileText,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Tabs } from '../../components/common/Tabs';
import { Table } from '../../components/common/Table';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../components/ToastContext';
import { useQuotes } from '../../mock/quotes';

export const AdminQuotesPage = () => {
  const { addToast } = useToast();
  const { quotes, addQuote, updateQuoteStatus } = useQuotes();

  // Tabs: Quotations, Invoices, Payments, Outstanding
  const [activeTab, setActiveTab] = useState('Quotations');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [pageSize, setPageSize] = useState(10);

  // Modals state
  const [isNewQuoteModalOpen, setIsNewQuoteModalOpen] = useState(false);
  const [selectedQuoteDetail, setSelectedQuoteDetail] = useState(null);

  // "+ New Quotation" Form State
  const [formData, setFormData] = useState({
    client: '',
    clientEmail: '',
    clientPhone: '',
    property: '',
    location: '',
    surveyType: 'Homebuyer L2 (RICS Level 2)',
    baseFee: 650.0,
    discount: 0.0,
    droneExtra: false,
    debriefExtra: false,
    thermalExtra: false,
    weekendExtra: false,
    status: 'Sent', // 'Draft' | 'Sent' | 'Accepted'
  });

  // Dynamic live total computation for form
  const formExtrasTotal = useMemo(() => {
    let sum = 0;
    if (formData.droneExtra) sum += 120.0;
    if (formData.debriefExtra) sum += 50.0;
    if (formData.thermalExtra) sum += 150.0;
    if (formData.weekendExtra) sum += 80.0;
    return sum;
  }, [formData.droneExtra, formData.debriefExtra, formData.thermalExtra, formData.weekendExtra]);

  const formSubtotalExVat = useMemo(() => {
    const base = parseFloat(formData.baseFee) || 0;
    const disc = parseFloat(formData.discount) || 0;
    return Math.max(0, base + formExtrasTotal - disc);
  }, [formData.baseFee, formExtrasTotal, formData.discount]);

  const formVat20 = useMemo(() => {
    return formSubtotalExVat * 0.2;
  }, [formSubtotalExVat]);

  const formTotalIncVat = useMemo(() => {
    return formSubtotalExVat + formVat20;
  }, [formSubtotalExVat, formVat20]);

  // Handle form field change
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Submit "+ New Quotation"
  const handleCreateQuotation = (e) => {
    e.preventDefault();

    if (!formData.client.trim() || !formData.property.trim()) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please provide client name and property address.',
      });
      return;
    }

    const extras = [];
    if (formData.droneExtra) extras.push({ name: 'Drone Roof & Flashing Inspection', amount: 120.0 });
    if (formData.debriefExtra) extras.push({ name: 'Same-day Verbal Debrief by Surveyor', amount: 50.0 });
    if (formData.thermalExtra) extras.push({ name: 'Thermal Imaging Defect Assessment', amount: 150.0 });
    if (formData.weekendExtra) extras.push({ name: 'Weekend Out-of-Hours Inspection', amount: 80.0 });

    const newId = `QUO-2026-${Math.floor(110 + Math.random() * 889)}`;

    const newQuote = {
      id: newId,
      refNo: newId,
      invoiceNo: `INV-2026-${Math.floor(110 + Math.random() * 889)}`,
      client: formData.client.trim(),
      clientEmail: formData.clientEmail.trim() || 'client@example.co.uk',
      clientPhone: formData.customerPhone || '+44 7700 900000',
      property: formData.property.trim(),
      location: formData.location.trim() || 'London, UK',
      surveyType: formData.surveyType,
      baseFee: parseFloat(formData.baseFee) || 0,
      extras,
      discount: parseFloat(formData.discount) || 0,
      amountExVat: formSubtotalExVat,
      vatAmount: formVat20,
      totalAmount: formTotalIncVat,
      status: formData.status,
      type: 'quotation',
      date: new Date().toLocaleDateString('en-GB'),
      dueDate: new Date(Date.now() + 7 * 86400000).toLocaleDateString('en-GB'),
      paidDate: null,
      paymentMethod: null,
    };

    addQuote(newQuote);
    setIsNewQuoteModalOpen(false);

    // Reset form
    setFormData({
      client: '',
      clientEmail: '',
      clientPhone: '',
      property: '',
      location: '',
      surveyType: 'Homebuyer L2 (RICS Level 2)',
      baseFee: 650.0,
      discount: 0.0,
      droneExtra: false,
      debriefExtra: false,
      thermalExtra: false,
      weekendExtra: false,
      status: 'Sent',
    });

    addToast({
      type: 'success',
      title: 'Quotation Generated',
      message: `${newId} for £${formTotalIncVat.toFixed(2)} issued to ${newQuote.client}.`,
    });
  };

  // Tabs computation: Quotations, Invoices, Payments, Outstanding
  const tabs = useMemo(() => {
    const quotationsCount = quotes.length;
    const invoicesCount = quotes.filter((q) => q.status === 'Sent' || q.status === 'Paid' || q.status === 'Accepted').length;
    const paymentsCount = quotes.filter((q) => q.status === 'Paid').length;
    const outstandingCount = quotes.filter((q) => q.status !== 'Paid').length;

    return [
      { id: 'Quotations', label: 'Quotations', count: quotationsCount },
      { id: 'Invoices', label: 'Invoices', count: invoicesCount },
      { id: 'Payments', label: 'Payments', count: paymentsCount },
      { id: 'Outstanding', label: 'Outstanding', count: outstandingCount },
    ];
  }, [quotes]);

  // Filtered dataset
  const filteredData = useMemo(() => {
    return quotes.filter((item) => {
      // Tab filter
      if (activeTab === 'Invoices') {
        if (item.status === 'Draft') return false;
      } else if (activeTab === 'Payments') {
        if (item.status !== 'Paid') return false;
      } else if (activeTab === 'Outstanding') {
        if (item.status === 'Paid') return false;
      }

      // Status dropdown filter
      if (statusFilter !== 'All' && item.status.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const match =
          item.refNo.toLowerCase().includes(query) ||
          item.invoiceNo.toLowerCase().includes(query) ||
          item.client.toLowerCase().includes(query) ||
          item.property.toLowerCase().includes(query) ||
          item.surveyType.toLowerCase().includes(query);
        if (!match) return false;
      }

      return true;
    });
  }, [quotes, activeTab, statusFilter, searchTerm]);

  // Quick action: Mark as paid
  const handleMarkPaid = (id) => {
    updateQuoteStatus(id, 'Paid');
    addToast({
      type: 'success',
      title: 'Payment Cleared',
      message: `Quotation ${id} has been marked as settled in full. Receipt generated.`,
    });
  };

  // Quick action: Send Quote
  const handleSendQuote = (id, clientEmail) => {
    updateQuoteStatus(id, 'Sent');
    addToast({
      type: 'info',
      title: 'Quotation Dispatched',
      message: `Official proposal for ${id} sent via email to ${clientEmail}.`,
    });
  };

  // Status badge renderer: Draft, Sent, Viewed, Accepted, Paid
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Paid
          </span>
        );
      case 'Accepted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
            <CheckCircle2 className="w-3 h-3 text-indigo-600" />
            Accepted
          </span>
        );
      case 'Viewed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <Eye className="w-3 h-3 text-purple-600" />
            Viewed
          </span>
        );
      case 'Sent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Send className="w-3 h-3 text-[#2563EB]" />
            Sent
          </span>
        );
      case 'Draft':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <FileText className="w-3 h-3 text-slate-400" />
            Draft
          </span>
        );
    }
  };

  // Required table columns:
  // Amount ex VAT, VAT 20%, Total, Status (Draft, Sent, Viewed, Accepted, Paid)
  const columns = [
    {
      key: 'refNo',
      header: 'Reference #',
      sortable: true,
      className: 'font-mono font-bold text-[#0B1F4D] whitespace-nowrap',
      render: (val, row) => (
        <div>
          <button
            onClick={() => setSelectedQuoteDetail(row)}
            className="text-[#2563EB] hover:text-[#0B1F4D] font-bold hover:underline cursor-pointer"
          >
            {val}
          </button>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            {activeTab === 'Invoices' || activeTab === 'Payments' ? row.invoiceNo : row.date}
          </div>
        </div>
      ),
    },
    {
      key: 'client',
      header: 'Customer',
      sortable: true,
      render: (val, row) => (
        <div className="min-w-[140px]">
          <div className="font-bold text-slate-900 text-xs">{val}</div>
          <div className="text-[11px] text-slate-400 truncate max-w-[160px]">{row.clientEmail}</div>
        </div>
      ),
    },
    {
      key: 'property',
      header: 'Property & Service',
      sortable: true,
      render: (val, row) => (
        <div className="min-w-[180px] max-w-[240px]">
          <div className="font-bold text-slate-800 text-xs truncate">{val}</div>
          <div className="text-[11px] text-[#2563EB] font-semibold truncate mt-0.5">{row.surveyType}</div>
        </div>
      ),
    },
    {
      key: 'amountExVat',
      header: 'Amount ex VAT',
      sortable: true,
      className: 'font-mono font-bold text-slate-800 whitespace-nowrap',
      render: (val) => `£${val.toFixed(2)}`,
    },
    {
      key: 'vatAmount',
      header: 'VAT 20%',
      sortable: true,
      className: 'font-mono font-medium text-slate-500 whitespace-nowrap',
      render: (val) => `£${val.toFixed(2)}`,
    },
    {
      key: 'totalAmount',
      header: 'Total (inc. VAT)',
      sortable: true,
      className: 'font-mono font-black text-[#0B1F4D] whitespace-nowrap',
      render: (val, row) => (
        <div className="font-black text-sm text-[#0B1F4D]">
          £{val.toFixed(2)}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (val) => renderStatusBadge(val),
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      className: 'text-right whitespace-nowrap',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1.5">
          {row.status !== 'Paid' ? (
            <button
              onClick={() => handleMarkPaid(row.id)}
              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white text-[11px] font-bold border border-emerald-200 transition-colors cursor-pointer"
            >
              Mark Paid
            </button>
          ) : (
            <button
              onClick={() => addToast({ type: 'info', title: 'Receipt Download', message: `Downloaded receipt for ${row.refNo}.` })}
              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
              title="Download VAT Receipt"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setSelectedQuoteDetail(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#0B1F4D] hover:bg-slate-100 transition-colors cursor-pointer"
            title="View Breakdown"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // Financial KPI Summaries
  const totalSettledRevenue = useMemo(() => {
    return quotes.filter((q) => q.status === 'Paid').reduce((acc, q) => acc + q.totalAmount, 0);
  }, [quotes]);

  const totalOutstanding = useMemo(() => {
    return quotes.filter((q) => q.status !== 'Paid').reduce((acc, q) => acc + q.totalAmount, 0);
  }, [quotes]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Quotations & Payment Gateway"
        subtitle="Manage client fee proposals, 20% UK VAT calculations, online Stripe card settlements, and official invoices."
        breadcrumb={['Super Admin', 'Quotations & Payments']}
        actionLabel="New Quotation"
        actionIcon={Plus}
        onAction={() => setIsNewQuoteModalOpen(true)}
      />

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Settled Revenue (Paid)</span>
            <div className="text-2xl font-black text-emerald-600 font-mono mt-1">
              £{totalSettledRevenue.toFixed(2)}
            </div>
            <span className="text-[11px] text-slate-400">Cleared via Stripe / BACS</span>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
            <PoundSterling className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Outstanding Invoices</span>
            <div className="text-2xl font-black text-amber-600 font-mono mt-1">
              £{totalOutstanding.toFixed(2)}
            </div>
            <span className="text-[11px] text-slate-400">Awaiting client authorization</span>
          </div>
          <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Standard VAT Rate</span>
            <div className="text-2xl font-black text-[#0B1F4D] font-mono mt-1">
              20.0% UK
            </div>
            <span className="text-[11px] text-slate-400">HMRC Registered Schedule</span>
          </div>
          <div className="p-3 rounded-2xl bg-blue-50 text-[#2563EB]">
            <Receipt className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs: Quotations, Invoices, Payments, Outstanding */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by quote #, invoice #, client, or property..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:border-[#2563EB] focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-xs font-semibold">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2563EB] cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Sent">Sent</option>
            <option value="Viewed">Viewed</option>
            <option value="Accepted">Accepted</option>
            <option value="Paid">Paid</option>
          </select>

          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table Component */}
      <Table
        columns={columns}
        data={filteredData}
        pageSize={pageSize}
        emptyTitle="No records found"
        emptyMessage="No quotations or payments match the selected criteria."
      />

      {/* MODAL 1: "+ New Quotation" Form with Live Total */}
      <Modal
        isOpen={isNewQuoteModalOpen}
        onClose={() => setIsNewQuoteModalOpen(false)}
        title="Generate New Survey Quotation"
        subtitle="Construct client fee proposal with automatic 20% UK VAT computation and optional inspection extras."
        maxWidth="max-w-2xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsNewQuoteModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="new-quotation-form"
              className="px-5 py-2 rounded-xl bg-[#0B1F4D] text-white text-xs font-bold hover:bg-[#162E6E] shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Issue Quotation (£{formTotalIncVat.toFixed(2)})
            </button>
          </>
        }
      >
        <form id="new-quotation-form" onSubmit={handleCreateQuotation} className="space-y-4 text-xs">
          {/* Survey Type & Property */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Survey Standard / Type *
              </label>
              <select
                name="surveyType"
                value={formData.surveyType}
                onChange={handleFormChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:bg-white"
              >
                <option value="Homebuyer L2 (RICS Level 2)">Homebuyer L2 (RICS Level 2)</option>
                <option value="Building L3 (RICS Level 3)">Building L3 (RICS Level 3)</option>
                <option value="Snagging (New Build Inspection)">Snagging (New Build Inspection)</option>
                <option value="Valuation (Red Book Residential)">Valuation (Red Book Residential)</option>
                <option value="Damp & Defect Survey">Damp & Defect Survey</option>
                <option value="Expert Witness (CPR Part 35)">Expert Witness (CPR Part 35)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Property Address *
              </label>
              <input
                type="text"
                name="property"
                required
                placeholder="e.g. 18 Kensington Church Street"
                value={formData.property}
                onChange={handleFormChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:bg-white"
              />
            </div>
          </div>

          {/* Location & Client */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                City / Postcode
              </label>
              <input
                type="text"
                name="location"
                placeholder="e.g. Kensington, London W8 4EP"
                value={formData.location}
                onChange={handleFormChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Client Name *
              </label>
              <input
                type="text"
                name="client"
                required
                placeholder="e.g. Sophie Turner"
                value={formData.client}
                onChange={handleFormChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Client Email
              </label>
              <input
                type="email"
                name="clientEmail"
                placeholder="sophie@example.co.uk"
                value={formData.clientEmail}
                onChange={handleFormChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:bg-white"
              />
            </div>
          </div>

          {/* Price (Base Fee ex VAT) & Discount */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Base Fee (£ ex VAT) *
              </label>
              <input
                type="number"
                step="10"
                min="0"
                name="baseFee"
                value={formData.baseFee}
                onChange={handleFormChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Discount (£ ex VAT)
              </label>
              <input
                type="number"
                step="5"
                min="0"
                name="discount"
                value={formData.discount}
                onChange={handleFormChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-emerald-700 font-bold focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Initial Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleFormChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:bg-white"
              >
                <option value="Sent">Sent (Email to client)</option>
                <option value="Draft">Draft (Internal review)</option>
                <option value="Accepted">Accepted by client</option>
              </select>
            </div>
          </div>

          {/* Optional Inspection Extras */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="font-bold text-slate-800 block text-xs">
              Inspection Extras & Add-ons
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white cursor-pointer transition-colors">
                <span className="font-medium text-slate-700">Drone Roof & Flashing (+£120.00)</span>
                <input
                  type="checkbox"
                  name="droneExtra"
                  checked={formData.droneExtra}
                  onChange={handleFormChange}
                  className="w-4 h-4 rounded text-[#2563EB]"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white cursor-pointer transition-colors">
                <span className="font-medium text-slate-700">Same-Day Verbal Debrief (+£50.00)</span>
                <input
                  type="checkbox"
                  name="debriefExtra"
                  checked={formData.debriefExtra}
                  onChange={handleFormChange}
                  className="w-4 h-4 rounded text-[#2563EB]"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white cursor-pointer transition-colors">
                <span className="font-medium text-slate-700">Thermal Imaging Scan (+£150.00)</span>
                <input
                  type="checkbox"
                  name="thermalExtra"
                  checked={formData.thermalExtra}
                  onChange={handleFormChange}
                  className="w-4 h-4 rounded text-[#2563EB]"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white cursor-pointer transition-colors">
                <span className="font-medium text-slate-700">Weekend Site Inspection (+£80.00)</span>
                <input
                  type="checkbox"
                  name="weekendExtra"
                  checked={formData.weekendExtra}
                  onChange={handleFormChange}
                  className="w-4 h-4 rounded text-[#2563EB]"
                />
              </label>
            </div>
          </div>

          {/* LIVE TOTAL BREAKDOWN BOX */}
          <div className="p-4 rounded-2xl bg-[#0B1F4D]/5 border border-[#0B1F4D]/15 space-y-1.5 font-mono">
            <div className="flex justify-between text-slate-600">
              <span>Base Survey Fee:</span>
              <span>£{(parseFloat(formData.baseFee) || 0).toFixed(2)}</span>
            </div>
            {formExtrasTotal > 0 && (
              <div className="flex justify-between text-blue-600">
                <span>Selected Extras:</span>
                <span>+£{formExtrasTotal.toFixed(2)}</span>
              </div>
            )}
            {parseFloat(formData.discount) > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Promotional Discount:</span>
                <span>-£{(parseFloat(formData.discount) || 0).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-slate-800 pt-1 border-t border-slate-200/80">
              <span>Amount ex VAT (Net Subtotal):</span>
              <span>£{formSubtotalExVat.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>UK VAT (20%):</span>
              <span>£{formVat20.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-black text-[#0B1F4D] pt-1.5 border-t border-slate-300">
              <span>Live Quotation Total:</span>
              <span className="text-emerald-700">£{formTotalIncVat.toFixed(2)}</span>
            </div>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Quote Details View */}
      {selectedQuoteDetail && (
        <Modal
          isOpen={!!selectedQuoteDetail}
          onClose={() => setSelectedQuoteDetail(null)}
          title={`Quotation: ${selectedQuoteDetail.refNo}`}
          subtitle={`${selectedQuoteDetail.property}, ${selectedQuoteDetail.location}`}
          maxWidth="max-w-xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <button
                onClick={() => {
                  addToast({ type: 'success', title: 'PDF Proposal', message: `Exported quotation PDF for ${selectedQuoteDetail.refNo}.` });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export PDF</span>
              </button>

              <button
                onClick={() => setSelectedQuoteDetail(null)}
                className="px-4 py-2 rounded-xl bg-[#0B1F4D] text-white text-xs font-bold hover:bg-[#162E6E] cursor-pointer"
              >
                Close
              </button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Customer</span>
                <span className="font-bold text-slate-900 text-sm">{selectedQuoteDetail.client}</span>
                <span className="text-slate-500 block">{selectedQuoteDetail.clientEmail}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Status</span>
                {renderStatusBadge(selectedQuoteDetail.status)}
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 font-mono">
              <div className="flex justify-between text-slate-600">
                <span>Base Survey Fee ({selectedQuoteDetail.surveyType}):</span>
                <span>£{selectedQuoteDetail.baseFee.toFixed(2)}</span>
              </div>
              {selectedQuoteDetail.extras.map((extra, idx) => (
                <div key={idx} className="flex justify-between text-slate-500 pl-2">
                  <span>+ {extra.name}:</span>
                  <span>£{extra.amount.toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between text-emerald-700">
                <span>Discount Applied:</span>
                <span>-£{selectedQuoteDetail.discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-800 pt-1 border-t border-slate-200">
                <span>Amount ex VAT:</span>
                <span>£{selectedQuoteDetail.amountExVat.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>UK Standard VAT (20%):</span>
                <span>£{selectedQuoteDetail.vatAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-black text-sm text-[#0B1F4D] pt-2 border-t border-slate-300">
                <span>Total Fee (inc. VAT):</span>
                <span className="text-emerald-700">£{selectedQuoteDetail.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {selectedQuoteDetail.status === 'Paid' ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center justify-between">
                <span>Payment Method: <strong>{selectedQuoteDetail.paymentMethod}</strong></span>
                <span className="font-mono text-[11px]">{selectedQuoteDetail.paidDate}</span>
              </div>
            ) : (
              <button
                onClick={() => {
                  handleMarkPaid(selectedQuoteDetail.id);
                  setSelectedQuoteDetail((prev) => ({ ...prev, status: 'Paid' }));
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Mark as Paid in Full (£{selectedQuoteDetail.totalAmount.toFixed(2)})
              </button>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
