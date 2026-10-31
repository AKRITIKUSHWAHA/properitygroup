import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, ShieldAlert, ShieldCheck, CheckCircle2, HelpCircle, ChevronDown } from 'lucide-react';
import { siteConfig } from '../../config/siteConfig';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Container } from '../../components/common/Container';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { SectionHeading } from '../../components/common/SectionHeading';
import { QuoteRequestForm } from '../../components/forms/QuoteRequestForm';
import { CoverageMap } from '../../components/common/CoverageMap';

export function ContactPage() {
  const location = useLocation();

  useDocumentTitle(
    "Contact & Service Coverage | NJS Property Group",
    "Contact our RICS-aligned property surveyors for quotations and advice across London, Surrey, Oxfordshire, Buckinghamshire, and Berkshire. Swift quotation turnaround."
  );

  const breadcrumbs = [
    { label: "Contact", path: "/contact" }
  ];

  // Frequently Asked Questions
  const faqs = [
    {
      q: "How quickly can a survey be booked and carried out?",
      a: "Once terms are agreed, on-site physical inspections are typically scheduled within 3 to 7 working days, subject to property access granted by the estate agent or vendor. Urgent timescales can be accommodated upon request."
    },
    {
      q: "When will I receive my written survey report?",
      a: "Comprehensive, indexed PDF survey reports are typically issued within 3 to 5 business days following the physical site inspection. Your surveyor will also offer a post-survey telephone debrief to highlight major findings."
    },
    {
      q: "What is the difference between a mortgage valuation and a survey?",
      a: "A mortgage valuation is carried out solely for the lender's benefit to confirm whether the property represents adequate security for a loan. It is not an inspection for the buyer and will not detail defects or upcoming repair costs. An independent Level 2 or Level 3 survey is commissioned entirely for you."
    },
    {
      q: "Which counties and areas do you cover?",
      a: "Our core inspection coverage spans London (all boroughs), Surrey, Oxfordshire, Buckinghamshire, and Berkshire. We inspect both urban and rural residential properties across these regions."
    },
    {
      q: "How does the instruction and booking workflow operate?",
      a: "Following your quote request, you will receive our service-specific quotation and Terms of Engagement. Upon your digital signature and booking confirmation, our administrative team coordinates key collection with the selling agent."
    }
  ];

  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    }
  }, [location.hash, location.pathname, location.search]);

  return (
    <div className="contact-page service-page luxury-site-canvas">
      {/* High-Impact Architectural Header Banner */}
      <header
        className="service-header-hero"
        style={{ backgroundImage: `url(https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=85)` }}
      >
        <div className="service-header-overlay" />
        <Container>
          <div className="service-header-content">
            <Breadcrumbs items={breadcrumbs} />
            <h1 className="page-header-title">Contact &amp; Coverage Hub</h1>
            <p className="page-header-desc">
              Speak directly with our independent surveying practice or request an obligation-free, fixed quotation for residential properties across London and the Home Counties.
            </p>

            <div className="service-meta-strip">
              <span className="service-meta-pill">
                <Phone size={14} className="text-white" />
                <span>Hotline: {siteConfig.contact.telephoneDisplay}</span>
              </span>
              <span className="service-meta-pill">
                <Clock size={14} className="text-white" />
                <span>Written Quotes in 24 Hours</span>
              </span>
              <span className="service-meta-pill">
                <MapPin size={14} className="text-white" />
                <span>London, Surrey, Oxon, Bucks &amp; Berks</span>
              </span>
            </div>
          </div>
        </Container>
      </header>

      {/* Main Grid: Contact Details & Quote Form */}
      <section className="section">
        <Container>
          <div className="contact-detail-grid">
            {/* Left Column: Direct Contact & Office Information */}
            <div>
              <div style={{ marginBottom: 'var(--space-8)' }}>
                <h2 style={{ color: '#FFFFFF', marginBottom: '0.5rem', fontWeight: 700 }}>Get in Touch</h2>
                <p className="contact-lead-text" style={{ color: '#CBD5E1', fontSize: 'var(--font-size-sm)', lineHeight: '1.6' }}>
                  Whether you are purchasing your first home, acquiring a period building, or managing a legal dispute, our surveying team is available to assist.
                </p>
              </div>

              {/* Contact Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
                {/* Telephone */}
                <div style={{ padding: '1.25rem', backgroundColor: '#FFFFFF', borderRadius: '16px', display: 'flex', gap: '1rem', alignItems: 'center', border: '1px solid #CBD5E1', boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}>
                  <div style={{ width: '46px', height: '46px', backgroundColor: '#F1F5F9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#142A43', flexShrink: 0, border: '1px solid #CBD5E1' }}>
                    <Phone size={22} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#0F172A', fontWeight: '800', letterSpacing: '0.04em', display: 'block', marginBottom: '2px' }}>
                      Enquiries &amp; Quotations
                    </span>
                    <div>
                      <a href={`tel:${siteConfig.contact.telephone}`} style={{ fontSize: '1.15rem', fontWeight: '800', color: '#142A43', textDecoration: 'none' }}>
                        {siteConfig.contact.telephoneDisplay}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div style={{ padding: '1.25rem', backgroundColor: '#FFFFFF', borderRadius: '16px', display: 'flex', gap: '1rem', alignItems: 'center', border: '1px solid #CBD5E1', boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}>
                  <div style={{ width: '46px', height: '46px', backgroundColor: '#F1F5F9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#142A43', flexShrink: 0, border: '1px solid #CBD5E1' }}>
                    <Mail size={22} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#0F172A', fontWeight: '800', letterSpacing: '0.04em', display: 'block', marginBottom: '2px' }}>
                      Written Correspondence
                    </span>
                    <div>
                      <a href={`mailto:${siteConfig.contact.email}`} style={{ fontSize: '0.92rem', fontWeight: '700', color: '#142A43', textDecoration: 'none' }}>
                        {siteConfig.contact.email}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Correspondence Address */}
                <div style={{ padding: '1.25rem', backgroundColor: '#FFFFFF', borderRadius: '16px', display: 'flex', gap: '1rem', alignItems: 'flex-start', border: '1px solid #CBD5E1', boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}>
                  <div style={{ width: '46px', height: '46px', backgroundColor: '#F1F5F9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#142A43', flexShrink: 0, border: '1px solid #CBD5E1', marginTop: '2px' }}>
                    <MapPin size={22} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#0F172A', fontWeight: '800', letterSpacing: '0.04em', display: 'block', marginBottom: '4px' }}>
                      Registered Office Address
                    </span>
                    <p style={{ fontSize: '0.88rem', color: '#1E293B', fontWeight: '500', margin: 0, lineHeight: '1.55' }}>
                      {siteConfig.contact.address.line1}<br />
                      {siteConfig.contact.address.city} {siteConfig.contact.address.postcode}
                    </p>
                  </div>
                </div>

                {/* Hours */}
                <div style={{ padding: '1.25rem', backgroundColor: '#FFFFFF', borderRadius: '16px', display: 'flex', gap: '1rem', alignItems: 'center', border: '1px solid #CBD5E1', boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}>
                  <div style={{ width: '46px', height: '46px', backgroundColor: '#F1F5F9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#142A43', flexShrink: 0, border: '1px solid #CBD5E1' }}>
                    <Clock size={22} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#0F172A', fontWeight: '800', letterSpacing: '0.04em', display: 'block', marginBottom: '4px' }}>
                      Practice Hours
                    </span>
                    <p style={{ fontSize: '0.88rem', color: '#1E293B', fontWeight: '600', margin: 0 }}>
                      {siteConfig.contact.openingHours}
                    </p>
                  </div>
                </div>
              </div>

              {/* RICS Practice Notice */}
              <div style={{ padding: '1.25rem', border: '1.5px solid #CBD5E1', borderRadius: '16px', backgroundColor: '#FFFFFF', fontSize: '0.85rem', boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}>
                <strong style={{ display: 'block', color: '#0F172A', fontWeight: '800', fontSize: '0.9rem', marginBottom: '0.35rem' }}>
                  RICS Regulated Practice:
                </strong>
                <p style={{ color: '#334155', margin: 0, lineHeight: '1.55', fontWeight: '500' }}>
                  All survey instructions and written quotations adhere strictly to the Royal Institution of Chartered Surveyors (RICS) Home Survey Standard.
                </p>
              </div>
            </div>

            {/* Right Column: Embedded Quote Form */}
            <div id="quote">
              <QuoteRequestForm />
            </div>
          </div>
        </Container>
      </section>

      {/* Target Regional Coverage Subsection */}
      <section id="coverage" className="section section-alt">
        <Container>
          <CoverageMap />
        </Container>
      </section>

      {/* Privacy Notice Section (UK GDPR & RICS Compliant) */}
      <section id="privacy" className="section section-alt" style={{ backgroundColor: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
        <Container isNarrow>
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 14px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: '40px', height: '40px', backgroundColor: '#0B1F4D', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF' }}>
                <ShieldCheck size={20} />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748B', fontWeight: 800, letterSpacing: '0.05em' }}>Legal &amp; Compliance</span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Privacy Notice &amp; Data Protection</h2>
              </div>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              NJS Property Group Ltd (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is committed to protecting your privacy in full compliance with the UK General Data Protection Regulation (UK GDPR) and Data Protection Act 2018.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.35rem' }}>1. Data Controller</h4>
                <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                  NJS Property Group Ltd, 124 City Road, London EC1V 2NX. Contact: <a href="mailto:info@njspropertygroup.com" style={{ color: '#2563EB', textDecoration: 'underline' }}>info@njspropertygroup.com</a>.
                </p>
              </div>

              <div style={{ padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.35rem' }}>2. Information We Collect</h4>
                <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                  Instructing client names, property addresses, contact telephone, email, and access instructions strictly to fulfill survey quotations and inspections.
                </p>
              </div>

              <div style={{ padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.35rem' }}>3. How We Use Your Data</h4>
                <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                  Solely for conducting RICS property inspections, producing diagnostic survey reports, issuing VAT invoices, and statutory audit compliance. Zero third-party marketing sales.
                </p>
              </div>

              <div style={{ padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.35rem' }}>4. Your Statutory Rights</h4>
                <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                  You hold the legal right to request access, rectification, or erasure of your personal data at any time by contacting our compliance officer at info@njspropertygroup.com.
                </p>
              </div>
            </div>

            <p style={{ fontSize: '0.78rem', color: '#94A3B8', margin: 0, fontStyle: 'italic' }}>
              Last revised: October 2026 • Registered in England &amp; Wales • Regulated by the Royal Institution of Chartered Surveyors.
            </p>
          </div>
        </Container>
      </section>

      {/* FAQs Section */}
      <section id="faqs" className="section">
        <Container isNarrow>
          <SectionHeading
            eyebrow="Frequently Asked Questions"
            title="Common Enquiries Regarding Property Surveys"
            subtitle="Transparent answers to help you choose the right survey level and understand the inspection journey."
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="contact-faq-item"
                style={{
                  border: '1px solid #CBD5E1',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#FFFFFF',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  style={{
                    width: '100%',
                    padding: 'var(--space-4)',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: 'var(--font-size-sm)',
                    color: '#0F172A'
                  }}
                  aria-expanded={openFaq === idx}
                >
                  <span style={{ color: '#0F172A', fontWeight: 700 }}>{faq.q}</span>
                  <ChevronDown
                    size={16}
                    style={{
                      transform: openFaq === idx ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s',
                      flexShrink: 0,
                      color: '#142A43'
                    }}
                  />
                </button>
                {openFaq === idx && (
                  <div className="contact-faq-answer" style={{ padding: '0 var(--space-4) var(--space-4)', fontSize: 'var(--font-size-xs)', color: '#334155', lineHeight: '1.6', fontWeight: 500 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}

