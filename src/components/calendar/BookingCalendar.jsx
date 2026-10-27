import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  User,
  Plus,
  Lock,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldAlert,
  FileCheck2,
  CreditCard,
} from 'lucide-react';
import { SURVEYORS, INITIAL_JOBS } from '../../mock/jobs';
import { NewBookingModal } from './NewBookingModal';
import { Modal } from '../common/Modal';
import { useToast } from '../ToastContext';

export const BookingCalendar = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();

  // State
  const [viewMode, setViewMode] = useState('week'); // 'day' | 'week' | 'month'
  const [selectedDate, setSelectedDate] = useState('27/10/2026');
  const [selectedSurveyorIds, setSelectedSurveyorIds] = useState(
    SURVEYORS.map((s) => s.id)
  );
  const [jobs, setJobs] = useState(INITIAL_JOBS);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Toggle surveyor checkbox
  const handleToggleSurveyor = (id) => {
    setSelectedSurveyorIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllSurveyors = () => {
    if (selectedSurveyorIds.length === SURVEYORS.length) {
      setSelectedSurveyorIds([]);
    } else {
      setSelectedSurveyorIds(SURVEYORS.map((s) => s.id));
    }
  };

  // Filter jobs by selected surveyors
  const visibleJobs = useMemo(() => {
    return jobs.filter((j) => selectedSurveyorIds.includes(j.surveyorId));
  }, [jobs, selectedSurveyorIds]);

  // Handle new booking
  const handleAddBooking = (newJob) => {
    setJobs((prev) => [newJob, ...prev]);
    addToast({
      type: newJob.canBook ? 'success' : 'info',
      title: 'Booking Added',
      message: newJob.canBook
        ? `Booking confirmed for ${newJob.customer} with ${newJob.surveyor}.`
        : `Booking slot held for ${newJob.customer}. Waiting for terms and payment clearance.`,
    });
  };

  // Quick unlock: allow user to validate terms or payment directly from modal
  const handleQuickUnlock = (jobId, type) => {
    setJobs((prev) =>
      prev.map((j) => {
        if (j.id !== jobId) return j;
        const newTerms = type === 'terms' ? 'Signed' : j.termsStatus;
        const newPayment = type === 'payment' ? 'Paid' : j.paymentStatus;
        const canBookNow = newTerms === 'Signed' && newPayment === 'Paid';
        return {
          ...j,
          termsStatus: newTerms,
          paymentStatus: newPayment,
          canBook: canBookNow,
          status: canBookNow ? 'Scheduled' : j.status,
        };
      })
    );

    setSelectedEvent((prev) => {
      if (!prev || prev.id !== jobId) return prev;
      const newTerms = type === 'terms' ? 'Signed' : prev.termsStatus;
      const newPayment = type === 'payment' ? 'Paid' : prev.paymentStatus;
      return {
        ...prev,
        termsStatus: newTerms,
        paymentStatus: newPayment,
        canBook: newTerms === 'Signed' && newPayment === 'Paid',
      };
    });

    addToast({
      type: 'success',
      title: type === 'terms' ? 'Terms Validated' : 'Payment Cleared',
      message: `Booking ${jobId} updated successfully.`,
    });
  };

  // Week days definition for 26 Oct - 01 Nov 2026
  const weekDays = [
    { name: 'Monday', date: '26/10/2026', shortDate: '26 Oct' },
    { name: 'Tuesday (Today)', date: '27/10/2026', shortDate: '27 Oct', isToday: true },
    { name: 'Wednesday', date: '28/10/2026', shortDate: '28 Oct' },
    { name: 'Thursday', date: '29/10/2026', shortDate: '29 Oct' },
    { name: 'Friday', date: '30/10/2026', shortDate: '30 Oct' },
    { name: 'Saturday', date: '31/10/2026', shortDate: '31 Oct' },
    { name: 'Sunday', date: '01/11/2026', shortDate: '01 Nov' },
  ];

  // Month days simulation (31 days of October)
  const monthDays = Array.from({ length: 31 }, (_, i) => {
    const dayNum = i + 1;
    const dateStr = `${String(dayNum).padStart(2, '0')}/10/2026`;
    return { dayNum, dateStr };
  });

  return (
    <div className="space-y-6">
      {/* Top Controller Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Day/Week/Month Toggle + Date Navigation */}
        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Toggle: Day / Week / Month */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
            {['day', 'week', 'month'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  viewMode === mode
                    ? 'bg-[#0B1F4D] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Date controls */}
          <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
            <button
              onClick={() => alert('Previous range')}
              className="p-2 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3.5 py-1.5 text-xs font-bold text-slate-800 font-mono">
              {viewMode === 'day'
                ? 'Tuesday, 27 October 2026'
                : viewMode === 'week'
                ? '26 Oct – 01 Nov 2026 (Week 44)'
                : 'October 2026'}
            </span>
            <button
              onClick={() => alert('Next range')}
              className="p-2 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: + New Booking CTA */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#0B1F4D]/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Booking</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Surveyor Filters + Right Calendar View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Surveyor filter with checkboxes */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Surveyor Filter
              </span>
              <button
                onClick={handleSelectAllSurveyors}
                className="text-[11px] font-bold text-[#2563EB] hover:underline"
              >
                {selectedSurveyorIds.length === SURVEYORS.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="mt-3.5 space-y-2.5">
              {SURVEYORS.map((surveyor) => {
                const isSelected = selectedSurveyorIds.includes(surveyor.id);
                return (
                  <label
                    key={surveyor.id}
                    className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'bg-slate-50/80 border-slate-200'
                        : 'opacity-50 border-transparent hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSurveyor(surveyor.id)}
                      className="w-4 h-4 mt-0.5 rounded text-[#2563EB] focus:ring-[#2563EB]"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-800 truncate">
                          {surveyor.name}
                        </span>
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: surveyor.color }}
                        />
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {surveyor.credentials}
                      </div>
                      <div className="text-[10px] font-medium text-slate-500 mt-0.5">
                        Coverage: <span className="font-semibold text-slate-700">{surveyor.postcodes}</span>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* RICS Compliance Rules Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0B1F4D] to-[#162E6E] text-white space-y-2 shadow-sm">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-200">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Inspection Gating Rules</span>
            </div>
            <p className="text-[11px] text-slate-200 leading-snug">
              Per UK RICS mandates, slots remain in <strong>"Waiting for terms and payment"</strong> mode and cannot be dispatched to field surveyors until both contract terms are digitally signed and advance fee is settled.
            </p>
          </div>
        </div>

        {/* Right Column: Calendar Views (Day, Week, Month) */}
        <div className="lg:col-span-3">
          {/* WEEK VIEW */}
          {viewMode === 'week' && (
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              {weekDays.map((day) => {
                const dayJobs = visibleJobs.filter((j) => j.date === day.date);

                return (
                  <div
                    key={day.date}
                    className={`bg-white rounded-2xl border shadow-xs p-3 flex flex-col min-h-[460px] ${
                      day.isToday ? 'border-[#2563EB] ring-2 ring-[#2563EB]/15' : 'border-slate-200/90'
                    }`}
                  >
                    <div className="pb-2.5 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <div
                          className={`text-xs font-bold ${
                            day.isToday ? 'text-[#2563EB]' : 'text-[#0B1F4D]'
                          }`}
                        >
                          {day.shortDate}
                        </div>
                        <div className="text-[10px] font-medium text-slate-400">
                          {day.name.split(' ')[0]}
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {dayJobs.length}
                      </span>
                    </div>

                    <div className="mt-2.5 space-y-2.5 flex-1 overflow-y-auto">
                      {dayJobs.map((job) => {
                        const surveyorObj = SURVEYORS.find((s) => s.id === job.surveyorId);
                        const isWaiting = !job.canBook || job.termsStatus !== 'Signed' || job.paymentStatus !== 'Paid';

                        return (
                          <div
                            key={job.id}
                            onClick={() => setSelectedEvent(job)}
                            style={{
                              borderLeftColor: surveyorObj ? surveyorObj.color : '#2563EB',
                            }}
                            className={`p-2.5 rounded-xl border border-l-4 text-left transition-all cursor-pointer relative overflow-hidden group shadow-2xs ${
                              isWaiting
                                ? 'bg-amber-50/60 border-amber-300 opacity-90 hover:opacity-100'
                                : 'bg-slate-50/80 border-slate-200 hover:border-slate-300 hover:shadow-xs'
                            }`}
                          >
                            {/* Disabled / Waiting for terms badge */}
                            {isWaiting && (
                              <div className="mb-1.5">
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-amber-200/80 text-amber-900 border border-amber-300">
                                  <Lock className="w-2.5 h-2.5 shrink-0" />
                                  Waiting for terms & payment
                                </span>
                              </div>
                            )}

                            <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-slate-500 mb-0.5">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {job.timeSlot}
                            </div>

                            <div className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                              {job.property}
                            </div>

                            <div className="text-[10px] text-slate-500 mt-1 truncate">
                              {job.surveyType}
                            </div>

                            <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                              <span className="font-semibold text-slate-700 truncate">
                                {job.surveyor.split(' ')[0]} {job.surveyor.split(' ')[1]}
                              </span>
                              <span
                                className={`font-bold ${
                                  job.status === 'Completed'
                                    ? 'text-emerald-700'
                                    : 'text-[#2563EB]'
                                }`}
                              >
                                {job.status}
                              </span>
                            </div>
                          </div>
                        );
                      })}

                      {dayJobs.length === 0 && (
                        <div className="h-full flex items-center justify-center text-center p-4 text-[11px] text-slate-300 italic">
                          No inspections
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* DAY VIEW */}
          {viewMode === 'day' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h4 className="text-sm font-bold text-[#0B1F4D]">
                    Tuesday, 27 October 2026 – Field Schedule
                  </h4>
                  <p className="text-xs text-slate-500">
                    Inspections for all selected surveyors.
                  </p>
                </div>
                <span className="text-xs font-bold text-[#2563EB] bg-blue-50 px-3 py-1 rounded-xl">
                  {visibleJobs.filter((j) => j.date === '27/10/2026').length} Appointments
                </span>
              </div>

              <div className="space-y-3">
                {visibleJobs
                  .filter((j) => j.date === '27/10/2026')
                  .map((job) => {
                    const surveyorObj = SURVEYORS.find((s) => s.id === job.surveyorId);
                    const isWaiting = !job.canBook || job.termsStatus !== 'Signed' || job.paymentStatus !== 'Paid';

                    return (
                      <div
                        key={job.id}
                        onClick={() => setSelectedEvent(job)}
                        style={{ borderLeftColor: surveyorObj ? surveyorObj.color : '#2563EB' }}
                        className={`p-4 rounded-2xl border border-l-4 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                          isWaiting
                            ? 'bg-amber-50/50 border-amber-300'
                            : 'bg-slate-50/80 border-slate-200 hover:shadow-sm'
                        }`}
                      >
                        <div className="space-y-1 flex-1">
                          {isWaiting && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              <Lock className="w-3 h-3" />
                              Waiting for terms and payment
                            </span>
                          )}

                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#0B1F4D] bg-white px-2 py-0.5 rounded border border-slate-200">
                              {job.timeSlot}
                            </span>
                            <span className="text-sm font-bold text-slate-900">
                              {job.property}, {job.location}
                            </span>
                          </div>

                          <div className="text-xs text-slate-600 flex items-center gap-3">
                            <span>Client: <strong>{job.customer}</strong></span>
                            <span>•</span>
                            <span>Survey: <strong>{job.surveyType}</strong></span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <div className="text-xs font-bold text-slate-800">{job.surveyor}</div>
                            <div className="text-[10px] text-slate-400">Assigned Surveyor</div>
                          </div>
                          <span
                            className="w-3.5 h-3.5 rounded-full shrink-0"
                            style={{ backgroundColor: surveyorObj?.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* MONTH VIEW */}
          {viewMode === 'month' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 overflow-hidden">
              <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-100">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                  <div key={d} className="py-1">
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1.5 mt-2">
                {monthDays.map((m) => {
                  const dayJobs = visibleJobs.filter((j) => j.date === m.dateStr);

                  return (
                    <div
                      key={m.dayNum}
                      className={`min-h-[72px] p-1.5 rounded-xl border flex flex-col justify-between transition-colors ${
                        m.dayNum === 27
                          ? 'border-[#2563EB] bg-blue-50/30 font-bold'
                          : 'border-slate-100 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xs text-slate-600">{m.dayNum}</span>

                      <div className="space-y-1">
                        {dayJobs.slice(0, 2).map((j) => {
                          const sObj = SURVEYORS.find((s) => s.id === j.surveyorId);
                          const isWaiting = !j.canBook || j.termsStatus !== 'Signed' || j.paymentStatus !== 'Paid';

                          return (
                            <div
                              key={j.id}
                              onClick={() => setSelectedEvent(j)}
                              style={{
                                backgroundColor: isWaiting ? '#FEF3C7' : sObj ? sObj.color : '#2563EB',
                                color: isWaiting ? '#78350F' : '#FFFFFF',
                              }}
                              className="text-[9px] font-bold px-1.5 py-0.5 rounded truncate cursor-pointer shadow-2xs"
                              title={`${j.property} - ${isWaiting ? 'Waiting for terms and payment' : j.surveyor}`}
                            >
                              {isWaiting ? '🔒 Wait terms' : j.property}
                            </div>
                          );
                        })}
                        {dayJobs.length > 2 && (
                          <span className="text-[9px] text-slate-400 font-bold block">
                            +{dayJobs.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Booking Modal */}
      <NewBookingModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSubmit={handleAddBooking}
      />

      {/* Event Details / Booking Gating Modal */}
      {selectedEvent && (
        <Modal
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          title={`Booking: ${selectedEvent.jobNo}`}
          subtitle={`${selectedEvent.property}, ${selectedEvent.location}`}
          maxWidth="max-w-xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <button
                onClick={() => {
                  setSelectedEvent(null);
                  navigate(`/admin/survey-jobs/${selectedEvent.id}`);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
              >
                <span>View Full Job Details</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 rounded-xl bg-[#0B1F4D] text-white text-xs font-bold hover:bg-[#162E6E]"
              >
                Close
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            {/* Gating Alert if waiting for terms/payment */}
            {(!selectedEvent.canBook || selectedEvent.termsStatus !== 'Signed' || selectedEvent.paymentStatus !== 'Paid') ? (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-3">
                <div className="flex items-center gap-2 font-bold text-xs text-amber-950">
                  <Lock className="w-4 h-4 text-amber-600" />
                  <span>Waiting for terms and payment</span>
                </div>
                <p className="text-xs text-amber-800 leading-snug">
                  This booking remains <strong>disabled</strong> and cannot be dispatched to surveyor{' '}
                  <strong>{selectedEvent.surveyor}</strong> until both requirements below are fulfilled:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-amber-200">
                    <span className="text-xs font-medium">Terms of Engagement:</span>
                    {selectedEvent.termsStatus === 'Signed' ? (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Signed
                      </span>
                    ) : (
                      <button
                        onClick={() => handleQuickUnlock(selectedEvent.id, 'terms')}
                        className="px-2 py-1 text-[11px] font-bold bg-[#0B1F4D] text-white rounded-lg hover:bg-[#162E6E]"
                      >
                        Sign Now
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-amber-200">
                    <span className="text-xs font-medium">Advance Fee:</span>
                    {selectedEvent.paymentStatus === 'Paid' ? (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                      </span>
                    ) : (
                      <button
                        onClick={() => handleQuickUnlock(selectedEvent.id, 'payment')}
                        className="px-2 py-1 text-[11px] font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                      >
                        Capture Payment
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Inspection Confirmed & Locked (Terms Signed & Paid)</span>
              </div>
            )}

            {/* Event details card */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">
                  Assigned Surveyor
                </span>
                <span className="font-bold text-slate-800">{selectedEvent.surveyor}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">
                  Inspection Time Slot
                </span>
                <span className="font-bold text-slate-800">{selectedEvent.date} ({selectedEvent.timeSlot})</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">
                  Client Name
                </span>
                <span className="font-bold text-slate-800">{selectedEvent.customer}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">
                  Survey Standard
                </span>
                <span className="font-bold text-slate-800">{selectedEvent.surveyType}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
