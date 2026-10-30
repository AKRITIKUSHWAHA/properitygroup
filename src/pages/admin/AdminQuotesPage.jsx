import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  MoreVertical,
  PhoneCall,
  Copy,
  DollarSign,
  FileCheck,
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Tabs } from '../../components/common/Tabs';
import { Table } from '../../components/common/Table';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../components/ToastContext';
import { useQuotes } from '../../mock/quotes';
import { ClientProfileModal } from '../../components/crm/ClientProfileModal';
import { RecordBacsPaymentModal } from '../../components/crm/RecordBacsPaymentModal';
import { downloadInvoicePDF } from '../../utils/pdfGenerator';

// 3-Dot Clean Action Dropdown Menu for each Quotation
const QuoteRowActions = ({
  quote,
  onView,
  onMarkPaid,
  onRecordBacs,
  onDownloadReceipt,
  onResendQuote,
  onOpenClientProfile,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const { addToast } = useToast();

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

  const handleCopy = (e, text, label) => {
    e.stopPropagation();
    setIsOpen(false);
    navigator.clipboard?.writeText(text);
    addToast({
      type: 'info',
      title: 'Copied to Clipboard',
      message: `${label}: ${text}`,
    });
  };

  const isPaid = quote.status === 'Paid';

  return (
    <div className="relative inline-block text-right" ref={menuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-[#0B1F4D] hover:bg-slate-100 transition-colors cursor-pointer"
        title="Quotation actions"
        aria-label="Quotation actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-52 sm:w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-left">
          {/* Primary View Action */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onView(quote);
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-[#0B1F4D] bg-blue-50/70 hover:bg-blue-100/80 transition-colors cursor-pointer text-left"
          >
            <Eye className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
            <span>View Fee Breakdown</span>
          </button>

          {/* Settle / Mark Paid */}
          {!isPaid ? (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  onRecordBacs(quote);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-blue-900 bg-blue-50/70 hover:bg-blue-100/80 transition-colors cursor-pointer text-left"
              >
                <PoundSterling className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Record BACS Payment</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  onMarkPaid(quote.id);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-emerald-950 bg-emerald-50/70 hover:bg-emerald-100/80 transition-colors cursor-pointer text-left"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Mark as Paid (£{quote.totalAmount.toFixed(2)})</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onDownloadReceipt(quote);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer text-left"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Download VAT Receipt (PDF)</span>
            </button>
          )}

          {/* Resend Proposal */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onResendQuote(quote.id, quote.clientEmail);
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left"
          >
            <Send className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Resend Proposal Email</span>
          </button>

          {/* Client Profile with Call Notes & Complaints */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onOpenClientProfile(quote.clientEmail, 'calls');
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#0B1F4D] transition-colors cursor-pointer text-left"
          >
            <PhoneCall className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
            <span>Call Notes &amp; Complaints</span>
          </button>

          <div className="h-px bg-slate-100 my-1" />

          {/* Copy Shortcuts */}
          <button
            type="button"
            onClick={(e) => handleCopy(e, quote.refNo, 'Quotation Ref')}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left"
          >
            <Copy className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Copy Quote Ref ({quote.refNo})</span>
          </button>

          <button
            type="button"
            onClick={(e) => handleCopy(e, quote.property, 'Property')}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left"
          >
            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span>Copy Property Address</span>
          </button>
        </div>
      )}
    </div>
  );
};

export const AdminQuotesPage = () => {
  const { addToast } = useToast();
  const { quotes, addQuote, updateQuoteStatus } = useQuotes();

  // Tabs: Quotations, Invoices, Payments, Outstanding
  const [activeTab, setActiveTab] = useState('Quotations');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [pageSize] = useState(10);

  // Modals state
  const [isNewQuoteModalOpen, setIsNewQuoteModalOpen] = useState(false);
  const [selectedQuoteDetail, setSelectedQuoteDetail] = useState(null);
  const [selectedClientEmail, setSelectedClientEmail] = useState(null);
  const [clientModalTab, setClientModalTab] = useState('calls');

  // BACS Settlement Modal State (Client Point 16)
  const [isBacsModalOpen, setIsBacsModalOpen] = useState(false);
  const [selectedBacsQuote, setSelectedBacsQuote] = useState(null);

  // Rate Card Calculator State (Client Point 10)
  const [calcBeds, setCalcBeds] = useState('3 Bedrooms');
  const [calcEra, setCalcEra] = useState('1919-1980 Post-War');
  const [calcType, setCalcType] = useState('Terraced House');

  const handleApplyRateCard = (surveyType = formData.surveyType) => {
    const isLevel3 = surveyType.toLowerCase().includes('l3') || surveyType.toLowerCase().includes('building');
    let base = 650;
    if (!isLevel3) {
      if (calcBeds === '1-2 Bedrooms') base = 550;
      else if (calcBeds === '3 Bedrooms') base = 650;
      else if (calcBeds === '4 Bedrooms') base = 750;
      else if (calcBeds === '5+ Bedrooms') base = 890;
    } else {
      if (calcBeds === '1-2 Bedrooms') base = 850;
      else if (calcBeds === '3 Bedrooms') base = 950;
      else if (calcBeds === '4 Bedrooms') base = 1150;
      else if (calcBeds === '5+ Bedrooms') base = 1390;
    }

    if (calcEra.includes('Victorian')) base += 100;
    else if (calcEra.includes('1919-1980')) base += 50;

    if (calcType === 'Flat/Apartment') base -= 30;
    else if (calcType === 'Semi-Detached') base += 40;
    else if (calcType === 'Detached') base += 80;

    setFormData((prev) => ({ ...prev, baseFee: base }));
    addToast({
      type: 'info',
      title: 'Rate Card Fee Applied',
      message: `Computed £${base.toFixed(2)} based on ${calcBeds}, ${calcEra}, and ${calcType}.`,
    });
  };

  const handleOpenBacsModal = (quote) => {
    setSelectedBacsQuote(quote);
    setIsBacsModalOpen(true);
  };

  const handleBacsPaymentConfirmed = (bacsData) => {
    if (!selectedBacsQuote) return;
    updateQuoteStatus(selectedBacsQuote.id, 'Paid');
    if (selectedQuoteDetail && selectedQuoteDetail.id === selectedBacsQuote.id) {
      setSelectedQuoteDetail((prev) => ({
        ...prev,
        status: 'Paid',
        paymentMethod: `BACS (${bacsData.reference})`,
        paidDate: bacsData.date,
      }));
    }
  };

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
      clientPhone: formData.clientPhone || '+44 7700 900000',
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
      { id: 'Quotations', label: 'All Quotations', count: quotationsCount },
      { id: 'Invoices', label: 'Invoices Issued', count: invoicesCount },
      { id: 'Payments', label: 'Paid & Settled', count: paymentsCount },
      { id: 'Outstanding', label: 'Awaiting Payment', count: outstandingCount },
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
          item.clientEmail?.toLowerCase().includes(query) ||
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

  const handleDownloadReceipt = (quote) => {
    downloadInvoicePDF({
      invoiceNo: quote.invoiceNo || 'INV-2026-101',
      date: quote.paidDate || quote.date || new Date().toLocaleDateString('en-GB'),
      clientName: quote.client || 'Client',
      property: quote.property || 'Property',
      surveyType: quote.surveyType || 'RICS Level 2 Home Survey',
      baseFee: quote.baseFee || quote.amountExVat || 770.0,
      vatAmount: quote.vatAmount || 154.0,
      totalAmount: quote.totalAmount || 924.0,
      paymentMethod: quote.paymentMethod || 'BACS Settlement',
    });
    addToast({
      type: 'success',
      title: 'HMRC VAT Receipt Downloaded',
      message: `Official invoice PDF saved for ${quote.refNo} (${quote.invoiceNo}).`,
    });
  };

  // Status badge renderer: Draft, Sent, Viewed, Accepted, Paid
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Paid
          </span>
        );
      case 'Accepted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
            <CheckCircle2 className="w-3 h-3 text-indigo-600" />
            Accepted
          </span>
        );
      case 'Viewed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <Eye className="w-3 h-3 text-purple-600" />
            Viewed
          </span>
        );
      case 'Sent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Send className="w-3 h-3 text-[#2563EB]" />
            Sent
          </span>
        );
      case 'Draft':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <FileText className="w-3 h-3 text-slate-400" />
            Draft
          </span>
        );
    }
  };

  // Clean, Fluid & Responsive 6-Column Specification (Fits on all screens without horizontal cutoff)
  const columns = [
    {
      key: 'refNo',
      header: 'Quote Ref / Date',
      sortable: true,
      className: 'w-[16%] min-w-[100px]',
      render: (val, row) => (
        <div className="truncate">
          <button
            onClick={() => setSelectedQuoteDetail(row)}
            className="text-[#2563EB] hover:text-[#0B1F4D] font-mono font-bold hover:underline cursor-pointer block truncate"
            title="Click to view full quote breakdown"
          >
            {val}
          </button>
          <div className="text-[11px] text-slate-500 font-mono mt-0.5">{row.date}</div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
            {row.invoiceNo}
          </div>
        </div>
      ),
    },
    {
      key: 'client',
      header: 'Customer',
      sortable: true,
      className: 'w-[23%] min-w-[125px]',
      render: (val, row) => (
        <div className="min-w-0">
          <button
            onClick={() => {
              setSelectedClientEmail(row.clientEmail);
              setClientModalTab('calls');
            }}
            className="text-left font-bold text-slate-900 hover:text-[#2563EB] hover:underline flex items-center gap-1 group cursor-pointer max-w-full"
            title="Click to view client profile, call notes & complaints"
          >
            <span className="truncate">{val}</span>
            <PhoneCall className="w-3 h-3 text-[#2563EB] opacity-60 group-hover:opacity-100 transition-opacity shrink-0" />
          </button>
          <div className="text-[11px] text-slate-500 truncate mt-0.5">{row.clientEmail}</div>
          <div className="text-[10px] text-slate-400 font-mono truncate">{row.clientPhone || '+44 7700 900000'}</div>
        </div>
      ),
    },
    {
      key: 'property',
      header: 'Property & Service',
      sortable: true,
      className: 'w-[27%] min-w-[135px]',
      render: (val, row) => (
        <div className="min-w-0">
          <div className="font-bold text-[#0B1F4D] text-xs truncate" title={val}>
            {val}
          </div>
          <div className="text-[11px] text-[#2563EB] font-semibold truncate mt-0.5">
            {row.surveyType}
          </div>
          <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
            <MapPin className="w-2.5 h-2.5 text-rose-500 shrink-0" />
            <span className="truncate">{row.location}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'totalAmount',
      header: 'Fee & UK VAT',
      sortable: true,
      className: 'w-[18%] min-w-[105px]',
      render: (val, row) => (
        <div className="font-mono min-w-0">
          <div className="font-black text-xs sm:text-sm text-[#0B1F4D]">
            £{val.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-500 truncate">
            Net £{row.amountExVat.toFixed(2)} + £{row.vatAmount.toFixed(2)} VAT
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      className: 'w-[11%] min-w-[75px]',
      render: (val) => renderStatusBadge(val),
    },
    {
      key: 'actions',
      header: 'Actions', sortable: false, headerClassName: 'text-right w-[8%] min-w-[44px]',
      className: 'text-right w-[5%] min-w-[44px] pr-3 sm:pr-4',
      render: (_, row) => (
        <QuoteRowActions
          quote={row}
          onView={(q) => setSelectedQuoteDetail(q)}
          onMarkPaid={handleMarkPaid}
          onRecordBacs={handleOpenBacsModal}
          onDownloadReceipt={handleDownloadReceipt}
          onResendQuote={handleSendQuote}
          onOpenClientProfile={(email, tab) => {
            setSelectedClientEmail(email);
            setClientModalTab(tab);
          }}
        />
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

  const averageQuoteFee = useMemo(() => {
    if (quotes.length === 0) return 0;
    const total = quotes.reduce((acc, q) => acc + q.totalAmount, 0);
    return total / quotes.length;
  }, [quotes]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <PageHeader
        title="Quotations & Payment Gateway"
        subtitle="Manage client fee proposals, 20% UK VAT calculations, online Stripe card settlements, and official invoices."
        breadcrumb={['Admin', 'Quotations & Payments']}
        actionLabel="New Quotation"
        actionIcon={Plus}
        onAction={() => setIsNewQuoteModalOpen(true)}
      />

      {/* Top 3 Executive Metric Cards (Responsive 1/2/3 grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Settled Revenue (Paid)</span>
            <PoundSterling className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 font-mono">
            £{totalSettledRevenue.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-500">Cleared via Stripe / BACS Direct Debit</div>
        </div>

        <div className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Outstanding Invoices</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-600 font-mono">
            £{totalOutstanding.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-500">Awaiting client authorization &amp; deposit</div>
        </div>

        <div className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-1 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Average Instruction Fee</span>
            <TrendingUp className="w-4 h-4 text-[#2563EB]" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#0B1F4D] font-mono">
            £{averageQuoteFee.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-500">{quotes.length} Total Issued Proposals (inc. 20% UK VAT)</div>
        </div>
      </div>

      {/* Tabs: Quotations, Invoices, Payments, Outstanding */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-lg">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by quote #, invoice #, client, or property..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:border-[#2563EB] focus:bg-white transition-all min-h-[42px]"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="text-slate-400 text-[11px] font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2563EB] cursor-pointer min-h-[40px]"
            >
              <option value="All">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Sent">Sent</option>
              <option value="Viewed">Viewed</option>
              <option value="Accepted">Accepted</option>
              <option value="Paid">Paid</option>
            </select>
          </div>

          {(searchTerm || statusFilter !== 'All' || activeTab !== 'Quotations') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('All');
                setActiveTab('Quotations');
              }}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer min-h-[40px]"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Table Component (Fit 100% on screen, 0 horizontal scroll) */}
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
                <option value="Damp &amp; Defect Survey">Damp &amp; Defect Survey</option>
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

          {/* Instant Rate Card Calculator Box (Client Point 10) */}
          <div className="bg-blue-50/70 p-3.5 rounded-2xl border border-blue-200/90 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0B1F4D] flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>NJS Instant Rate Card Calculator (Survey Booker Engine)</span>
              </span>
              <button
                type="button"
                onClick={() => handleApplyRateCard()}
                className="px-2.5 py-1 bg-[#0B1F4D] hover:bg-[#162E6E] text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
              >
                Auto-Calculate Fee
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Bedrooms</label>
                <select
                  value={calcBeds}
                  onChange={(e) => setCalcBeds(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                >
                  <option value="1-2 Bedrooms">1-2 Bedrooms</option>
                  <option value="3 Bedrooms">3 Bedrooms</option>
                  <option value="4 Bedrooms">4 Bedrooms</option>
                  <option value="5+ Bedrooms">5+ Bedrooms</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Property Era / Age</label>
                <select
                  value={calcEra}
                  onChange={(e) => setCalcEra(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                >
                  <option value="Pre-1919 Victorian">Pre-1919 (Victorian / Period)</option>
                  <option value="1919-1980 Post-War">1919 - 1980 (Inter/Post-War)</option>
                  <option value="Modern Post-1980">Post-1980 (Modern Construction)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Property Type</label>
                <select
                  value={calcType}
                  onChange={(e) => setCalcType(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                >
                  <option value="Flat/Apartment">Flat / Apartment</option>
                  <option value="Terraced House">Terraced House</option>
                  <option value="Semi-Detached">Semi-Detached House</option>
                  <option value="Detached">Detached House</option>
                </select>
              </div>
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
              Inspection Extras &amp; Add-ons
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white cursor-pointer transition-colors">
                <span className="font-medium text-slate-700">Drone Roof &amp; Flashing (+£120.00)</span>
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
              <div className="space-y-3">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center justify-between">
                  <span>Payment Method: <strong>{selectedQuoteDetail.paymentMethod || 'Stripe UK Online'}</strong></span>
                  <span className="font-mono text-[11px]">{selectedQuoteDetail.paidDate || 'Paid in Full'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownloadReceipt(selectedQuoteDetail)}
                  className="w-full py-2.5 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4 text-sky-400" />
                  <span>Download VAT Receipt (PDF)</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    handleOpenBacsModal(selectedQuoteDetail);
                  }}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <PoundSterling className="w-4 h-4" />
                  <span>Record BACS Settlement</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleMarkPaid(selectedQuoteDetail.id);
                    setSelectedQuoteDetail((prev) => ({ ...prev, status: 'Paid' }));
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Mark Paid (£{selectedQuoteDetail.totalAmount.toFixed(2)})
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Record Offline BACS Payment Modal (Client Point 16) */}
      <RecordBacsPaymentModal
        isOpen={isBacsModalOpen}
        onClose={() => setIsBacsModalOpen(false)}
        record={selectedBacsQuote}
        onPaymentRecorded={handleBacsPaymentConfirmed}
      />

      {/* MODAL 3: Client Profile, Call Notes & Complaints */}
      <ClientProfileModal
        isOpen={!!selectedClientEmail}
        onClose={() => setSelectedClientEmail(null)}
        clientEmail={selectedClientEmail}
        initialTab={clientModalTab}
      />
    </div>
  );
};
