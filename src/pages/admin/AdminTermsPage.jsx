import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Tabs } from '../../components/common/Tabs';
import { Table } from '../../components/common/Table';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../components/ToastContext';
import { TERMS_TEMPLATES, useTerms } from '../../mock/terms';

export const AdminTermsPage = () => {
  const { addToast } = useToast();
  const { agreements, addAgreement, markAgreementSigned } = useTerms();

  const [activeTab, setActiveTab] = useState('All'); // 'All' | 'Signed' | 'Sent' | 'Pending'
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(10);

  // Modals state
  const [isSendTermsModalOpen, setIsSendTermsModalOpen] = useState(false);
  const [selectedTemplateToPreview, setSelectedTemplateToPreview] = useState(null);
  const [selectedAgreementDetail, setSelectedAgreementDetail] = useState(null);

  // Form state for "Send terms" modal (user required: signer email)
  const [formData, setFormData] = useState({
    signerEmail: '',
    clientName: '',
    property: '',
    location: '',
    serviceKey: 'Homebuyer L2',
    notes: '',
  });

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

  // Handle Download Signed Copy
  const handleDownloadSignedCopy = (agreement) => {
    addToast({
      type: 'success',
      title: 'Downloading Signed Agreement',
      message: `Downloaded executed PDF certificate for ${agreement.refNo} (${agreement.auditCode || 'Verified e-signature'}).`,
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
  }, [agreements, activeTab, searchTerm]);

  // Table columns definition
  const columns = [
    {
      key: 'refNo',
      header: 'Agreement Ref',
      sortable: true,
      className: 'font-mono font-bold text-[#0B1F4D] whitespace-nowrap',
      render: (val, row) => (
        <div>
          <button
            onClick={() => setSelectedAgreementDetail(row)}
            className="text-[#2563EB] hover:text-[#0B1F4D] font-bold hover:underline cursor-pointer"
          >
            {val}
          </button>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            Sent: {row.sentDate}
          </div>
        </div>
      ),
    },
    {
      key: 'client',
      header: 'Signer / Client',
      sortable: true,
      render: (val, row) => (
        <div className="min-w-[140px]">
          <div className="font-bold text-slate-900 text-xs">{val}</div>
          <div className="text-[11px] text-slate-500 font-mono mt-0.5 truncate max-w-[170px]">
            {row.signerEmail}
          </div>
        </div>
      ),
    },
    {
      key: 'property',
      header: 'Subject Property',
      sortable: true,
      render: (val, row) => (
        <div className="min-w-[170px] max-w-[230px]">
          <div className="font-bold text-slate-800 text-xs truncate">{val}</div>
          <div className="text-[11px] text-slate-400 truncate mt-0.5">{row.location}</div>
        </div>
      ),
    },
    {
      key: 'serviceKey',
      header: 'Service Template',
      sortable: true,
      render: (val, row) => (
        <div className="min-w-[140px]">
          <span className="font-bold text-slate-800 text-xs block">{val}</span>
          <span className="text-[10px] font-mono text-[#2563EB] bg-blue-50 px-1.5 py-0.5 rounded font-bold">
            {row.versionYear}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (val) => {
        if (val === 'Signed') {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Signed
            </span>
          );
        }
        if (val === 'Sent') {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
              <Send className="w-3 h-3 text-[#2563EB]" />
              Sent
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            Pending
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Download Signed Copy / Action',
      sortable: false,
      className: 'text-right whitespace-nowrap',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-2">
          {row.status === 'Signed' ? (
            <button
              onClick={() => handleDownloadSignedCopy(row)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Signed Copy</span>
            </button>
          ) : (
            <button
              onClick={() => {
                markAgreementSigned(row.id);
                addToast({
                  type: 'success',
                  title: 'Terms Marked Signed',
                  message: `Agreement ${row.refNo} has been marked as legally executed.`,
                });
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#0B1F4D] text-slate-700 hover:text-white text-xs font-bold transition-all cursor-pointer"
            >
              Mark as Signed
            </button>
          )}

          <button
            onClick={() => setSelectedAgreementDetail(row)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Terms of Engagement & Legal Documents"
        subtitle="Manage legally binding RICS contractual templates across 6 surveying disciplines and monitor digital signature execution."
        breadcrumb={['Admin', 'Terms & Documents']}
        actionLabel="Send Terms to Client"
        actionIcon={FileSignature}
        onAction={() => setIsSendTermsModalOpen(true)}
      />

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
          <span className="text-xs font-bold font-mono text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
            6 Active Templates (Year: 2026)
          </span>
        </div>

        {/* 6 Template Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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

                <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#2563EB] transition-colors leading-snug">
                  {tmpl.name}
                </h4>

                <div className="text-[11px] text-slate-500 font-medium mt-1">
                  Mandate: <strong className="text-slate-700">{tmpl.governingBody}</strong>
                </div>

                <p className="text-xs text-slate-600 mt-2.5 leading-relaxed line-clamp-3">
                  {tmpl.summary}
                </p>

                <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">PII Liability:</span>
                  <span className="font-bold text-slate-800 font-mono">{tmpl.piiCap.split(' ')[0]}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedTemplateToPreview(tmpl)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-[#0B1F4D] transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview Clauses</span>
                </button>

                <button
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, serviceKey: tmpl.serviceKey }));
                    setIsSendTermsModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>Send Terms</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: LIST OF SENT / SIGNED / PENDING AGREEMENTS */}
      <div className="space-y-4 pt-4 border-t border-slate-200/80">
        <div>
          <h3 className="text-base font-black text-[#0B1F4D] flex items-center gap-2">
            <FileSignature className="w-5 h-5 text-[#2563EB]" />
            <span>Digital Execution & Agreements Register</span>
          </h3>
          <p className="text-xs text-slate-500">
            Track outbound electronic mandates, verify audit trails, and download legally executed signed copies.
          </p>
        </div>

        {/* Tabs: All, Signed, Sent, Pending */}
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {/* Search toolbar */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
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

          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
            >
              Clear Search
            </button>
          )}
        </div>

        {/* Table of Agreements */}
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
              Statutory Terms & Standard Clauses:
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
                  <span>Download Signed PDF Copy</span>
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
    </div>
  );
};
