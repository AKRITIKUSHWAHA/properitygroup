import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Check,
  Sparkles
} from 'lucide-react';
import { SURVEYORS, useJobs } from '../../mock/jobs';
import { NewBookingModal } from './NewBookingModal';
import { Modal } from '../common/Modal';
import { useToast } from '../ToastContext';

export const BookingCalendar = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const targetJobBase = location.pathname.startsWith('/staff') ? '/staff/survey-jobs' : '/admin/jobs';

  // Shared persistent jobs state
  const { jobs, setJobs, addJob } = useJobs();

  // Calendar View State (Mobile defaults to 'day', Desktop to 'month' or 'week')
  const [viewMode, setViewMode] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 768 ? 'day' : 'month'
  );
  const [selectedDayDate, setSelectedDayDate] = useState('28/10/2026');
  const [selectedMonthDate, setSelectedMonthDate] = useState('28/10/2026');
  const [weekOffset, setWeekOffset] = useState(0); // 0 = Week 44 (26 Oct - 01 Nov 2026)
  const [monthOffset, setMonthOffset] = useState(0); // 0 = Oct 2026

  // Surveyor Checkbox Filters
  const [selectedSurveyorIds, setSelectedSurveyorIds] = useState(
    SURVEYORS.map((s) => s.id)
  );

  // Modals
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // New Task Form
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('09:00 AM - 11:00 AM');
  const [newTaskType, setNewTaskType] = useState('inspection');

  // Custom Tasks State matching Video 1
  const [calendarTasks, setCalendarTasks] = useState([
    {
      id: 'tsk-1',
      date: '28/10/2026',
      time: '09:00 AM - 11:00 AM',
      title: 'Inspection date set for 1820942',
      subtitle: 'Mr Dimitrios Koutoukidis • 36 College Glen, Maidenhead',
      type: 'inspection',
      color: 'bg-[#2563EB] text-white',
    },
    {
      id: 'tsk-2',
      date: '28/10/2026',
      time: '06:00 PM - 08:00 PM',
      title: 'Report date set for 1814424',
      subtitle: 'Rory Maclean • 90 Lime Grove, London HA4 8RW',
      type: 'report',
      color: 'bg-[#6D28D9] text-white',
    },
    {
      id: 'tsk-3',
      date: '28/10/2026',
      time: '06:00 PM - 07:30 PM',
      title: 'Report date set for 1815456',
      subtitle: 'Mr Imran Mahmood • 21 Gladesmere, London',
      type: 'report',
      color: 'bg-[#6D28D9] text-white',
    },
    {
      id: 'tsk-4',
      date: '29/10/2026',
      time: '10:00 AM - 12:30 PM',
      title: 'Inspection date set for 1821004',
      subtitle: 'Giulia Gasparet • 18 Tubbenden Lane, Orpington',
      type: 'inspection',
      color: 'bg-[#2563EB] text-white',
    },
    {
      id: 'tsk-5',
      date: '30/10/2026',
      time: '09:30 AM - 11:30 AM',
      title: 'Inspection date set for 1821088',
      subtitle: 'Abhijeet Dandade • 79 Chiltern Road, Dunstable',
      type: 'inspection',
      color: 'bg-[#2563EB] text-white',
    },
  ]);

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
      const isToday = dateStr === '28/10/2026';

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

  // Date controls handlers
  const handlePrevRange = () => {
    if (viewMode === 'week') setWeekOffset((prev) => prev - 1);
    else if (viewMode === 'month') setMonthOffset((prev) => prev - 1);
    else {
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
    setSelectedDayDate('28/10/2026');
    setSelectedMonthDate('28/10/2026');
  };

  // Add task handler
  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask = {
      id: `tsk-${Date.now()}`,
      date: selectedMonthDate,
      time: newTaskTime,
      title: newTaskTitle.trim(),
      subtitle: 'Manual operational task',
      type: newTaskType,
      color: newTaskType === 'inspection' ? 'bg-[#2563EB] text-white' : 'bg-[#6D28D9] text-white',
    };

    setCalendarTasks((prev) => [newTask, ...prev]);
    setNewTaskTitle('');
    setIsNewTaskModalOpen(false);
    addToast({
      type: 'success',
      title: 'Task Scheduled',
      message: `Task added to To-Do list for ${selectedMonthDate}.`,
    });
  };

  // Active tasks for selected month day
  const activeDayTasks = calendarTasks.filter((t) => t.date === selectedMonthDate);

  // Selected Day Name e.g. "Wednesday"
  const getDayName = (dateStr) => {
    const parts = dateStr.split('/');
    const d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    return d.toLocaleDateString('en-GB', { weekday: 'long' });
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
                ? selectedDayDate === '28/10/2026'
                  ? 'Wednesday, 28 October 2026 (Today)'
                  : selectedDayDate
                : viewMode === 'week'
                ? `Week 44 (26 Oct – 01 Nov 2026)`
                : `October 2026 (SurveyBooker)`}
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
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            Today (28 Oct)
          </button>
        </div>

        {/* Right: New Booking & Total Counter */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white text-xs font-bold transition-all shadow-md shadow-[#0B1F4D]/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Inspection Booking</span>
          </button>
        </div>
      </div>

      {/* Main Calendar View Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Surveyor Checkbox Filter Panel */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Certified Surveyors ({selectedSurveyorIds.length}/{SURVEYORS.length})
              </span>
              <button
                onClick={handleSelectAllSurveyors}
                className="text-xs text-[#2563EB] hover:underline font-semibold cursor-pointer"
              >
                {selectedSurveyorIds.length === SURVEYORS.length ? 'Clear all' : 'Select all'}
              </button>
            </div>

            <div className="space-y-2">
              {SURVEYORS.map((s) => {
                const isSelected = selectedSurveyorIds.includes(s.id);
                return (
                  <label
                    key={s.id}
                    className="flex items-center justify-between p-2.5 rounded-2xl border border-slate-200/80 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSurveyor(s.id)}
                        className="w-4 h-4 rounded text-[#2563EB] focus:ring-[#2563EB]"
                      />
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: s.color }}
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-800">{s.name}</div>
                        <div className="text-[10px] text-slate-400">{s.postcodes}</div>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Calendar Grids (Day, Week, or Month + Daily To-Do List) */}
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
                        <div className={`text-xs font-bold ${day.isToday ? 'text-[#2563EB]' : 'text-[#0B1F4D]'}`}>
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
                                ? 'bg-amber-50/70 border-amber-300 opacity-90 hover:opacity-100'
                                : 'bg-slate-50/80 border-slate-200 hover:border-slate-300 hover:bg-white'
                            }`}
                          >
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
                          </div>
                        );
                      })}
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

              <div className="space-y-4">
                {visibleJobs
                  .filter((j) => j.date === selectedDayDate)
                  .map((job) => {
                    const surveyorObj = SURVEYORS.find((s) => s.id === job.surveyorId);
                    return (
                      <div
                        key={job.id}
                        onClick={() => setSelectedEvent(job)}
                        style={{ borderLeftColor: surveyorObj ? surveyorObj.color : '#2563EB' }}
                        className="p-4 rounded-2xl border border-l-4 bg-slate-50/80 border-slate-200 hover:bg-white transition-all cursor-pointer flex items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#2563EB]">
                              {job.timeSlot}
                            </span>
                            <span className="text-sm font-bold text-slate-900">
                              {job.property}, {job.location}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500">
                            Client: <strong>{job.customer}</strong> &bull; Survey: {job.surveyType}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xs font-bold text-slate-800">{job.surveyor}</div>
                          <div className="text-[10px] text-slate-400">{surveyorObj?.credentials}</div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* 3. MONTH VIEW WITH DAILY TO-DO LIST (Matching SurveyBooker Video 1) */}
          {viewMode === 'month' && (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 overflow-hidden space-y-6">
              {/* Month Header Banner */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h4 className="text-base font-extrabold text-[#0B1F4D] tracking-tight">
                    October 2026 &bull; Inspection &amp; Task Calendar
                  </h4>
                  <p className="text-xs text-slate-400">
                    Colored dots indicate inspection bookings and report due milestones.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-bold">
                  <span className="flex items-center gap-1 text-blue-600">
                    <span className="w-2 h-2 rounded-full bg-blue-600" /> Inspection
                  </span>
                  <span className="flex items-center gap-1 text-purple-600">
                    <span className="w-2 h-2 rounded-full bg-purple-600" /> Report Due
                  </span>
                </div>
              </div>

              {/* Day Name Headers */}
              <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] uppercase tracking-wider text-slate-400">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <div key={i} className="py-1">
                    {d}
                  </div>
                ))}
              </div>

              {/* 31 Month Days Grid */}
              <div className="grid grid-cols-7 gap-1.5">
                {currentMonthDays.map((m) => {
                  const dayTasks = calendarTasks.filter((t) => t.date === m.dateStr);
                  const isSelected = selectedMonthDate === m.dateStr;
                  const isToday = m.dateStr === '28/10/2026';

                  return (
                    <div
                      key={m.dayNum}
                      onClick={() => setSelectedMonthDate(m.dateStr)}
                      className={`min-h-[56px] p-1.5 rounded-xl border flex flex-col items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#0B1F4D] bg-[#0B1F4D] text-white shadow-xs font-bold'
                          : isToday
                          ? 'border-[#0284C7] bg-sky-50 text-[#0284C7] font-black'
                          : 'border-slate-100 hover:bg-slate-50 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span className="text-xs">{m.dayNum}</span>

                      {/* Colored Dots Indicator Strip (From Video 1) */}
                      <div className="flex items-center gap-1 mt-1">
                        {dayTasks.some((t) => t.type === 'inspection') && (
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isSelected ? 'bg-sky-300' : 'bg-blue-600'
                            }`}
                          />
                        )}
                        {dayTasks.some((t) => t.type === 'report') && (
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isSelected ? 'bg-purple-300' : 'bg-purple-600'
                            }`}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* DAILY TO-DO LIST (Matching SurveyBooker Video 1) */}
              <div className="pt-5 border-t border-slate-200">
                <div className="flex items-center justify-between mb-3.5">
                  <div>
                    <h4 className="text-sm font-extrabold text-[#0B1F4D] flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-[#0284C7]" />
                      <span>{getDayName(selectedMonthDate)}'s To-Do List</span>
                    </h4>
                    <span className="text-xs text-slate-500">
                      There are {activeDayTasks.length} items to do for {selectedMonthDate}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsNewTaskModalOpen(true)}
                    className="w-8 h-8 rounded-full bg-[#0284C7] hover:bg-[#0369A1] text-white flex items-center justify-center shadow-md transition-all hover:scale-105 cursor-pointer"
                    title="Add task for this date"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Task Cards */}
                <div className="space-y-2.5">
                  {activeDayTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-3.5 rounded-2xl shadow-xs transition-all ${task.color}`}
                    >
                      <div className="flex items-center justify-between text-xs font-mono font-bold opacity-90 mb-1">
                        <span>{task.time}</span>
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-black/20">
                          {task.type}
                        </span>
                      </div>
                      <div className="font-extrabold text-sm tracking-tight">{task.title}</div>
                      {task.subtitle && (
                        <div className="text-xs opacity-90 mt-0.5">{task.subtitle}</div>
                      )}
                    </div>
                  ))}

                  {activeDayTasks.length === 0 && (
                    <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-xs font-medium">No items scheduled for this date.</p>
                      <button
                        type="button"
                        onClick={() => setIsNewTaskModalOpen(true)}
                        className="mt-2 text-xs font-bold text-[#0284C7] hover:underline"
                      >
                        + Add To-Do Item
                      </button>
                    </div>
                  )}
                </div>
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

      {/* New Task Modal */}
      <Modal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        title={`Add To-Do Item (${selectedMonthDate})`}
        size="sm"
      >
        <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Task Title *</label>
            <input
              type="text"
              placeholder="e.g. Inspection date set for #1820942"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              required
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Time Slot</label>
            <input
              type="text"
              value={newTaskTime}
              onChange={(e) => setNewTaskTime(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Task Type</label>
            <select
              value={newTaskType}
              onChange={(e) => setNewTaskType(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            >
              <option value="inspection">On-Site Inspection (Blue)</option>
              <option value="report">Report Deadline (Purple)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsNewTaskModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#0B1F4D] text-white rounded-xl font-bold"
            >
              Add Item
            </button>
          </div>
        </form>
      </Modal>

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
                  navigate(`${targetJobBase}/${selectedEvent.id}`);
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
                <span>Inspection Confirmed &amp; Locked (Terms Signed &amp; Payment Received)</span>
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
