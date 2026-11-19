import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';
import { BottomTabBar } from '../components/BottomTabBar';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../components/ToastContext';

export const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const notifiedMsgTimesRef = useRef(new Set());

  const isMessagesPage =
    location.pathname.startsWith('/admin/messages') ||
    location.pathname.startsWith('/admin/message') ||
    location.pathname.startsWith('/surveyor/messages') ||
    location.pathname.startsWith('/customer/messages');

  // Real-time incoming chat listener across all pages for instant notifications
  useEffect(() => {
    let isMounted = true;

    const checkIncomingMessages = async () => {
      try {
        const token = localStorage.getItem('property_group_auth_token');
        if (!token) return;

        const res = await fetch('/api/v1/messages/contacts', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          const contacts = data?.contacts || data?.data?.contacts || [];

          contacts.forEach((c) => {
            const hasUnread = c.unread || c.unreadCount > 0;
            const msgTime = c.lastMessageTime ? new Date(c.lastMessageTime).getTime() : 0;
            const notificationKey = `${c.id}_${msgTime}`;

            // Trigger notification alert if unread and not yet toasted
            if (hasUnread && msgTime > 0 && !notifiedMsgTimesRef.current.has(notificationKey)) {
              notifiedMsgTimesRef.current.add(notificationKey);

              // Broadcast notification to header notification bell
              window.dispatchEvent(
                new CustomEvent('njs_new_message_notification', {
                  detail: {
                    contactId: c.id,
                    senderName: c.name || 'Operations',
                    text: c.lastMessage || 'New message received',
                    time: c.time || 'Just now',
                  },
                })
              );

              // Only show popup Toast if user is NOT currently looking at the messages page
              if (!isMessagesPage) {
                addToast({
                  type: 'info',
                  title: `💬 New Message from ${c.name || 'Operations Desk'}`,
                  message: c.lastMessage ? `"${c.lastMessage.slice(0, 90)}${c.lastMessage.length > 90 ? '...' : ''}"` : 'You have received a new message.',
                  duration: 6500,
                });
              }
            }
          });
        }
      } catch {}
    };

    // Initial check
    checkIncomingMessages();

    // Fast 3-second poll for snappy notification alerts
    const interval = setInterval(checkIncomingMessages, 3000);

    // Cross-tab broadcast channel for instantaneous 0-delay sync
    let bc = null;
    try {
      bc = new BroadcastChannel('njs_chat_sync');
      bc.onmessage = (ev) => {
        if (ev?.data?.type === 'CHAT_UPDATED') {
          checkIncomingMessages();
        }
      };
    } catch {}

    const handleStorage = (e) => {
      if (e.key === 'njs_last_chat_dispatch' || e.key === 'propertygroup_conversations_v1') {
        checkIncomingMessages();
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      isMounted = false;
      clearInterval(interval);
      if (bc) bc.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, [isMessagesPage, user?.role, addToast]);

  return (
    <div
      className={
        isMessagesPage
          ? 'h-screen max-h-screen overflow-hidden bg-[#D5DAE2] flex flex-col antialiased'
          : 'min-h-screen bg-[#D5DAE2] flex flex-col antialiased'
      }
    >
      {/* Sidebar: Mobile off-canvas drawer / Tablet icon rail (64px) / Desktop 240px */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col md:pl-16 xl:pl-[260px] min-w-0 transition-all duration-300 ${
          isMessagesPage ? 'h-full max-h-screen overflow-hidden' : ''
        }`}
      >
        {/* Sticky Top Bar */}
        <TopBar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        {/* Dynamic Page Content */}
        <main
          className={
            isMessagesPage
              ? 'flex-1 min-h-0 p-2 sm:p-3 lg:p-3.5 max-w-7xl w-full mx-auto flex flex-col overflow-hidden'
              : 'flex-1 p-3.5 sm:p-5 lg:p-6 xl:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-8'
          }
        >
          <ErrorBoundary key={location.pathname} locationKey={location.pathname}>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>

      {/* Mobile Bottom Tab Bar (visible below md) */}
      {!isMessagesPage && <BottomTabBar onOpenMore={() => setSidebarOpen(true)} />}
    </div>
  );
};
