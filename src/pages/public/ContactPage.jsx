import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, ShieldAlert, CheckCircle2, HelpCircle, ChevronDown } from 'lucide-react';
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
    "Contact & Service Coverage | UK Property Surveying Practice",
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

  return (
    <div className="contact-page">
      {/* Header Banner */}
      <header className="page-header">
        <Container>
          <Breadcrumbs items={breadcrumbs} />
          <h1>Contact &amp; Coverage Hub</h1>
          <p className="page-header-desc">
            Speak with our surveying practice or request an obligation-free, fixed quotation for residential properties across London and the South East.
          </p>
        </Container>
      </header>

      {/* Main Grid: Contact Details & Quote Form */}
      <section className="section">
        <Container>
          <div className="grid-2" style={{ gridTemplateColumns: '1fr 1.25fr', alignItems: 'start' }}>
            {/* Left Column: Direct Contact & Office Information */}
            <div>
              <div style={{ marginBottom: 'var(--space-8)' }}>
                <h2>Get in Touch</h2>
                <p style={{ color: 'var(--color-muted-text)', fontSize: 'var(--font-size-sm)', lineHeight: '1.6' }}>
                  Whether you are purchasing your first home, acquiring a period building, or managing a legal dispute, our surveying team is available to assist.
                </p>
              </div>

              {/* Contact Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
                {/* Telephone */}
                <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-light-grey)', borderRadius: 'var(--radius-md)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: '42px', height: '42px', backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-navy)', flexShrink: 0, border: '1px solid var(--color-border-subtle)' }}>
                    <Phone size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', color: 'var(--color-light-text)', fontWeight: 'bold' }}>
                      Enquiries &amp; Quotations
                    </span>
                    <div>
                      <a href={`tel:${siteConfig.contact.telephone}`} style={{ fontSize: 'var(--font-size-md)', fontWeight: 'bold', color: 'var(--color-primary-navy)' }}>
                        {siteConfig.contact.telephoneDisplay}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-light-grey)', borderRadius: 'var(--radius-md)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: '42px', height: '42px', backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-navy)', flexShrink: 0, border: '1px solid var(--color-border-subtle)' }}>
                    <Mail size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', color: 'var(--color-light-text)', fontWeight: 'bold' }}>
                      Written Correspondence
                    </span>
                    <div>
                      <a href={`mailto:${siteConfig.contact.email}`} style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold', color: 'var(--color-primary-navy)' }}>
                        {siteConfig.contact.email}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Correspondence Address */}
                <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-light-grey)', borderRadius: 'var(--radius-md)', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '42px', height: '42px', backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-navy)', flexShrink: 0, border: '1px solid var(--color-border-subtle)' }}>
                    <MapPin size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', color: 'var(--color-light-text)', fontWeight: 'bold' }}>
                      Registered Address Placeholder
                    </span>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-main-text)', margin: '0.25rem 0 0' }}>
                      {siteConfig.contact.address.line1}<br />
                      {siteConfig.contact.address.line2}, {siteConfig.contact.address.city} {siteConfig.contact.address.postcode}
                    </p>
                  </div>
                </div>

                {/* Hours */}
                <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-light-grey)', borderRadius: 'var(--radius-md)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: '42px', height: '42px', backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-navy)', flexShrink: 0, border: '1px solid var(--color-border-subtle)' }}>
                    <Clock size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', color: 'var(--color-light-text)', fontWeight: 'bold' }}>
                      Practice Hours
                    </span>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-main-text)', margin: '0.25rem 0 0' }}>
                      {siteConfig.contact.openingHours}
                    </p>
                  </div>
                </div>
              </div>

              {/* Client Asset & Details Checklist Notice */}
              <div style={{ padding: 'var(--space-4)', border: '1px solid var(--color-border-medium)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-white)', fontSize: 'var(--font-size-xs)' }}>
                <strong style={{ display: 'block', color: 'var(--color-primary-navy)', marginBottom: '0.25rem' }}>
                  Client Content Requirement:
                </strong>
                <p style={{ color: 'var(--color-muted-text)', margin: 0 }}>
                  Per Part 1.1 of the Master Specification, verified phone numbers, direct email routings, and registered trading office addresses will be inserted once supplied by the client.
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

      {/* FAQs Section */}
      <section className="section">
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
                style={{
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-white)',
                  overflow: 'hidden'
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
                    color: 'var(--color-primary-navy)'
                  }}
                  aria-expanded={openFaq === idx}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={16}
                    style={{
                      transform: openFaq === idx ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s',
                      flexShrink: 0
                    }}
                  />
                </button>
                {openFaq === idx && (
                  <div style={{ padding: '0 var(--space-4) var(--space-4)', fontSize: 'var(--font-size-xs)', color: 'var(--color-muted-text)', lineHeight: '1.6' }}>
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

