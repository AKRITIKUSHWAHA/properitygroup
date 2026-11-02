import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  MessageSquare,
  Send,
  Paperclip,
  Search,
  ExternalLink,
  Mail,
  Phone,
  Building,
  User,
  Clock,
  CheckCircle2,
  ShieldCheck,
  CheckCheck,
  RefreshCw,
  AlertCircle,
  FileText,
  Calendar,
  Sparkles,
  ArrowLeft,
  MapPin,
  X,
} from 'lucide-react';
import { useMessages } from '../../mock/messages';
import { useJobs } from '../../mock/jobs';
import { useToast } from '../../components/ToastContext';

const QUICK_RESPONSES = [
  'Confirmed surveyor appointment for tomorrow morning.',
  'Keys collected from the estate agent. Survey underway.',
  'Surveyor has noted your specific inspection request.',
  'RICS draft report is currently in final quality assurance review.',
];

export const AdminMessagesPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { conversations, sendMessage, markAsRead } = useMessages();
  const { jobs } = useJobs();
  const { addToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'unread'
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [mobileView, setMobileView] = useState('list'); // 'list' | 'chat'
  const messagesEndRef = useRef(null);

  // Initialize selected conversation from URL param or first conversation
  const urlJobId = searchParams.get('jobId');
  const urlConvId = searchParams.get('convId');

  const [selectedConvId, setSelectedConvId] = useState(() => {
    if (urlConvId) {
      const match = conversations.find((c) => c.id === urlConvId);
      if (match) return match.id;
    }
    if (urlJobId) {
      const match = conversations.find((c) => c.jobId === urlJobId);
      if (match) return match.id;
    }
    return conversations[0]?.id || 'conv-1';
  });

  const activeConv =
    conversations.find((c) => c.id === selectedConvId) || conversations[0];

  // Auto-scroll chat to bottom whenever messages change or conversation switches
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeConv?.messages?.length, selectedConvId]);

  // Mark conversation as read by admin when selected
  useEffect(() => {
    if (activeConv?.id && activeConv.unreadAdmin > 0) {
      markAsRead(activeConv.id, 'admin');
    }
  }, [activeConv?.id, activeConv?.unreadAdmin]);

  // Filter conversations by search query & filter tab
  const filteredConversations = conversations.filter((c) => {
    if (filterType === 'unread' && !(c.unreadAdmin > 0)) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (c.clientName || '').toLowerCase().includes(q) ||
      (c.jobId || '').toLowerCase().includes(q) ||
      (c.property || '').toLowerCase().includes(q) ||
      (c.clientEmail || '').toLowerCase().includes(q)
    );
  });

  // Calculate unread count for admin
  const totalUnreadAdmin = conversations.reduce(
    (sum, c) => sum + (c.unreadAdmin || 0),
    0
  );

  const handleSelectConv = (convId) => {
    setSelectedConvId(convId);
    markAsRead(convId, 'admin');
    setMobileView('chat');
  };

  const handleSendReply = (e) => {
    e?.preventDefault();
    if (!replyText.trim() || !activeConv) return;

    setIsSending(true);
    const messageContent = replyText.trim();
    setReplyText('');

    try {
      sendMessage(
        activeConv.id,
        messageContent,
        'Alexander Sterling (Admin)',
        'admin'
      );

      addToast({
        type: 'success',
        title: 'Reply Sent to Customer',
        message: `Your message has been delivered to ${activeConv.clientName} and synced with their portal.`,
      });
    } catch (err) {
      console.error(err);
      addToast({
        type: 'error',
        title: 'Dispatch Failed',
        message: 'Could not deliver message. Please retry.',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleApplyQuickResponse = (text) => {
    setReplyText(text);
  };

  const handleAttachFile = () => {
    addToast({
      type: 'info',
      title: 'Attachment Upload',
      message: 'Document/inspection note attached for customer preview.',
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] md:h-[calc(100vh-115px)] -mt-2 -mb-8 overflow-hidden max-w-7xl mx-auto">
      {/* Sleek Integrated Header & Status Strip (Ultra-Compact Single Row ~42px) */}
      <div className="bg-white px-3.5 py-2 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-2 shrink-0 mb-2.5">
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#0B1F4D] text-white flex items-center justify-center font-bold shrink-0 shadow-2xs">
              <MessageSquare className="w-3.5 h-3.5" />
            </div>
            <div>
              <h1 className="font-extrabold text-slate-900 text-sm leading-none flex items-center gap-1.5">
                <span>Messages Inbox</span>
                <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 text-[10.5px] font-mono font-bold">
                  {conversations.length}
                </span>
              </h1>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-slate-400">
            <span>•</span>
            <span className="text-slate-600 font-semibold">{totalUnreadAdmin} Unread</span>
            <span>•</span>
            <span className="text-slate-600 font-semibold">
              {new Set(conversations.map((c) => c.jobId)).size} Survey Jobs Linked
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Customer Portal Gateway Active</span>
          </span>
          <span className="hidden lg:inline text-[11px] text-slate-500 font-mono">
            info@njspropertygroup.com
          </span>
        </div>
      </div>

      {/* Main Split-Screen Messaging Hub (Takes remaining height exactly, no outer scroll) */}
      <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col md:flex-row flex-1 min-h-0">
        {/* Left Column: Conversation Directory */}
        <div
          className={`w-full md:w-80 lg:w-96 shrink-0 border-r border-slate-200 flex flex-col bg-slate-50/50 min-h-0 ${
            mobileView === 'chat' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Search & Header */}
          <div className="p-3 bg-white border-b border-slate-200 space-y-2 shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-[#0B1F4D] text-xs uppercase tracking-wider flex items-center gap-1.5">
                <span>Conversations</span>
                <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 text-[10px] font-mono font-bold">
                  {filteredConversations.length}
                </span>
              </h3>
              {totalUnreadAdmin > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                  {totalUnreadAdmin} New
                </span>
              )}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search customer, job, address..."
                className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20 focus:border-[#0B1F4D] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Quick Filter Tabs */}
            <div className="flex items-center gap-1 pt-0.5">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-2 py-0.5 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer ${
                  filterType === 'all'
                    ? 'bg-[#0B1F4D] text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                All Threads ({conversations.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('unread')}
                className={`px-2 py-0.5 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  filterType === 'unread'
                    ? 'bg-[#0B1F4D] text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <span>Unread</span>
                {totalUnreadAdmin > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                )}
              </button>
            </div>
          </div>

          {/* Conversation List (Scrolls independently) */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 min-h-0">
            {filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-slate-400">
                <AlertCircle className="w-6 h-6 mx-auto mb-1.5 text-slate-300" />
                <p className="text-xs font-medium">No matching threads found.</p>
              </div>
            ) : (
              filteredConversations.map((c) => {
                const isSelected = c.id === activeConv?.id;
                const lastMsg = c.messages?.[c.messages.length - 1];
                const hasUnread = (c.unreadAdmin || 0) > 0;

                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectConv(c.id)}
                    className={`w-full text-left p-3 transition-all flex items-start gap-2.5 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/80 border-l-4 border-l-[#0B1F4D] shadow-2xs'
                        : 'hover:bg-slate-100/70 border-l-4 border-l-transparent'
                    }`}
                  >
                    {/* Customer Avatar */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-2xs ${
                        isSelected
                          ? 'bg-[#0B1F4D] text-white'
                          : 'bg-white border border-slate-200 text-slate-700'
                      }`}
                    >
                      {c.clientName
                        ?.split(' ')
                        .map((n) => n[0])
                        .join('')
                        .substring(0, 2)
                        .toUpperCase() || 'CU'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span
                          className={`text-xs font-bold truncate ${
                            isSelected ? 'text-[#0B1F4D]' : 'text-slate-800'
                          }`}
                        >
                          {c.clientName}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                          {lastMsg?.time?.split(',')[0] || ''}
                        </span>
                      </div>

                      {/* Job Ref Pill + Property Address */}
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="px-1.5 py-0.2 rounded bg-slate-200/90 text-[9.5px] font-mono font-bold text-slate-700 shrink-0">
                          {c.jobId}
                        </span>
                        <span className="text-[10.5px] text-slate-500 truncate font-medium">
                          {c.property}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] text-slate-500 truncate leading-snug">
                          {lastMsg ? (
                            <span>
                              {lastMsg.role === 'admin' ? (
                                <strong className="text-slate-700 font-semibold">You: </strong>
                              ) : null}
                              {lastMsg.text}
                            </span>
                          ) : (
                            <span className="italic text-slate-400">No messages yet</span>
                          )}
                        </p>

                        {hasUnread && (
                          <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-bold shrink-0 shadow-xs">
                            {c.unreadAdmin} New
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Conversation & Reply Desk */}
        <div
          className={`flex-1 flex flex-col bg-white min-h-0 min-w-0 ${
            mobileView === 'list' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activeConv ? (
            <>
              {/* Thread Header Bar (shrink-0) */}
              <div className="px-3.5 py-2.5 sm:py-3 border-b border-slate-200 bg-white shrink-0">
                <div className="flex items-center justify-between gap-3 min-w-0">
                  <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                    {/* Mobile Back Button */}
                    <button
                      type="button"
                      onClick={() => setMobileView('list')}
                      className="md:hidden p-1.5 -ml-1 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer shrink-0"
                      title="Back to all conversations"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>

                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#0B1F4D] text-white flex items-center justify-center font-black text-xs shadow-xs shrink-0">
                      {activeConv.clientName
                        ?.split(' ')
                        .map((n) => n[0])
                        .join('')
                        .substring(0, 2)
                        .toUpperCase() || 'CU'}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h2 className="font-extrabold text-slate-900 text-xs sm:text-sm truncate">
                          {activeConv.clientName}
                        </h2>
                        <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold whitespace-nowrap">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Customer Portal
                        </span>
                      </div>

                      <div className="text-[10.5px] sm:text-[11px] text-slate-500 flex flex-wrap items-center gap-1.5 mt-0.5 font-medium min-w-0">
                        <span className="truncate max-w-[160px] sm:max-w-[240px] flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{activeConv.property}</span>
                        </span>
                        <span>•</span>
                        <span className="text-[#0B1F4D] font-bold whitespace-nowrap">{activeConv.surveyType}</span>
                        {activeConv.surveyor && (
                          <>
                            <span>•</span>
                            <span className="text-amber-800 font-semibold whitespace-nowrap bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200/80 text-[10px]">
                              {activeConv.surveyor}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions on right with strict whitespace-nowrap */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {activeConv.jobId && (
                      <Link
                        to={`/admin/jobs/${activeConv.jobId}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold transition-all whitespace-nowrap shadow-2xs cursor-pointer"
                        title="Open full survey job in workspace"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#0B1F4D]" />
                        <span>Job #{activeConv.jobId}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </Link>
                    )}

                    {activeConv.clientEmail && (
                      <a
                        href={`mailto:${activeConv.clientEmail}`}
                        className="p-1.5 rounded-xl text-slate-500 hover:text-[#0B1F4D] hover:bg-slate-100 transition-colors"
                        title={`Email ${activeConv.clientEmail}`}
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {activeConv.clientPhone && (
                      <a
                        href={`tel:${activeConv.clientPhone}`}
                        className="p-1.5 rounded-xl text-slate-500 hover:text-[#0B1F4D] hover:bg-slate-100 transition-colors"
                        title={`Call ${activeConv.clientPhone}`}
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Message Thread Body - THIS IS THE ONLY CHATBOX THAT SCROLLS! */}
              <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3.5 bg-slate-50/60 min-h-0">
                {/* Channel Pill */}
                <div className="flex items-center justify-center my-0.5">
                  <div className="px-3 py-0.5 rounded-full bg-white border border-slate-200/90 text-slate-600 text-[9.5px] font-bold uppercase tracking-wider shadow-2xs flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>RICS Survey Direct Communications • Job #{activeConv.jobId}</span>
                  </div>
                </div>

                {activeConv.messages?.map((m) => {
                  const isAdmin = m.role === 'admin';
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className="text-[10.5px] font-bold text-slate-600">{m.sender}</span>
                        <span className="text-[9.5px] text-slate-400 font-mono">• {m.time}</span>
                      </div>

                      <div
                        className={`max-w-xl p-3 sm:p-3.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-xs ${
                          isAdmin
                            ? 'bg-[#0B1F4D] text-white rounded-tr-none'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{m.text}</p>

                        {isAdmin && (
                          <div className="flex items-center justify-end gap-1 mt-1 text-blue-200/80 text-[9.5px] font-medium">
                            <span>Delivered to portal</span>
                            <CheckCheck className="w-3.5 h-3.5 text-sky-300" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Response Suggestion Chips (shrink-0) */}
              <div className="px-3 py-1.5 bg-slate-100/70 border-t border-slate-200/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
                <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-500 shrink-0 flex items-center gap-1 mr-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Quick Reply:
                </span>
                {QUICK_RESPONSES.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyQuickResponse(chip)}
                    className="shrink-0 px-2.5 py-0.5 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 text-slate-700 hover:text-[#0B1F4D] text-[10.5px] font-semibold transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Reply Composer Form (shrink-0 - ALWAYS 100% VISIBLE & DOCKED AT BOTTOM) */}
              <form
                onSubmit={handleSendReply}
                className="p-2.5 sm:p-3 bg-white border-t border-slate-200 shrink-0"
              >
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAttachFile}
                    className="p-2 rounded-xl text-slate-400 hover:text-[#0B1F4D] hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                    title="Attach inspection note or photo"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Reply to ${activeConv.clientName}... (Press Enter to send)`}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20 focus:border-[#0B1F4D] transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!replyText.trim() || isSending}
                    className="px-4 py-2 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <span>Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400 px-1">
                  <span className="truncate">
                    Replies sync in real-time with customer portal (
                    <span className="font-mono text-slate-600 font-medium">{activeConv.clientEmail}</span>).
                  </span>
                  <span className="font-semibold text-slate-500 whitespace-nowrap ml-2 hidden sm:inline">
                    Sender: Alexander Sterling (Admin)
                  </span>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400">
              <MessageSquare className="w-12 h-12 text-slate-200 mb-2" />
              <p className="text-sm font-semibold text-slate-600">No conversation selected</p>
              <p className="text-xs text-slate-400">Choose a customer thread from the left directory.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
