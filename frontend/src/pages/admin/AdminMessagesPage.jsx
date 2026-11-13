import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  MessageSquare,
  Send,
  Paperclip,
  Search,
  ExternalLink,
  Check,
  CheckCheck,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  X,
} from 'lucide-react';
import { useMessages } from '../../mock/messages';
import { useToast } from '../../components/ToastContext';
import { adminMessagesApi } from '../../api/adminApi';

const QUICK_RESPONSES = [
  'Confirmed surveyor appointment for tomorrow morning.',
  'Keys collected from the estate agent. Survey underway.',
  'Surveyor has noted your specific inspection request.',
  'RICS draft report is currently in final quality assurance review.',
];

const getMessageTime = (timeStr) => {
  if (!timeStr) return '';
  if (timeStr.includes(',')) {
    return timeStr.split(',')[1].trim();
  }
  return timeStr;
};

export const AdminMessagesPage = () => {
  const [searchParams] = useSearchParams();
  const { conversations, sendMessage, markAsRead } = useMessages();
  const { addToast } = useToast();

  const [apiThreads, setApiThreads] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'unread'
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [mobileView, setMobileView] = useState('list'); // 'list' | 'chat'

  // Fetch threads & metrics from backend messages API (MySQL)
  const fetchThreads = async () => {
    try {
      const res = await adminMessagesApi.getThreads();
      const rawThreads = res?.threads || res?.data?.threads || [];
      if (Array.isArray(rawThreads) && rawThreads.length > 0) {
        const mapped = rawThreads.map((t) => {
          return {
            id: t.conversationId,
            jobId: t.jobId || 'General Inquiry',
            jobDbId: t.jobDbId || null,
            clientEmail: t.clientEmail || 'customer@demo.com',
            clientName: t.clientName || 'Customer',
            property: t.property || 'Direct Portal Query',
            unreadAdmin: t.unreadAdmin || 0,
            unreadCustomer: t.unreadCustomer || 0,
            messages: (t.messages || []).map((m) => {
              const created = m.createdAt ? new Date(m.createdAt) : new Date();
              const timeString =
                m.time ||
                `${created.toLocaleDateString('en-GB')}, ${created.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
              return {
                id: m.id,
                sender:
                  m.sender ||
                  m.senderName ||
                  (m.role === 'admin' ? 'Alexander Sterling (Admin)' : t.clientName),
                role: m.role || 'customer',
                text: m.text || m.content || '',
                time: timeString,
                readByCustomer: Boolean(m.readByCustomer),
              };
            }),
          };
        });
        setApiThreads(mapped);
      }
      adminMessagesApi.getMetrics().catch(() => {});
    } catch (err) {
      console.warn('Unable to load threads from backend messages API:', err);
    } finally {
      setIsLoadingThreads(false);
    }
  };

  useEffect(() => {
    fetchThreads();
    const interval = setInterval(fetchThreads, 15000);
    return () => clearInterval(interval);
  }, []);

  const chatMessagesRef = useRef(null);

  // Ensure body scroll is unlocked and page is positioned cleanly at top
  useEffect(() => {
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  const displayConversations = apiThreads.length > 0 ? apiThreads : conversations;

  // Initialize selected conversation from URL param or first conversation
  const urlJobId = searchParams.get('jobId');
  const urlConvId = searchParams.get('convId');

  const [selectedConvId, setSelectedConvId] = useState(() => {
    if (urlConvId) {
      const match = displayConversations.find((c) => c.id === urlConvId);
      if (match) return match.id;
    }
    if (urlJobId) {
      const match = displayConversations.find((c) => c.jobId === urlJobId);
      if (match) return match.id;
    }
    return displayConversations[0]?.id || 'conv-1';
  });

  // Ensure selectedConvId is synchronized whenever threads load
  useEffect(() => {
    if (apiThreads.length > 0) {
      setSelectedConvId((current) => {
        if (current && apiThreads.some((t) => t.id === current || t.jobId === current)) {
          return current;
        }
        return apiThreads[0].id;
      });
    }
  }, [apiThreads]);

  const activeConv =
    displayConversations.find((c) => c.id === selectedConvId || c.jobId === selectedConvId) ||
    displayConversations[0];

  // Auto-scroll ONLY the chat messages container to bottom without shifting the parent window
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [activeConv?.messages?.length, selectedConvId]);

  // Mark conversation as read by admin when selected
  useEffect(() => {
    if (activeConv?.id && activeConv.unreadAdmin > 0) {
      markAsRead(activeConv.id, 'admin');
      adminMessagesApi.markRead(activeConv.id).catch(() => {});
      setApiThreads((prev) =>
        prev.map((t) => (t.id === activeConv.id ? { ...t, unreadAdmin: 0 } : t))
      );
    }
  }, [activeConv?.id, activeConv?.unreadAdmin]);

  // Filter conversations by search query & filter tab
  const filteredConversations = displayConversations.filter((c) => {
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
  const totalUnreadAdmin = displayConversations.reduce(
    (sum, c) => sum + (c.unreadAdmin || 0),
    0
  );

  const handleSelectConv = (convId) => {
    setSelectedConvId(convId);
    markAsRead(convId, 'admin');
    adminMessagesApi.markRead(convId).catch(() => {});
    setApiThreads((prev) =>
      prev.map((t) => (t.id === convId ? { ...t, unreadAdmin: 0 } : t))
    );
    setMobileView('chat');
  };

  const handleSendReply = async (e) => {
    e?.preventDefault();
    if (!replyText.trim() || !activeConv) return;

    setIsSending(true);
    const messageContent = replyText.trim();
    setReplyText('');

    const timeString = `${new Date().toLocaleDateString('en-GB')}, ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
    const tempId = Date.now();
    const optimisticMsg = {
      id: tempId,
      sender: 'Alexander Sterling (Admin)',
      role: 'admin',
      text: messageContent,
      time: timeString,
      readByCustomer: false,
    };

    // Optimistically update thread state
    setApiThreads((prev) =>
      prev.map((t) => {
        if (t.id === activeConv.id) {
          return {
            ...t,
            unreadCustomer: (t.unreadCustomer || 0) + 1,
            messages: [...(t.messages || []), optimisticMsg],
          };
        }
        return t;
      })
    );

    // Sync with mock/localStorage for cross-tab reactivity
    try {
      sendMessage(
        activeConv.id,
        messageContent,
        'Alexander Sterling (Admin)',
        'admin'
      );
    } catch {
      // ignore
    }

    try {
      const res = await adminMessagesApi.sendMessage({
        conversationId: activeConv.id,
        content: messageContent,
        jobId: activeConv.jobDbId || activeConv.jobId || null,
      });

      const savedMsg = res?.message || res?.data?.message;
      if (savedMsg?.id) {
        setApiThreads((prev) =>
          prev.map((t) => {
            if (t.id === activeConv.id) {
              return {
                ...t,
                messages: (t.messages || []).map((m) =>
                  m.id === tempId ? { ...m, id: savedMsg.id, readByCustomer: Boolean(savedMsg.readByCustomer) } : m
                ),
              };
            }
            return t;
          })
        );
      }

      addToast({
        type: 'success',
        title: 'Reply Sent to Customer',
        message: `Your message has been delivered to ${activeConv.clientName} and saved to database.`,
      });
    } catch (err) {
      console.error('Failed to persist message via API:', err);
      addToast({
        type: 'error',
        title: 'Dispatch Warning',
        message: 'Message delivered locally, but failed to sync to server database.',
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
    <div className="h-full flex flex-col min-h-0 space-y-2 max-w-7xl mx-auto w-full overflow-hidden">
      {/* Clean Header (Breadcrumbs + Page Title) */}
      <div className="shrink-0 px-0.5 pt-0.5">
        <nav className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium whitespace-nowrap mb-0.5">
          <span>NJS Property Group</span>
          <span className="text-slate-400">/</span>
          <span>Admin</span>
          <span className="text-slate-400">/</span>
          <span className="text-[#2563EB] font-bold">Messages</span>
        </nav>
        <h1 className="text-lg sm:text-xl font-extrabold text-[#0B1F4D] tracking-tight">
          Messages Inbox &amp; Client Communications
        </h1>
      </div>

      {/* Main Chat Application Card (Separated from sidebar with rounded borders & soft shadow) */}
      <div className="flex-1 min-h-0 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col md:flex-row select-text">
        {/* Left Column: Conversation Directory */}
        <div
          className={`w-full md:w-80 lg:w-[340px] xl:w-[360px] shrink-0 border-r border-slate-200 bg-white flex flex-col h-full min-h-0 ${
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
                {displayConversations.length}
              </span>
            </h2>

            <button
              type="button"
              onClick={fetchThreads}
              title="Refresh messages from database"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10.5px] font-bold shadow-2xs transition-colors cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Portal Gateway</span>
            </button>
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
              All Threads ({displayConversations.length})
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

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 min-h-0 bg-slate-50/40">
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
            {/* WhatsApp-Style Chat Top Header Bar */}
            <div className="h-16 px-4 sm:px-5 border-b border-slate-200 bg-white shrink-0 flex items-center justify-between gap-3 min-w-0 shadow-2xs">
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

                {/* Customer Avatar with Active Online Dot */}
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full bg-[#0B1F4D] text-white flex items-center justify-center font-bold text-sm shadow-xs tracking-wider">
                    {activeConv.clientName
                      ?.split(' ')
                      .map((n) => n[0])
                      .join('')
                      .substring(0, 2)
                      .toUpperCase() || 'CU'}
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white absolute bottom-0 right-0" />
                </div>

                <div className="min-w-0">
                  <h2 className="font-bold text-slate-900 text-sm sm:text-base truncate leading-tight">
                    {activeConv.clientName}
                  </h2>
                  <p className="text-[11px] text-emerald-600 font-medium truncate flex items-center gap-1.5">
                    <span>Active on Portal</span>
                    {activeConv.property && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-500 truncate max-w-[240px]">{activeConv.property}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Linked Job Reference Badge */}
              {activeConv.jobId && (
                <Link
                  to={`/admin/jobs/${activeConv.jobId}`}
                  className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-[#0B1F4D] text-xs font-mono font-bold flex items-center gap-1.5 transition-colors shrink-0"
                  title="Open full survey job in workspace"
                >
                  <span>Job #{activeConv.jobId}</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </Link>
              )}
            </div>

            {/* Message Thread Body (WhatsApp Web Style Canvas) */}
            <div
              ref={chatMessagesRef}
              className="flex-1 p-3.5 sm:p-5 overflow-y-auto space-y-2 bg-[#F0F2F5] min-h-0"
            >
              {/* Centered Date / Channel Divider */}
              <div className="flex items-center justify-center my-1.5 sticky top-0 z-10 pointer-events-none">
                <span className="px-3 py-1 rounded-lg bg-white/95 backdrop-blur-xs border border-slate-200/80 text-slate-600 text-[11px] font-semibold shadow-2xs">
                  RICS Client Direct Communications
                </span>
              </div>

              {activeConv.messages?.map((m) => {
                const isAdmin = m.role === 'admin';
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col mb-1.5 ${isAdmin ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`relative px-3.5 py-2 text-[13px] sm:text-[13.5px] leading-relaxed shadow-2xs break-words max-w-[85%] sm:max-w-[72%] md:max-w-[62%] w-fit min-w-[110px] select-text ${
                        isAdmin
                          ? 'bg-[#0B1F4D] text-white rounded-2xl rounded-tr-xs'
                          : 'bg-white text-slate-900 rounded-2xl rounded-tl-xs border border-slate-200/80'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{m.text}</p>

                      <div
                        className={`flex items-center justify-end gap-1 mt-1 float-right ml-3 select-none -mb-0.5 ${
                          isAdmin ? 'text-blue-200/70' : 'text-slate-400'
                        }`}
                      >
                        <span className="text-[10px] font-mono leading-none">
                          {getMessageTime(m.time)}
                        </span>
                        {isAdmin && (
                          m.readByCustomer ? (
                            <CheckCheck className="w-3.5 h-3.5 text-sky-400 shrink-0 inline" title="Seen by customer" />
                          ) : (
                            <Check className="w-3.5 h-3.5 text-blue-300/70 shrink-0 inline" title="Delivered to portal" />
                          )
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Response Suggestions Bar */}
            <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 shrink-0 flex items-center gap-1 mr-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Quick Reply:
              </span>
              {QUICK_RESPONSES.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyQuickResponse(chip)}
                  className="shrink-0 px-2.5 py-1 rounded-full bg-white hover:bg-blue-50 border border-slate-200 text-slate-700 hover:text-[#0B1F4D] text-xs font-medium transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Bottom Message Input Bar (WhatsApp Web Style) */}
            <form
              onSubmit={handleSendReply}
              className="p-2.5 sm:p-3 bg-white border-t border-slate-200 shrink-0"
            >
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAttachFile}
                  className="p-2 rounded-full text-slate-500 hover:text-[#0B1F4D] hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                  title="Attach inspection note or photo"
                >
                  <Paperclip className="w-5 h-5" />
                </button>

                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Type a message to ${activeConv.clientName}...`}
                    className="w-full px-4 py-2.5 bg-slate-100 border-0 rounded-full text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!replyText.trim() || isSending}
                  className="w-10 h-10 rounded-full bg-[#0B1F4D] hover:bg-[#162E6E] disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-xs transition-all flex items-center justify-center shrink-0 cursor-pointer"
                  title="Send message"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
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
