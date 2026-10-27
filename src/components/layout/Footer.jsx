import React from 'react';
import { Link } from 'react-router-dom';
import { Building, MapPin, Phone, Mail, ShieldAlert, ArrowUpRight } from 'lucide-react';
import { siteConfig } from '../../config/siteConfig';
import { approvedServices } from '../../config/services';
import { footerCoverageLinks } from '../../config/navigation';
import { Container } from '../common/Container';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer" role="contentinfo">
      <Container>
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

            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-silver-light)', marginBottom: 'var(--space-4)' }}>
              Independent property surveying, valuation, new-build snagging, damp diagnostics, and expert witness services across London, Surrey, Oxfordshire, Buckinghamshire, and Berkshire.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: 'var(--font-size-xs)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={14} style={{ color: 'var(--color-accent-gold)' }} />
                <a href={`tel:${siteConfig.contact.telephone}`} style={{ color: 'var(--color-white)', textDecoration: 'none' }}>
                  {siteConfig.contact.telephoneDisplay}
                </a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={14} style={{ color: 'var(--color-accent-gold)' }} />
                <span>{siteConfig.contact.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={14} style={{ color: 'var(--color-accent-gold)' }} />
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
                <Link to="/expert-witness" style={{ color: 'var(--color-accent-gold)' }}>
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

          {/* Governance, Accreditations & Scope */}
          <div>
            <h4 className="footer-heading">Compliance &amp; Sign-off</h4>
            <div className="footer-badge-box">
              <strong style={{ color: 'var(--color-white)', display: 'block', marginBottom: '0.25rem' }}>
                Technology &amp; Scope Notice:
              </strong>
              {siteConfig.techStackNotice.originalBriefNotice}
            </div>

            <div style={{ marginTop: 'var(--space-3)', fontSize: 'var(--font-size-xs)', color: 'var(--color-silver-dark)' }}>
              <span>Legacy Services Removed: Construction &amp; Real Estate pages retired. </span>
              <a href="/REDIRECTS.md" style={{ color: 'var(--color-silver-light)', textDecoration: 'underline' }}>
                View Redirect Matrix
              </a>
            </div>
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
            <Link to="/REDIRECTS.md">Production Redirects</Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}

