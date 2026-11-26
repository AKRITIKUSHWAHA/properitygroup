import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  ShieldCheck,
  AlertCircle,
  Building2,
  Send,
  Key,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  Search,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { SURVEYORS, useJobs, normalizeToUKDate } from '../../mock/jobs';
import { useLeads } from '../../mock/leads';
import { adminSurveyorsApi, adminCrmAndLeadsApi } from '../../api/adminApi';

export const NewBookingModal = ({ isOpen, onClose, onSubmit, surveyors = [], initialDate = '' }) => {
  const { jobs } = useJobs();
  const { leads: localLeads } = useLeads();
  const [activeSurveyors, setActiveSurveyors] = useState([]);
  const [backendLeads, setBackendLeads] = useState([]);
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [autoFilledNotice, setAutoFilledNotice] = useState(null);
  const customerDropdownRef = useRef(null);

  // Load live surveyors from backend API
  useEffect(() => {
    if (!isOpen) return;
    if (surveyors && surveyors.length > 0) return;
    if (activeSurveyors.length > 0) return;
    adminSurveyorsApi
      .getSurveyors()
      .then((res) => {
        const raw =
          res?.surveyors ||
          res?.data?.surveyors ||
          res?.data?.data?.surveyors ||
          (Array.isArray(res) ? res : []);
        if (Array.isArray(raw) && raw.length > 0) {
          setActiveSurveyors(raw);
        }
      })
      .catch((err) => {
        console.warn('Failed to load surveyors in NewBookingModal:', err);
      });
  }, [isOpen, surveyors]);

  // Load CRM leads from backend API
  useEffect(() => {
    if (!isOpen) return;
    adminCrmAndLeadsApi
      .getLeads()
      .then((res) => {
        const raw = res?.leads || res?.data?.leads || (Array.isArray(res) ? res : []);
        if (Array.isArray(raw)) {
          setBackendLeads(raw);
        }
      })
      .catch((err) => console.warn('Could not load CRM leads for booking modal:', err));
  }, [isOpen]);

  // Combine and deduplicate leads from Backend API, local storage, and previous jobs
  const availableLeads = useMemo(() => {
    const list = [];
    const seen = new Set();

    const addEntry = (item) => {
      if (!item) return;
      const name = (item.clientName || item.customerName || item.customer || '').trim();
      const email = (item.clientEmail || item.customerEmail || '').trim().toLowerCase();
      const property = (item.propertyAddress || item.property || '').trim();
      if (!name && !email && !property) return;

      const key = `${name.toLowerCase()}_${email}_${property.toLowerCase()}`;
      if (seen.has(key)) return;
      seen.add(key);

      const rawService = item.serviceType || item.enquiry || item.surveyType || '';
      let normalizedService = 'RICS Level 2 Home Survey';
      const sLower = rawService.toLowerCase();
      if (sLower.includes('level 3') || sLower.includes('building')) {
        normalizedService = 'RICS Level 3 Building Survey';
      } else if (sLower.includes('valuation') || sLower.includes('red book')) {
        normalizedService = 'Residential Red Book Valuation';
      } else if (sLower.includes('defect') || sLower.includes('structural') || sLower.includes('damp')) {
        normalizedService = 'Specific Structural Defect Survey';
      } else if (sLower.includes('level 2') || sLower.includes('homebuyer')) {
        if (sLower.includes('valuation')) {
          normalizedService = 'RICS Level 2 Home Survey (with Valuation)';
        } else {
          normalizedService = 'RICS Level 2 Home Survey';
        }
      }

      list.push({
        id: item.reference || item.id || `lead-${list.length + 1}`,
        reference: item.reference || item.id || '',
        name: name || 'Private Client',
        email: item.clientEmail || item.customerEmail || '',
        phone: item.clientPhone || item.customerPhone || '',
        property: property || '',
        location: item.postcode || item.location || '',
        surveyType: normalizedService,
        source: item.source || 'Website',
        status: item.status || 'New',
        termsSigned: Boolean(item.termsSigned || item.termsStatus === 'Signed'),
        paymentReceived: Boolean(item.paymentReceived || item.paymentStatus === 'Paid'),
      });
    };

    backendLeads.forEach(addEntry);
    (localLeads || []).forEach(addEntry);
    (jobs || []).forEach(addEntry);

    return list;
  }, [backendLeads, localLeads, jobs]);

  const surveyorList = useMemo(() => {
    if (Array.isArray(surveyors) && surveyors.length > 0) {
      return surveyors;
    }
    if (activeSurveyors.length > 0) {
      return activeSurveyors.map((s, idx) => ({
        id: `srv-${s.id}`,
        dbId: s.id,
        name: s.name,
        email: s.email || 'surveyor@njspropertygroup.com',
        credentials: s.surveyorProfile?.accreditation || 'MRICS Chartered Surveyor',
        postcodes: s.surveyorProfile?.postcodesCovered || 'All London Zones',
        color: ['#2563EB', '#7C3AED', '#059669', '#D97706', '#E11D48'][idx % 5],
      }));
    }
    return SURVEYORS;
  }, [surveyors, activeSurveyors]);

  const todayUK = useMemo(() => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  }, []);

  const [formData, setFormData] = useState({
    customer: '',
    customerEmail: '',
    customerPhone: '',
    property: '',
    location: '',
    surveyType: 'RICS Level 2 Home Survey',
    surveyorId: '',
    date: initialDate || todayUK,
    timeSlot: '10:00 - 13:00',
    accessType: 'Keys with Selling Agent',
    keyRef: '',
    conciergeCode: '',
    sellingAgent: '',
    termsSigned: false,
    paymentReceived: false,
  });

  useEffect(() => {
    if (isOpen) {
      setFormData((prev) => {
        const targetSurveyorId =
          (surveyorList.length > 0 && (!prev.surveyorId || !surveyorList.some((s) => s.id === prev.surveyorId)))
            ? surveyorList[0].id
            : (prev.surveyorId || surveyorList[0]?.id || 'srv-1');
        return {
          ...prev,
          date: initialDate || prev.date || todayUK,
          surveyorId: targetSurveyorId,
        };
      });
    }
  }, [isOpen, initialDate, surveyorList, todayUK]);

  // Click outside to close customer autocomplete dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(e.target)) {
        setIsCustomerDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset modal search state on close
  useEffect(() => {
    if (!isOpen) {
      setIsCustomerDropdownOpen(false);
      setAutoFilledNotice(null);
      setSelectedLeadId('');
    }
  }, [isOpen]);

  const [error, setError] = useState('');

  // Conflict / Double-Booking Check
  const selectedSurveyor = surveyorList.find((s) => s.id === formData.surveyorId) || surveyorList[0];
  const normFormDate = normalizeToUKDate(formData.date);
  const conflictJob = jobs.find((j) => {
    if (!j || j.status === 'Cancelled') return false;
    const sameSurveyor =
      String(j.surveyorId).replace(/^srv-/, '') === String(formData.surveyorId).replace(/^srv-/, '') ||
      (j.surveyor && selectedSurveyor?.name && j.surveyor.toLowerCase() === selectedSurveyor.name.toLowerCase());
    const jobDate = normalizeToUKDate(j.date || j.inspectionDate);
    const sameDate = jobDate && normFormDate && jobDate === normFormDate;
    const sameTime =
      j.timeSlot === formData.timeSlot ||
      (j.timeSlot && formData.timeSlot && j.timeSlot.split(' - ')[0].trim() === formData.timeSlot.split(' - ')[0].trim());
    return sameSurveyor && sameDate && sameTime;
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Auto-fill full customer information when a lead is chosen
  const handleSelectLead = (leadOrId) => {
    const lead =
      typeof leadOrId === 'object'
        ? leadOrId
        : availableLeads.find((l) => l.id === leadOrId || l.reference === leadOrId);
    if (!lead) return;

    setSelectedLeadId(lead.id);
    setFormData((prev) => ({
      ...prev,
      customer: lead.name,
      customerEmail: lead.email || prev.customerEmail,
      customerPhone: lead.phone || prev.customerPhone,
      property: lead.property || prev.property,
      location: lead.location || prev.location,
      surveyType: lead.surveyType || prev.surveyType,
      termsSigned: lead.termsSigned !== undefined ? lead.termsSigned : prev.termsSigned,
      paymentReceived: lead.paymentReceived !== undefined ? lead.paymentReceived : prev.paymentReceived,
    }));

    setIsCustomerDropdownOpen(false);
    setAutoFilledNotice({
      name: lead.name,
      reference: lead.reference || lead.id,
      property: lead.property,
    });
  };

  // Filter leads based on customer input text
  const filteredLeads = useMemo(() => {
    const q = (formData.customer || '').toLowerCase().trim();
    if (!q) return availableLeads;
    return availableLeads.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.phone.toLowerCase().includes(q) ||
        l.property.toLowerCase().includes(q) ||
        l.location.toLowerCase().includes(q) ||
        (l.id && String(l.id).toLowerCase().includes(q))
    );
  }, [availableLeads, formData.customer]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.customer.trim() || !formData.property.trim() || !formData.location.trim()) {
      setError('Please provide customer name, property address, and UK location.');
      return;
    }

    const canBook = formData.termsSigned && formData.paymentReceived;
    const cleanDate = normalizeToUKDate(formData.date) || formData.date;

    const tempRef = `JOB-PENDING-${Date.now()}`;
    const newJob = {
      id: tempRef,
      jobNo: tempRef,
      customer: formData.customer.trim(),
      customerEmail: formData.customerEmail.trim(),
      customerPhone: formData.customerPhone.trim(),
      surveyType: formData.surveyType,
      property: formData.property.trim(),
      location: formData.location.trim(),
      surveyor: selectedSurveyor ? selectedSurveyor.name : (surveyorList[0]?.name || 'Chartered Surveyor'),
      surveyorId: selectedSurveyor ? selectedSurveyor.id : (surveyorList[0]?.id || 'srv-1'),
      surveyorEmail: selectedSurveyor?.email || (surveyorList[0]?.email || 'surveyor@njspropertygroup.com'),
      date: cleanDate,
      inspectionDate: cleanDate,
      timeSlot: formData.timeSlot,
      inspectionTime: formData.timeSlot,
      status: canBook ? 'Scheduled' : 'On Hold',
      progress: canBook ? 30 : 15,
      termsStatus: formData.termsSigned ? 'Signed' : 'Pending',
      paymentStatus: formData.paymentReceived ? 'Paid' : 'Unpaid',
      canBook: canBook,
      timelineStep: canBook ? 6 : 3,
      propertyDetails: {
        value: '£750,000',
        bedrooms: '3 Bedrooms, 2 Bathrooms',
        tenure: 'Freehold',
        listedBuilding: 'None',
        accessDetails: [formData.accessType, formData.keyRef, formData.conciergeCode ? `Concierge/Code: ${formData.conciergeCode}` : ''].filter(Boolean).join(' • '),
        yearBuilt: 'c. 1950',
        propertyType: 'Residential Property',
      },
      quote: {
        baseFee: 650.0,
        extras: [],
        discount: 0.0,
        vatRate: 0.2,
      },
      contacts: {
        client: { name: formData.customer, role: 'Buyer', phone: formData.customerPhone, email: formData.customerEmail },
        solicitor: { name: 'Solicitors Direct', firm: 'Conveyancers UK', phone: '', email: '', ref: '' },
        agent: { name: formData.sellingAgent, agency: 'Selling Agent', phone: '', email: '' },
      },
      notes: [],
      tasks: [],
      documents: [],
      emails: [],
      activityLog: [{ id: 1, time: new Date().toLocaleDateString('en-GB'), text: 'Booking slot created via Calendar.' }],
    };

    onSubmit(newJob);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Survey Booking Slot"
      subtitle="Schedule an on-site property inspection with an accredited chartered surveyor."
      maxWidth="max-w-2xl"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="new-booking-form"
            className="px-5 py-2.5 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white text-xs font-bold transition-all shadow-md shadow-[#0B1F4D]/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            Schedule Booking
          </button>
        </>
      }
    >
      <form id="new-booking-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        {/* 1. Fast-Fill from Inbound CRM Leads Banner */}
        {availableLeads.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50/90 to-indigo-50/70 border border-blue-200/90 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-[#0B1F4D] text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#0B1F4D] block">
                  Fast-Fill from Inbound Lead
                </span>
                <span className="text-[11px] text-slate-500">
                  Select an enquiry to auto-populate all contact, property &amp; survey particulars
                </span>
              </div>
            </div>

            <select
              value={selectedLeadId}
              onChange={(e) => {
                if (e.target.value) handleSelectLead(e.target.value);
              }}
              className="px-3 py-1.5 bg-white border border-blue-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 cursor-pointer shadow-2xs max-w-full sm:max-w-xs"
            >
              <option value="">-- Choose from Leads ({availableLeads.length}) --</option>
              {availableLeads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} {l.property ? `• ${l.property.slice(0, 25)}` : ''} ({l.id})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Auto-filled confirmation badge */}
        {autoFilledNotice && (
          <div className="flex items-center justify-between px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Auto-populated details for <strong>{autoFilledNotice.name}</strong> ({autoFilledNotice.reference})
              </span>
            </div>
            <button
              type="button"
              onClick={() => setAutoFilledNotice(null)}
              className="text-emerald-700 hover:text-emerald-900 text-[11px] font-bold cursor-pointer underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Client details with Autocomplete Dropdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Customer Name + Autocomplete Dropdown */}
          <div className="relative" ref={customerDropdownRef}>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>Customer Name *</span>
              {availableLeads.length > 0 && (
                <span className="text-[10px] text-blue-600 font-normal">
                  {availableLeads.length} leads in CRM
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type="text"
                name="customer"
                required
                autoComplete="off"
                placeholder="e.g. Fiona Campbell"
                value={formData.customer}
                onChange={(e) => {
                  handleChange(e);
                  setIsCustomerDropdownOpen(true);
                }}
                onFocus={() => setIsCustomerDropdownOpen(true)}
                className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 placeholder:text-xs placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setIsCustomerDropdownOpen((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Toggle customer leads list"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Dropdown / Autocomplete Menu */}
            {isCustomerDropdownOpen && availableLeads.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-xl max-h-60 overflow-y-auto z-50 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between sticky top-0 border-b border-slate-100">
                  <span>Available Inbound Leads</span>
                  <span>{filteredLeads.length} matches</span>
                </div>
                {filteredLeads.length === 0 ? (
                  <div className="p-3 text-center text-xs text-slate-400">
                    No matching leads found. Continue typing to enter a new client.
                  </div>
                ) : (
                  filteredLeads.map((lead) => (
                    <button
                      key={lead.id}
                      type="button"
                      onClick={() => handleSelectLead(lead)}
                      className="w-full text-left p-2.5 hover:bg-blue-50/80 transition-colors flex items-start gap-2.5 cursor-pointer group"
                    >
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-[#0B1F4D] flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-[#0B1F4D] group-hover:text-white transition-colors">
                        {lead.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-slate-800 group-hover:text-[#2563EB]">
                            {lead.name}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                            {lead.id}
                          </span>
                        </div>
                        {lead.property && (
                          <div className="text-[11px] text-slate-600 truncate mt-0.5">
                            📍 {lead.property}{lead.location ? `, ${lead.location}` : ''}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400 truncate mt-0.5 flex items-center gap-2">
                          {lead.email && <span>{lead.email}</span>}
                          {lead.phone && <span>• {lead.phone}</span>}
                          {lead.surveyType && (
                            <span className="text-blue-600 font-medium">• {lead.surveyType}</span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Customer Email
            </label>
            <input
              type="email"
              name="customerEmail"
              placeholder="fiona@example.co.uk"
              value={formData.customerEmail}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 placeholder:text-xs placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Customer Phone
            </label>
            <input
              type="tel"
              name="customerPhone"
              placeholder="+44 7700 900..."
              value={formData.customerPhone}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 placeholder:text-xs placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Property details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Property Address *
            </label>
            <input
              type="text"
              name="property"
              required
              placeholder="e.g. 52 Clarendon Road"
              value={formData.property}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 placeholder:text-xs placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Location &amp; Postcode *
            </label>
            <input
              type="text"
              name="location"
              required
              placeholder="e.g. Notting Hill, London W11 2HR"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 placeholder:text-xs placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Surveyor & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assigned Surveyor
            </label>
            <select
              name="surveyorId"
              value={formData.surveyorId}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] focus:bg-white transition-all"
            >
              {surveyorList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.postcodes})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Inspection Date (UK)
            </label>
            <input
              type="text"
              name="date"
              placeholder="DD/MM/YYYY"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium font-mono text-slate-900 placeholder:text-slate-400 placeholder:text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Time Slot
            </label>
            <select
              name="timeSlot"
              value={formData.timeSlot}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] focus:bg-white transition-all"
            >
              <option value="09:00 - 12:00">09:00 - 12:00 (Morning)</option>
              <option value="10:00 - 13:00">10:00 - 13:00 (Mid-Morning)</option>
              <option value="14:00 - 17:00">14:00 - 17:00 (Afternoon)</option>
              <option value="15:00 - 18:00">15:00 - 18:00 (Late Afternoon)</option>
            </select>
          </div>
        </div>

        {/* Double-Booking Prevention Warning Banner */}
        {conflictJob && (
          <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-2.5 text-xs text-amber-950 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold text-amber-900">⚠️ Surveyor Double-Booking Detected:</span>
              <p className="mt-0.5 leading-relaxed">
                <strong>{selectedSurveyor.name}</strong> already has job <strong>{conflictJob.jobNo}</strong> scheduled on <strong>{formData.date}</strong> at <strong>{conflictJob.timeSlot}</strong> for <em>{conflictJob.property}</em>. Please select an alternate slot or reassign to avoid surveyor overlap.
              </p>
            </div>
          </div>
        )}

        {/* Access & Keyholder Logistics */}
        <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0B1F4D]">
            <Key className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Keyholder &amp; On-Site Access Logistics</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Access Type / Key Collection
              </label>
              <select
                name="accessType"
                value={formData.accessType}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all"
              >
                <option value="Keys with Selling Agent">Keys with Selling Agent</option>
                <option value="Vendor / Homeowner on Site">Vendor / Homeowner on Site</option>
                <option value="Key Safe / Lockbox">Key Safe / Lockbox</option>
                <option value="Building Concierge">Building Concierge</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Branch Ref / Key Code
              </label>
              <input
                type="text"
                name="keyRef"
                placeholder="e.g. Foxtons Mayfair #FX-402"
                value={formData.keyRef}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 placeholder:text-xs placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Concierge / Alarm Code
              </label>
              <input
                type="text"
                name="conciergeCode"
                placeholder="e.g. #8492"
                value={formData.conciergeCode}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium font-mono text-slate-800 placeholder:text-slate-400 placeholder:text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Selling Agent Contact
              </label>
              <input
                type="text"
                name="sellingAgent"
                placeholder="e.g. Sarah Croft (020 7629 8171)"
                value={formData.sellingAgent}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 placeholder:text-xs placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all"
              />
            </div>
          </div>
        </div>

        {/* Survey Type */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Survey Standard
          </label>
          <select
            name="surveyType"
            value={formData.surveyType}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] focus:bg-white transition-all"
          >
            <option value="RICS Level 2 Home Survey">RICS Level 2 Home Survey</option>
            <option value="RICS Level 2 Home Survey (with Valuation)">RICS Level 2 Home Survey (with Valuation)</option>
            <option value="RICS Level 3 Building Survey">RICS Level 3 Building Survey</option>
            <option value="Specific Structural Defect Survey">Specific Structural Defect Survey</option>
            <option value="Residential Red Book Valuation">Residential Red Book Valuation</option>
          </select>
        </div>

        {/* Terms & Payment Verification Box */}
        <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>RICS Compliance Requirement: Terms &amp; Advance Payment</span>
          </div>
          <p className="text-[11px] text-amber-800 leading-snug">
            Bookings without executed terms or payment remain <strong>disabled</strong> on the calendar with a "Waiting for terms and payment" indicator.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer bg-white p-2.5 rounded-xl border border-amber-200">
              <input
                type="checkbox"
                name="termsSigned"
                checked={formData.termsSigned}
                onChange={handleChange}
                className="w-4 h-4 rounded text-[#2563EB] focus:ring-[#2563EB]"
              />
              <span>Terms of Engagement Signed</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer bg-white p-2.5 rounded-xl border border-amber-200">
              <input
                type="checkbox"
                name="paymentReceived"
                checked={formData.paymentReceived}
                onChange={handleChange}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>Advance Payment Received</span>
            </label>
          </div>
        </div>
      </form>
    </Modal>
  );
};
