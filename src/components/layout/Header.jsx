import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  Menu,
  ChevronDown,
  Building,
  User,
  Phone,
  Clock,
  ShieldCheck,
  MapPin,
  ArrowRight,
  HelpCircle,
  FileCheck2,
  Scale,
  Sparkles,
  ChevronRight,
  X
} from 'lucide-react';
import { siteConfig } from '../../config/siteConfig';
import { navigationCategories } from '../../config/navigation';
import { MobileNavigation } from './MobileNavigation';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState(null); // 'services' | 'coverage' | 'about' | null
  const headerNavRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const location = useLocation();

  const isHomePage = location.pathname === '/';
  const isServicesActive = location.pathname.startsWith('/services');
  const isCoverageActive = location.pathname === '/contact' && (location.search.includes('area=') || location.hash === '#coverage');
  const isAboutActive = location.pathname === '/contact' && !isCoverageActive;

  // Clear hover debounce timeout
  const clearHoverTimeout = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  // Open dropdown with cancel of any closing timeout
  const handleMouseEnter = (dropdownKey) => {
    clearHoverTimeout();
    setActiveDropdown(dropdownKey);
  };

  // Graceful debounce on mouse leave so user can move into the menu without flicker
  const handleMouseLeave = () => {
    clearHoverTimeout();
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 220);
  };

  // Toggle on click (for keyboard / tap)
  const toggleDropdown = (dropdownKey) => {
    clearHoverTimeout();
    setActiveDropdown(prev => (prev === dropdownKey ? null : dropdownKey));
  };

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerNavRef.current && !headerNavRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      clearHoverTimeout();
    };
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [location.pathname, location.search, location.hash]);

  // Smooth scroll to quote section if already on homepage
  const handleQuoteClick = (e) => {
    if (isHomePage) {
      e.preventDefault();
      const target = document.getElementById('quote-section') || document.getElementById('quote');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="site-header" role="banner">
      {/* 1. Top Announcement Bar (matching client's reference with Customer Login) */}
      {showAnnouncement && (
        <div className="header-announcement-strip">
          <div className="header-container">
            <div className="announcement-strip-inner">
              <div className="announcement-center">
                <span className="announcement-home-icon" role="img" aria-label="house">🏡</span>
                <span className="announcement-text">
                  Skip the wait – get a quote, book and pay for your survey online
                </span>
              </div>
              <div className="announcement-right">
                <Link to="/login" className="announcement-login-btn">
                  <span>Customer Login</span>
                  <ChevronRight size={13} aria-hidden="true" />
                </Link>
                <button
                  type="button"
                  className="announcement-dismiss-btn"
                  onClick={() => setShowAnnouncement(false)}
                  aria-label="Dismiss announcement banner"
                  title="Dismiss announcement"
                >
                  <X size={13} aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Secondary Utility / Trust & Hotline Strip (matching client's reference) */}
      <div className="header-utility-strip">
        <div className="header-container">
          <div className="utility-strip-inner">
            <div className="utility-left">
              <a
                href="https://www.trustpilot.com/review/esurv.co.uk"
                target="_blank"
                rel="noopener noreferrer"
                className="utility-trust-link"
                title="Read our Excellent reviews on Trustpilot"
                aria-label="Rated Excellent on Trustpilot with 4.8 out of 5 stars"
              >
                <span className="trust-highlight">Excellent</span>
                <div className="trustpilot-star-boxes" aria-hidden="true">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span key={i} className="tp-star-box">
                      <svg viewBox="0 0 16 16" width="11" height="11" fill="#FFFFFF">
                        <path d="M8 0.5l2.4 4.9 5.4 0.8-3.9 3.8 0.9 5.4-4.8-2.5-4.8 2.5 0.9-5.4-3.9-3.8 5.4-0.8z" />
                      </svg>
                    </span>
                  ))}
                </div>
                <div className="trustpilot-brand">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="#00b67a" className="tp-logo-star">
                    <path d="M12 1.5l3.2 6.5 7.2 1.1-5.2 5.1 1.2 7.2-6.4-3.4-6.4 3.4 1.2-7.2-5.2-5.1 7.2-1.1z" />
                  </svg>
                  <span className="trustpilot-name">Trustpilot</span>
                </div>
              </a>
            </div>
            <div className="utility-right">
              <span className="utility-call-text hide-mobile">Call us free today to book a survey</span>
              <a
                href={`tel:${siteConfig.contact.telephone}`}
                className="utility-phone-link"
                title="Call Survey Dispatch Hotline"
              >
                <Phone size={13} aria-hidden="true" />
                <span className="utility-phone-number">{siteConfig.contact.telephoneDisplay}</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="header-main">
        <div className="header-container">
          <div className="header-main-inner" ref={headerNavRef}>
            {/* Site Logo Emblem matching Luxury Mockup */}
            <Link to="/" className="site-logo" aria-label="Surveying Practice - Home">
              <div className="logo-badge" aria-hidden="true">
                <Building size={20} />
              </div>
              <div className="logo-text-group">
                <span className="logo-title font-serif">Surveying Practice</span>
                <span className="logo-subtitle">UK Independent Surveyors</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="desktop-nav" aria-label="Main Navigation">
              {/* Home */}
              <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Home
              </NavLink>

              {/* 1. Systematic Mega-Dropdown for Survey Services (e.surv Architecture) */}
              <div
                className="nav-dropdown-wrapper"
                onMouseEnter={() => handleMouseEnter('services')}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  className={`nav-dropdown-trigger ${isServicesActive || activeDropdown === 'services' ? 'active' : ''}`}
                  onClick={() => toggleDropdown('services')}
                  aria-expanded={activeDropdown === 'services'}
                  aria-haspopup="true"
                  aria-label="Survey Services Menu"
                >
                  <span>Survey Services</span>
                  <ChevronDown
                    size={14}
                    aria-hidden="true"
                    className="dropdown-chevron"
                    style={{
                      transform: activeDropdown === 'services' ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  />
                </button>

                {activeDropdown === 'services' && (
                  <div
                    className="nav-dropdown-menu nav-mega-menu"
                    role="menu"
                    aria-label="Survey Services Mega Menu"
                  >
                    <div className="mega-menu-grid">
                      {/* Column 1: Pre-Purchase Residential Surveys */}
                      <div className="mega-menu-col">
                        <div className="mega-col-header">
                          <span className="mega-col-title">Residential Surveys</span>
                          <span className="mega-col-caption">Pre-Purchase Condition Reports</span>
                        </div>
                        <div className="mega-col-items">
                          {navigationCategories.services.columns[0].items.map(service => (
                            <Link
                              key={service.id}
                              to={service.path}
                              className="dropdown-item mega-item"
                              role="menuitem"
                              onClick={() => setActiveDropdown(null)}
                            >
                              <div className="dropdown-item-top">
                                <span className="dropdown-item-title">{service.name}</span>
                                <span className="dropdown-item-badge">{service.badge}</span>
                              </div>
                              <span className="dropdown-item-desc">{service.description}</span>
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Column 2: Specialist Valuations & Dispute Evidence */}
                      <div className="mega-menu-col">
                        <div className="mega-col-header">
                          <span className="mega-col-title">Valuations &amp; Legal</span>
                          <span className="mega-col-caption">Appraisals &amp; Dispute Evidence</span>
                        </div>
                        <div className="mega-col-items">
                          {navigationCategories.services.columns[1].items.map(item => (
                            <Link
                              key={item.id}
                              to={item.path}
                              className="dropdown-item mega-item"
                              role="menuitem"
                              onClick={() => setActiveDropdown(null)}
                            >
                              <div className="dropdown-item-top">
                                <span className="dropdown-item-title">{item.name}</span>
                                <span className="dropdown-item-badge">{item.badge}</span>
                              </div>
                              <span className="dropdown-item-desc">{item.description}</span>
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Column 3: Advice, Coverage Hub & Fast Quotation Action */}
                      <div className="mega-menu-col mega-col-action">
                        <div className="mega-col-header">
                          <span className="mega-col-title">Advice &amp; Fast Action</span>
                          <span className="mega-col-caption">Guidance &amp; Coverage Hub</span>
                        </div>
                        <div className="mega-col-items">
                          {navigationCategories.services.columns[2].items.map(item => (
                            <Link
                              key={item.id}
                              to={item.path}
                              className="dropdown-item mega-item-sm"
                              role="menuitem"
                              onClick={() => setActiveDropdown(null)}
                            >
                              <div className="dropdown-item-title">{item.name}</div>
                              <span className="dropdown-item-desc">{item.description}</span>
                            </Link>
                          ))}
                        </div>

                        {/* Direct Fast Quotation Action Card */}
                        <div className="mega-action-card">
                          <div className="mega-action-card-inner">
                            <span className="mega-action-title">Need a Survey Quote?</span>
                            <p className="mega-action-sub" style={{ color: '#CBD5E1', margin: '0 0 0.65rem 0' }}>
                              Receive your fixed-fee written quote within 24 business hours.
                            </p>
                            <a
                              href={isHomePage ? '#quote-section' : '/contact#quote'}
                              onClick={(e) => {
                                setActiveDropdown(null);
                                handleQuoteClick(e);
                              }}
                              className="mega-action-btn"
                            >
                              <span>Request a Quote</span>
                              <ArrowRight size={13} aria-hidden="true" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Expert Witness */}
              <NavLink
                to="/expert-witness"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                Expert Witness
              </NavLink>

              {/* 3. Service Coverage Dropdown */}
              <div
                className="nav-dropdown-wrapper"
                onMouseEnter={() => handleMouseEnter('coverage')}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  className={`nav-dropdown-trigger ${isCoverageActive || activeDropdown === 'coverage' ? 'active' : ''}`}
                  onClick={() => toggleDropdown('coverage')}
                  aria-expanded={activeDropdown === 'coverage'}
                  aria-haspopup="true"
                  aria-label="Service Coverage Areas Menu"
                >
                  <span>Service Coverage</span>
                  <ChevronDown
                    size={14}
                    aria-hidden="true"
                    className="dropdown-chevron"
                    style={{
                      transform: activeDropdown === 'coverage' ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  />
                </button>

                {activeDropdown === 'coverage' && (
                  <div
                    className="nav-dropdown-menu coverage-dropdown-menu"
                    role="menu"
                    aria-label="Service Coverage Submenu"
                  >
                    <div className="dropdown-menu-header">
                      <span className="dropdown-menu-caption">London &amp; The Home Counties</span>
                    </div>

                    <div className="dropdown-items-grid">
                      {navigationCategories.coverage.children.map(area => (
                        <Link
                          key={area.id}
                          to={area.path}
                          className="dropdown-item"
                          role="menuitem"
                          onClick={() => setActiveDropdown(null)}
                        >
                          <div className="dropdown-item-top">
                            <span className="dropdown-item-title">{area.name}</span>
                            <span className="dropdown-item-badge">{area.badge}</span>
                          </div>
                          <span className="dropdown-item-desc">{area.description}</span>
                        </Link>
                      ))}
                    </div>

                    <div className="dropdown-menu-footer">
                      <Link
                        to="/contact#coverage"
                        className="dropdown-footer-link"
                        onClick={() => setActiveDropdown(null)}
                      >
                        <MapPin size={13} aria-hidden="true" />
                        <span>View All Coverage Areas &amp; Postcodes</span>
                        <ArrowRight size={13} aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. About / Contact Dropdown */}
              <div
                className="nav-dropdown-wrapper"
                onMouseEnter={() => handleMouseEnter('about')}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  className={`nav-dropdown-trigger ${isAboutActive || activeDropdown === 'about' ? 'active' : ''}`}
                  onClick={() => toggleDropdown('about')}
                  aria-expanded={activeDropdown === 'about'}
                  aria-haspopup="true"
                  aria-label="About & Contact Menu"
                >
                  <span>About / Contact</span>
                  <ChevronDown
                    size={14}
                    aria-hidden="true"
                    className="dropdown-chevron"
                    style={{
                      transform: activeDropdown === 'about' ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  />
                </button>

                {activeDropdown === 'about' && (
                  <div
                    className="nav-dropdown-menu about-dropdown-menu align-right"
                    role="menu"
                    aria-label="About and Contact Submenu"
                  >
                    <div className="dropdown-menu-header">
                      <span className="dropdown-menu-caption">Independent Practice Information</span>
                    </div>

                    <div className="dropdown-items-grid">
                      {navigationCategories.aboutContact.children.map(item => (
                        <Link
                          key={item.id}
                          to={item.path}
                          className="dropdown-item"
                          role="menuitem"
                          onClick={() => setActiveDropdown(null)}
                        >
                          <div className="dropdown-item-top">
                            <span className="dropdown-item-title">{item.name}</span>
                          </div>
                          <span className="dropdown-item-desc">{item.description}</span>
                        </Link>
                      ))}
                    </div>

                    <div className="dropdown-menu-footer dropdown-hotline-footer">
                      <a
                        href={`tel:${siteConfig.contact.telephone}`}
                        className="dropdown-hotline-link"
                        title="Direct Survey Hotline"
                      >
                        <div className="hotline-icon-wrap" aria-hidden="true">
                          <Phone size={14} />
                        </div>
                        <div className="hotline-text-wrap">
                          <span className="hotline-label">Direct Hotline:</span>
                          <span className="hotline-number">{siteConfig.contact.telephoneDisplay}</span>
                        </div>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </nav>

            {/* Header Actions */}
            <div className="header-actions">
              <Link to="/login" className="header-login-glass-btn hide-mobile">
                Sign In
              </Link>

              <a
                href={isHomePage ? '#quote-section' : '/contact#quote'}
                onClick={handleQuoteClick}
                className="header-quote-glass-btn"
              >
                <span>Request a Quote</span>
              </a>

              <button
                type="button"
                className="mobile-nav-toggle"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open Navigation Menu"
                aria-expanded={mobileMenuOpen}
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <MobileNavigation isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </header>
  );
}
