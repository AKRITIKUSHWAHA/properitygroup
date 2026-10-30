import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  Plus,
  FileSignature,
  FileText,
  CheckCircle2,
  Clock,
  Send,
  Download,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Eye,
  Building,
  Mail,
  User,
  MapPin,
  Calendar,
  MoreVertical,
  PhoneCall,
  Copy,
  ChevronDown,
  ChevronUp,
  Filter,
  Check,
  FileCheck,
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Tabs } from '../../components/common/Tabs';
import { Table } from '../../components/common/Table';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../components/ToastContext';
import { TERMS_TEMPLATES, useTerms } from '../../mock/terms';
import { ClientProfileModal } from '../../components/crm/ClientProfileModal';
import { downloadTermsPDF } from '../../utils/pdfGenerator';

// Clean 3-Dot Action Dropdown Menu for each Agreement row
const AgreementRowActions = ({
  agreement,
  onView,
  onMarkSigned,
  onDownloadCopy,
  onResendTerms,
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

  const isSigned = agreement.status === 'Signed';

  return (
    <div className="relative inline-block text-right" ref={menuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-[#0B1F4D] hover:bg-slate-100 transition-colors cursor-pointer"
        title="Agreement actions"
        aria-label="Agreement actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-56 sm:w-60 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-left">
          {/* Primary View Action */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onView(agreement);
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-[#0B1F4D] bg-blue-50/70 hover:bg-blue-100/80 transition-colors cursor-pointer text-left"
          >
            <Eye className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
            <span>View Terms &amp; Audit Trail</span>
          </button>

          {/* Download Signed Copy or Mark as Signed */}
          {isSigned ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onDownloadCopy(agreement);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 transition-colors cursor-pointer text-left"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Download Signed Copy</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onMarkSigned(agreement.id);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-emerald-950 bg-emerald-50/70 hover:bg-emerald-100/80 transition-colors cursor-pointer text-left"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Mark as Signed &amp; Executed</span>
            </button>
          )}

          {/* Resend Terms via Email */}
          {!isSigned && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onResendTerms(agreement);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left"
            >
              <Send className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
              <span>Resend Signature Link</span>
            </button>
          )}

          {/* Client Profile with Call Notes & Complaints */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onOpenClientProfile(agreement.signerEmail);
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
            onClick={(e) => handleCopy(e, agreement.refNo, 'Agreement Ref')}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left"
          >
            <Copy className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Copy Ref ({agreement.refNo})</span>
          </button>

          <button
            type="button"
            onClick={(e) => handleCopy(e, agreement.property, 'Property Address')}
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

export const AdminTermsPage = () => {
  const { addToast } = useToast();
  const { agreements, addAgreement, markAgreementSigned } = useTerms();

  const [activeTab, setActiveTab] = useState('All'); // 'All' | 'Signed' | 'Sent' | 'Pending'
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceFilter, setServiceFilter] = useState('All');
  const [pageSize, setPageSize] = useState(10);
  const [showTemplatesSection, setShowTemplatesSection] = useState(true);

  // Modals state
  const [isSendTermsModalOpen, setIsSendTermsModalOpen] = useState(false);
  const [selectedTemplateToPreview, setSelectedTemplateToPreview] = useState(null);
  const [selectedAgreementDetail, setSelectedAgreementDetail] = useState(null);

  // Client Profile Modal
  const [selectedClientEmail, setSelectedClientEmail] = useState(null);
  const [clientModalTab, setClientModalTab] = useState('calls');

  // Form state for "Send terms" modal (user required: signer email)
  const [formData, setFormData] = useState({
    signerEmail: '',
    clientName: '',
    property: '',
    location: '',
    serviceKey: 'Homebuyer L2',
    notes: '',
  });

  // Calculate high-level summary KPIs
  const kpiStats = useMemo(() => {
    const total = agreements.length;
    const signedCount = agreements.filter((a) => a.status === 'Signed').length;
    const pendingCount = agreements.filter((a) => a.status === 'Pending' || a.status === 'Sent').length;
    const rate = total > 0 ? Math.round((signedCount / total) * 100) : 0;

    return {
      total,
      signedCount,
      pendingCount,
      rate,
    };
  }, [agreements]);

  // Handle Send Terms submit
  const handleSendTermsSubmit = (e) => {
    e.preventDefault();

    if (!formData.signerEmail.trim() || !formData.clientName.trim() || !formData.property.trim()) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please provide signer email, client name, and property address.',
      });
      return;
    }

    const templateObj = TERMS_TEMPLATES.find((t) => t.serviceKey === formData.serviceKey) || TERMS_TEMPLATES[0];
    const newId = `AGR-2026-${Math.floor(100 + Math.random() * 899)}`;

    const newAgreement = {
      id: newId,
      refNo: newId,
      jobNo: null,
      client: formData.clientName.trim(),
      signerEmail: formData.signerEmail.trim(),
      property: formData.property.trim(),
      location: formData.location.trim() || 'London, UK',
      serviceKey: templateObj.serviceKey,
      templateName: templateObj.name,
      versionYear: `${templateObj.version} / ${templateObj.year}`,
      status: 'Sent',
      sentDate: new Date().toLocaleDateString('en-GB'),
      signedDate: null,
      signerIp: null,
      auditCode: `DOC-SENT-${Math.floor(10000 + Math.random() * 89999)}-DISPATCHED`,
      downloadUrl: null,
    };

    addAgreement(newAgreement);
    setIsSendTermsModalOpen(false);

    setFormData({
      signerEmail: '',
      clientName: '',
      property: '',
      location: '',
      serviceKey: 'Homebuyer L2',
      notes: '',
    });

    addToast({
      type: 'success',
      title: 'Terms Dispatched',
      message: `${templateObj.shortName} (${templateObj.version}) sent to ${newAgreement.signerEmail} for digital execution.`,
    });
  };

  // Quick Action Handlers
  const handleDownloadSignedCopy = (agreement) => {
    downloadTermsPDF({
      jobNo: agreement.jobNo || agreement.refNo,
      clientName: agreement.client,
      property: agreement.property,
      surveyType: agreement.templateName || 'RICS Level 2 Home Survey',
      signatureType: 'drawn',
      signatureValue: 'Verified Digital Signature',
    });
    addToast({
      type: 'success',
      title: 'Signed Agreement Downloaded',
      message: `Downloaded executed PDF certificate for ${agreement.refNo} (${agreement.auditCode || 'Verified e-signature'}).`,
    });
  };

  const handleMarkSigned = (id) => {
    markAgreementSigned(id);
    addToast({
      type: 'success',
      title: 'Terms Marked as Executed',
      message: `Agreement ${id} has been marked as legally signed and verified.`,
    });
  };

  const handleResendTerms = (agreement) => {
    addToast({
      type: 'info',
      title: 'Signature Link Dispatched',
      message: `Authentication token resent to ${agreement.signerEmail} for ${agreement.refNo}.`,
    });
  };

  // Tabs computation: All, Signed, Sent, Pending
  const tabs = useMemo(() => {
    const allCount = agreements.length;
    const signedCount = agreements.filter((a) => a.status === 'Signed').length;
    const sentCount = agreements.filter((a) => a.status === 'Sent').length;
    const pendingCount = agreements.filter((a) => a.status === 'Pending').length;

    return [
      { id: 'All', label: 'All Agreements', count: allCount },
      { id: 'Signed', label: 'Signed', count: signedCount },
      { id: 'Sent', label: 'Sent', count: sentCount },
      { id: 'Pending', label: 'Pending', count: pendingCount },
    ];
  }, [agreements]);

  // Filtered dataset
  const filteredAgreements = useMemo(() => {
    return agreements.filter((a) => {
      // Tab filter
      if (activeTab !== 'All' && a.status.toLowerCase() !== activeTab.toLowerCase()) {
        return false;
      }

      // Service filter
      if (serviceFilter !== 'All' && a.serviceKey !== serviceFilter) {
        return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const match =
          a.refNo.toLowerCase().includes(query) ||
          a.client.toLowerCase().includes(query) ||
          a.signerEmail.toLowerCase().includes(query) ||
          a.property.toLowerCase().includes(query) ||
          a.serviceKey.toLowerCase().includes(query);
        if (!match) return false;
      }

      return true;
    });
  }, [agreements, activeTab, serviceFilter, searchTerm]);

  // Clean, Fluid & Responsive 6-Column Specification (Matching 100% responsiveness standard)
  const columns = [
    {
      key: 'refNo',
      header: 'Agreement Ref',
      sortable: true,
      className: 'w-[17%] min-w-[110px]',
      render: (val, row) => (
        <div className="truncate">
          <button
            onClick={() => setSelectedAgreementDetail(row)}
            className="text-[#2563EB] hover:text-[#0B1F4D] font-mono font-bold hover:underline cursor-pointer block truncate"
            title="Click to view legal agreement details"
          >
            {val}
          </button>
          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
            Sent: {row.sentDate}
          </div>
          {row.jobNo && (
            <div className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
              Ref: {row.jobNo}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'client',
      header: 'Signer / Client',
      sortable: true,
      className: 'w-[23%] min-w-[125px]',
      render: (val, row) => (
        <div className="min-w-0">
          <button
            onClick={() => {
              setSelectedClientEmail(row.signerEmail);
              setClientModalTab('calls');
            }}
            className="text-left font-bold text-slate-900 hover:text-[#2563EB] hover:underline flex items-center gap-1 group cursor-pointer max-w-full"
            title="Click to view client profile, call notes & complaints"
          >
            <span className="truncate">{val}</span>
            <PhoneCall className="w-3 h-3 text-[#2563EB] opacity-60 group-hover:opacity-100 transition-opacity shrink-0" />
          </button>
          <div className="text-[11px] text-slate-500 truncate mt-0.5 font-mono">
            {row.signerEmail}
          </div>
        </div>
      ),
    },
    {
      key: 'property',
      header: 'Subject Property',
      sortable: true,
      className: 'w-[26%] min-w-[130px]',
      render: (val, row) => (
        <div className="min-w-0">
          <div className="font-bold text-[#0B1F4D] text-xs truncate" title={val}>
            {val}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
            <MapPin className="w-2.5 h-2.5 text-rose-500 shrink-0" />
            <span className="truncate">{row.location}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'serviceKey',
      header: 'Service Template',
      sortable: true,
      className: 'w-[18%] min-w-[110px]',
      render: (val, row) => (
        <div className="min-w-0">
          <span className="font-bold text-slate-800 text-xs block truncate">{val}</span>
          <span className="inline-block text-[10px] font-mono text-[#2563EB] bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded font-semibold mt-0.5 truncate">
            {row.versionYear}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      className: 'w-[11%] min-w-[75px]',
      render: (val) => {
        if (val === 'Signed') {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Signed
            </span>
          );
        }
        if (val === 'Sent') {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
              <Send className="w-3 h-3 text-[#2563EB]" />
              Sent
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            Pending
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions', sortable: false, headerClassName: 'text-right w-[8%] min-w-[44px]',
      className: 'text-right w-[5%] min-w-[44px] pr-3 sm:pr-4',
      render: (_, row) => (
        <AgreementRowActions
          agreement={row}
          onView={setSelectedAgreementDetail}
          onMarkSigned={handleMarkSigned}
          onDownloadCopy={handleDownloadSignedCopy}
          onResendTerms={handleResendTerms}
          onOpenClientProfile={(email) => {
            setSelectedClientEmail(email);
            setClientModalTab('calls');
          }}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Terms of Engagement & Legal Documents"
        subtitle="Manage legally binding RICS contractual templates across 6 surveying disciplines and monitor digital signature execution."
        breadcrumb={['Admin', 'Terms & Documents']}
        actionLabel="Send Terms to Client"
        actionIcon={FileSignature}
        onAction={() => setIsSendTermsModalOpen(true)}
      />

      {/* TOP 3 EXECUTIVE KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-1">
              Executed Legal Panel
            </span>
            <div className="text-2xl font-black text-[#0B1F4D] tracking-tight">
              {kpiStats.signedCount}{' '}
              <span className="text-sm font-semibold text-slate-400">/ {kpiStats.total}</span>
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              Verified digital signatures
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-1">
              Signed Compliance Rate
            </span>
            <div className="text-2xl font-black text-[#0B1F4D] tracking-tight">
              {kpiStats.rate}%
            </div>
            <div className="text-[11px] text-[#2563EB] font-semibold flex items-center gap-1 mt-1">
              <ShieldCheck className="w-3 h-3 text-[#2563EB]" />
              Average turnaround &lt; 18h
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB] shrink-0">
            <FileSignature className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-1">
              Pending Client Signatures
            </span>
            <div className="text-2xl font-black text-[#0B1F4D] tracking-tight">
              {kpiStats.pendingCount}{' '}
              <span className="text-sm font-semibold text-slate-400">Awaiting</span>
            </div>
            <div className="text-[11px] text-amber-600 font-semibold flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3 text-amber-500" />
              Auto-reminders dispatched
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* SECTION 1: ONE TERMS TEMPLATE PER SERVICE (6 SERVICES) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-black text-[#0B1F4D] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#2563EB]" />
              <span>Standard Service Terms Templates (6 Disciplines)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Updated for 2026 UK statutory regulations, RICS Home Survey Standard, and Consumer Rights Act 2015.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-bold font-mono text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
              6 Active Templates (Year: 2026)
            </span>
            <button
              onClick={() => setShowTemplatesSection((prev) => !prev)}
              className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
              title={showTemplatesSection ? 'Collapse templates view' : 'Expand templates view'}
            >
              {showTemplatesSection ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* 6 Template Cards Grid */}
        {showTemplatesSection && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {TERMS_TEMPLATES.map((tmpl) => (
              <div
                key={tmpl.id}
                className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Header with service badge and version/year */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-[#0B1F4D] text-white">
                      {tmpl.serviceKey}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-blue-50 text-[#2563EB] border border-blue-200">
                      {tmpl.version} ({tmpl.year})
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#2563EB] transition-colors leading-snug line-clamp-1">
                    {tmpl.name}
                  </h4>

                  <div className="text-[11px] text-slate-500 font-medium mt-1 truncate">
                    Mandate: <strong className="text-slate-700">{tmpl.governingBody}</strong>
                  </div>

                  <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-2">
                    {tmpl.summary}
                  </p>

                  <div className="mt-3 py-1.5 px-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">PI Liability:</span>
                    <span className="font-bold text-[#0B1F4D] font-mono">
                      {tmpl.piiCap.split(' ')[0]} Cover
                    </span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedTemplateToPreview(tmpl)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#0B1F4D] transition-colors cursor-pointer py-1"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>Preview Clauses</span>
                  </button>

                  <button
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, serviceKey: tmpl.serviceKey }));
                      setIsSendTermsModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>Send Terms</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: DIGITAL EXECUTION & AGREEMENTS REGISTER */}
      <div className="space-y-4 pt-4 border-t border-slate-200/80">
        <div>
          <h3 className="text-base font-black text-[#0B1F4D] flex items-center gap-2">
            <FileSignature className="w-5 h-5 text-[#2563EB]" />
            <span>Digital Execution &amp; Agreements Register</span>
          </h3>
          <p className="text-xs text-slate-500">
            Track outbound electronic mandates, verify audit trails, and download legally executed signed copies.
          </p>
        </div>

        {/* Tabs: All, Signed, Sent, Pending */}
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {/* Search & Filter toolbar */}
        <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by agreement ref, client, signer email, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:border-[#2563EB] focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-2.5">
            {/* Service Discipline Filter */}
            <div className="relative">
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:bg-white cursor-pointer"
              >
                <option value="All">All Disciplines</option>
                {TERMS_TEMPLATES.map((t) => (
                  <option key={t.id} value={t.serviceKey}>
                    {t.serviceKey}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

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

        {/* Responsive Table of Agreements */}
        <Table
          columns={columns}
          data={filteredAgreements}
          pageSize={pageSize}
          emptyTitle="No agreements found"
          emptyMessage="No digital terms agreements match the selected tab filter or search query."
        />
      </div>

      {/* MODAL 1: "Send terms" Modal (Prompt: signer email) */}
      <Modal
        isOpen={isSendTermsModalOpen}
        onClose={() => setIsSendTermsModalOpen(false)}
        title="Dispatch Digital Terms of Engagement"
        subtitle="Issue an encrypted e-signature contract link to the client / purchaser via email and SMS."
        maxWidth="max-w-xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsSendTermsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="send-terms-form"
              className="px-5 py-2 rounded-xl bg-[#0B1F4D] text-white text-xs font-bold hover:bg-[#162E6E] shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Dispatch to Signer
            </button>
          </>
        }
      >
        <form id="send-terms-form" onSubmit={handleSendTermsSubmit} className="space-y-4 text-xs">
          {/* Signer Email (Required by user prompt) */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Signer Email Address * (Client e-signature delivery)
            </label>
            <input
              type="email"
              required
              placeholder="e.g. client@example.co.uk"
              value={formData.signerEmail}
              onChange={(e) => setFormData({ ...formData, signerEmail: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:bg-white"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              The recipient will receive an encrypted DocuSign / RICS authentication token to execute terms.
            </span>
          </div>

          {/* Client Name & Service Template */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Client / Signer Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Oliver Montgomery"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Service Template * (One per service)
              </label>
              <select
                value={formData.serviceKey}
                onChange={(e) => setFormData({ ...formData, serviceKey: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:bg-white"
              >
                {TERMS_TEMPLATES.map((tmpl) => (
                  <option key={tmpl.id} value={tmpl.serviceKey}>
                    {tmpl.serviceKey} — {tmpl.version} ({tmpl.year})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Property Address & Postcode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Subject Property Address *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 29 Cheyne Walk"
                value={formData.property}
                onChange={(e) => setFormData({ ...formData, property: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Location / Postcode
              </label>
              <input
                type="text"
                placeholder="e.g. Chelsea, London SW3 5HH"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:bg-white"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Custom Inspection Notes / Caveats (Optional)
            </label>
            <textarea
              rows="2"
              placeholder="e.g. Roof space access subject to vendor providing safe loft ladder..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:bg-white"
            />
          </div>

          {/* RICS Compliance Banner */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="text-[11px] leading-snug">
              Per UK surveying regulations, on-site inspections will remain on hold until the signer successfully executes this mandate.
            </span>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Template Clauses Preview Modal */}
      {selectedTemplateToPreview && (
        <Modal
          isOpen={!!selectedTemplateToPreview}
          onClose={() => setSelectedTemplateToPreview(null)}
          title={selectedTemplateToPreview.name}
          subtitle={`Version: ${selectedTemplateToPreview.version} (Year: ${selectedTemplateToPreview.year}) • ${selectedTemplateToPreview.governingBody}`}
          maxWidth="max-w-2xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-mono font-bold text-slate-600">
                {selectedTemplateToPreview.piiCap}
              </span>
              <button
                onClick={() => setSelectedTemplateToPreview(null)}
                className="px-4 py-2 rounded-xl bg-[#0B1F4D] text-white text-xs font-bold hover:bg-[#162E6E] cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
              {selectedTemplateToPreview.summary}
            </p>

            <h5 className="font-bold text-[#0B1F4D] text-xs uppercase tracking-wider">
              Statutory Terms &amp; Standard Clauses:
            </h5>

            <div className="space-y-3">
              {selectedTemplateToPreview.keyClauses.map((clause, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                      Clause {clause.num}
                    </span>
                    <span className="font-bold text-slate-900">{clause.title}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed pt-1">
                    {clause.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 3: Agreement Details & Signature Certificate View */}
      {selectedAgreementDetail && (
        <Modal
          isOpen={!!selectedAgreementDetail}
          onClose={() => setSelectedAgreementDetail(null)}
          title={`Agreement: ${selectedAgreementDetail.refNo}`}
          subtitle={`${selectedAgreementDetail.property}, ${selectedAgreementDetail.location}`}
          maxWidth="max-w-xl"
          footer={
            <div className="flex items-center justify-between w-full">
              {selectedAgreementDetail.status === 'Signed' ? (
                <button
                  onClick={() => handleDownloadSignedCopy(selectedAgreementDetail)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Signed PDF</span>
                </button>
              ) : (
                <span className="text-xs text-amber-700 font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Awaiting client digital execution
                </span>
              )}

              <button
                onClick={() => setSelectedAgreementDetail(null)}
                className="px-4 py-2 rounded-xl bg-[#0B1F4D] text-white text-xs font-bold hover:bg-[#162E6E] cursor-pointer"
              >
                Close
              </button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Signer Name</span>
                <span className="font-bold text-slate-900">{selectedAgreementDetail.client}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Signer Email</span>
                <span className="font-mono text-slate-800 font-bold truncate block">{selectedAgreementDetail.signerEmail}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Service Template</span>
                <span className="font-bold text-slate-900">{selectedAgreementDetail.serviceKey}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Template Version</span>
                <span className="font-mono text-slate-800">{selectedAgreementDetail.versionYear}</span>
              </div>
            </div>

            {selectedAgreementDetail.status === 'Signed' ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Certificate of Digital Execution (Verified)</span>
                </div>
                <div className="text-[11px] font-mono space-y-1 text-emerald-800">
                  <div>Timestamp: {selectedAgreementDetail.signedDate}</div>
                  <div>IP Address: {selectedAgreementDetail.signerIp || '86.142.19.42 (London, UK)'}</div>
                  <div>Audit Hash: {selectedAgreementDetail.auditCode}</div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
                <div className="flex items-center gap-1.5 font-bold">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Awaiting Digital Signature</span>
                </div>
                <p className="text-[11px] text-amber-800">
                  Digital signature link was dispatched to <strong>{selectedAgreementDetail.signerEmail}</strong> on {selectedAgreementDetail.sentDate}.
                </p>
                <button
                  onClick={() => {
                    markAgreementSigned(selectedAgreementDetail.id);
                    setSelectedAgreementDetail((prev) => ({
                      ...prev,
                      status: 'Signed',
                      signedDate: new Date().toLocaleDateString('en-GB') + ', 17:15',
                      signerIp: '86.142.19.42 (London, UK)',
                    }));
                  }}
                  className="mt-1 px-3 py-1.5 bg-[#0B1F4D] text-white rounded-xl text-xs font-bold hover:bg-[#162E6E] cursor-pointer"
                >
                  Manually Verify Signature
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* MODAL 4: Client Profile (Calls & Complaints) */}
      {selectedClientEmail && (
        <ClientProfileModal
          isOpen={!!selectedClientEmail}
          onClose={() => setSelectedClientEmail(null)}
          clientEmail={selectedClientEmail}
          initialTab={clientModalTab}
        />
      )}
    </div>
  );
};
