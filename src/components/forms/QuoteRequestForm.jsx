import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { approvedServices } from '../../config/services';
import { validateQuoteForm } from '../../utils/validation';
import { FormField } from './FormField';
import { Button } from '../common/Button';

export function QuoteRequestForm({ defaultServiceId = '', className = '' }) {
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
    return (
      <div className={`hero-card ${className}`} style={{ borderLeft: '4px solid var(--color-success)', maxWidth: '520px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <CheckCircle2 size={28} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
          <div>
            <h3 style={{ fontSize: 'var(--font-size-md)', color: 'var(--color-primary-navy)', margin: 0 }}>
              Quotation Request Received
            </h3>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted-text)' }}>
              Reference: <strong>{submissionReceipt.referenceId}</strong>
            </span>
          </div>
        </div>

        <div className="alert-box alert-info" style={{ marginBottom: '1rem', padding: '0.65rem 0.85rem' }}>
          <div style={{ fontSize: 'var(--font-size-xs)' }}>
            <strong>Demonstration Notice:</strong> Form validated according to RICS criteria. Payload captured successfully.
          </div>
        </div>

        <div className="prototype-receipt" style={{ maxHeight: '160px', overflowY: 'auto' }}>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: 0 }}>
            {JSON.stringify(submissionReceipt.data, null, 2)}
          </pre>
        </div>

        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button variant="secondary" size="sm" onClick={handleReset} icon={RefreshCw}>
            Submit Another Quote
          </Button>
          <Button to="/contact" variant="primary" size="sm">
            Contact Team
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      className={`hero-card ${className} compact-quote-form`}
      onSubmit={handleSubmit}
      noValidate
      aria-label="Request a Survey Quote Form"
    >
      <div className="hero-card-header" style={{ marginBottom: '0.65rem' }}>
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
            placeholder="e.g. 14 High Street, Guildford"
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
            placeholder="e.g. eleanor@example.co.uk"
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
