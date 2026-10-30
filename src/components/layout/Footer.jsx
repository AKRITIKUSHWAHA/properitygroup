import React from 'react';
import { Link } from 'react-router-dom';
import { Building, MapPin, Phone, Mail, ShieldCheck, ShieldAlert, ArrowUpRight, Lock } from 'lucide-react';
import { siteConfig } from '../../config/siteConfig';
import { approvedServices } from '../../config/services';
import { footerCoverageLinks } from '../../config/navigation';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand & Purpose Column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: 'var(--space-4)' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  backgroundColor: 'var(--color-primary-navy)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                <Building size={20} style={{ color: 'var(--color-white)' }} />
              </div>
              <span style={{ fontSize: 'var(--font-size-md)', fontWeight: 'bold', color: 'var(--color-white)' }}>
                {siteConfig.companyName}
              </span>
            </div>

            <p style={{ fontSize: 'var(--font-size-sm)', color: '#FFFFFF', marginBottom: 'var(--space-4)' }}>
              Independent property surveying, valuation, new-build snagging, damp diagnostics, and expert witness services across London, Surrey, Oxfordshire, Buckinghamshire, and Berkshire.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: 'var(--font-size-xs)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={15} style={{ color: '#FFFFFF', flexShrink: 0 }} />
                <a href={`tel:${siteConfig.contact.telephone}`} style={{ color: 'var(--color-white)', textDecoration: 'none' }}>
                  {siteConfig.contact.telephoneDisplay}
                </a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={15} style={{ color: '#FFFFFF', flexShrink: 0 }} />
                <span>{siteConfig.contact.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <MapPin size={15} style={{ color: '#FFFFFF', flexShrink: 0, marginTop: '2px' }} />
                <span>Central Correspondence: Pall Mall, London (Client Address Pending)</span>
              </div>
            </div>
          </div>

          {/* Approved Core Surveying Services */}
          <div>
            <h4 className="footer-heading">Survey Services</h4>
            <ul className="footer-links">
              {approvedServices.map(service => (
                <li key={service.id}>
                  <Link to={service.path}>{service.name}</Link>
                </li>
              ))}
              <li>
                <Link to="/expert-witness" style={{ color: '#FFFFFF', fontWeight: 600 }}>
                  Expert Witness &amp; Disputes &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Regional Service Areas */}
          <div>
            <h4 className="footer-heading">Service Coverage</h4>
            <ul className="footer-links">
              {footerCoverageLinks.map((item, idx) => (
                <li key={idx}>
                  <Link to={item.path}>{item.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Governance, Accreditations & Practice Standards */}
          <div>
            <h4 className="footer-heading">Professional Standards</h4>
            <div className="footer-badge-box" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <ShieldCheck size={16} style={{ color: '#FFFFFF', flexShrink: 0 }} />
                <strong style={{ color: '#FFFFFF', fontSize: '0.82rem' }}>
                  RICS Practice Standards
                </strong>
              </div>
              <p style={{ margin: 0, fontSize: '0.74rem', color: '#CBD5E1', lineHeight: 1.45 }}>
                All surveys conducted under RICS Home Survey Standard specifications with zero contractor bias and full Professional Indemnity Insurance.
              </p>
            </div>

            <ul className="footer-links" style={{ marginTop: '0.85rem' }}>
              <li>
                <span style={{ color: '#94A3B8', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <span style={{ color: '#10B981', fontWeight: 'bold' }}>✓</span> RICS Red Book Valuation Scheme
                </span>
              </li>
              <li>
                <span style={{ color: '#94A3B8', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <span style={{ color: '#10B981', fontWeight: 'bold' }}>✓</span> CPR Part 35 Court Admissible Evidence
                </span>
              </li>
              <li>
                <span style={{ color: '#94A3B8', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <span style={{ color: '#10B981', fontWeight: 'bold' }}>✓</span> Independent Moisture &amp; Damp Diagnostics
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-copyright">
            &copy; {currentYear} {siteConfig.companyName}. All rights reserved. RICS Home Survey Standard Aligned.
          </div>
          <div className="footer-bottom-links">
            <Link to="/contact">Client Enquiry Form</Link>
            <Link to="/contact#privacy">Privacy Notice</Link>
            <Link to="/contact">Terms of Engagement</Link>
            {/* Discreet Back-Office link for Practice Personnel only */}
            <Link
              to="/backoffice"
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-1"
              title="Restricted entrance for chartered surveyors and practice administrators"
            >
              <Lock size={11} className="inline opacity-70" />
              <span>Staff &amp; Surveyor Back-Office</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
