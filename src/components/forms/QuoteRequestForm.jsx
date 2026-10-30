import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { approvedServices } from '../../config/services';
import { siteConfig } from '../../config/siteConfig';
import { validateQuoteForm } from '../../utils/validation';
import { FormField } from './FormField';
import { Button } from '../common/Button';

export function QuoteRequestForm({ defaultServiceId = '', className = '' }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 80);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (defaultServiceId) {
      setFormData(prev => ({ ...prev, serviceId: defaultServiceId }));
    }
  }, [defaultServiceId]);

  const [formData, setFormData] = useState({
    propertyType: '',
    propertyAddress: '',
    propertyPostcode: '',
    approxBedrooms: '3',
    serviceId: defaultServiceId || '',
    timescale: 'within-1-2-weeks',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    additionalNotes: '',
    privacyConsent: false
  });

  const [showNotes, setShowNotes] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionReceipt, setSubmissionReceipt] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  const propertyTypes = [
    { value: 'detached', label: 'Detached House' },
    { value: 'semi-detached', label: 'Semi-Detached House' },
    { value: 'terraced', label: 'Terraced / Townhouse' },
    { value: 'flat-apartment', label: 'Flat / Purpose-Built Apartment' },
    { value: 'converted-flat', label: 'Converted Period Flat / Maisonette' },
    { value: 'bungalow', label: 'Bungalow' },
    { value: 'commercial-residential', label: 'Mixed Commercial / Residential' }
  ];

  const timescaleOptions = [
    { value: 'urgent-3-5-days', label: 'Urgent (3 – 5 days)' },
    { value: 'within-1-2-weeks', label: 'Standard (1 – 2 weeks)' },
    { value: 'flexible-month', label: 'Flexible (3 – 4 weeks)' },
    { value: 'planning-stage', label: 'Early Planning / Pre-Offer' }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    const validation = validateQuoteForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      const firstErrorField = Object.keys(validation.errors)[0];
      const el = document.getElementById(firstErrorField);
      if (el) el.focus();
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 600));

      const selectedService = approvedServices.find(s => s.id === formData.serviceId);

      const receipt = {
        timestamp: new Date().toISOString(),
        referenceId: `REF-${Math.floor(100000 + Math.random() * 900000)}`,
        data: {
          ...formData,
          serviceName: selectedService ? selectedService.name : formData.serviceId
        },
        notice: "Frontend Demonstration Build: This form validated successfully according to all RICS quotation criteria. Because this project is the standalone React frontend, no real email or database insertion has occurred. To connect to the live CRM / SurveyBooker backend, configure the POST endpoint in src/components/forms/QuoteRequestForm.jsx."
      };

      setSubmissionReceipt(receipt);
      setIsSubmitting(false);
    } catch (err) {
      setIsSubmitting(false);
      setSubmitError("An unexpected error occurred while processing the request. Please try again.");
    }
  };

  const handleReset = () => {
    setSubmissionReceipt(null);
    setSubmitError(null);
    setErrors({});
    setShowNotes(false);
    setFormData({
      propertyType: '',
      propertyAddress: '',
      propertyPostcode: '',
      approxBedrooms: '3',
      serviceId: defaultServiceId || '',
      timescale: 'within-1-2-weeks',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      additionalNotes: '',
      privacyConsent: false
    });
  };

  if (submissionReceipt) {
    const data = submissionReceipt.data || {};
    const selectedTimescale = timescaleOptions.find(t => t.value === data.timescale)?.label || 'Standard (1 – 2 weeks)';
    const selectedPropertyType = propertyTypes.find(p => p.value === data.propertyType)?.label;
    return (
      <div 
        className={`hero-card ${className} compact-quote-form quote-success-card`} 
        style={{ maxWidth: '580px', width: '100%', margin: '0 auto' }}
      >
        {/* Success Header Strip */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.12)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.18)', border: '1.5px solid #10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CheckCircle2 size={24} style={{ color: '#10B981' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-0.01em', fontFamily: 'var(--font-serif)' }}>
                Quotation Request Received
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#94A3B8', margin: 0 }}>
                Logged with RICS Survey Dispatch Desk
              </p>
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94A3B8', display: 'block' }}>Reference</span>
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.02em', background: 'rgba(255, 255, 255, 0.08)', padding: '0.2rem 0.55rem', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.15)', display: 'inline-block' }}>
              {submissionReceipt.referenceId}
            </span>
          </div>
        </div>

        {/* Client Confirmation Message */}
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '14px', padding: '1rem', border: '1px solid rgba(255, 255, 255, 0.1)', marginBottom: '1.25rem' }}>
          <p style={{ fontSize: '0.88rem', color: '#F1F5F9', lineHeight: 1.5, margin: 0, fontWeight: 500 }}>
            Thank you, <strong style={{ color: '#FFFFFF' }}>{data.customerName || 'Valued Client'}</strong>. We have received your survey instruction enquiry.
          </p>
          <p style={{ fontSize: '0.8rem', color: '#94A3B8', lineHeight: 1.5, margin: '0.45rem 0 0 0' }}>
            A member of our surveying team will review the property details and email your formal fixed-fee quotation to <strong style={{ color: '#E2E8F0' }}>{data.customerEmail}</strong> within <strong style={{ color: '#FFFFFF' }}>24 business hours</strong>.
          </p>
        </div>

        {/* Clean Property & Instruction Summary Table (Zero Code/JSON!) */}
        <div style={{ backgroundColor: 'rgba(10, 18, 30, 0.55)', borderRadius: '12px', padding: '0.85rem 1rem', border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94A3B8', display: 'block', marginBottom: '0.6rem' }}>
            Instruction Overview
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.65rem', fontSize: '0.8rem' }}>
            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem' }}>Survey Service:</span>
              <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{data.serviceName || 'Home Survey'}</span>
            </div>
            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem' }}>Property Location:</span>
              <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{data.propertyAddress ? `${data.propertyAddress}, ${data.propertyPostcode}` : (data.propertyPostcode || 'Specified Region')}</span>
            </div>
            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem' }}>Target Timescale:</span>
              <span style={{ color: '#FFFFFF', fontWeight: 600, textTransform: 'capitalize' }}>{selectedTimescale}</span>
            </div>
            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem' }}>Direct Contact Phone:</span>
              <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{data.customerPhone || 'Not provided'}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleReset}
            className="compact-submit-btn"
            style={{
              flex: '1 1 auto',
              background: 'linear-gradient(135deg, #FFFFFF 0%, #E2E8F0 100%)',
              color: '#060B13',
              padding: '0.65rem 1.25rem',
              borderRadius: '9999px',
              fontSize: '0.84rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              cursor: 'pointer',
              border: 'none',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)'
            }}
          >
            <RefreshCw size={14} />
            <span>Submit Another Quote</span>
          </button>

          <a
            href={`tel:${siteConfig.contact.telephone}`}
            style={{
              flex: '1 1 auto',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#FFFFFF',
              padding: '0.65rem 1.25rem',
              borderRadius: '9999px',
              fontSize: '0.84rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              textDecoration: 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <span>Call Hotline: {siteConfig.contact.telephoneDisplay}</span>
          </a>
        </div>

        {/* Assurance Note */}
        <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'center' }}>
          <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
            Strictly Confidential &bull; Independent RICS Aligned Practice &bull; Zero Contractor Bias
          </span>
        </div>
      </div>
    );
  }

  return (
    <form
      className={`hero-card ${className} compact-quote-form hero-form-animate-entrance ${mounted ? 'is-slide-ready' : 'is-slide-pending'}`}
      onSubmit={handleSubmit}
      noValidate
      aria-label="Request a Survey Quote Form"
    >
      <div className="hero-card-header" style={{ marginBottom: '0.65rem' }}>
        <div className="quote-form-live-status">
          <span className="live-status-dot" aria-hidden="true" />
          <span className="live-status-text">Live RICS Surveyor Availability &bull; Instant Online Estimate</span>
        </div>
        <h3 className="hero-card-title" style={{ fontSize: '1.15rem', marginBottom: '2px' }}>
          Request a Fixed-Fee Survey Quote
        </h3>
        <p className="hero-card-desc" style={{ fontSize: '0.75rem' }}>
          Tailored quotation for London &amp; the Home Counties &bull; Swift response
        </p>
      </div>

      {submitError && (
        <div className="alert-box alert-danger" role="alert" style={{ padding: '0.5rem 0.75rem', marginBottom: '0.5rem' }}>
          <AlertTriangle size={15} />
          <span style={{ fontSize: '0.75rem' }}>{submitError}</span>
        </div>
      )}

      {/* Row 1: Required Service Selector */}
      <div className="form-group-compact">
        <label htmlFor="serviceId" className="form-label-compact">
          Required Survey Service <span className="req">*</span>
        </label>
        <select
          id="serviceId"
          name="serviceId"
          value={formData.serviceId}
          onChange={handleChange}
          className={`form-select form-input-compact ${errors.serviceId ? 'is-invalid' : ''}`}
          aria-invalid={!!errors.serviceId}
        >
          <option value="">Select Survey Discipline...</option>
          {approvedServices.map(service => (
            <option key={service.id} value={service.id}>
              {service.name}
            </option>
          ))}
        </select>
        {errors.serviceId && <span className="form-error-compact">{errors.serviceId}</span>}
      </div>

      {/* Row 2: Property Type & Bedrooms (2 Cols) */}
      <div className="form-grid-2">
        <div className="form-group-compact">
          <label htmlFor="propertyType" className="form-label-compact">
            Property Type <span className="req">*</span>
          </label>
          <select
            id="propertyType"
            name="propertyType"
            value={formData.propertyType}
            onChange={handleChange}
            className={`form-select form-input-compact ${errors.propertyType ? 'is-invalid' : ''}`}
            aria-invalid={!!errors.propertyType}
          >
            <option value="">Select Property Type...</option>
            {propertyTypes.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          {errors.propertyType && <span className="form-error-compact">{errors.propertyType}</span>}
        </div>

        <div className="form-group-compact">
          <label htmlFor="approxBedrooms" className="form-label-compact">
            Bedrooms
          </label>
          <select
            id="approxBedrooms"
            name="approxBedrooms"
            value={formData.approxBedrooms}
            onChange={handleChange}
            className="form-select form-input-compact"
          >
            <option value="1">1 Bed / Studio</option>
            <option value="2">2 Bedrooms</option>
            <option value="3">3 Bedrooms</option>
            <option value="4">4 Bedrooms</option>
            <option value="5">5+ Bedrooms</option>
          </select>
        </div>
      </div>

      {/* Row 3: Address & Postcode (2 Cols) */}
      <div className="form-grid-2">
        <div className="form-group-compact">
          <label htmlFor="propertyAddress" className="form-label-compact">
            Property Address &amp; Town <span className="req">*</span>
          </label>
          <input
            type="text"
            id="propertyAddress"
            name="propertyAddress"
            placeholder="e.g. 14 High Street"
            value={formData.propertyAddress}
            onChange={handleChange}
            className={`form-input form-input-compact ${errors.propertyAddress ? 'is-invalid' : ''}`}
            aria-invalid={!!errors.propertyAddress}
          />
          {errors.propertyAddress && <span className="form-error-compact">{errors.propertyAddress}</span>}
        </div>

        <div className="form-group-compact">
          <label htmlFor="propertyPostcode" className="form-label-compact">
            UK Postcode <span className="req">*</span>
          </label>
          <input
            type="text"
            id="propertyPostcode"
            name="propertyPostcode"
            placeholder="e.g. GU1 3AA"
            value={formData.propertyPostcode}
            onChange={handleChange}
            className={`form-input form-input-compact ${errors.propertyPostcode ? 'is-invalid' : ''}`}
            aria-invalid={!!errors.propertyPostcode}
            style={{ textTransform: 'uppercase' }}
          />
          {errors.propertyPostcode && <span className="form-error-compact">{errors.propertyPostcode}</span>}
        </div>
      </div>

      {/* Row 4: Required Timescale & Customer Name (2 Cols) */}
      <div className="form-grid-2">
        <div className="form-group-compact">
          <label htmlFor="timescale" className="form-label-compact">
            Required Timescale <span className="req">*</span>
          </label>
          <select
            id="timescale"
            name="timescale"
            value={formData.timescale}
            onChange={handleChange}
            className={`form-select form-input-compact ${errors.timescale ? 'is-invalid' : ''}`}
            aria-invalid={!!errors.timescale}
          >
            {timescaleOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {errors.timescale && <span className="form-error-compact">{errors.timescale}</span>}
        </div>

        <div className="form-group-compact">
          <label htmlFor="customerName" className="form-label-compact">
            Full Name <span className="req">*</span>
          </label>
          <input
            type="text"
            id="customerName"
            name="customerName"
            placeholder="e.g. Eleanor Vance"
            value={formData.customerName}
            onChange={handleChange}
            className={`form-input form-input-compact ${errors.customerName ? 'is-invalid' : ''}`}
            aria-invalid={!!errors.customerName}
            autoComplete="name"
          />
          {errors.customerName && <span className="form-error-compact">{errors.customerName}</span>}
        </div>
      </div>

      {/* Row 5: Email & Phone (2 Cols) */}
      <div className="form-grid-2">
        <div className="form-group-compact">
          <label htmlFor="customerEmail" className="form-label-compact">
            Email Address <span className="req">*</span>
          </label>
          <input
            type="email"
            id="customerEmail"
            name="customerEmail"
            placeholder="e.g. name@example.com"
            value={formData.customerEmail}
            onChange={handleChange}
            className={`form-input form-input-compact ${errors.customerEmail ? 'is-invalid' : ''}`}
            aria-invalid={!!errors.customerEmail}
            autoComplete="email"
          />
          {errors.customerEmail && <span className="form-error-compact">{errors.customerEmail}</span>}
        </div>

        <div className="form-group-compact">
          <label htmlFor="customerPhone" className="form-label-compact">
            Phone / Mobile <span className="req">*</span>
          </label>
          <input
            type="tel"
            id="customerPhone"
            name="customerPhone"
            placeholder="e.g. 07700 900123"
            value={formData.customerPhone}
            onChange={handleChange}
            className={`form-input form-input-compact ${errors.customerPhone ? 'is-invalid' : ''}`}
            aria-invalid={!!errors.customerPhone}
            autoComplete="tel"
          />
          {errors.customerPhone && <span className="form-error-compact">{errors.customerPhone}</span>}
        </div>
      </div>

      {/* Expandable Optional Notes Section */}
      <div style={{ marginBottom: '0.45rem' }}>
        <button
          type="button"
          onClick={() => setShowNotes(!showNotes)}
          className="notes-toggle-btn"
          aria-expanded={showNotes}
        >
          <span>{showNotes ? '− Hide specific notes' : '+ Add specific property notes (optional)'}</span>
        </button>

        {showNotes && (
          <div style={{ marginTop: '0.35rem' }}>
            <textarea
              id="additionalNotes"
              name="additionalNotes"
              rows={2}
              placeholder="e.g. Victorian property with extension, suspect damp in basement..."
              value={formData.additionalNotes}
              onChange={handleChange}
              className="form-textarea form-input-compact"
            />
          </div>
        )}
      </div>

      {/* Privacy Consent Checkbox (Compact 1 Line) */}
      <div style={{ marginBottom: '0.65rem' }}>
        <label className="compact-privacy-label">
          <input
            type="checkbox"
            name="privacyConsent"
            checked={formData.privacyConsent}
            onChange={handleChange}
            className="compact-checkbox"
          />
          <span>
            I agree to the processing of my details for this survey quote request.
          </span>
        </label>
        {errors.privacyConsent && (
          <span className="form-error-compact" style={{ display: 'block', marginTop: '2px' }}>
            {errors.privacyConsent}
          </span>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="gold"
        size="md"
        isBlock
        loading={isSubmitting}
        icon={ArrowRight}
        iconPosition="right"
        className="compact-submit-btn"
      >
        {isSubmitting ? 'Validating Quote...' : 'Request Survey Quotation'}
      </Button>

      <div style={{ textAlign: 'center', marginTop: '0.35rem', fontSize: '0.68rem', color: 'var(--color-muted-text)' }}>
        No payment required &bull; Confidential &bull; RICS Home Survey Aligned
      </div>
    </form>
  );
}
