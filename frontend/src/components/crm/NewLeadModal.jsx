import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Building2, PoundSterling, FileText, Send } from 'lucide-react';
import { Modal } from '../common/Modal';
import { LEAD_SOURCES, LEAD_STATUSES } from '../../mock/leads';

const OWNERS = [
  'Sarah Jenkins',
  'Alexander Sterling',
  'David Thorne MRICS',
  'Jonathan Cross FRICS',
  'Claire Bennet AssocRICS',
];

const SURVEY_TYPES = [
  'RICS Level 2 Home Survey',
  'RICS Level 2 Home Survey (with Valuation)',
  'RICS Level 3 Building Survey',
  'Specific Structural Defect Survey',
  'Residential Red Book Valuation',
  'Commercial Dilapidations & Survey',
  'Expert Witness CPR Part 35 Report',
];

export const NewLeadModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    enquiry: 'RICS Level 2 Home Survey',
    property: '',
    location: '',
    source: 'Website',
    status: 'New',
    owner: 'Sarah Jenkins',
    estimatedValue: '650.00',
    notes: '',
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.customerName.trim()) {
      setError('Please provide the customer name.');
      return;
    }
    if (!formData.customerEmail.trim()) {
      setError('Please provide the customer email address.');
      return;
    }
    if (!formData.property.trim() || !formData.location.trim()) {
      setError('Please enter the property address and postcode/location.');
      return;
    }

    const formattedValue = formData.estimatedValue.startsWith('£')
      ? formData.estimatedValue
      : `£${parseFloat(formData.estimatedValue || 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })}`;

    const newLead = {
      id: `LD-${Math.floor(1050 + Math.random() * 900)}`,
      customerName: formData.customerName.trim(),
      customerEmail: formData.customerEmail.trim(),
      customerPhone: formData.customerPhone.trim() || '+44 7700 900000',
      enquiry: formData.enquiry,
      property: formData.property.trim(),
      location: formData.location.trim(),
      source: formData.source,
      status: formData.status,
      created: new Intl.DateTimeFormat('en-GB').format(new Date()),
      owner: formData.owner,
      estimatedValue: formattedValue,
      notes: formData.notes.trim() || 'No additional notes provided.',
    };

    onSubmit(newLead);
    onClose();
    // Reset form
    setFormData({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      enquiry: 'RICS Level 2 Home Survey',
      property: '',
      location: '',
      source: 'Website',
      status: 'New',
      owner: 'Sarah Jenkins',
      estimatedValue: '650.00',
      notes: '',
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Survey Lead"
      subtitle="Register an inbound survey enquiry from estate agents, portals, or direct clients."
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
            form="new-lead-form"
            className="px-5 py-2.5 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white text-xs font-bold transition-all shadow-md shadow-[#0B1F4D]/20 flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            Create Lead Record
          </button>
        </>
      }
    >
      <form id="new-lead-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        {/* Customer Info Section */}
        <div className="space-y-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Client Details
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Customer Name *
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="customerName"
                  required
                  placeholder="e.g. Jonathan Croft"
                  value={formData.customerName}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:bg-white"
                />
              </div>
            </div>

            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  name="customerEmail"
                  required
                  placeholder="name@example.co.uk"
                  value={formData.customerEmail}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:bg-white"
                />
              </div>
            </div>

            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                UK Telephone
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  name="customerPhone"
                  placeholder="+44 7700 900..."
                  value={formData.customerPhone}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Property & Survey Section */}
        <div className="space-y-3 pt-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Property & Survey Requirements
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Property Address *
              </label>
              <div className="relative">
                <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="property"
                  required
                  placeholder="e.g. 18 Highfield Ave"
                  value={formData.property}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Location & UK Postcode *
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="location"
                  required
                  placeholder="e.g. Guildford, Surrey GU2 7YZ"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:bg-white"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Survey Service Requested
            </label>
            <select
              name="enquiry"
              value={formData.enquiry}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:bg-white"
            >
              {SURVEY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Lead Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Lead Source
            </label>
            <select
              name="source"
              value={formData.source}
              onChange={handleChange}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:bg-white"
            >
              {LEAD_SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Initial Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:bg-white"
            >
              {LEAD_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Estimated Fee (£)
            </label>
            <div className="relative">
              <PoundSterling className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                step="10"
                name="estimatedValue"
                placeholder="650"
                value={formData.estimatedValue}
                onChange={handleChange}
                className="w-full pl-8 pr-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Lead Owner
            </label>
            <select
              name="owner"
              value={formData.owner}
              onChange={handleChange}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:bg-white"
            >
              {OWNERS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Client Special Instructions / Defect Notes
          </label>
          <textarea
            name="notes"
            rows="2"
            value={formData.notes}
            onChange={handleChange}
            placeholder="e.g. Property is vacant, keys with local estate agent branch..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:bg-white"
          />
        </div>
      </form>
    </Modal>
  );
};
