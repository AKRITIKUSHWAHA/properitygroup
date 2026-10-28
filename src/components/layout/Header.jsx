import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, ChevronDown, Building, User, Phone, Clock, ShieldCheck, MapPin, ArrowRight } from 'lucide-react';
import { siteConfig } from '../../config/siteConfig';
import { approvedServices } from '../../config/services';
import { Button } from '../common/Button';
import { MobileNavigation } from './MobileNavigation';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  // Close dropdown on outside click or escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setServicesDropdownOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setServicesDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setServicesDropdownOpen(false);
  }, [location.pathname]);

  const isServicesActive = location.pathname.startsWith('/services');
  const isHomePage = location.pathname === '/';

  return (
    <header className={`site-header ${isHomePage ? 'site-header-floating' : ''}`} role="banner">
      {/* Top Utility Bar with Direct Hotline & Practice Standards (Subpages) */}
      {!isHomePage && (
        <div className="header-topbar">
          <div className="header-container">
            <div className="header-topbar-inner">
              <div className="topbar-items">
                <span className="topbar-item">
                  <ShieldCheck size={13} aria-hidden="true" />
                  <span>RICS Home Survey Standard Aligned Practice</span>
                </span>
                <span className="topbar-item hide-mobile">
                  <MapPin size={13} aria-hidden="true" />
                  <span>London &bull; Surrey &bull; Oxfordshire &bull; Buckinghamshire &bull; Berkshire</span>
                </span>
              </div>
              <div className="topbar-items">
                <a href={`tel:${siteConfig.contact.telephone}`} className="topbar-item topbar-phone" title="Call Survey Dispatch Hotline">
                  <Phone size={13} aria-hidden="true" />
                  <span>Survey Hotline: <strong>{siteConfig.contact.telephoneDisplay}</strong></span>
                </a>
                <span className="topbar-item hide-mobile">
                  <Clock size={13} aria-hidden="true" />
                  <span>Mon–Fri 8:30–18:00</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation Bar */}
      <div className="header-main">
        <div className="header-container">
          <div className="header-main-inner">
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
              <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Home
              </NavLink>

              {/* Services Dropdown */}
              <div className="nav-dropdown-wrapper" ref={dropdownRef}>
                <button
                  type="button"
                  className={`nav-dropdown-trigger ${isServicesActive ? 'active' : ''}`}
                  onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
                  aria-expanded={servicesDropdownOpen}
                  aria-haspopup="true"
                  aria-label="Survey Services Menu"
                >
                  <span>Survey Services</span>
                  <ChevronDown
                    size={14}
                    aria-hidden="true"
                    style={{
                      transform: servicesDropdownOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  />
                </button>

                {servicesDropdownOpen && (
                  <div className="nav-dropdown-menu" role="menu">
                    {approvedServices.map(service => (
                      <Link
                        key={service.id}
                        to={service.path}
                        className="dropdown-item"
                        role="menuitem"
                        onClick={() => setServicesDropdownOpen(false)}
                      >
                        <div className="dropdown-item-top">
                          <span className="dropdown-item-title">{service.name}</span>
                          <span className="dropdown-item-badge">{service.badge}</span>
                        </div>
                        <span className="dropdown-item-desc">{service.tagline}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <NavLink to="/expert-witness" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Expert Witness
              </NavLink>

              <NavLink to="/contact" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Contact &amp; Coverage
              </NavLink>
            </nav>

            {/* Header Actions */}
            <div className="header-actions">
              <Link to="/login" className="header-login-glass-btn hide-mobile">
                Sign In
              </Link>

              <a href="/#quote-section" className="header-quote-glass-btn">
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
