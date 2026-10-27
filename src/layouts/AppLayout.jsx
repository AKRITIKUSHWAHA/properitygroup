import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';

export const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F3F5F9] flex flex-col">
      {/* Sidebar (drawer on mobile, fixed column on desktop lg) */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-72 min-w-0 transition-all duration-300">
        {/* Sticky Top Bar */}
        <TopBar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
