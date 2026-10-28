import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { NavLink } from 'react-router-dom';
import { X, ChevronRight, Phone, Mail, ShieldCheck, User } from 'lucide-react';
import { approvedServices } from '../../config/services';
import { siteConfig } from '../../config/siteConfig';
import { Button } from '../common/Button';

export function MobileNavigation({ isOpen, onClose }) {
  const drawerRef = useRef(null);

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

  // Trap focus inside drawer when opened
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
        <div className="mobile-drawer-header">
          <div className="logo-title" style={{ fontSize: 'var(--font-size-base)' }}>
            {siteConfig.companyName}
          </div>
          <button
            type="button"
            className="mobile-nav-toggle"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        <nav className="mobile-drawer-links" aria-label="Mobile Navigation">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `mobile-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <span>Home</span>
            <ChevronRight size={16} />
          </NavLink>

          <div className="mobile-services-heading">Core Surveying Services</div>
          {approvedServices.map(service => (
            <NavLink
              key={service.id}
              to={service.path}
              className={({ isActive }) => `mobile-sublink ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              {service.name}
            </NavLink>
          ))}

          <NavLink
            to="/expert-witness"
            className={({ isActive }) => `mobile-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <span>Expert Witness (Litigation)</span>
            <ChevronRight size={16} />
          </NavLink>

          <NavLink
            to="/contact"
            className={({ isActive }) => `mobile-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <span>Contact &amp; Coverage</span>
            <ChevronRight size={16} />
          </NavLink>

          <NavLink
            to="/login"
            className={({ isActive }) => `mobile-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={16} />
              <span>Client Portal</span>
            </span>
            <ChevronRight size={16} />
          </NavLink>
        </nav>

        {/* Mobile Action Callouts */}
        <div style={{ marginTop: 'auto', paddingTop: 'var(--space-6)', borderTop: '1px solid var(--color-border-subtle)' }}>
          <Button
            to="/login"
            variant="secondary"
            isBlock
            onClick={onClose}
            icon={User}
            style={{ marginBottom: 'var(--space-3)' }}
          >
            Client Portal
          </Button>

          <Button
            to="/contact#quote"
            variant="gold"
            isBlock
            onClick={onClose}
            style={{ marginBottom: 'var(--space-4)' }}
          >
            Request Instant Quote
          </Button>

          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted-text)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Phone size={13} style={{ color: 'var(--color-primary-navy)' }} />
              <a href={`tel:${siteConfig.contact.telephone}`} style={{ color: 'var(--color-primary-navy)', fontWeight: 600 }}>
                {siteConfig.contact.telephoneDisplay}
              </a>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Mail size={13} style={{ color: 'var(--color-primary-navy)' }} />
              <span>{siteConfig.contact.email}</span>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}



