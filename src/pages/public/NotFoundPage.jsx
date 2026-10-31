import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Home, ArrowRight, Compass, HelpCircle } from 'lucide-react';
import { approvedServices } from '../../config/services';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Container } from '../../components/common/Container';
import { Button } from '../../components/common/Button';

export function NotFoundPage() {
  useDocumentTitle(
    "Page Not Found (404) | NJS Property Group",
    "The requested page could not be located. Browse our 5 approved surveying services or contact our team."
  );

  return (
    <div className="not-found-page luxury-site-canvas" style={{ padding: 'var(--space-16) 0' }}>
      <Container isNarrow>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              backgroundColor: 'var(--color-danger-bg)',
              color: 'var(--color-danger)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-4)'
            }}
          >
            <AlertCircle size={36} />
          </div>

          <h1 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-2)', color: '#FFFFFF' }}>
            404 — Page Not Found
          </h1>
          <p style={{ color: '#CBD5E1', fontSize: 'var(--font-size-md)', maxWidth: '580px', margin: '0 auto var(--space-6)' }}>
            The URL you requested may have been relocated, or belongs to a retired service section. Please use the navigation below to access our active surveying services.
          </p>

          <Button to="/" variant="primary" icon={Home}>
            Return to Homepage
          </Button>
        </div>

        {/* Removed Services Explanatory Box (Master Spec Part 9) */}
        <div
          style={{
            backgroundColor: 'var(--color-light-grey)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-6)',
            marginBottom: 'var(--space-8)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 'var(--space-2)', color: 'var(--color-primary-navy)', fontWeight: 'bold' }}>
            <Compass size={18} />
            <span>Looking for Former Construction or Real Estate Pages?</span>
          </div>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted-text)', marginBottom: 'var(--space-4)', lineHeight: '1.6' }}>
            Per client instructions (Master Specification Part 9), previous <strong>Construction</strong> and <strong>Real Estate</strong> service pages have been formally retired from this practice to maintain focus on RICS-aligned residential property surveying, valuation, and legal witness services. Production 301 server redirects are configured to route users to relevant structural and valuation services.
          </p>

          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <Link
              to="/services/building-survey-level-3"
              style={{
                fontSize: 'var(--font-size-xs)',
                fontWeight: 'bold',
                color: 'var(--color-primary-navy)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <span>For Structural &amp; Building Investigations &rarr; Level 3 Building Survey</span>
            </Link>
            <Link
              to="/services/valuation-report"
              style={{
                fontSize: 'var(--font-size-xs)',
                fontWeight: 'bold',
                color: 'var(--color-primary-navy)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <span>For Property Market Appraisals &rarr; RICS Red Book Valuation</span>
            </Link>
          </div>
        </div>

        {/* Active Approved Services Quick Directory */}
        <div style={{ backgroundColor: 'var(--color-white)', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)' }}>
          <h3 style={{ fontSize: 'var(--font-size-md)', marginBottom: 'var(--space-4)', color: 'var(--color-primary-navy)' }}>
            Active Surveying Disciplines:
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-3)' }}>
            {approvedServices.map(service => (
              <Link
                key={service.id}
                to={service.path}
                style={{
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-light-grey)',
                  color: 'var(--color-primary-navy)',
                  textDecoration: 'none',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: '600',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>{service.name}</span>
                <ArrowRight size={14} />
              </Link>
            ))}
            <Link
              to="/expert-witness"
              style={{
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-accent-gold-soft)',
                color: 'var(--color-primary-dark)',
                textDecoration: 'none',
                fontSize: 'var(--font-size-sm)',
                fontWeight: '600',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>Expert Witness &amp; CPR Part 35</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}

