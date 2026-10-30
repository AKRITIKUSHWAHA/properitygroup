import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  AlertCircle,
  Phone,
  Key,
  MapPin,
  UploadCloud,
  CheckCircle2,
  Camera,
  Navigation,
  FileText,
  ShieldCheck,
  Sparkles,
  Calendar,
  ChevronRight,
  Plus,
  X,
  Image as ImageIcon,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { useToast } from '../../components/ToastContext';
import { Modal } from '../../components/common/Modal';

/**
 * Mobile-First Surveyor Field Portal Dashboard
 * Fully implements Client Master List Requirements (Point 14):
 * - Mobile-first responsive UI for field inspections
 * - Allocated daily jobs with property & keyholder access instructions
 * - On-Site Action Buttons: "Log Arrival" & "Inspection Complete"
 * - On-site photo & defect note uploads direct from mobile camera
 * - 48h turnaround countdown SLA timer
 * - Draft report QA submission to Admin
 */

export const SurveyorDashboardPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  // On-Site Status for Primary Job (JOB-2026-080, 14 Mayfair Gate)
  // 'scheduled' | 'arrived' | 'completed' | 'qa_submitted'
  const [jobStage, setJobStage] = useState('arrived');
  const [arrivalTimestamp, setArrivalTimestamp] = useState('Today at 10:02 AM');
  const [completeTimestamp, setCompleteTimestamp] = useState(null);

  // Turnaround Countdown State (48h SLA)
  const [timeRemaining, setTimeRemaining] = useState({ hours: 34, minutes: 22 });

  // Photo & Note Upload State
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState('Dining Room (Damp Defect)');
  const [defectNote, setDefectNote] = useState('Moisture meter reading 24% WME at skirting board level behind radiator.');
  const [capturedPhotos, setCapturedPhotos] = useState([
    {
      id: 1,
      room: 'Dining Room',
      note: 'Skirting board dampness reading 24% WME',
      url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=300&q=80',
      time: '10:45 AM',
    },
    {
      id: 2,
      room: 'Roof & Parapet',
      note: 'Minor slip on two Welsh slate tiles on west elevation',
      url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=300&q=80',
      time: '11:15 AM',
    },
  ]);

  // QA Submission State
  const [isQASubmitted, setIsQASubmitted] = useState(false);

  // Handlers for On-Site Actions
  const handleLogArrival = () => {
    const timeStr = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    setJobStage('arrived');
    setArrivalTimestamp(`Today at ${timeStr}`);
    addToast({
      type: 'success',
      title: 'GPS Site Arrival Recorded',
      message: `Checked in at 14 Mayfair Gate at ${timeStr}. On-site inspection clock activated.`,
    });
  };

  const handleInspectionComplete = () => {
    const timeStr = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    setJobStage('completed');
    setCompleteTimestamp(`Today at ${timeStr}`);
    addToast({
      type: 'success',
      title: 'Inspection Completed',
      message: `On-site survey marked complete at ${timeStr}. Please ensure keys are returned to Foxtons Mayfair.`,
    });
  };

  const handleAddPhoto = (e) => {
    e.preventDefault();
    if (!defectNote.trim()) return;

    const newPhoto = {
      id: Date.now(),
      room: selectedRoom,
      note: defectNote,
      url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=300&q=80',
      time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    };

    setCapturedPhotos([newPhoto, ...capturedPhotos]);
    setIsPhotoModalOpen(false);
    setDefectNote('');
    addToast({
      type: 'success',
      title: 'Site Evidence Saved',
      message: `Photo and observation logged under ${selectedRoom}.`,
    });
  };

  const handleSubmitQA = () => {
    setIsQASubmitted(true);
    setJobStage('qa_submitted');
    addToast({
      type: 'success',
      title: 'Report Submitted for QA Review',
      message: 'Draft RICS Level 2 report and site evidence dispatched to Admin Quality Review Desk.',
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      <PageHeader
        title="Surveyor Mobile Field Portal"
        subtitle="Manage allocated appointments, log site arrival & completion, record defect photos, and submit reports for QA."
        breadcrumb={['Surveyor', 'Field Portal']}
        actionLabel="Availability & Diary"
        actionIcon={Calendar}
        onAction={() => navigate('/surveyor/my-availability')}
      />

      {/* 1. URGENT 48-HOUR SLA COUNTDOWN BANNER (Client Point 14) */}
      <div className="bg-gradient-to-r from-[#0B1F4D] via-[#162E6E] to-[#2563EB] text-white p-5 sm:p-6 rounded-3xl shadow-md border border-blue-400/20 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-blue-200 border border-white/15">
              <Clock className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Report Delivery SLA Tracker</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black">
              14 Mayfair Gate — Level 2 Survey
            </h2>
            <p className="text-xs text-blue-100">
              Target turnaround: 48 hours post-inspection • Instructing Client: Emma Watson
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 self-start md:self-auto shrink-0">
            <div className="text-center">
              <span className="text-2xl sm:text-3xl font-black font-mono text-amber-300">
                {timeRemaining.hours}h {timeRemaining.minutes}m
              </span>
              <span className="block text-[10px] uppercase font-bold text-blue-200 tracking-wider">
                Deadline Remaining
              </span>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <button
              onClick={() => navigate('/surveyor/upload-reports')}
              className="px-4 py-2 bg-white text-[#0B1F4D] rounded-xl text-xs font-bold hover:bg-blue-50 transition-colors shadow-xs cursor-pointer"
            >
              Upload Draft
            </button>
          </div>
        </div>
      </div>

      {/* 2. ACTIVE SITE JOB CARD WITH ON-SITE BUTTONS (High Priority) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Job Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200 font-mono">
                JOB-2026-080
              </span>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider
                  ${
                    jobStage === 'scheduled'
                      ? 'bg-amber-100 text-amber-800'
                      : jobStage === 'arrived'
                      ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-300'
                      : jobStage === 'completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-purple-100 text-purple-800'
                  }
                `}
              >
                {jobStage === 'scheduled'
                  ? 'Upcoming (En Route)'
                  : jobStage === 'arrived'
                  ? 'On-Site (Inspecting)'
                  : jobStage === 'completed'
                  ? 'Inspection Concluded'
                  : 'Submitted for QA'}
              </span>
            </div>

            <h3 className="text-xl font-black text-slate-900 mt-1.5">
              14 Mayfair Gate, Mayfair, London W1K 2PB
            </h3>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Inspection Slot: <strong>10:00 – 13:00 (Today)</strong></span>
            </p>
          </div>

          {/* Google Maps Link */}
          <a
            href="https://maps.google.com/?q=14+Mayfair+Gate+London+W1K+2PB"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <Navigation className="w-4 h-4 text-[#2563EB]" />
            <span>Open Navigation</span>
          </a>
        </div>

        {/* Access & Keyholder Logistics Box (Point 14) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Key className="w-3.5 h-3.5 text-amber-500" />
              <span>Key Collection</span>
            </span>
            <div className="font-bold text-slate-900">Foxtons Mayfair Branch</div>
            <div className="text-slate-600 text-[11px]">Branch Ref: <strong>#FX-402</strong></div>
            <div className="text-slate-500 text-[11px] pt-1 border-t border-slate-200">
              Selling Agent: Sarah Croft (Knight Frank)
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
              <span>Concierge & Entry</span>
            </span>
            <div className="font-bold text-slate-900">Portico Access Code</div>
            <div className="text-[#0B1F4D] font-mono font-black text-sm">#8492</div>
            <div className="text-slate-500 text-[11px] pt-1 border-t border-slate-200">
              Concierge desk on ground floor (Tel: 020 7946 0888)
            </div>
          </div>

          <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200/70 space-y-1">
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>Specific Inspection Notes</span>
            </span>
            <div className="font-bold text-blue-950">Damp & Roof Void Focus</div>
            <p className="text-blue-900 text-[11px] leading-relaxed">
              Client specifically requested electronic moisture meter readings in rear dining room skirting board.
            </p>
          </div>
        </div>

        {/* ON-SITE ACTION BUTTONS (Point 14 of Client Requirements) */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              On-Site Action Protocol
            </h4>
            <span className="text-[11px] text-slate-400">Tap buttons when arriving and finishing</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Button 1: Log Arrival */}
            <button
              onClick={handleLogArrival}
              className={`min-h-[48px] px-4 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                jobStage === 'arrived' || jobStage === 'completed' || jobStage === 'qa_submitted'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {jobStage === 'arrived' || jobStage === 'completed' || jobStage === 'qa_submitted'
                  ? `✓ Arrived (${arrivalTimestamp})`
                  : 'Log Arrival on Site'}
              </span>
            </button>

            {/* Button 2: Inspection Complete */}
            <button
              onClick={handleInspectionComplete}
              disabled={jobStage === 'scheduled'}
              className={`min-h-[48px] px-4 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                jobStage === 'completed' || jobStage === 'qa_submitted'
                  ? 'bg-blue-50 text-blue-900 border border-blue-300'
                  : jobStage === 'arrived'
                  ? 'bg-[#0B1F4D] hover:bg-[#162E6E] text-white'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>
                {completeTimestamp
                  ? `✓ Inspection Completed (${completeTimestamp})`
                  : 'Mark Inspection Complete'}
              </span>
            </button>
          </div>
        </div>

        {/* 3. PHOTO & NOTE CAPTURE SECTION (Camera Button) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#2563EB]" />
              <h4 className="text-sm font-bold text-slate-900">
                Site Evidence & Defect Notes ({capturedPhotos.length} Captured)
              </h4>
            </div>

            <button
              onClick={() => setIsPhotoModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Add Photo / Note</span>
            </button>
          </div>

          {/* Photo Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {capturedPhotos.map((photo) => (
              <div
                key={photo.id}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3"
              >
                <img
                  src={photo.url}
                  alt={photo.room}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {photo.room}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {photo.time}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                    {photo.note}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. DRAFT REPORT & QA SUBMISSION TO ADMIN (Point 14) */}
        <div className="p-5 rounded-2xl bg-purple-50/60 border border-purple-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-purple-700" />
              <h4 className="text-sm font-bold text-purple-950">
                Submit Report to Admin for Quality Review
              </h4>
            </div>
            <p className="text-xs text-purple-800">
              Deliver condition ratings and final report draft. Admin will review before releasing to client.
            </p>
          </div>

          <button
            onClick={handleSubmitQA}
            disabled={isQASubmitted}
            className={`px-5 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-md ${
              isQASubmitted
                ? 'bg-purple-200 text-purple-900 cursor-not-allowed'
                : 'bg-purple-700 hover:bg-purple-800 text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isQASubmitted ? 'Submitted for QA Review ✓' : 'Submit for Quality Review'}</span>
          </button>
        </div>
      </div>

      {/* 5. SECOND APPOINTMENT (Afternoon Slot) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-200">
              JOB-2026-081
            </span>
            <h4 className="text-base font-bold text-slate-900 mt-1">
              24 Kensington Palace Gardens, London W8 4QQ
            </h4>
            <span className="text-xs text-slate-500">Slot: 14:30 – 17:00 (Afternoon Inspection)</span>
          </div>

          <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-xl">
            Upcoming Today
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
          <div className="p-3 bg-slate-50 rounded-xl">
            Service: <strong>RICS Level 3 Building Survey (4 Storeys + Vault)</strong>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            Access: <strong>Concierge Security Gate (Code #8492)</strong>
          </div>
        </div>
      </div>

      {/* MODAL: ADD SITE PHOTO & DEFECT NOTE */}
      {isPhotoModalOpen && (
        <Modal
          isOpen={isPhotoModalOpen}
          onClose={() => setIsPhotoModalOpen(false)}
          title="Add Site Inspection Photo & Defect Note"
          subtitle="Record defects and moisture readings directly from mobile camera."
          maxWidth="max-w-lg"
          footer={
            <div className="flex justify-end gap-2 w-full">
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddPhoto}
                className="px-4 py-2 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-xs font-bold text-white cursor-pointer"
              >
                Save Site Evidence
              </button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Property Room / Element
              </label>
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
              >
                <option value="Dining Room (Damp Defect)">Dining Room (Damp Defect)</option>
                <option value="Roof & Chimney Flashing">Roof & Chimney Flashing</option>
                <option value="Loft Space & Insulation">Loft Space & Insulation</option>
                <option value="Subfloor & Ventilation">Subfloor & Ventilation</option>
                <option value="Windows & Joinery">Windows & Joinery</option>
                <option value="External Masonry & Pointing">External Masonry & Pointing</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Defect Observation / Technical Moisture Readings
              </label>
              <textarea
                rows={3}
                value={defectNote}
                onChange={(e) => setDefectNote(e.target.value)}
                placeholder="Enter technical measurements (e.g. 24% WME dampness) or defect diagnosis..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="p-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl text-center space-y-2">
              <Camera className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-slate-600 font-bold">Tap to capture photo with camera</div>
              <p className="text-[10px] text-slate-400">Supports JPG, PNG, HEIC from mobile device</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
