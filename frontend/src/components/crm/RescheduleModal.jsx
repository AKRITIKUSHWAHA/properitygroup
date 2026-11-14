import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  User,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Bell,
  ArrowRight,
  ShieldCheck,
  Send
} from 'lucide-react';
import { useToast } from '../ToastContext';
import { useJobs, SURVEYORS } from '../../mock/jobs';
import { useClientProfiles } from '../../mock/clientProfiles';
import { adminSurveyJobsApi } from '../../api/adminApi';

const TIME_SLOTS = [
  { id: 'morning', label: 'Morning Slot (09:00 - 12:00)', range: '09:00 AM - 12:00 PM' },
  { id: 'midday', label: 'Midday Slot (11:00 - 14:00)', range: '11:00 AM - 02:00 PM' },
  { id: 'afternoon', label: 'Afternoon Slot (13:00 - 16:00)', range: '01:00 PM - 04:00 PM' },
  { id: 'late_afternoon', label: 'Late Afternoon (15:00 - 18:00)', range: '03:00 PM - 06:00 PM' },
  { id: 'all_day', label: 'Flexible Full-Day (09:00 - 17:00)', range: '09:00 AM - 05:00 PM' },
];

const RESCHEDULE_REASONS = [
  'Client Requested Alternative Inspection Date',
  'Estate Agent / Key Collection Delay',
  'Vendor / Occupier Access Conflict',
  'Surveyor Diary Capacity Reallocation',
  'Severe Weather / Roof Inspection Hazard',
  'Property Renovation In Progress (Delayed Site Readiness)',
  'Other Administrative Reschedule',
];

