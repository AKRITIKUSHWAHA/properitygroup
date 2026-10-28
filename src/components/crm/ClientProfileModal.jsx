import React, { useState } from 'react';
import {
  X,
  Phone,
  Mail,
  MapPin,
  Clock,
  Plus,
  AlertTriangle,
  CheckCircle2,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  ShieldAlert,
  User,
  Calendar,
  Building,
  Check,
  FileText,
  BadgeAlert,
  Send,
  MessageSquare,
} from 'lucide-react';
import { useClientProfiles } from '../../mock/clientProfiles';
import { useToast } from '../ToastContext';

export const ClientProfileModal = ({ isOpen, onClose, clientEmail, initialTab = 'calls' }) => {
  const { addToast } = useToast();
  const { profiles, addCallLog, addComplaint, updateComplaint } = useClientProfiles();

  const [activeTab, setActiveTab] = useState(initialTab); // 'calls', 'complaints', 'overview'
  const [isAddingCall, setIsAddingCall] = useState(false);
  const [isAddingComplaint, setIsAddingComplaint] = useState(false);
  const [resolvingComplaintId, setResolvingComplaintId] = useState(null);
  const [resolutionText, setResolutionText] = useState('');

  // Form states for new Call Note
  const [callForm, setCallForm] = useState({
    direction: 'Inbound',
    staff: 'Sarah Jenkins',
    duration: '5 mins',
    subject: '',
    notes: '',
  });

  // Form states for new Complaint
  const [complaintForm, setComplaintForm] = useState({
    category: 'Report Delivery Delay',
    severity: 'Medium',
    subject: '',
    description: '',
    assignedTo: 'Sarah Jenkins',
  });

  if (!isOpen) return null;

  // Retrieve client profile or fallback
  const client = (clientEmail && profiles[clientEmail]) || {
    id: 'CLT-GUEST',
    name: 'Emma Watson',
    email: clientEmail || 'customer@demo.com',
    phone: '+44 7700 900147',
    address: '14 Mayfair Gate, London W1K 2PB',
    clientType: 'Residential Homebuyer',
    status: 'Active Client',
    totalSpent: '£650.00',
    activeJobs: ['JOB-2026-084'],
    calls: [],
    complaints: [],
  };

  const calls = client.calls || [];
  const complaints = client.complaints || [];

  const openComplaintsCount = complaints.filter(
    (c) => c.status === 'Open' || c.status === 'Under Investigation'
  ).length;

  const handleCreateCall = (e) => {
    e.preventDefault();
    if (!callForm.notes.trim()) return;

    addCallLog(client.email, {
      clientName: client.name,
      clientPhone: client.phone,
      clientAddress: client.address,
      direction: callForm.direction,
      staff: callForm.staff,
      duration: callForm.duration,
      subject: callForm.subject.trim() || `${callForm.direction} Telephone Call`,
      notes: callForm.notes.trim(),
      tags: ['Call Log', callForm.direction],
    });

    setCallForm({
      direction: 'Inbound',
      staff: 'Sarah Jenkins',
      duration: '5 mins',
      subject: '',
      notes: '',
    });
    setIsAddingCall(false);

    addToast({
      type: 'success',
      title: 'Call Note Recorded',
      message: `Call log with ${client.name} has been saved with timestamp.`,
    });
  };

  const handleCreateComplaint = (e) => {
    e.preventDefault();
    if (!complaintForm.description.trim()) return;

    addComplaint(client.email, {
      clientName: client.name,
      clientPhone: client.phone,
      clientAddress: client.address,
      category: complaintForm.category,
      severity: complaintForm.severity,
      status: 'Open',
      subject: complaintForm.subject.trim() || `${complaintForm.category} Issue`,
      description: complaintForm.description.trim(),
      assignedTo: complaintForm.assignedTo,
    });

    setComplaintForm({
      category: 'Report Delivery Delay',
      severity: 'Medium',
      subject: '',
      description: '',
      assignedTo: 'Sarah Jenkins',
    });
    setIsAddingComplaint(false);

    addToast({
      type: 'warning',
      title: 'Complaint Formally Logged',
      message: `Complaint ticket registered for ${client.name}. Assigned to ${complaintForm.assignedTo}.`,
    });
  };

  const handleResolveComplaint = (complaintId) => {
    if (!resolutionText.trim()) return;

    updateComplaint(client.email, complaintId, {
      status: 'Resolved',
      resolutionNotes: resolutionText.trim(),
    });

    setResolvingComplaintId(null);
    setResolutionText('');

    addToast({
      type: 'success',
      title: 'Complaint Resolved',
      message: `Complaint ticket ${complaintId} marked as Resolved.`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header with Client Info */}
        <div className="bg-gradient-to-r from-[#0B1F4D] to-[#1E3A8A] text-white p-5 sm:p-6 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white font-extrabold text-lg border border-white/20 shrink-0 shadow-inner">
                {client.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-xl font-bold tracking-tight">{client.name}</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 text-white backdrop-blur-sm border border-white/20">
                    {client.clientType || 'Residential Client'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {client.status || 'Active Client'}
                  </span>
                </div>

                {/* Contact metadata */}
                <div className="flex items-center gap-4 text-xs text-slate-200 mt-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-300" />
                    <span className="font-mono">{client.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-300" />
                    <span>{client.phone}</span>
                  </div>
                  {client.address && (
                    <div className="flex items-center gap-1.5 truncate max-w-xs">
                      <MapPin className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                      <span className="truncate">{client.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-6 border-b border-white/15">
            <button
              onClick={() => setActiveTab('calls')}
              className={`pb-3 px-3.5 text-xs font-bold transition-all relative cursor-pointer flex items-center gap-2 ${
                activeTab === 'calls'
                  ? 'text-white border-b-2 border-amber-400'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <PhoneCall className="w-4 h-4 text-blue-300" />
              <span>Call &amp; Communication Notes</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/20 text-white font-bold">
                {calls.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('complaints')}
              className={`pb-3 px-3.5 text-xs font-bold transition-all relative cursor-pointer flex items-center gap-2 ${
                activeTab === 'complaints'
                  ? 'text-white border-b-2 border-rose-400'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-amber-300" />
              <span>Complaints Register</span>
              {openComplaintsCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-rose-500 text-white font-bold animate-pulse">
                  {openComplaintsCount} Active
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/20 text-white font-bold">
                  {complaints.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-3 px-3.5 text-xs font-bold transition-all relative cursor-pointer flex items-center gap-2 ${
                activeTab === 'overview'
                  ? 'text-white border-b-2 border-emerald-400'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Building className="w-4 h-4 text-emerald-300" />
              <span>Overview &amp; Surveys</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* TAB 1: CALL & COMMUNICATION NOTES */}
          {activeTab === 'calls' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-[#0B1F4D] flex items-center gap-2">
                    <PhoneCall className="w-4 h-4 text-[#2563EB]" />
                    Call &amp; Telephone Discussion History
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Chronological record of all inbound/outbound client calls, timestamps, and staff discussion notes.
                  </p>
                </div>

                <button
                  onClick={() => setIsAddingCall(!isAddingCall)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddingCall ? 'Cancel Note' : 'Log Call Note'}</span>
                </button>
              </div>

              {/* Form to log new call note */}
              {isAddingCall && (
                <form
                  onSubmit={handleCreateCall}
                  className="p-4 sm:p-5 bg-blue-50/60 rounded-2xl border border-blue-200/80 space-y-3.5 animate-in fade-in slide-in-from-top-3 duration-200"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0B1F4D] uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#2563EB]" />
                      Record New Call Entry (Auto Timestamped)
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {new Date().toLocaleDateString('en-GB')} at {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Call Direction *</label>
                      <select
                        value={callForm.direction}
                        onChange={(e) => setCallForm({ ...callForm, direction: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                      >
                        <option value="Inbound">Inbound (Client called us)</option>
                        <option value="Outbound">Outbound (We phoned client)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Staff Member *</label>
                      <select
                        value={callForm.staff}
                        onChange={(e) => setCallForm({ ...callForm, staff: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                      >
                        <option value="Sarah Jenkins">Sarah Jenkins (Operations)</option>
                        <option value="Alexander Sterling">Alexander Sterling (HQ Director)</option>
                        <option value="David Thorne MRICS">David Thorne MRICS (Surveyor)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Call Duration</label>
                      <input
                        type="text"
                        placeholder="e.g. 5 mins"
                        value={callForm.duration}
                        onChange={(e) => setCallForm({ ...callForm, duration: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Subject / Reason for Call</label>
                    <input
                      type="text"
                      placeholder="e.g. Client called asking about surveyor arrival window"
                      value={callForm.subject}
                      onChange={(e) => setCallForm({ ...callForm, subject: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Call Discussion Notes &amp; Client Feedback *
                    </label>
                    <textarea
                      rows="3"
                      required
                      placeholder="Detailed record of what the client said, questions raised, instructions given, and follow-up agreed..."
                      value={callForm.notes}
                      onChange={(e) => setCallForm({ ...callForm, notes: e.target.value })}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingCall(false)}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-[#0B1F4D] text-white text-xs font-bold hover:bg-[#162E6E] shadow-xs cursor-pointer"
                    >
                      Save Call Note
                    </button>
                  </div>
                </form>
              )}

              {/* Call history list */}
              {calls.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/80">
                  <PhoneCall className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-bold text-slate-700">No telephone call notes logged yet</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Click &quot;Log Call Note&quot; above to record an inbound or outbound call with {client.name}.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {calls.map((call) => (
                    <div
                      key={call.id}
                      className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              call.direction === 'Inbound'
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                            }`}
                          >
                            {call.direction === 'Inbound' ? (
                              <PhoneIncoming className="w-3 h-3 text-blue-600" />
                            ) : (
                              <PhoneOutgoing className="w-3 h-3 text-indigo-600" />
                            )}
                            {call.direction} Call
                          </span>

                          <span className="text-xs font-bold text-slate-900">{call.subject}</span>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                          <span className="flex items-center gap-1 font-semibold text-slate-700">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {call.timestamp}
                          </span>
                          <span>Duration: {call.duration}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/80 p-3 rounded-xl border border-slate-200/60">
                        {call.notes}
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span>
                          Logged by: <strong className="text-slate-600">{call.staff}</strong>
                        </span>
                        {call.tags && (
                          <div className="flex items-center gap-1.5">
                            {call.tags.map((t, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DEDICATED COMPLAINTS REGISTER */}
          {activeTab === 'complaints' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-rose-950 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    Dedicated Client Complaints &amp; Escalations Log
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Formal record of client grievances, delay disputes, surveyor conduct, and resolution outcomes.
                  </p>
                </div>

                <button
                  onClick={() => setIsAddingComplaint(!isAddingComplaint)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddingComplaint ? 'Cancel Complaint' : 'Log New Complaint'}</span>
                </button>
              </div>

              {/* Form to log complaint */}
              {isAddingComplaint && (
                <form
                  onSubmit={handleCreateComplaint}
                  className="p-4 sm:p-5 bg-rose-50/70 rounded-2xl border border-rose-200 space-y-3.5 animate-in fade-in slide-in-from-top-3 duration-200"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      Register Formal Customer Complaint
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {new Date().toLocaleDateString('en-GB')} at {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Complaint Category *
                      </label>
                      <select
                        value={complaintForm.category}
                        onChange={(e) => setComplaintForm({ ...complaintForm, category: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                      >
                        <option value="Report Delivery Delay">Report Delivery Delay</option>
                        <option value="Valuation Discrepancy">Valuation Discrepancy</option>
                        <option value="Surveyor Punctuality / Conduct">Surveyor Punctuality / Conduct</option>
                        <option value="Booking Reschedule">Booking Reschedule</option>
                        <option value="Quote Pricing Query">Quote Pricing Query</option>
                        <option value="Access & Key Problem">Access &amp; Key Problem</option>
                        <option value="General Dissatisfaction">General Dissatisfaction</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Severity Level *</label>
                      <select
                        value={complaintForm.severity}
                        onChange={(e) => setComplaintForm({ ...complaintForm, severity: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                      >
                        <option value="Low">Low (Informational query)</option>
                        <option value="Medium">Medium (Discontent / Delay)</option>
                        <option value="High">High (Threatening cancellation / legal)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Assigned Handler *</label>
                      <select
                        value={complaintForm.assignedTo}
                        onChange={(e) => setComplaintForm({ ...complaintForm, assignedTo: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                      >
                        <option value="Sarah Jenkins">Sarah Jenkins (Operations Lead)</option>
                        <option value="Alexander Sterling">Alexander Sterling (Managing Director)</option>
                        <option value="David Thorne MRICS">David Thorne MRICS (Head Surveyor)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Complaint Summary</label>
                    <input
                      type="text"
                      placeholder="Brief headline e.g. Inspection slot moved without 24hr prior notice"
                      value={complaintForm.subject}
                      onChange={(e) => setComplaintForm({ ...complaintForm, subject: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Full Complaint Details (What the client said) *
                    </label>
                    <textarea
                      rows="3"
                      required
                      placeholder="State exact grievances raised by the customer, time issues, or report accuracy disputes..."
                      value={complaintForm.description}
                      onChange={(e) => setComplaintForm({ ...complaintForm, description: e.target.value })}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingComplaint(false)}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-xs cursor-pointer"
                    >
                      Register Complaint
                    </button>
                  </div>
                </form>
              )}

              {/* Complaints List */}
              {complaints.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/80">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-800">Clean Service Record</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    No customer complaints or service disputes have been registered for {client.name}.
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {complaints.map((c) => (
                    <div
                      key={c.id}
                      className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3 hover:border-slate-300 transition-all"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-[#0B1F4D] bg-slate-100 px-2.5 py-1 rounded-lg">
                            {c.id}
                          </span>

                          <span className="text-xs font-bold text-slate-900">{c.category}</span>

                          {/* Severity badge */}
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              c.severity === 'High'
                                ? 'bg-rose-100 text-rose-800'
                                : c.severity === 'Medium'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {c.severity} Severity
                          </span>
                        </div>

                        {/* Status badge */}
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 ${
                              c.status === 'Resolved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : c.status === 'Under Investigation'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {c.status === 'Resolved' && <Check className="w-3 h-3 text-emerald-600" />}
                            {c.status}
                          </span>
                        </div>
                      </div>

                      {/* Complaint narrative */}
                      <div className="bg-rose-50/40 p-3 rounded-xl border border-rose-100 text-xs text-slate-800 leading-relaxed">
                        <div className="text-[11px] font-bold text-rose-900 mb-1">{c.subject}</div>
                        <p>{c.description}</p>
                      </div>

                      {/* Resolution details if resolved */}
                      {c.status === 'Resolved' && c.resolutionNotes && (
                        <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200/80 text-xs space-y-1">
                          <div className="flex items-center justify-between font-bold text-emerald-900 text-[11px]">
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Resolved Resolution Outcome:
                            </span>
                            <span className="font-mono text-slate-500 font-normal">{c.resolvedAt}</span>
                          </div>
                          <p className="text-slate-700 leading-relaxed">{c.resolutionNotes}</p>
                        </div>
                      )}

                      {/* Action to resolve if open */}
                      {c.status !== 'Resolved' && (
                        <div className="pt-1">
                          {resolvingComplaintId === c.id ? (
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                              <label className="block text-[11px] font-bold text-slate-700">
                                Enter Resolution Summary &amp; Corrective Action Taken *
                              </label>
                              <textarea
                                rows="2"
                                placeholder="Explain how the grievance was resolved with the client (e.g. issued revised report, discount extended, apology call made)..."
                                value={resolutionText}
                                onChange={(e) => setResolutionText(e.target.value)}
                                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs"
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setResolvingComplaintId(null)}
                                  className="px-3 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleResolveComplaint(c.id)}
                                  className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 cursor-pointer"
                                >
                                  Confirm Resolution
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setResolvingComplaintId(c.id);
                                setResolutionText('');
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-bold transition-colors cursor-pointer border border-slate-200/80"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Mark as Resolved</span>
                            </button>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                        <span>
                          Logged on: <strong className="text-slate-600 font-mono">{c.loggedAt}</strong>
                        </span>
                        <span>
                          Assigned to: <strong className="text-slate-600">{c.assignedTo}</strong>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: OVERVIEW & SURVEYS */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Account Classification
                  </span>
                  <div className="text-sm font-bold text-[#0B1F4D] mt-1">{client.clientType}</div>
                  <div className="text-xs text-slate-500 mt-0.5">UK Residential Registry</div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Total Fees Settled
                  </span>
                  <div className="text-sm font-extrabold text-emerald-700 font-mono mt-1">
                    {client.totalSpent}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">Paid via Stripe Gateway</div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Active Survey Jobs
                  </span>
                  <div className="text-sm font-bold text-[#2563EB] font-mono mt-1">
                    {client.activeJobs?.join(', ') || 'None in progress'}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">RICS Standard SLA</div>
                </div>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Primary Inspected Property Address
                </span>
                <div className="text-xs font-bold text-[#0B1F4D] flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-slate-400" />
                  {client.address}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-400 font-mono">
            Client Ref: {client.id} • {calls.length} Call Entries • {complaints.length} Complaints Logged
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
