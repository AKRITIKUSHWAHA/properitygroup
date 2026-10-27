import React from 'react';
import { Outlet } from 'react-router-dom';
import { useScrollToTop } from '../../hooks/useScrollToTop';
import { Header } from './Header';
import { Footer } from './Footer';

export function PublicLayout() {
  // Automatically scroll viewport to top on route change
  useScrollToTop();

  return (
    <div className="site-wrapper flex flex-col min-h-screen bg-white">
      {/* WCAG 2.1 AA Skip to Content Link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Main Public Header & Navigation */}
      <Header />

      {/* Main Page Landmark */}
      <main id="main-content" tabIndex="-1" role="main" className="flex-1">
        <Outlet />
      </main>

      {/* Professional Website Footer */}
      <Footer />
    </div>
  );
}

export default PublicLayout;

