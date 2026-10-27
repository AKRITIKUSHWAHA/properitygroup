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
  Building,
} from 'lucide-react';
import { SURVEYORS, useJobs } from '../../mock/jobs';
import { NewBookingModal } from './NewBookingModal';
import { Modal } from '../common/Modal';
import { useToast } from '../ToastContext';

export const BookingCalendar = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Shared persistent jobs state
  const { jobs, setJobs, addJob } = useJobs();

  // Calendar View State
  const [viewMode, setViewMode] = useState('week'); // 'day' | 'week' | 'month'
  const [selectedDayDate, setSelectedDayDate] = useState('27/10/2026');
  const [weekOffset, setWeekOffset] = useState(0); // 0 = Week 44 (26 Oct - 01 Nov 2026)
  const [monthOffset, setMonthOffset] = useState(0); // 0 = Oct 2026

  // Surveyor Checkbox Filters
  const [selectedSurveyorIds, setSelectedSurveyorIds] = useState(
    SURVEYORS.map((s) => s.id)
  );

  // Modals
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

  // Handle new booking submission
  const handleAddBooking = (newJob) => {
    addJob(newJob);
    addToast({
      type: newJob.canBook ? 'success' : 'info',
      title: 'Booking Created',
      message: newJob.canBook
        ? `Inspection confirmed for ${newJob.customer} with ${newJob.surveyor}.`
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
          timelineStep: canBookNow ? Math.max(j.timelineStep || 0, 7) : j.timelineStep,
        };
      })
    );

    setSelectedEvent((prev) => {
      if (!prev || prev.id !== jobId) return prev;
      const newTerms = type === 'terms' ? 'Signed' : prev.termsStatus;
      const newPayment = type === 'payment' ? 'Paid' : prev.paymentStatus;
      const canBookNow = newTerms === 'Signed' && newPayment === 'Paid';
      return {
        ...prev,
        termsStatus: newTerms,
        paymentStatus: newPayment,
        canBook: canBookNow,
        status: canBookNow ? 'Scheduled' : prev.status,
        timelineStep: canBookNow ? Math.max(prev.timelineStep || 0, 7) : prev.timelineStep,
      };
    });

    addToast({
      type: 'success',
      title: type === 'terms' ? 'Terms Validated' : 'Payment Cleared',
      message: `Booking ${jobId} updated successfully. Status transitioned to active.`,
    });
  };

  // Dynamic Week Days computation based on weekOffset
  const currentWeekDays = useMemo(() => {
    // Base week: 26 Oct (Mon) to 01 Nov (Sun) 2026
    const baseDate = new Date(2026, 9, 26 + weekOffset * 7); // Month index 9 is October
    const days = [];
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      const dayNum = String(d.getDate()).padStart(2, '0');
      const monthNum = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const dateStr = `${dayNum}/${monthNum}/${year}`;
      const shortDate = `${d.getDate()} ${monthNames[d.getMonth()]}`;
      const isToday = dateStr === '27/10/2026';

      days.push({
        name: isToday ? `${dayNames[i]} (Today)` : dayNames[i],
        date: dateStr,
        shortDate,
        isToday,
      });
    }
    return days;
  }, [weekOffset]);

  // Dynamic Month Days simulation (31 days)
  const currentMonthDays = useMemo(() => {
    const isNov = monthOffset === 1;
    const isSep = monthOffset === -1;
    const totalDays = isNov || isSep ? 30 : 31;
    const monthNum = isNov ? '11' : isSep ? '09' : '10';

    return Array.from({ length: totalDays }, (_, i) => {
      const dayNum = i + 1;
      const dateStr = `${String(dayNum).padStart(2, '0')}/${monthNum}/2026`;
      return { dayNum, dateStr };
    });
  }, [monthOffset]);

  // Time slots for Day view timeline
  const dayTimeSlots = [
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
  ];

  // Date controls handlers
  const handlePrevRange = () => {
    if (viewMode === 'week') setWeekOffset((prev) => prev - 1);
    else if (viewMode === 'month') setMonthOffset((prev) => prev - 1);
    else {
      // Day mode: step back 1 day
      const parts = selectedDayDate.split('/');
      const d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]) - 1);
      const newDay = String(d.getDate()).padStart(2, '0');
      const newMonth = String(d.getMonth() + 1).padStart(2, '0');
      setSelectedDayDate(`${newDay}/${newMonth}/${d.getFullYear()}`);
    }
  };

  const handleNextRange = () => {
    if (viewMode === 'week') setWeekOffset((prev) => prev + 1);
    else if (viewMode === 'month') setMonthOffset((prev) => prev + 1);
    else {
      // Day mode: step forward 1 day
      const parts = selectedDayDate.split('/');
      const d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]) + 1);
      const newDay = String(d.getDate()).padStart(2, '0');
      const newMonth = String(d.getMonth() + 1).padStart(2, '0');
      setSelectedDayDate(`${newDay}/${newMonth}/${d.getFullYear()}`);
    }
  };

  const handleResetToday = () => {
    setWeekOffset(0);
    setMonthOffset(0);
    setSelectedDayDate('27/10/2026');
  };

  return (
    <div className="space-y-6">
      {/* Top Controller Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Day/Week/Month Toggle + Date Navigation */}
        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Toggle: Day / Week / Month */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
            {['day', 'week', 'month'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
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
              onClick={handlePrevRange}
              aria-label="Previous date range"
              className="p-2 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3.5 py-1.5 text-xs font-bold text-slate-800 font-mono select-none">
              {viewMode === 'day'
                ? selectedDayDate === '27/10/2026'
                  ? 'Tuesday, 27 October 2026 (Today)'
                  : selectedDayDate
                : viewMode === 'week'
                ? `${currentWeekDays[0]?.shortDate} – ${currentWeekDays[6]?.shortDate} 2026 (Week ${44 + weekOffset})`
                : monthOffset === 0
                ? 'October 2026'
                : monthOffset > 0
                ? 'November 2026'
                : 'September 2026'}
            </span>
            <button
              onClick={handleNextRange}
              aria-label="Next date range"
              className="p-2 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleResetToday}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Today
          </button>
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
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Surveyor Filter
              </span>
              <button
                onClick={handleSelectAllSurveyors}
                className="text-[11px] font-bold text-[#2563EB] hover:underline cursor-pointer"
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
                    className={`flex items-start gap-3 p-2.5 rounded-2xl border transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'bg-slate-50/90 border-slate-200'
                        : 'opacity-40 border-transparent hover:bg-slate-50'
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
                          className="w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-white shadow-xs"
                          style={{ backgroundColor: surveyor.color }}
                        />
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {surveyor.credentials}
                      </div>
                      <div className="text-[10px] font-medium text-slate-500 mt-0.5">
                        Postcodes: <span className="font-semibold text-slate-700">{surveyor.postcodes}</span>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Gating Status Compliance Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-[#0B1F4D] to-[#162E6E] text-white space-y-2.5 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Inspection Gating Rules</span>
            </div>
            <p className="text-[11px] text-slate-200 leading-relaxed">
              Per UK RICS mandates, inspection slots stay disabled and display{' '}
              <strong className="text-amber-300">"Waiting for terms and payment"</strong> until both client contract terms are signed and advance fees are settled.
            </p>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
              <span>Active Bookings:</span>
              <span className="font-bold text-white font-mono">
                {visibleJobs.filter((j) => j.canBook).length}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-amber-200">
              <span>Pending Terms/Payment:</span>
              <span className="font-bold font-mono">
                {visibleJobs.filter((j) => !j.canBook).length}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Calendar Views (Day, Week, Month) */}
        <div className="lg:col-span-3">
          {/* 1. WEEK VIEW */}
          {viewMode === 'week' && (
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              {currentWeekDays.map((day) => {
                const dayJobs = visibleJobs.filter((j) => j.date === day.date);

                return (
                  <div
                    key={day.date}
                    className={`bg-white rounded-3xl border shadow-xs p-3 flex flex-col min-h-[480px] ${
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
                            className={`p-2.5 rounded-2xl border border-l-4 text-left transition-all cursor-pointer relative group shadow-2xs ${
                              isWaiting
                                ? 'bg-amber-50/70 border-amber-300 opacity-90 hover:opacity-100 hover:ring-1 hover:ring-amber-400'
                                : 'bg-slate-50/80 border-slate-200 hover:border-slate-300 hover:shadow-xs hover:bg-white'
                            }`}
                          >
                            {/* Disabled / Waiting for terms badge */}
                            {isWaiting ? (
                              <div className="mb-1.5">
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-amber-200/80 text-amber-900 border border-amber-300/80">
                                  <Lock className="w-2.5 h-2.5 shrink-0" />
                                  Waiting for terms and payment
                                </span>
                              </div>
                            ) : null}

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
                                  isWaiting
                                    ? 'text-amber-800'
                                    : job.status === 'Completed'
                                    ? 'text-emerald-700'
                                    : 'text-[#2563EB]'
                                }`}
                              >
                                {isWaiting ? 'Disabled' : job.status}
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

          {/* 2. DAY VIEW */}
          {viewMode === 'day' && (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                <div>
                  <h4 className="text-base font-black text-[#0B1F4D]">
                    Field Inspection Timetable ({selectedDayDate})
                  </h4>
                  <p className="text-xs text-slate-500">
                    Appointments scheduled across active certified surveyors.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#2563EB] bg-blue-50 px-3 py-1 rounded-xl">
                    {visibleJobs.filter((j) => j.date === selectedDayDate).length} Inspections
                  </span>
                </div>
              </div>

              {/* Day Time Schedule Grid */}
              <div className="space-y-4">
                {visibleJobs
                  .filter((j) => j.date === selectedDayDate)
                  .map((job) => {
                    const surveyorObj = SURVEYORS.find((s) => s.id === job.surveyorId);
                    const isWaiting = !job.canBook || job.termsStatus !== 'Signed' || job.paymentStatus !== 'Paid';

                    return (
                      <div
                        key={job.id}
                        onClick={() => setSelectedEvent(job)}
                        style={{ borderLeftColor: surveyorObj ? surveyorObj.color : '#2563EB' }}
                        className={`p-4 rounded-2xl border border-l-4 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                          isWaiting
                            ? 'bg-amber-50/60 border-amber-300'
                            : 'bg-slate-50/80 border-slate-200 hover:shadow-xs hover:bg-white'
                        }`}
                      >
                        <div className="space-y-1.5 flex-1">
                          {isWaiting && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-200/80 text-amber-900 border border-amber-300">
                              <Lock className="w-3 h-3" />
                              Waiting for terms and payment
                            </span>
                          )}

                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-black text-[#0B1F4D] bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
                              {job.timeSlot}
                            </span>
                            <span className="text-sm font-bold text-slate-900">
                              {job.property}, {job.location}
                            </span>
                          </div>

                          <div className="text-xs text-slate-600 flex flex-wrap items-center gap-2">
                            <span>Client: <strong className="text-slate-800">{job.customer}</strong></span>
                            <span className="text-slate-300">•</span>
                            <span>Survey: <strong className="text-slate-800">{job.surveyType}</strong></span>
                            <span className="text-slate-300">•</span>
                            <span>Ref: <strong className="font-mono text-slate-700">{job.jobNo}</strong></span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200/60">
                          <div className="text-left md:text-right">
                            <div className="text-xs font-bold text-slate-800">{job.surveyor}</div>
                            <div className="text-[10px] text-slate-400">{surveyorObj?.credentials}</div>
                          </div>
                          <img
                            src={surveyorObj?.avatar}
                            alt={job.surveyor}
                            className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-xs"
                          />
                        </div>
                      </div>
                    );
                  })}

                {visibleJobs.filter((j) => j.date === selectedDayDate).length === 0 && (
                  <div className="text-center py-12 text-slate-400">
                    <CalendarIcon className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-xs font-semibold">No appointments scheduled for {selectedDayDate}.</p>
                    <button
                      onClick={() => setIsNewModalOpen(true)}
                      className="mt-3 px-4 py-2 bg-[#0B1F4D] text-white text-xs font-bold rounded-xl"
                    >
                      + Create Booking on this Date
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. MONTH VIEW */}
          {viewMode === 'month' && (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 overflow-hidden">
              <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] uppercase tracking-wider text-slate-400 pb-3 border-b border-slate-100">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                  <div key={d} className="py-1">
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1.5 mt-2.5">
                {currentMonthDays.map((m) => {
                  const dayJobs = visibleJobs.filter((j) => j.date === m.dateStr);
                  const isCurrentDay = m.dateStr === '27/10/2026';

                  return (
                    <div
                      key={m.dayNum}
                      onClick={() => {
                        setSelectedDayDate(m.dateStr);
                        setViewMode('day');
                      }}
                      className={`min-h-[78px] p-2 rounded-2xl border flex flex-col justify-between transition-all cursor-pointer ${
                        isCurrentDay
                          ? 'border-[#2563EB] bg-blue-50/40 ring-2 ring-blue-500/20 font-bold'
                          : 'border-slate-100 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs ${isCurrentDay ? 'text-[#2563EB] font-black' : 'text-slate-600'}`}>
                          {m.dayNum}
                        </span>
                        {dayJobs.length > 0 && (
                          <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                        )}
                      </div>

                      <div className="space-y-1 mt-1">
                        {dayJobs.slice(0, 2).map((j) => {
                          const sObj = SURVEYORS.find((s) => s.id === j.surveyorId);
                          const isWaiting = !j.canBook || j.termsStatus !== 'Signed' || j.paymentStatus !== 'Paid';

                          return (
                            <div
                              key={j.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEvent(j);
                              }}
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
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
              >
                <span>View Full Job Details</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2.5 rounded-xl bg-[#0B1F4D] text-white text-xs font-bold hover:bg-[#162E6E] cursor-pointer"
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
                  This booking remains <strong>disabled</strong> on the calendar and cannot be dispatched to field surveyor{' '}
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
                        className="px-2.5 py-1 text-[11px] font-bold bg-[#0B1F4D] text-white rounded-lg hover:bg-[#162E6E] cursor-pointer"
                      >
                        Sign Terms Now
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
                        className="px-2.5 py-1 text-[11px] font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer"
                      >
                        Capture Payment Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Inspection Confirmed & Locked (Terms Signed & Payment Received)</span>
              </div>
            )}

            {/* Event details card */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">
                  Assigned Surveyor
                </span>
                <span className="font-bold text-slate-800">{selectedEvent.surveyor}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">
                  Inspection Time Slot
                </span>
                <span className="font-bold text-slate-800">{selectedEvent.date} ({selectedEvent.timeSlot})</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">
                  Client Name
                </span>
                <span className="font-bold text-slate-800">{selectedEvent.customer}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
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
