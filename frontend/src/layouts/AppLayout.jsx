import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';
import { BottomTabBar } from '../components/BottomTabBar';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

export const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const isMessagesPage =
    location.pathname.startsWith('/admin/messages') ||
    location.pathname.startsWith('/admin/message');

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
              ? 'flex-1 min-h-0 p-3 sm:p-4 lg:p-5 max-w-7xl w-full mx-auto flex flex-col overflow-hidden'
              : 'flex-1 p-3.5 sm:p-5 lg:p-6 xl:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-8'
          }
        >
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>

      {/* Mobile Bottom Tab Bar (visible below md) */}
      {!isMessagesPage && <BottomTabBar onOpenMore={() => setSidebarOpen(true)} />}
    </div>
  );
};
