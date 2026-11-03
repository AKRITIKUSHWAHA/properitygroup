import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  User,
  Building,
  Clock,
  CheckCircle2,
  Paperclip,
  Mail,
  Phone,
  ShieldCheck,
  X,
  ExternalLink,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { useMessages } from '../../mock/messages';
import { useToast } from '../ToastContext';

export const AdminMessagesModal = ({ isOpen, onClose, defaultJobId = null }) => {
  const { conversations, sendMessage, markAsRead } = useMessages();
  const { addToast } = useToast();

  const [selectedConvId, setSelectedConvId] = useState(() => {
    if (defaultJobId) {
      const match = conversations.find((c) => c.jobId === defaultJobId);
      if (match) return match.id;
    }
    return conversations[0]?.id || 'conv-1';
  });

  const [replyText, setReplyText] = useState('');

  const activeConv =
    conversations.find((c) => c.id === selectedConvId) || conversations[0];

  const handleSelectConv = (convId) => {
    setSelectedConvId(convId);
    markAsRead(convId, 'admin');
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !activeConv) return;

    sendMessage(
      activeConv.id,
      replyText.trim(),
      'NJS Operations Desk (Sarah)',
      'admin'
    );

    setReplyText('');

    addToast({
      type: 'success',
      title: 'Reply Dispatched to Customer',
      message: `Message sent to ${activeConv.clientName}. Notification copy sent to info@njspropertygroup.com.`,
    });
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Central Operations Messaging Desk"
      subtitle="Communicate directly with clients in their private portal. Messages sync in real-time."
      maxWidth="max-w-4xl"
      footer={
        <div className="flex items-center justify-between w-full text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-blue-600" />
            <span>Connected to Business Mail: <strong>info@njspropertygroup.com</strong></span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
          >
            Close Desk
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[520px]">
        {/* Left Column: Conversation List */}
        <div className="border border-slate-200 rounded-2xl overflow-y-auto divide-y divide-slate-100 bg-slate-50/50">
          <div className="p-3 bg-white border-b border-slate-200 sticky top-0 z-10">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
              <span>Active Threads</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono font-bold">
                {conversations.length}
              </span>
            </div>
          </div>

          {conversations.map((c) => {
            const isSelected = c.id === activeConv?.id;
            const lastMsg = c.messages[c.messages.length - 1];

            return (
              <div
                key={c.id}
                onClick={() => handleSelectConv(c.id)}
                className={`p-3.5 cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-white shadow-xs border-l-4 border-l-[#2563EB]'
                    : 'hover:bg-white/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {c.clientName}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {c.jobId}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-0.5 font-medium">
                  {c.property}
                </p>
                {lastMsg && (
                  <p className="text-[11px] text-slate-400 truncate mt-1 italic">
                    {lastMsg.role === 'admin' ? 'You: ' : ''}
                    {lastMsg.text}
                  </p>
                )}
                {c.unreadAdmin > 0 && (
                  <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                    {c.unreadAdmin} new
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Column: Chat Window */}
        <div className="md:col-span-2 border border-slate-200 rounded-2xl flex flex-col bg-white overflow-hidden">
          {/* Header */}
          {activeConv && (
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-[#0B1F4D]">
                    {activeConv.clientName}
                  </h4>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md">
                    {activeConv.jobId}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate">
                  {activeConv.property} &bull; {activeConv.surveyType}
                </p>
              </div>

              <div className="text-right text-[11px] text-slate-500">
                <span className="block font-semibold">Surveyor: {activeConv.surveyor}</span>
                <span className="text-slate-400">{activeConv.clientPhone}</span>
              </div>
            </div>
          )}

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/30">
            {activeConv?.messages?.map((msg) => {
              const isAdmin = msg.role === 'admin';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[10px] font-bold text-slate-500">
                      {msg.sender}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {msg.time}
                    </span>
                  </div>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs font-medium leading-relaxed shadow-2xs ${
                      isAdmin
                        ? 'bg-[#0B1F4D] text-white rounded-tr-xs'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input & Dispatch */}
          <form
            onSubmit={handleSendReply}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={`Reply to ${activeConv?.clientName || 'customer'}...`}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
            <button
              type="submit"
              disabled={!replyText.trim()}
              className="px-4 py-2.5 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </Modal>
  );
};

