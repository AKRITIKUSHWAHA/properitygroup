import React, { useState } from 'react';
import { Calendar, Clock, MapPin, User, ShieldCheck, AlertCircle, Building2, Send, Key, AlertTriangle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { SURVEYORS, useJobs } from '../../mock/jobs';

export const NewBookingModal = ({ isOpen, onClose, onSubmit }) => {
  const { jobs } = useJobs();
  const [formData, setFormData] = useState({
    customer: '',
    customerEmail: '',
    customerPhone: '',
    property: '',
    location: '',
    surveyType: 'RICS Level 2 Home Survey',
    surveyorId: 'srv-1',
    date: '28/10/2026',
    timeSlot: '10:00 - 13:00',
    accessType: 'Keys with Selling Agent',
    keyRef: 'Foxtons Mayfair Ref #FX-402',
    conciergeCode: '#8492',
    sellingAgent: 'Sarah Croft (020 7629 8171)',
    termsSigned: false,
    paymentReceived: false,
  });

  const [error, setError] = useState('');

  // Conflict / Double-Booking Check
  const selectedSurveyor = SURVEYORS.find((s) => s.id === formData.surveyorId) || SURVEYORS[0];
  const conflictJob = jobs.find(
    (j) =>
      j.surveyorId === formData.surveyorId &&
      j.date === formData.date &&
      j.status !== 'Cancelled' &&
      (j.timeSlot === formData.timeSlot || j.timeSlot?.split(' - ')[0] === formData.timeSlot?.split(' - ')[0])
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.customer.trim() || !formData.property.trim() || !formData.location.trim()) {
      setError('Please provide customer name, property address, and UK location.');
      return;
    }

    const selectedSurveyor = SURVEYORS.find((s) => s.id === formData.surveyorId) || SURVEYORS[0];
    const canBook = formData.termsSigned && formData.paymentReceived;

    const newJob = {
      id: `JOB-2026-${Math.floor(100 + Math.random() * 899)}`,
      jobNo: `JOB-2026-${Math.floor(100 + Math.random() * 899)}`,
      customer: formData.customer.trim(),
      customerEmail: formData.customerEmail.trim() || 'client@example.co.uk',
      customerPhone: formData.customerPhone.trim() || '+44 7700 900000',
      surveyType: formData.surveyType,
      property: formData.property.trim(),
      location: formData.location.trim(),
      surveyor: selectedSurveyor.name,
      surveyorId: selectedSurveyor.id,
      date: formData.date,
      timeSlot: formData.timeSlot,
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
        accessDetails: `${formData.accessType}: ${formData.keyRef} (Concierge/Code: ${formData.conciergeCode})`,
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
            className="px-5 py-2.5 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white text-xs font-bold transition-all shadow-md shadow-[#0B1F4D]/20 flex items-center gap-1.5"
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

        {/* Client details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Customer Name *
            </label>
            <input
              type="text"
              name="customer"
              required
              placeholder="e.g. Fiona Campbell"
              value={formData.customer}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:bg-white"
            />
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
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:bg-white"
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
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:bg-white"
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
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Location & Postcode *
            </label>
            <input
              type="text"
              name="location"
              required
              placeholder="e.g. Notting Hill, London W11 2HR"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:bg-white"
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
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:bg-white"
            >
              {SURVEYORS.map((s) => (
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
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:bg-white"
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
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:bg-white"
            >
              <option value="09:00 - 12:00">09:00 - 12:00 (Morning)</option>
              <option value="10:00 - 13:00">10:00 - 13:00 (Mid-Morning)</option>
              <option value="14:00 - 17:00">14:00 - 17:00 (Afternoon)</option>
              <option value="15:00 - 18:00">15:00 - 18:00 (Late Afternoon)</option>
            </select>
          </div>
        </div>

        {/* Double-Booking Prevention Warning Banner (Client Point 11) */}
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

        {/* Access & Keyholder Logistics (Client Point 11) */}
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
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:bg-white"
          >
            <option value="RICS Level 2 Home Survey">RICS Level 2 Home Survey</option>
            <option value="RICS Level 2 Home Survey (with Valuation)">RICS Level 2 Home Survey (with Valuation)</option>
            <option value="RICS Level 3 Building Survey">RICS Level 3 Building Survey</option>
            <option value="Specific Structural Defect Survey">Specific Structural Defect Survey</option>
            <option value="Residential Red Book Valuation">Residential Red Book Valuation</option>
          </select>
        </div>

        {/* Terms & Payment Verification Box - Critical requirement */}
        <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>RICS Compliance Requirement: Terms & Advance Payment</span>
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
