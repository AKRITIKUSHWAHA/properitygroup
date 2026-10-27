import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';
import { BottomTabBar } from '../components/BottomTabBar';

export const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#D5DAE2] flex flex-col antialiased">
      {/* Sidebar: Mobile off-canvas drawer / Tablet icon rail (64px) / Desktop 240px */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-16 lg:pl-[260px] min-w-0 transition-all duration-300">
        {/* Sticky Top Bar */}
        <TopBar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        {/* Dynamic Page Content with bottom padding on mobile for the BottomTabBar */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Tab Bar (visible below md) */}
      <BottomTabBar onOpenMore={() => setSidebarOpen(true)} />
    </div>
  );
};
