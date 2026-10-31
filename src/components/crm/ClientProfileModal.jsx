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
  Copy,
  Receipt,
  Briefcase,
  ChevronRight,
  ShieldCheck,
  Tag,
  Filter,
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
  const [searchQuery, setSearchQuery] = useState('');

  // Keep activeTab in sync when initialTab changes on open
  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  // Form states for new Call Note
  const [callForm, setCallForm] = useState({
    direction: 'Inbound',
    staff: 'Alexander Sterling',
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
    assignedTo: 'Alexander Sterling',
  });

  if (!isOpen) return null;

  // Retrieve client profile or fallback
  const client = (clientEmail && profiles[clientEmail]) || {
    id: 'CLT-1001',
    name: 'Emma Watson',
    email: clientEmail || 'customer@demo.com',
    phone: '+44 7700 900147',
    address: '14 Mayfair Gate, Mayfair, London W1K 2PB',
    clientType: 'First-Time Residential Buyer',
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

  const handleCopy = (text, label) => {
    navigator.clipboard?.writeText(text);
    addToast({
      type: 'info',
      title: 'Copied to Clipboard',
      message: `${label} copied: ${text}`,
    });
  };

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
      staff: 'Alexander Sterling',
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
      assignedTo: 'Alexander Sterling',
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

  const filteredCalls = calls.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.subject?.toLowerCase().includes(q) ||
      c.notes?.toLowerCase().includes(q) ||
      c.staff?.toLowerCase().includes(q)
    );
  });

  const getInitials = (name) => {
    if (!name) return 'CL';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        
        {/* ================= HEADER SECTION ================= */}
        <div className="bg-[#0B1F4D] text-white p-5 sm:p-6 shrink-0 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Bar: Avatar, Names, Badges, and Close Button */}
          <div className="flex items-start justify-between gap-4 relative z-10">
            <div className="flex items-start gap-4">
              {/* Client Avatar with gradient and ring */}
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md ring-2 ring-white/20 shrink-0">
                {getInitials(client.name)}
              </div>

              {/* Client Name & High-level Badges */}
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-xl font-bold tracking-tight text-white leading-tight">
                    {client.name}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/15 text-slate-100 border border-white/10">
                    {client.clientType || 'Residential Client'}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {client.status || 'Active Client'}
                  </span>
                </div>

                {/* Contact Pill Row */}
                <div className="flex items-center gap-2.5 pt-1.5 text-xs text-slate-200 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleCopy(client.email, 'Email')}
                    title="Click to copy email"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-colors cursor-pointer text-[11px]"
                  >
                    <Mail className="w-3.5 h-3.5 text-blue-300" />
                    <span className="font-mono">{client.email}</span>
                    <Copy className="w-2.5 h-2.5 text-slate-400 opacity-70" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopy(client.phone, 'Phone number')}
                    title="Click to copy phone"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-colors cursor-pointer text-[11px]"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-300" />
                    <span>{client.phone}</span>
                    <Copy className="w-2.5 h-2.5 text-slate-400 opacity-70" />
                  </button>

                  {client.address && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 text-slate-200 text-[11px] max-w-xs truncate">
                      <MapPin className="w-3.5 h-3.5 text-rose-300 shrink-0" />
                      <span className="truncate">{client.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Close Modal Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-all cursor-pointer shrink-0"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================= NAVIGATION TABS BAR ================= */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 sm:px-6 shrink-0 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Tab 1: Calls */}
            <button
              onClick={() => setActiveTab('calls')}
              className={`py-3.5 px-3 sm:px-4 text-xs font-bold transition-all relative cursor-pointer flex items-center gap-2 border-b-2 ${
                activeTab === 'calls'
                  ? 'border-[#2563EB] text-[#2563EB]'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <PhoneCall className={`w-4 h-4 ${activeTab === 'calls' ? 'text-[#2563EB]' : 'text-slate-400'}`} />
              <span>Call &amp; Communication History</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  activeTab === 'calls'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {calls.length}
              </span>
            </button>

            {/* Tab 2: Complaints */}
            <button
              onClick={() => setActiveTab('complaints')}
              className={`py-3.5 px-3 sm:px-4 text-xs font-bold transition-all relative cursor-pointer flex items-center gap-2 border-b-2 ${
                activeTab === 'complaints'
                  ? 'border-rose-600 text-rose-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <AlertTriangle
                className={`w-4 h-4 ${
                  activeTab === 'complaints' ? 'text-rose-600' : 'text-slate-400'
                }`}
              />
              <span>Complaints Register</span>
              {openComplaintsCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500 text-white animate-pulse">
                  {openComplaintsCount} Active
                </span>
              ) : (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    activeTab === 'complaints'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {complaints.length}
                </span>
              )}
            </button>

            {/* Tab 3: Overview */}
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3.5 px-3 sm:px-4 text-xs font-bold transition-all relative cursor-pointer flex items-center gap-2 border-b-2 ${
                activeTab === 'overview'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building
                className={`w-4 h-4 ${
                  activeTab === 'overview' ? 'text-emerald-600' : 'text-slate-400'
                }`}
              />
              <span>Overview &amp; Surveys</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center text-xs text-slate-400 font-mono">
            REF: <strong className="text-slate-700 ml-1 font-bold">{client.id}</strong>
          </div>
        </div>

        {/* ================= CONTENT BODY ================= */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-slate-50/40">
          
          {/* ================================================= */}
          {/* TAB 1: CALL & COMMUNICATION NOTES                 */}
          {/* ================================================= */}
          {activeTab === 'calls' && (
            <div className="space-y-4">
              {/* Action Toolbar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <PhoneCall className="w-4 h-4 text-[#2563EB]" />
                    Call &amp; Telephone Discussion Logs
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Chronological record of inbound client queries, outbound updates, and staff notes.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsAddingCall(!isAddingCall)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAddingCall ? 'Close Note Form' : 'Log Call Note'}</span>
                  </button>
                </div>
              </div>

              {/* Form to log new call note */}
              {isAddingCall && (
                <form
                  onSubmit={handleCreateCall}
                  className="p-5 bg-white rounded-2xl border-2 border-blue-200/90 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-3 duration-200"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-xs font-bold text-[#0B1F4D] uppercase tracking-wider flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#2563EB]" />
                      Record New Call Entry (Auto Timestamped)
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {new Date().toLocaleDateString('en-GB')} at {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Call Direction *
                      </label>
                      <select
                        value={callForm.direction}
                        onChange={(e) => setCallForm({ ...callForm, direction: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      >
                        <option value="Inbound">Inbound (Client called us)</option>
                        <option value="Outbound">Outbound (We phoned client)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Logged By Staff Member *
                      </label>
                      <select
                        value={callForm.staff}
                        onChange={(e) => setCallForm({ ...callForm, staff: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      >
                        <option value="Alexander Sterling">Alexander Sterling (Admin)</option>
                        <option value="David Thorne MRICS">David Thorne MRICS (Surveyor)</option>
                        <option value="Claire Bennet AssocRICS">Claire Bennet AssocRICS (Surveyor)</option>
                        <option value="Oliver Hughes MRICS">Oliver Hughes MRICS (Surveyor)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Call Duration
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 5 mins"
                        value={callForm.duration}
                        onChange={(e) => setCallForm({ ...callForm, duration: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Subject / Reason for Call
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Client called asking about surveyor arrival window"
                      value={callForm.subject}
                      onChange={(e) => setCallForm({ ...callForm, subject: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
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
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsAddingCall(false)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-[#0B1F4D] text-white text-xs font-bold hover:bg-[#162E6E] shadow-sm cursor-pointer"
                    >
                      Save Call Log
                    </button>
                  </div>
                </form>
              )}

              {/* Call history list */}
              {calls.length === 0 ? (
                <div className="p-10 text-center bg-white rounded-2xl border border-slate-200/90">
                  <PhoneCall className="w-10 h-10 text-slate-300 mx-auto mb-2.5" />
                  <p className="text-sm font-bold text-slate-800">No telephone call notes logged yet</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Click &quot;Log Call Note&quot; above to record an inbound or outbound call with {client.name}.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {calls.map((call) => (
                    <div
                      key={call.id}
                      className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all space-y-3"
                    >
                      {/* Top Header of Call Card */}
                      <div className="flex items-center justify-between flex-wrap gap-2.5">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                              call.direction === 'Inbound'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80'
                                : 'bg-blue-50 text-blue-800 border border-blue-200/80'
                            }`}
                          >
                            {call.direction === 'Inbound' ? (
                              <PhoneIncoming className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <PhoneOutgoing className="w-3.5 h-3.5 text-blue-600" />
                            )}
                            {call.direction} Call
                          </span>

                          <span className="text-sm font-bold text-slate-900">{call.subject}</span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1.5 font-medium text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {call.timestamp}
                          </span>
                          <span className="font-medium bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
                            Duration: {call.duration}
                          </span>
                        </div>
                      </div>

                      {/* Content of Note */}
                      <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/70 text-xs text-slate-700 leading-relaxed font-normal">
                        {call.notes}
                      </div>

                      {/* Footer of Call Card */}
                      <div className="flex items-center justify-between text-xs text-slate-500 pt-1 flex-wrap gap-2">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>Logged by:</span>
                          <strong className="text-slate-800 font-semibold">{call.staff}</strong>
                        </div>

                        {call.tags && call.tags.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {call.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium border border-slate-200/60"
                              >
                                <Tag className="w-2.5 h-2.5 text-slate-400" />
                                {tag}
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

          {/* ================================================= */}
          {/* TAB 2: DEDICATED COMPLAINTS REGISTER              */}
          {/* ================================================= */}
          {activeTab === 'complaints' && (
            <div className="space-y-4">
              {/* Action Toolbar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    Dedicated Client Complaints &amp; Escalations Log
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Formal record of client grievances, delay disputes, surveyor conduct, and resolution outcomes.
                  </p>
                </div>

                <button
                  onClick={() => setIsAddingComplaint(!isAddingComplaint)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddingComplaint ? 'Close Form' : 'Log New Complaint'}</span>
                </button>
              </div>

              {/* Form to log complaint */}
              {isAddingComplaint && (
                <form
                  onSubmit={handleCreateComplaint}
                  className="p-5 bg-white rounded-2xl border-2 border-rose-200 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-3 duration-200"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      Register Formal Customer Complaint
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {new Date().toLocaleDateString('en-GB')} at {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Complaint Category *
                      </label>
                      <select
                        value={complaintForm.category}
                        onChange={(e) => setComplaintForm({ ...complaintForm, category: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/30"
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
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Severity Level *
                      </label>
                      <select
                        value={complaintForm.severity}
                        onChange={(e) => setComplaintForm({ ...complaintForm, severity: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                      >
                        <option value="Low">Low (Informational query)</option>
                        <option value="Medium">Medium (Discontent / Delay)</option>
                        <option value="High">High (Threatening cancellation / legal)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Assigned Handler *
                      </label>
                      <select
                        value={complaintForm.assignedTo}
                        onChange={(e) => setComplaintForm({ ...complaintForm, assignedTo: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                      >
                        <option value="Alexander Sterling">Alexander Sterling (Admin Lead)</option>
                        <option value="David Thorne MRICS">David Thorne MRICS (Head Surveyor)</option>
                        <option value="Claire Bennet AssocRICS">Claire Bennet AssocRICS (Surveyor)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Complaint Headline / Summary
                    </label>
                    <input
                      type="text"
                      placeholder="Brief headline e.g. Inspection slot moved without 24hr prior notice"
                      value={complaintForm.subject}
                      onChange={(e) => setComplaintForm({ ...complaintForm, subject: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/30"
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
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsAddingComplaint(false)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-sm cursor-pointer"
                    >
                      Register Complaint
                    </button>
                  </div>
                </form>
              )}

              {/* Complaints List */}
              {complaints.length === 0 ? (
                <div className="p-10 text-center bg-white rounded-2xl border border-slate-200/90">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2.5" />
                  <p className="text-sm font-bold text-slate-800">Clean Service Record</p>
                  <p className="text-xs text-slate-500 mt-1">
                    No customer complaints or service disputes have been registered for {client.name}.
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {complaints.map((c) => (
                    <div
                      key={c.id}
                      className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3 hover:border-slate-300 transition-all"
                    >
                      {/* Top Bar of Complaint Card */}
                      <div className="flex items-center justify-between flex-wrap gap-2.5">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-mono font-bold text-xs text-[#0B1F4D] bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/70">
                            {c.id}
                          </span>

                          <span className="text-sm font-bold text-slate-900">{c.category}</span>

                          {/* Severity badge */}
                          <span
                            className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                              c.severity === 'High'
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : c.severity === 'Medium'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-blue-100 text-blue-800 border border-blue-200'
                            }`}
                          >
                            {c.severity} Severity
                          </span>
                        </div>

                        {/* Status badge */}
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                              c.status === 'Resolved'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : c.status === 'Under Investigation'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-rose-50 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {c.status === 'Resolved' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                            {c.status}
                          </span>
                        </div>
                      </div>

                      {/* Complaint narrative */}
                      <div className="bg-rose-50/40 p-3.5 rounded-xl border border-rose-100/80 text-xs text-slate-800 leading-relaxed">
                        <div className="text-xs font-bold text-rose-950 mb-1">{c.subject}</div>
                        <p className="text-slate-700">{c.description}</p>
                      </div>

                      {/* Resolution details if resolved */}
                      {c.status === 'Resolved' && c.resolutionNotes && (
                        <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-200/70 text-xs space-y-1.5">
                          <div className="flex items-center justify-between font-bold text-emerald-950 text-xs">
                            <span className="flex items-center gap-1.5">
                              <ShieldCheck className="w-4 h-4 text-emerald-600" />
                              Official Resolution Outcome:
                            </span>
                            <span className="font-mono text-slate-500 font-normal text-[11px]">{c.resolvedAt}</span>
                          </div>
                          <p className="text-slate-700 leading-relaxed">{c.resolutionNotes}</p>
                        </div>
                      )}

                      {/* Action to resolve if open */}
                      {c.status !== 'Resolved' && (
                        <div className="pt-1">
                          {resolvingComplaintId === c.id ? (
                            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                              <label className="block text-xs font-bold text-slate-800">
                                Enter Resolution Summary &amp; Corrective Action Taken *
                              </label>
                              <textarea
                                rows="2"
                                placeholder="Explain how the grievance was resolved with the client (e.g. issued revised report, discount extended, apology call made)..."
                                value={resolutionText}
                                onChange={(e) => setResolutionText(e.target.value)}
                                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setResolvingComplaintId(null)}
                                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleResolveComplaint(c.id)}
                                  className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 cursor-pointer shadow-xs"
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
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-bold transition-colors cursor-pointer border border-slate-200/80"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Mark as Resolved</span>
                            </button>
                          )}
                        </div>
                      )}

                      {/* Footer Info */}
                      <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
                        <span>
                          Logged on: <strong className="text-slate-700 font-mono">{c.loggedAt}</strong>
                        </span>
                        <span>
                          Assigned to: <strong className="text-slate-700">{c.assignedTo}</strong>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================================================= */}
          {/* TAB 3: OVERVIEW & SURVEYS                         */}
          {/* ================================================= */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* 3 Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Account Classification</span>
                    <User className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="text-sm font-bold text-[#0B1F4D] mt-1">{client.clientType}</div>
                  <div className="text-xs text-slate-500 mt-0.5">UK Residential Registry</div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Total Fees Settled</span>
                    <Receipt className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-sm font-extrabold text-emerald-700 font-mono mt-1">
                    {client.totalSpent}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">Paid via Stripe Gateway</div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Active Survey Jobs</span>
                    <Briefcase className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div className="text-sm font-bold text-[#2563EB] font-mono mt-1">
                    {client.activeJobs?.join(', ') || 'None in progress'}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">RICS Standard SLA</div>
                </div>
              </div>

              {/* Inspected Property Card */}
              <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Primary Inspected Property Address
                  </span>
                  <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Inspection Ready
                  </span>
                </div>
                <div className="text-sm font-bold text-[#0B1F4D] flex items-center gap-2 pt-1">
                  <Building className="w-4 h-4 text-blue-600" />
                  {client.address}
                </div>
                <p className="text-xs text-slate-500">
                  Estate Agent has confirmed key access. Surveyor allocated for inspection window.
                </p>
              </div>

              {/* Client Summary Information */}
              <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Client Communication Summary
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between">
                    <span className="text-slate-600">Total Phone Calls Logged:</span>
                    <strong className="text-slate-900 font-mono font-bold">{calls.length} entries</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between">
                    <span className="text-slate-600">Active Complaints:</span>
                    <strong className={`font-mono font-bold ${openComplaintsCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {openComplaintsCount} active ({complaints.length} total)
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ================= FOOTER SECTION ================= */}
        <div className="p-4 sm:px-6 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-mono bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 font-semibold">
              {client.id}
            </span>
            <span className="hidden sm:inline text-slate-400">•</span>
            <span className="hidden sm:inline">
              {calls.length} Call {calls.length === 1 ? 'Entry' : 'Entries'}
            </span>
            <span className="hidden sm:inline text-slate-400">•</span>
            <span className="hidden sm:inline">
              {complaints.length} {complaints.length === 1 ? 'Complaint' : 'Complaints'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Close Profile
          </button>
        </div>

      </div>
    </div>
  );
};
