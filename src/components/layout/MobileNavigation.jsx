import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { NavLink } from 'react-router-dom';
import {
  X,
  ChevronRight,
  ChevronDown,
  Phone,
  ShieldCheck,
  User,
  MapPin,
  Building,
  HelpCircle
} from 'lucide-react';
import { navigationCategories } from '../../config/navigation';
import { siteConfig } from '../../config/siteConfig';
import { Button } from '../common/Button';

export function MobileNavigation({ isOpen, onClose }) {
  const drawerRef = useRef(null);
  const [expandedSection, setExpandedSection] = useState('services'); // default open 'services' accordion

  const toggleSection = (sectionKey) => {
    setExpandedSection(prev => (prev === sectionKey ? null : sectionKey));
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Trap focus inside drawer when opened & lock body scroll
  useEffect(() => {
    if (isOpen && drawerRef.current) {
      drawerRef.current.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="mobile-drawer-overlay"
      onClick={onClose}
      aria-hidden={!isOpen}
    >
      <div
        className="mobile-drawer"
        ref={drawerRef}
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
        aria-label="Site Navigation Menu"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mobile-drawer-header">
          <div className="mobile-drawer-brand">
            <div className="logo-badge" aria-hidden="true" style={{ width: '32px', height: '32px' }}>
              <Building size={16} />
            </div>
            <div>
              <span className="logo-title font-serif" style={{ fontSize: '1rem', color: '#FFFFFF', display: 'block' }}>
                {siteConfig.companyName}
              </span>
              <span style={{ fontSize: '0.68rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                UK Independent Surveyors
              </span>
            </div>
          </div>
          <button
            type="button"
            className="mobile-nav-toggle"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Accordion Links */}
        <nav className="mobile-drawer-links" aria-label="Mobile Navigation">
          {/* Home */}
          <NavLink
            to="/"
            end
            className={({ isActive }) => `mobile-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <span>Home</span>
            <ChevronRight size={15} />
          </NavLink>

          {/* 1. Systematic Survey Services Accordion (e.surv Architecture) */}
          <div className="mobile-accordion-group">
            <button
              type="button"
              className={`mobile-accordion-trigger ${expandedSection === 'services' ? 'is-expanded' : ''}`}
              onClick={() => toggleSection('services')}
              aria-expanded={expandedSection === 'services'}
            >
              <span>Survey Services</span>
              <ChevronDown
                size={16}
                aria-hidden="true"
                style={{
                  transform: expandedSection === 'services' ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              />
            </button>

            {expandedSection === 'services' && (
              <div className="mobile-accordion-panel">
                <div className="mobile-panel-section-caption">Residential Surveys</div>
                {navigationCategories.services.columns[0].items.map(service => (
                  <NavLink
                    key={service.id}
                    to={service.path}
                    className={({ isActive }) => `mobile-sublink ${isActive ? 'active' : ''}`}
                    onClick={onClose}
                  >
                    <div className="mobile-sublink-inner">
                      <span className="mobile-sublink-title">{service.name}</span>
                      <span className="mobile-sublink-badge">{service.badge}</span>
                    </div>
                  </NavLink>
                ))}

                <div className="mobile-panel-section-caption" style={{ marginTop: '0.5rem' }}>Valuations &amp; Specialist</div>
                {navigationCategories.services.columns[1].items.map(item => (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    className={({ isActive }) => `mobile-sublink ${isActive ? 'active' : ''}`}
                    onClick={onClose}
                  >
                    <div className="mobile-sublink-inner">
                      <span className="mobile-sublink-title">{item.name}</span>
                      <span className="mobile-sublink-badge">{item.badge}</span>
                    </div>
                  </NavLink>
                ))}

                <NavLink
                  to="/contact#faqs"
                  className="mobile-sublink mobile-sublink-all"
                  onClick={onClose}
                  style={{ marginTop: '0.35rem' }}
                >
                  <HelpCircle size={13} style={{ marginRight: '6px', color: '#F8D37D' }} />
                  <span>Which Survey Do I Need? Guide</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* 2. Expert Witness */}
          <NavLink
            to="/expert-witness"
            className={({ isActive }) => `mobile-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>Expert Witness</span>
              <span className="mobile-pill-badge">CPR Part 35</span>
            </div>
            <ChevronRight size={15} />
          </NavLink>

          {/* 3. Service Coverage Accordion */}
          <div className="mobile-accordion-group">
            <button
              type="button"
              className={`mobile-accordion-trigger ${expandedSection === 'coverage' ? 'is-expanded' : ''}`}
              onClick={() => toggleSection('coverage')}
              aria-expanded={expandedSection === 'coverage'}
            >
              <span>Service Coverage</span>
              <ChevronDown
                size={16}
                aria-hidden="true"
                style={{
                  transform: expandedSection === 'coverage' ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              />
            </button>

            {expandedSection === 'coverage' && (
              <div className="mobile-accordion-panel">
                {navigationCategories.coverage.children.map(area => (
                  <NavLink
                    key={area.id}
                    to={area.path}
                    className={({ isActive }) => `mobile-sublink ${isActive ? 'active' : ''}`}
                    onClick={onClose}
                  >
                    <div className="mobile-sublink-inner">
                      <span className="mobile-sublink-title">{area.name}</span>
                      <span className="mobile-sublink-badge">{area.badge}</span>
                    </div>
                  </NavLink>
                ))}
                <NavLink
                  to="/contact#coverage"
                  className="mobile-sublink mobile-sublink-all"
                  onClick={onClose}
                >
                  <MapPin size={13} style={{ marginRight: '6px', color: '#F8D37D' }} />
                  <span>All Coverage Areas &amp; Postcodes</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* 4. About / Contact Accordion */}
          <div className="mobile-accordion-group">
            <button
              type="button"
              className={`mobile-accordion-trigger ${expandedSection === 'about' ? 'is-expanded' : ''}`}
              onClick={() => toggleSection('about')}
              aria-expanded={expandedSection === 'about'}
            >
              <span>About / Contact</span>
              <ChevronDown
                size={16}
                aria-hidden="true"
                style={{
                  transform: expandedSection === 'about' ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              />
            </button>

            {expandedSection === 'about' && (
              <div className="mobile-accordion-panel">
                {navigationCategories.aboutContact.children.map(item => (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    className={({ isActive }) => `mobile-sublink ${isActive ? 'active' : ''}`}
                    onClick={onClose}
                  >
                    <span className="mobile-sublink-title">{item.name}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {/* 5. Client Portal Login */}
          <NavLink
            to="/login"
            className={({ isActive }) => `mobile-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={15} />
              <span>Client Portal</span>
            </span>
            <ChevronRight size={15} />
          </NavLink>
        </nav>

        {/* Mobile Action Callouts */}
        <div className="mobile-drawer-bottom">
          <Button
            to="/#quote-section"
            variant="gold"
            isBlock
            onClick={(e) => {
              onClose();
              if (window.location.pathname === '/') {
                const target = document.getElementById('quote-section');
                if (target) target.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            style={{ marginBottom: 'var(--space-3)' }}
          >
            Request Instant Quote
          </Button>

          <div className="mobile-drawer-contact-info">
            <a href={`tel:${siteConfig.contact.telephone}`} className="mobile-hotline-item">
              <Phone size={14} style={{ color: '#D4A017' }} />
              <span>Survey Hotline: <strong>{siteConfig.contact.telephoneDisplay}</strong></span>
            </a>
            <div className="mobile-hours-item">
              <span>{siteConfig.contact.openingHours}</span>
            </div>
            <div className="mobile-standards-item">
              <ShieldCheck size={13} style={{ color: '#D4A017' }} />
              <span>RICS Home Survey Aligned</span>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