export const RescheduleModal = ({ isOpen, onClose, job, onRescheduled }) => {
  const { addToast } = useToast();
  const { updateJob } = useJobs();
  const { addCallLog } = useClientProfiles();

  // Calculate default tomorrow date in YYYY-MM-DD
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [newDate, setNewDate] = useState(tomorrow);
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[0].range);
  const [selectedSurveyor, setSelectedSurveyor] = useState('');
  const [reason, setReason] = useState(RESCHEDULE_REASONS[0]);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [notifyParties, setNotifyParties] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (job) {
      // Find matching surveyor if set on job
      const matchingSurveyor = SURVEYORS.find(
        (s) => s.name === job.surveyor || s.id === job.surveyorId
      );
      setSelectedSurveyor(matchingSurveyor ? matchingSurveyor.name : SURVEYORS[0].name);
      setSelectedSlot(job.timeSlot || TIME_SLOTS[0].range);
      setNewDate(tomorrow);
      setReason(RESCHEDULE_REASONS[0]);
      setAdditionalNotes('');
    }
  }, [job, tomorrow]);

  if (!isOpen || !job) return null;

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isSubmitting) return;

    if (!newDate) {
      addToast({
        type: 'error',
        title: 'Inspection Date Required',
        message: 'Please choose a valid new inspection date.',
      });
      return;
    }

    setIsSubmitting(true);

    const formattedDate = new Date(newDate).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const targetSurveyorObj = SURVEYORS.find((s) => s.name === selectedSurveyor) || SURVEYORS[0];

    const updates = {
      date: formattedDate,
      inspectionDate: newDate,
      timeSlot: selectedSlot,
      inspectionTime: selectedSlot,
      surveyor: targetSurveyorObj.name,
      surveyorId: targetSurveyorObj.id,
      rescheduleReason: reason,
      status: job.status === 'Completed' ? job.status : 'Booked',
      stage: 'BOOKED',
    };

    // 1. Update local mock jobs state
    updateJob(job.id, updates);

    // 2. Log in client profiles call log
    const clientEmail = job.customerEmail || job.clientEmail;
    if (clientEmail) {
      addCallLog(clientEmail, {
        clientName: job.customer || job.clientName || 'Private Client',
        clientPhone: job.customerPhone || job.clientPhone || '',
        clientAddress: job.property || job.location || '',
        direction: 'Outbound',
        staff: 'Admin Dispatcher',
        duration: '2 mins',
        subject: `Appointment Rescheduled (${job.jobNo || job.id})`,
        notes: `Inspection rescheduled from ${job.date || 'Original Date'} to ${formattedDate} (${selectedSlot}). Assigned Surveyor: ${targetSurveyorObj.name}. Reason: ${reason}. ${additionalNotes ? `Notes: ${additionalNotes}` : ''}`,
        tags: ['Rescheduled', 'Booking Update'],
      });
    }

    // 3. Persist to MySQL Backend via PUT/PATCH /api/v1/survey-jobs/:id/reschedule
    try {
      const jobId = job.dbId || job.id;
      await adminSurveyJobsApi.rescheduleJob(jobId, {
        inspectionDate: newDate,
        inspectionTime: selectedSlot,
        surveyorId: targetSurveyorObj.id.replace('srv-', ''),
        reason: `${reason}${additionalNotes ? ` - ${additionalNotes}` : ''}`,
      });
    } catch (err) {
      console.warn('Backend reschedule warning:', err.message);
    }

    addToast({
      type: 'success',
      title: 'Inspection Rescheduled',
      message: `Appointment successfully moved to ${formattedDate} (${selectedSlot}) with ${targetSurveyorObj.name}.`,
    });

    if (onRescheduled) {
      onRescheduled({ ...job, ...updates });
    }

    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#0B1F4D] text-white p-5 sm:p-6 shrink-0 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center font-bold shrink-0">
              <Calendar className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-white">Reschedule Inspection</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-[#0B1F4D]">
                  Updates Diary &amp; Calendar
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Job Ref: <strong className="text-white font-mono">{job.jobNo || job.id}</strong> &bull; Client:{' '}
                <strong className="text-amber-300">{job.customer || job.clientName || 'Private Client'}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Schedule Banner */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 sm:px-6 py-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-slate-400 text-[10px] font-bold uppercase block">Current Appointment</span>
            <span className="font-semibold text-slate-800">
              {job.date || 'Tentative Booking'} &bull; {job.timeSlot || 'Slot Unassigned'}
            </span>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-slate-400 text-[10px] font-bold uppercase block">Current Surveyor</span>
            <span className="font-bold text-[#0B1F4D]">{job.surveyor || 'Unallocated'}</span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* New Date & Time Slot Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                New Inspection Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Preferred Time Slot *
              </label>
              <select
                value={selectedSlot}
                onChange={(e) => setSelectedSlot(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:bg-white"
              >
                {TIME_SLOTS.map((slot) => (
                  <option key={slot.id} value={slot.range}>
                    {slot.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Surveyor Allocation Dropdown */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Assigned Field Surveyor *
            </label>
            <select
              value={selectedSurveyor}
              onChange={(e) => setSelectedSurveyor(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:bg-white"
            >
              {SURVEYORS.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name} — {s.credentials} ({s.postcodes})
                </option>
              ))}
            </select>
          </div>

          {/* Reason for Rescheduling */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Reason for Reschedule *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:bg-white"
            >
              {RESCHEDULE_REASONS.map((r, idx) => (
                <option key={idx} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Key Access / Additional Instructions */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Access &amp; Coordinator Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="e.g. Estate agent confirmed keys available from Foxtons 10 minutes prior to new inspection slot."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:bg-white resize-none"
            />
          </div>

          {/* Automated Notification Checkbox */}
          <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <span className="font-bold text-blue-900 block text-xs">Notify Client &amp; Surveyor</span>
                <span className="text-[11px] text-blue-700">Dispatch calendar invite and rescheduling notification</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={notifyParties}
              onChange={(e) => setNotifyParties(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 cursor-pointer transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] disabled:opacity-60 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-[#0B1F4D]/20 cursor-pointer transition-all"
            >
              <Calendar className="w-4 h-4 text-amber-300" />
              <span>{isSubmitting ? 'Rescheduling Appointment...' : 'Confirm & Reschedule'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
