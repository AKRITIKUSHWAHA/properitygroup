import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, ChevronDown, Building, User } from 'lucide-react';
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

  return (
    <header className="site-header" role="banner">
      {/* Main Navigation Bar */}
      <div className="header-main">
        <div className="header-container">
          <div className="header-main-inner">
            {/* Site Logo Placeholder */}
            <Link to="/" className="site-logo" aria-label={`${siteConfig.companyName} - Home`}>
              <div className="logo-badge" aria-hidden="true">
                <Building size={24} />
              </div>
              <div className="logo-text-group">
                <span className="logo-title">{siteConfig.companyName}</span>
                <span className="logo-subtitle">Independent RICS-Aligned Surveyors</span>
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
                  <ChevronDown size={14} aria-hidden="true" style={{ transform: servicesDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
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
                        <span className="dropdown-item-title">{service.name}</span>
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
              <Button to="/login" variant="secondary" size="md" icon={User} className="header-login-btn">
                Client Portal
              </Button>

              <Button to="/contact#quote" variant="gold" size="md" className="header-quote-btn">
                Get a Quote
              </Button>

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


