import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ShieldCheck, FileCode, ExternalLink, Home, ArrowLeft } from 'lucide-react';
import { Container } from '../../components/common/Container';
import { Button } from '../../components/common/Button';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export function RedirectsPage() {
  useDocumentTitle(
    "Production 301 Redirect Matrix | NJS Property Group",
    "Production HTTP 301 server redirects and legacy service decommissioning documentation."
  );

  const redirectMappings = [
    {
      source: '/construction/*',
      code: '301 Permanent',
      target: '/services/building-survey-level-3',
      targetName: 'Level 3 Building Survey',
      reason: 'Former commercial construction queries routed to comprehensive structural inspections.'
    },
    {
      source: '/construction',
      code: '301 Permanent',
      target: '/services/building-survey-level-3',
      targetName: 'Level 3 Building Survey',
      reason: 'Root construction landing page redirected to Level 3 structural survey.'
    },
    {
      source: '/real-estate/*',
      code: '301 Permanent',
      target: '/services/valuation-report',
      targetName: 'RICS Red Book Valuation',
      reason: 'Estate agency and property sales queries routed to formal RICS Red Book valuations.'
    },
    {
      source: '/real-estate',
      code: '301 Permanent',
      target: '/services/valuation-report',
      targetName: 'RICS Red Book Valuation',
      reason: 'Root real estate landing page redirected to Help to Buy / Shared Ownership valuations.'
    }
  ];

  return (
    <div style={{ padding: 'var(--space-12) 0 var(--space-16) 0', backgroundColor: 'var(--color-bg-light, #F8FAFC)', minHeight: '80vh' }}>
      <Container>
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--font-size-xs)' }}>
          <Link to="/" style={{ color: 'var(--color-primary-navy)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: '500' }}>
            <Home size={14} /> Home
          </Link>
          <span style={{ color: 'var(--color-silver-dark)' }}>/</span>
          <span style={{ color: 'var(--color-muted-text)' }}>Production Redirect Matrix</span>
        </div>

        {/* Page Header */}
        <div style={{ maxWidth: '820px', marginBottom: 'var(--space-8)' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.85rem',
            borderRadius: '9999px',
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            color: '#1D4ED8',
            fontSize: 'var(--font-size-xs)',
            fontWeight: '600',
            marginBottom: 'var(--space-3)'
          }}>
            <ShieldCheck size={14} />
            <span>RICS Scope Compliance &bull; Master Specification Part 9</span>
          </div>

          <h1 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: '800', color: 'var(--color-primary-navy, #142A43)', lineHeight: '1.2', marginBottom: 'var(--space-3)' }}>
            Production 301 Redirect Matrix
          </h1>
          <p style={{ fontSize: 'var(--font-size-md)', color: 'var(--color-muted-text, #475569)', lineHeight: '1.6' }}>
            Permanent architectural routing rules for decommissioned legacy services. In compliance with RICS Home Survey Standard accreditation, all non-core commercial construction and real estate services have been cleanly decommissioned and redirected.
          </p>
        </div>

        {/* Matrix Card */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
          overflow: 'hidden',
          marginBottom: 'var(--space-8)'
        }}>
          <div style={{ padding: 'var(--space-5) var(--space-6)', borderBottom: '1px solid #F1F5F9', backgroundColor: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: '700', color: '#1E293B', margin: 0 }}>
                Active Production Redirect Rules
              </h2>
              <span style={{ fontSize: 'var(--font-size-xs)', color: '#64748B' }}>
                Configured on edge web server &bull; HTTP 301 Moved Permanently
              </span>
            </div>
            <a
              href="/REDIRECTS.md"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 'var(--font-size-xs)',
                fontWeight: '600',
                color: '#1E40AF',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid #DBEAFE',
                backgroundColor: '#EFF6FF'
              }}
            >
              <FileCode size={13} /> View Raw REDIRECTS.md <ExternalLink size={12} />
            </a>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--font-size-sm)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '0.85rem 1.25rem', fontWeight: '600' }}>Legacy URL Path</th>
                  <th style={{ padding: '0.85rem 1.25rem', fontWeight: '600' }}>Status Code</th>
                  <th style={{ padding: '0.85rem 1.25rem', fontWeight: '600' }}>Active RICS Target</th>
                  <th style={{ padding: '0.85rem 1.25rem', fontWeight: '600', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {redirectMappings.map((rule, idx) => (
                  <tr key={idx} style={{ borderBottom: idx < redirectMappings.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <code style={{
                        padding: '0.2rem 0.5rem',
                        backgroundColor: '#F1F5F9',
                        borderRadius: '6px',
                        color: '#B91C1C',
                        fontWeight: '600',
                        fontSize: '0.85rem'
                      }}>
                        {rule.source}
                      </code>
                      <p style={{ margin: '0.35rem 0 0 0', fontSize: 'var(--font-size-xs)', color: '#64748B' }}>
                        {rule.reason}
                      </p>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', whiteSpace: 'nowrap' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '9999px',
                        backgroundColor: '#ECFDF5',
                        color: '#065F46',
                        fontSize: '0.75rem',
                        fontWeight: '700'
                      }}>
                        <CheckCircle2 size={12} /> {rule.code}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <strong style={{ display: 'block', color: '#0F172A', fontWeight: '600' }}>
                        {rule.targetName}
                      </strong>
                      <code style={{ fontSize: '0.8rem', color: '#2563EB' }}>
                        {rule.target}
                      </code>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <Link
                        to={rule.target}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.4rem 0.85rem',
                          borderRadius: '8px',
                          backgroundColor: '#142A43',
                          color: '#FFFFFF',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          textDecoration: 'none',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Visit Service <ArrowRight size={13} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Server Config & Return Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
          {/* Server Config Block */}
          <div style={{ backgroundColor: '#1E293B', borderRadius: '14px', padding: 'var(--space-5)', color: '#E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 'var(--space-3)', color: '#38BDF8', fontWeight: '600', fontSize: 'var(--font-size-xs)' }}>
              <FileCode size={16} />
              <span>Production Server Directive (_redirects)</span>
            </div>
            <pre style={{
              margin: 0,
              padding: '0.75rem',
              backgroundColor: '#0F172A',
              borderRadius: '8px',
              fontSize: '0.75rem',
              overflowX: 'auto',
              fontFamily: 'monospace',
              lineHeight: '1.6',
              color: '#A5F3FC'
            }}>
{`/construction/*    /services/building-survey-level-3  301!
/construction      /services/building-survey-level-3  301!
/real-estate/*     /services/valuation-report         301!
/real-estate       /services/valuation-report         301!
/*                 /index.html                        200`}
            </pre>
          </div>

          {/* Quick Actions Block */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            padding: 'var(--space-5)',
            border: '1px solid #E2E8F0',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 'var(--space-3)'
          }}>
            <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: '700', color: '#1E293B', margin: 0 }}>
              Need Help Finding a Service?
            </h3>
            <p style={{ fontSize: 'var(--font-size-xs)', color: '#64748B', margin: 0, lineHeight: '1.5' }}>
              Our RICS-accredited surveyors cover London and the Home Counties with fixed-fee quotations and fast report turnaround.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: 'var(--space-2)' }}>
              <Link
                to="/"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.55rem 1rem',
                  borderRadius: '8px',
                  backgroundColor: '#142A43',
                  color: '#FFFFFF',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  textDecoration: 'none'
                }}
              >
                <Home size={14} /> Return to Homepage
              </Link>
              <Link
                to="/contact"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.55rem 1rem',
                  borderRadius: '8px',
                  backgroundColor: '#F1F5F9',
                  color: '#1E293B',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  textDecoration: 'none',
                  border: '1px solid #CBD5E1'
                }}
              >
                Contact Practice Team
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

