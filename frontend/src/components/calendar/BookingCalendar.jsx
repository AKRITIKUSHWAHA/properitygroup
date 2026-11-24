import React, { useState, useMemo, useEffect } from 'react';
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
import { adminSurveyorsApi } from '../../api/adminApi';
import { NewBookingModal } from './NewBookingModal';
import { RescheduleModal } from '../crm/RescheduleModal';
import { Modal } from '../common/Modal';
import { useToast } from '../ToastContext';

export const BookingCalendar = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const targetJobBase = location.pathname.startsWith('/staff') ? '/staff/survey-jobs' : '/admin/jobs';

  // Shared persistent jobs state
  const { jobs, setJobs, addJob } = useJobs();

  const [activeSurveyors, setActiveSurveyors] = useState([]);

  useEffect(() => {
    adminSurveyorsApi
      .getSurveyors()
      .then((res) => {
        const raw = res?.surveyors || res?.data?.surveyors || res?.data?.data?.surveyors || (Array.isArray(res) ? res : []);
        if (Array.isArray(raw) && raw.length > 0) {
          setActiveSurveyors(raw);
        }
      })
      .catch(() => {});
  }, []);

  const surveyorList = useMemo(() => {
    if (activeSurveyors.length > 0) {
      return activeSurveyors.map((s, idx) => ({
        id: `srv-${s.id}`,
        dbId: s.id,
        name: s.name,
        credentials: s.surveyorProfile?.accreditation || 'MRICS Chartered Surveyor',
        color: ['#2563EB', '#7C3AED', '#059669', '#D97706', '#E11D48'][idx % 5],
        bgLight: 'bg-blue-50 border-blue-200 text-blue-900',
        avatar: (s.avatar && !s.avatar.includes('unsplash.com')) ? s.avatar : null,
        postcodes: s.surveyorProfile?.postcodesCovered || 'All London Zones',
      }));
    }
    return SURVEYORS;
  }, [activeSurveyors]);

  // Calendar View State (Mobile defaults to 'day', Desktop to 'month' or 'week')
  const [viewMode, setViewMode] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 768 ? 'day' : 'month'
  );

  const today = useMemo(() => new Date(), []);
  const todayFormatted = useMemo(() => {
    const d = String(today.getDate()).padStart(2, '0');
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const y = today.getFullYear();
    return `${d}/${m}/${y}`;
  }, [today]);

  const [selectedDayDate, setSelectedDayDate] = useState(() => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  });
  const [selectedMonthDate, setSelectedMonthDate] = useState(() => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  });
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);

  // Derived tasks from real platform survey jobs
  const derivedJobTasks = useMemo(() => {
    const tasks = [];
    (jobs || []).forEach((j) => {
      if (!j) return;
      let formattedDate = '';
      if (j.date && j.date.includes('/')) {
        formattedDate = j.date.split(',')[0].trim();
      } else if (j.date && j.date.includes('-')) {
        try {
          const parts = j.date.split('T')[0].split('-');
          if (parts.length === 3) {
            formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
          }
        } catch {}
      } else if (j.inspectionDate) {
        try {
          const parts = j.inspectionDate.split('T')[0].split('-');
          if (parts.length === 3) {
            formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
          }
        } catch {}
      }

      if (formattedDate) {
        tasks.push({
          id: `ins-${j.id || j.jobNo}`,
          date: formattedDate,
          time: j.timeSlot || j.inspectionTime || '10:00 AM - 01:00 PM',
          title: `Inspection: ${j.property || j.propertyAddress || 'Subject Property'} (${j.id || j.jobNo})`,
          subtitle: `Client: ${j.customer || j.clientName || 'Client'} • Surveyor: ${j.surveyor || 'Assigned'}`,
          type: 'inspection',
          color: 'bg-[#2563EB] text-white',
          job: j,
        });

        if (['drafting', 'qa_review', 'qa review', 'completed', 'delivered'].includes((j.status || '').toLowerCase()) || (j.timelineStep || 0) >= 8) {
          tasks.push({
            id: `rep-${j.id || j.jobNo}`,
            date: formattedDate,
            time: '05:00 PM - 07:00 PM',
            title: `Report Milestone: ${j.property || j.propertyAddress || 'Property'}`,
            subtitle: `RICS Compliance • Status: ${j.status || 'Active'}`,
            type: 'report',
            color: 'bg-[#6D28D9] text-white',
            job: j,
          });
        }
      }
    });
    return tasks;
  }, [jobs]);

  const [customTasks, setCustomTasks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('propertygroup_calendar_custom_tasks') || '[]');
    } catch {
      return [];
    }
  });

  const allTasks = useMemo(() => {
    return [...derivedJobTasks, ...customTasks];
  }, [derivedJobTasks, customTasks]);

  // Surveyor Checkbox Filters
  const [selectedSurveyorIds, setSelectedSurveyorIds] = useState([]);

  useEffect(() => {
    setSelectedSurveyorIds(surveyorList.map((s) => s.id));
  }, [surveyorList]);

  // Modals
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);

  // New Task Form
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('09:00 AM - 11:00 AM');
  const [newTaskType, setNewTaskType] = useState('inspection');

  // Toggle surveyor checkbox
  const handleToggleSurveyor = (id) => {
    setSelectedSurveyorIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllSurveyors = () => {
    if (selectedSurveyorIds.length === surveyorList.length) {
      setSelectedSurveyorIds([]);
    } else {
      setSelectedSurveyorIds(surveyorList.map((s) => s.id));
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

  // Display month computed from today + monthOffset
  const displayMonthDate = useMemo(() => {
    return new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  }, [today, monthOffset]);

  const monthLabel = useMemo(() => {
    return displayMonthDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  }, [displayMonthDate]);

  // Dynamic Week Days computation based on weekOffset from current week
  const currentWeekDays = useMemo(() => {
    const current = new Date(today);
    const day = current.getDay();
    const diffToMonday = current.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(current.setDate(diffToMonday + weekOffset * 7));

    const days = [];
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dayNum = String(d.getDate()).padStart(2, '0');
      const monthNum = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const dateStr = `${dayNum}/${monthNum}/${year}`;
      const shortDate = `${d.getDate()} ${monthNames[d.getMonth()]}`;
      const isToday = dateStr === todayFormatted;

      days.push({
        name: isToday ? `${dayNames[i]} (Today)` : dayNames[i],
        date: dateStr,
        shortDate,
        isToday,
      });
    }
    return days;
  }, [today, weekOffset, todayFormatted]);

  // Dynamic Month Days matching real calendar layout
  const currentMonthDays = useMemo(() => {
    const year = displayMonthDate.getFullYear();
    const month = displayMonthDate.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const monthNum = String(month + 1).padStart(2, '0');

    const blanks = Array.from({ length: firstDayIndex }, (_, i) => ({
      isBlank: true,
      key: `blank-${i}`,
      dayNum: null,
      dateStr: '',
      isToday: false,
    }));

    const days = Array.from({ length: totalDays }, (_, i) => {
      const dayNum = i + 1;
      const dateStr = `${String(dayNum).padStart(2, '0')}/${monthNum}/${year}`;
      const isToday = dateStr === todayFormatted;
      return {
        isBlank: false,
        key: `day-${dayNum}`,
        dayNum,
        dateStr,
        isToday,
      };
    });

    return [...blanks, ...days];
  }, [displayMonthDate, todayFormatted]);

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
    setSelectedDayDate(todayFormatted);
    setSelectedMonthDate(todayFormatted);
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

    setCustomTasks((prev) => {
      const updated = [newTask, ...prev];
      try {
        localStorage.setItem('propertygroup_calendar_custom_tasks', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setNewTaskTitle('');
    setIsNewTaskModalOpen(false);
    addToast({
      type: 'success',
      title: 'Task Scheduled',
      message: `Task added to To-Do list for ${selectedMonthDate}.`,
    });
  };

  // Active tasks for selected month day
  const activeDayTasks = allTasks.filter((t) => t.date === selectedMonthDate);

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
                ? selectedDayDate === todayFormatted
                  ? `${getDayName(selectedDayDate)}, ${selectedDayDate} (Today)`
                  : `${getDayName(selectedDayDate)}, ${selectedDayDate}`
                : viewMode === 'week'
                ? `${currentWeekDays[0]?.shortDate || ''} – ${currentWeekDays[6]?.shortDate || ''} ${currentWeekDays[6]?.date ? currentWeekDays[6].date.split('/')[2] : ''}`
                : monthLabel}
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
            Today ({today.getDate()} {today.toLocaleDateString('en-GB', { month: 'short' })})
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
                Certified Surveyors ({selectedSurveyorIds.length}/{surveyorList.length})
              </span>
              <button
                onClick={handleSelectAllSurveyors}
                className="text-xs text-[#2563EB] hover:underline font-semibold cursor-pointer"
              >
                {selectedSurveyorIds.length === surveyorList.length ? 'Clear all' : 'Select all'}
              </button>
            </div>

            <div className="space-y-2">
              {surveyorList.map((s) => {
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
                        const surveyorObj = surveyorList.find((s) => s.id === job.surveyorId);
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
                    const surveyorObj = surveyorList.find((s) => s.id === job.surveyorId);
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
                    {monthLabel} &bull; Inspection &amp; Task Calendar
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

              {/* Month Days Grid */}
              <div className="grid grid-cols-7 gap-1.5">
                {currentMonthDays.map((m) => {
                  if (m.isBlank) {
                    return (
                      <div
                        key={m.key}
                        className="min-h-[56px] p-1.5 rounded-xl border border-transparent bg-slate-50/20"
                      />
                    );
                  }

                  const dayTasks = allTasks.filter((t) => t.date === m.dateStr);
                  const isSelected = selectedMonthDate === m.dateStr;
                  const isToday = m.isToday;

                  return (
                    <div
                      key={m.key}
                      onClick={() => setSelectedMonthDate(m.dateStr)}
                      className={`min-h-[56px] p-1.5 rounded-xl border flex flex-col items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#0B1F4D] bg-[#0B1F4D] text-white shadow-xs font-bold'
                          : isToday
                          ? 'border-[#0284C7] bg-sky-50 text-[#0284C7] font-black ring-2 ring-[#0284C7]/20'
                          : 'border-slate-100 hover:bg-slate-50 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span className="text-xs">{m.dayNum}</span>

                      {/* Colored Dots Indicator Strip */}
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

              {/* DAILY TO-DO LIST (Real System Inspections + Tasks) */}
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
                      onClick={() => task.job && setSelectedEvent(task.job)}
                      className={`p-3.5 rounded-2xl shadow-xs transition-all ${task.color} ${task.job ? 'cursor-pointer hover:opacity-95' : ''}`}
                    >
                      <div className="flex items-center justify-between text-xs font-mono font-bold opacity-90 mb-1">
                        <span>{task.time}</span>
                        <div className="flex items-center gap-1.5">
                          {task.job && (
                            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono">
                              View Booking &rarr;
                            </span>
                          )}
                          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-black/20">
                            {task.type}
                          </span>
                        </div>
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
            <div className="flex items-center justify-between w-full gap-2">
              <button
                onClick={() => {
                  setSelectedEvent(null);
                  navigate(`${targetJobBase}/${selectedEvent.id}`);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
              >
                <span>View Job Details</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsRescheduleModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors cursor-pointer"
                >
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span>Reschedule</span>
                </button>

                <button
                  onClick={() => setSelectedEvent(null)}
                  className="px-4 py-2 rounded-xl bg-[#0B1F4D] text-white text-xs font-bold hover:bg-[#162E6E] cursor-pointer"
                >
                  Close
                </button>
              </div>
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

      {/* Reschedule Inspection Modal */}
      {selectedEvent && (
        <RescheduleModal
          isOpen={isRescheduleModalOpen}
          onClose={() => setIsRescheduleModalOpen(false)}
          job={selectedEvent}
          onRescheduled={(updated) => {
            setJobs((prev) =>
              prev.map((j) => {
                const isMatch =
                  j.id === updated.id ||
                  String(j.id) === String(updated.id) ||
                  j.jobNo === updated.jobNo ||
                  String(j.jobNo) === String(updated.jobNo) ||
                  (updated.reference && j.reference === updated.reference) ||
                  (updated.dbId && j.dbId === updated.dbId);
                return isMatch ? { ...j, ...updated } : j;
              })
            );
            setSelectedEvent(null);
            setIsRescheduleModalOpen(false);
          }}
        />
      )}
    </div>
  );
};
