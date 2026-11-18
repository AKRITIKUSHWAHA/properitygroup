import React, { useState } from 'react';
import {
  Calendar,
  Smartphone,
  Copy,
  Check,
  ExternalLink,
  Download,
  ShieldCheck,
  Clock,
  MapPin,
  Key,
  X,
  Sparkles,
} from 'lucide-react';
import { getCalendarSubscriptionUrls, downloadIcsFile } from '../../utils/calendarSync';

export const SurveyorCalendarSyncModal = ({ isOpen, onClose, surveyor, appointments = [] }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('apple'); // 'apple' | 'google' | 'outlook'

  if (!isOpen) return null;

  const surveyorId = surveyor?.id || 22;
  const surveyorName = surveyor?.name || 'Surveyor';
  const urls = getCalendarSubscriptionUrls(surveyorId);

  const handleCopy = () => {
    navigator.clipboard.writeText(urls.httpsUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadFullFeed = () => {
    window.open(urls.httpsUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#0B1F4D] text-white p-5 sm:p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 p-2 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 text-blue-200 text-xs font-bold uppercase tracking-wider mb-1">
            <Smartphone className="w-4 h-4 text-amber-400" />
            <span>Mobile Diary Synchronization</span>
          </div>

          <h3 className="text-lg sm:text-xl font-extrabold text-white">
            Sync Diary with Your Phone Calendar
          </h3>

          <p className="text-xs text-blue-100/90 mt-1 max-w-md">
            Automatically lock assigned RICS inspections, turn-by-turn driving addresses, and key access notes directly into your phone’s calendar.
          </p>

          <div className="mt-4 flex items-center gap-2 text-[11px] font-semibold bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 w-fit">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{appointments.length} Upcoming Inspections in Live Feed</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto min-h-0">
          {/* Platform Switcher Tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('apple')}
              className={`py-2 px-3 rounded-xl transition-all cursor-pointer ${
                activeTab === 'apple'
                  ? 'bg-white text-[#0B1F4D] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🍎 Apple (iPhone)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('google')}
              className={`py-2 px-3 rounded-xl transition-all cursor-pointer ${
                activeTab === 'google'
                  ? 'bg-white text-[#0B1F4D] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📅 Google
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('outlook')}
              className={`py-2 px-3 rounded-xl transition-all cursor-pointer ${
                activeTab === 'outlook'
                  ? 'bg-white text-[#0B1F4D] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📧 Outlook / 365
            </button>
          </div>

          {/* Tab 1: Apple Calendar */}
          {activeTab === 'apple' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-[#0B1F4D] text-sm">
                    iPhone, iPad & Mac 1-Click Subscription
                  </h4>
                  <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                    Auto-Refreshes
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Click the button below on your iPhone or Mac to subscribe. Any time Admin books or reschedules an inspection, your Apple Calendar updates automatically.
                </p>
                <a
                  href={urls.webcalUrl}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-[#0B1F4D] hover:bg-[#162E6E] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  <Calendar className="w-4 h-4 text-amber-300" />
                  <span>Subscribe on iPhone / Mac Calendar (1-Click)</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1" />
                </a>
              </div>

              <div className="text-xs text-slate-500 space-y-1.5 pl-2">
                <span className="font-bold text-slate-700 block">Manual Setup on iPhone:</span>
                <p>1. Open iPhone <strong>Settings &rarr; Calendar &rarr; Accounts &rarr; Add Account</strong></p>
                <p>2. Select <strong>Other &rarr; Add Subscribed Calendar</strong></p>
                <p>3. Paste the private feed URL from the box below and tap <strong>Next &rarr; Save</strong></p>
              </div>
            </div>
          )}

          {/* Tab 2: Google Calendar */}
          {activeTab === 'google' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-emerald-950 text-sm">
                    Google Calendar Live Sync (Android & Web)
                  </h4>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    Live Feed
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Connect your NJS Surveyor diary directly to your Google account. Automatically appears across Google Calendar on desktop and your Android phone.
                </p>
                <a
                  href={urls.googleCalendarSubscribeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Add Live Diary to Google Calendar</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1" />
                </a>
              </div>

              <div className="text-xs text-slate-500 space-y-1.5 pl-2">
                <span className="font-bold text-slate-700 block">Manual Setup in Google Calendar:</span>
                <p>1. In Google Calendar, click <strong>"+" next to Other Calendars</strong></p>
                <p>2. Choose <strong>"From URL"</strong></p>
                <p>3. Paste the private feed URL and click <strong>Add Calendar</strong></p>
              </div>
            </div>
          )}

          {/* Tab 3: Outlook */}
          {activeTab === 'outlook' && (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-indigo-950 text-sm">
                    Microsoft Outlook / Office 365
                  </h4>
                  <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full">
                    iCal Sync
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Download the complete `.ics` calendar file or subscribe in Outlook Web so all appointments appear on your work diary.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadFullFeed}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-[#0B1F4D] hover:bg-[#162E6E] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Diary (.ICS File)</span>
                  </button>
                  <a
                    href={`https://outlook.live.com/calendar/0/addcalendar`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all"
                  >
                    <span>Subscribe in Outlook Web</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-1" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Private Feed URL Box */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Your Private Calendar Feed URL:</span>
              <span className="text-[10px] text-slate-400">Strictly confidential to {surveyorName}</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={urls.httpsUrl}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-600 select-all focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="px-3.5 py-2 bg-[#0B1F4D] hover:bg-[#162E6E] text-white rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* What Gets Synced Info Box */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-800 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>What information is locked into your phone calendar?</span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 text-[11px] pt-1">
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Property address (GPS Nav ready)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Daylight window (10:00 - 16:00)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>Estate Agent key code & branch</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>RICS Survey Type & Job Ref</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
