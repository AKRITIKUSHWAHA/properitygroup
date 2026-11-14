import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, ChevronDown, ChevronUp, Eye, EyeOff, Lock, User } from 'lucide-react';
import { approvedServices } from '../../config/services';
import { siteConfig } from '../../config/siteConfig';
import { validateQuoteForm } from '../../utils/validation';
import { publicApi } from '../../api/publicApi';
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
    password: '',
    additionalNotes: '',
    privacyConsent: false
  });

  const [showPassword, setShowPassword] = useState(false);
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
      const selectedService = approvedServices.find(s => s.id === formData.serviceId);
      const serviceName = selectedService ? selectedService.name : formData.serviceId;

      const res = await publicApi.submitQuoteEnquiry({
        ...formData,
        serviceName,
        enquiryCategory: 'SURVEY_QUOTE',
        sourcePage: typeof window !== 'undefined' ? window.location.pathname : '/contact',
      });

      // Cache customer profile in local storage for instantaneous portal access
      try {
        const storedCustomers = JSON.parse(localStorage.getItem('property_group_registered_customers') || '{}');
        storedCustomers[formData.customerEmail.toLowerCase().trim()] = {
          id: `usr_client_${Date.now()}`,
          email: formData.customerEmail.toLowerCase().trim(),
          name: formData.customerName,
          role: 'customer',
          roleLabel: 'Property Client',
          company: 'NJS Property Group',
          phone: formData.customerPhone || '',
          address: formData.propertyAddress || '',
          city: formData.city || formData.propertyLocation || '',
          postcode: formData.propertyPostcode || '',
        };
        localStorage.setItem('property_group_registered_customers', JSON.stringify(storedCustomers));
      } catch {}

      const receipt = {
        timestamp: res?.timestamp || new Date().toISOString(),
        referenceId: res?.referenceId || `ENQ-${Math.floor(100000 + Math.random() * 900000)}`,
        emailNotification: res?.emailNotification || { recipient: siteConfig.contact.email, emailSent: false },
        data: {
          ...formData,
          serviceName,
        },
      };

      setSubmissionReceipt(receipt);
      setIsSubmitting(false);
    } catch (err) {
      setIsSubmitting(false);
      setSubmitError(
        err?.status === 0 || err?.status === 502 || err?.status === 503
          ? `Unable to reach our quotation server right now. Please email ${siteConfig.contact.email} or call ${siteConfig.contact.telephoneDisplay}.`
          : err?.message || `Unable to submit your enquiry right now. Please call ${siteConfig.contact.telephoneDisplay} or email ${siteConfig.contact.email}.`
      );
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
      password: '',
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
        style={{ maxWidth: '580px', width: '100%', margin: '0 auto', backgroundColor: '#FFFFFF', color: '#0F172A', boxSizing: 'border-box' }}
      >
        {/* Success Header Strip - Responsive & Never Cut Off */}
        <div className="quote-success-header-strip">
          <div className="quote-success-header-left">
            <div className="quote-success-check-badge">
              <CheckCircle2 size={22} style={{ color: '#059669' }} />
            </div>
            <div>
              <h3 className="quote-success-title">
                Quotation Request Received
              </h3>
              <p className="quote-success-subtitle">
                Logged with RICS Survey Dispatch Desk
              </p>
            </div>
          </div>
          <div className="quote-success-ref-badge">
            <span className="quote-success-ref-label">Reference</span>
            <span className="quote-success-ref-id">
              {submissionReceipt.referenceId}
            </span>
          </div>
        </div>

        {/* Client Confirmation Message */}
        <div className="quote-success-msg-box">
          <p style={{ fontSize: '0.88rem', color: '#0F172A', lineHeight: 1.5, margin: 0, fontWeight: 500, overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
            Thank you, <strong style={{ color: '#032954' }}>{data.customerName || 'Valued Client'}</strong>. We have received your survey instruction enquiry.
          </p>
          <p style={{ fontSize: '0.8rem', color: '#334155', lineHeight: 1.5, margin: '0.45rem 0 0 0', overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
            {submissionReceipt.emailNotification?.emailSent ? (
              <>
                Notification dispatched to <strong style={{ color: '#032954' }}>{submissionReceipt.emailNotification.recipient}</strong>. Our surveying team will email your formal fixed-fee quotation to <strong style={{ color: '#032954' }}>{data.customerEmail}</strong> within <strong style={{ color: '#0F172A' }}>24 business hours</strong>.
              </>
            ) : (
              <>
                Your enquiry has been logged against reference <strong style={{ color: '#032954' }}>{submissionReceipt.referenceId}</strong>. For urgent instructions you can also email <strong style={{ color: '#032954' }}>{siteConfig.contact.email}</strong> or call <strong style={{ color: '#0F172A' }}>{siteConfig.contact.telephoneDisplay}</strong>.
              </>
            )}
          </p>
        </div>

        {/* Clean Property & Instruction Summary Table */}
        <div className="quote-success-summary-box">
          <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#475569', display: 'block', marginBottom: '0.6rem' }}>
            Instruction Overview
          </span>
          <div className="quote-success-summary-grid">
            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem', fontWeight: 600 }}>Survey Service:</span>
              <span style={{ color: '#0F172A', fontWeight: 700, overflowWrap: 'anywhere', wordBreak: 'break-word' }}>{data.serviceName || 'Home Survey'}</span>
            </div>
            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem', fontWeight: 600 }}>Property Location:</span>
              <span style={{ color: '#0F172A', fontWeight: 700, overflowWrap: 'anywhere', wordBreak: 'break-word' }}>{data.propertyAddress ? `${data.propertyAddress}, ${data.propertyPostcode}` : (data.propertyPostcode || 'Specified Region')}</span>
            </div>
            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem', fontWeight: 600 }}>Target Timescale:</span>
              <span style={{ color: '#0F172A', fontWeight: 700, textTransform: 'capitalize', overflowWrap: 'anywhere', wordBreak: 'break-word' }}>{selectedTimescale}</span>
            </div>
            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem', fontWeight: 600 }}>Direct Contact Phone:</span>
              <span style={{ color: '#0F172A', fontWeight: 700, overflowWrap: 'anywhere', wordBreak: 'break-word' }}>{data.customerPhone || 'Not provided'}</span>
            </div>
          </div>
        </div>

        {/* Customer Portal Account Notice */}
        <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '0.75rem', marginTop: '0.65rem', display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
          <CheckCircle2 size={18} style={{ color: '#16A34A', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#166534', display: 'block' }}>
              Customer Portal Account Active
            </span>
            <span style={{ fontSize: '0.76rem', color: '#15803D', lineHeight: 1.4, display: 'block' }}>
              Your account is ready with email <strong>{data.customerEmail}</strong>. Use your password to log in, view quotes, and track your survey.
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="quote-success-actions" style={{ marginTop: '0.85rem' }}>
          <Link
            to="/login"
            state={{ prefilledEmail: data.customerEmail }}
            className="compact-submit-btn quote-success-action-btn"
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', backgroundColor: '#0B1F4D', color: '#FFFFFF', fontWeight: 700 }}
          >
            <User size={15} />
            <span>Login to Customer Dashboard &rarr;</span>
          </Link>

          <button
            type="button"
            onClick={handleReset}
            className="quote-success-action-btn quote-success-call-btn"
          >
            <RefreshCw size={14} />
            <span>Submit Another Quote</span>
          </button>
        </div>

        {/* Assurance Note */}
        <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #E2E8F0', textAlign: 'center' }}>
          <span style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 500, display: 'block', lineHeight: 1.4 }}>
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
          <option value="">Select Survey Discipline</option>
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
            <option value="">Select Property Type</option>
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

      {/* Row 6: Create Account Password (for Customer Portal) */}
      <div className="form-group-compact" style={{ marginBottom: '0.55rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
          <label htmlFor="password" className="form-label-compact" style={{ margin: 0, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Lock size={12} style={{ color: '#0B1F4D' }} />
            <span>Create Portal Password <span className="req">*</span></span>
          </label>
          <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 500 }}>
            Min. 6 characters
          </span>
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            placeholder="Choose a password (to log in and track survey)"
            value={formData.password}
            onChange={handleChange}
            className={`form-input form-input-compact ${errors.password ? 'is-invalid' : ''}`}
            aria-invalid={!!errors.password}
            autoComplete="new-password"
            style={{ paddingRight: '2.5rem' }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '0.55rem',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#64748B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px'
            }}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        {errors.password && <span className="form-error-compact">{errors.password}</span>}
        <span style={{ display: 'block', fontSize: '0.68rem', color: '#64748B', marginTop: '2px', lineHeight: 1.3 }}>
          Use this password with your email to log in to your dashboard to review quotes and download reports.
        </span>
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
            id="privacyConsent"
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
        {isSubmitting ? 'Sending Request...' : 'Request Survey Quotation'}
      </Button>

      <div style={{ textAlign: 'center', marginTop: '0.35rem', fontSize: '0.68rem', color: 'var(--color-muted-text)' }}>
        No payment required &bull; Confidential &bull; RICS Home Survey Aligned
      </div>
    </form>
  );
}
