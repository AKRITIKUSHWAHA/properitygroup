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

  // Lock body scroll while in full-bleed messages
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

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
    <div className="w-full h-full flex flex-col md:flex-row bg-white overflow-hidden select-text">
      {/* Left Column: Conversation Directory (Full Height, Edge-to-Edge) */}
      <div
        className={`w-full md:w-80 lg:w-[340px] xl:w-[380px] shrink-0 border-r border-slate-200 bg-white flex flex-col h-full min-h-0 ${
          mobileView === 'chat' ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Directory Top Header Bar */}
        <div className="p-3.5 bg-white border-b border-slate-200 space-y-2.5 shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-[#0B1F4D] text-base tracking-tight flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#0B1F4D]" />
              <span>Customer Chats</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-mono font-bold">
                {conversations.length}
              </span>
            </h2>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10.5px] font-bold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Portal Gateway</span>
            </span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer, job ref, address..."
              className="w-full pl-8 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20 focus:border-[#0B1F4D] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 pt-0.5">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterType === 'unread'
                  ? 'bg-[#0B1F4D] text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              <span>Unread</span>
              {totalUnreadAdmin > 0 ? (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9.5px] font-bold">
                  {totalUnreadAdmin}
                </span>
              ) : null}
            </button>
          </div>
        </div>

        {/* Conversation List (Scrolls independently with isolated overscroll) */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 min-h-0 bg-slate-50/40 overscroll-contain">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-xs font-semibold text-slate-600">No matching conversations found</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Try searching with a different name or job reference.</p>
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
                  className={`w-full text-left p-3.5 transition-all flex items-start gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/90 border-l-4 border-l-[#0B1F4D] shadow-2xs'
                      : 'hover:bg-slate-100/70 border-l-4 border-l-transparent bg-white'
                  }`}
                >
                  {/* Customer Avatar */}
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 shadow-2xs ${
                      isSelected
                        ? 'bg-[#0B1F4D] text-white'
                        : 'bg-slate-100 border border-slate-200 text-slate-700'
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
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-xs sm:text-[13px] font-bold truncate ${
                          isSelected ? 'text-[#0B1F4D]' : 'text-slate-800'
                        }`}
                      >
                        {c.clientName}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0 font-mono ml-2">
                        {lastMsg?.time?.split(',')[0] || ''}
                      </span>
                    </div>

                    {/* Job Reference & Property */}
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-slate-200/90 text-[10px] font-mono font-bold text-slate-700 shrink-0">
                        {c.jobId}
                      </span>
                      <span className="text-[11px] text-slate-500 truncate font-medium">
                        {c.property}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11.5px] text-slate-500 truncate leading-snug">
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
                        <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[9.5px] font-bold shrink-0 shadow-xs">
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

      {/* Right Column: Active Conversation (Real Full-Screen Chat View) */}
      <div
        className={`flex-1 flex flex-col bg-[#F8FAFC] h-full min-h-0 min-w-0 ${
          mobileView === 'list' ? 'hidden md:flex' : 'flex'
        }`}
      >
        {activeConv ? (
          <>
            {/* Clean Real Chat Top Header Bar (Only Customer Avatar + Name) */}
            <div className="h-14 sm:h-16 px-4 sm:px-6 border-b border-slate-200 bg-white shrink-0 flex items-center justify-between gap-3 min-w-0 shadow-2xs">
              <div className="flex items-center gap-3 min-w-0">
                {/* Mobile Back Button */}
                <button
                  type="button"
                  onClick={() => setMobileView('list')}
                  className="md:hidden p-1.5 -ml-1 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer shrink-0"
                  title="Back to conversation list"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                {/* Customer Initials Badge */}
                <div className="w-10 h-10 rounded-xl bg-[#0B1F4D] text-white flex items-center justify-center font-extrabold text-sm shadow-xs shrink-0 tracking-wider">
                  {activeConv.clientName
                    ?.split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase() || 'CU'}
                </div>

                {/* ONLY Customer Name */}
                <h2 className="font-extrabold text-slate-900 text-base sm:text-lg truncate leading-tight">
                  {activeConv.clientName}
                </h2>
              </div>
            </div>

            {/* Message Thread Body (Real Chat Canvas - ONLY this container scrolls) */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/70 min-h-0 overscroll-contain">
              {/* Channel Header Divider */}
              <div className="flex items-center justify-center my-1">
                <div className="px-3.5 py-1 rounded-full bg-white border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-wider shadow-2xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>RICS Survey Direct Client Communications</span>
                  {activeConv.jobId && (
                    <>
                      <span>•</span>
                      <Link
                        to={`/admin/jobs/${activeConv.jobId}`}
                        className="text-[#0B1F4D] hover:underline flex items-center gap-1 font-mono font-bold"
                        title="Open full survey job in workspace"
                      >
                        <span>Job #{activeConv.jobId}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </Link>
                    </>
                  )}
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
                      <span className="text-[11px] font-bold text-slate-600">{m.sender}</span>
                      <span className="text-[10px] text-slate-400 font-mono">• {m.time}</span>
                    </div>

                    <div
                      className={`max-w-xl p-3.5 sm:p-4 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-xs ${
                        isAdmin
                          ? 'bg-[#0B1F4D] text-white rounded-tr-none'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{m.text}</p>

                      {isAdmin && (
                        <div className="flex items-center justify-end gap-1 mt-1.5 text-blue-200/80 text-[10px] font-medium">
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

            {/* Quick Response Suggestions Bar */}
            <div className="px-4 py-2 bg-slate-100/80 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 shrink-0 flex items-center gap-1 mr-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Quick Suggestions:
              </span>
              {QUICK_RESPONSES.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyQuickResponse(chip)}
                  className="shrink-0 px-3 py-1 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 text-slate-700 hover:text-[#0B1F4D] text-xs font-semibold transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Bottom Message Input Bar (Full Width, Flush at Bottom) */}
            <form
              onSubmit={handleSendReply}
              className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0"
            >
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleAttachFile}
                  className="p-2.5 rounded-xl text-slate-400 hover:text-[#0B1F4D] hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
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
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20 focus:border-[#0B1F4D] transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!replyText.trim() || isSending}
                  className="px-5 py-2.5 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="mt-1.5 flex items-center justify-between text-[10.5px] text-slate-400 px-1">
                <span className="truncate">
                  Direct 2-way sync with customer&apos;s portal (
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
  );
};
