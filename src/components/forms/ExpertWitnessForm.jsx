import React, { useState } from 'react';
import { Scale, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, FileText } from 'lucide-react';
import { expertWitnessService } from '../../config/services';
import { validateExpertWitnessForm } from '../../utils/validation';
import { FormField } from './FormField';
import { Button } from '../common/Button';

export function ExpertWitnessForm({ className = '' }) {
  const [formData, setFormData] = useState({
    instructingRole: 'solicitor',
    lawFirmName: '',
    disputeType: 'boundary-dispute',
    caseSummary: '',
    courtDeadline: '',
    propertyLocation: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    isSingleJointExpert: 'no'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  const roleOptions = [
    { value: 'solicitor', label: 'Instructing Solicitor / Legal Executive' },
    { value: 'barrister', label: 'Barrister / Counsel Chambers' },
    { value: 'insurer', label: 'Insurance Loss Adjuster / Claims Handler' },
    { value: 'litigant-in-person', label: 'Private Individual (Litigant in Person)' },
    { value: 'commercial-party', label: 'Commercial Property Owner / Tenant' }
  ];

  const disputeCategories = [
    { value: 'boundary-dispute', label: 'Boundary & Demarcation Dispute' },
    { value: 'defective-workmanship', label: 'Building Defect & Contractor Workmanship' },
    { value: 'structural-subsidence', label: 'Structural Movement & Subsidence Causation' },
    { value: 'dilapidations', label: 'Commercial / Residential Dilapidations' },
    { value: 'damp-mould-liability', label: 'Severe Damp & Environmental Health' },
    { value: 'professional-negligence', label: 'Surveyor / Valuer Professional Negligence' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

    const validation = validateExpertWitnessForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      const firstError = Object.keys(validation.errors)[0];
      const el = document.getElementById(firstError);
      if (el) el.focus();
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 600));

      setReceipt({
        timestamp: new Date().toISOString(),
        instructionRef: `CPR-${Math.floor(200000 + Math.random() * 800000)}`,
        data: formData,
        notice: "Demonstration Build Notice: Your Expert Witness instruction enquiry has been validated according to CPR Part 35 preliminary requirements. This is a frontend prototype; no live database entry has been generated."
      });
      setIsSubmitting(false);
    } catch (err) {
      setIsSubmitting(false);
      setSubmitError("Failed to process instruction enquiry. Please try again.");
    }
  };

  const handleReset = () => {
    setReceipt(null);
    setSubmitError(null);
    setErrors({});
    setFormData({
      instructingRole: 'solicitor',
      lawFirmName: '',
      disputeType: 'boundary-dispute',
      caseSummary: '',
      courtDeadline: '',
      propertyLocation: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      isSingleJointExpert: 'no'
    });
  };

  if (receipt) {
    return (
      <div className={`hero-card ${className}`} style={{ borderLeft: '4px solid var(--color-accent-gold)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <Scale size={32} style={{ color: 'var(--color-accent-gold)' }} />
          <div>
            <h3 style={{ fontSize: 'var(--font-size-xl)', color: 'var(--color-primary-navy)' }}>
              Litigation Enquiry Logged (Demonstration)
            </h3>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted-text)' }}>
              Instruction Reference: <strong>{receipt.instructionRef}</strong>
            </span>
          </div>
        </div>

        <div className="alert-box alert-info">
          <div>
            <strong style={{ display: 'block', marginBottom: '0.25rem' }}>
              Civil Procedure Rules (CPR) Part 35 Prototype Notice:
            </strong>
            {receipt.notice}
          </div>
        </div>

        <div className="prototype-receipt">
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {JSON.stringify(receipt.data, null, 2)}
          </pre>
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
          <Button variant="secondary" size="sm" onClick={handleReset} icon={RefreshCw}>
            Submit Another Instruction Enquiry
          </Button>
          <Button to="/contact" variant="primary" size="sm">
            Contact Senior Surveyor
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      className={`hero-card expert-witness-form ${className}`}
      onSubmit={handleSubmit}
      noValidate
      aria-label="Expert Witness Instruction Form"
    >
      <div className="hero-card-header">
        <h3 className="hero-card-title" style={{ color: '#0F172A', fontWeight: 700 }}>
          Confidential Legal Instruction Enquiry
        </h3>
        <p className="hero-card-desc" style={{ color: '#334155', fontWeight: 500 }}>
          Submit dispute details for preliminary conflict checks, letter of instruction review, and CPR Part 35 readiness.
        </p>
      </div>

      {submitError && (
        <div className="alert-box alert-danger" role="alert">
          <AlertTriangle size={18} />
          <span>{submitError}</span>
        </div>
      )}

      {/* Instructing Role */}
      <div className="grid-2">
        <FormField
          id="instructingRole"
          label="Instructing Party Capacity"
          required
          error={errors.instructingRole}
        >
          <select
            id="instructingRole"
            name="instructingRole"
            value={formData.instructingRole}
            onChange={handleChange}
            className={`form-select ${errors.instructingRole ? 'is-invalid' : ''}`}
            aria-invalid={!!errors.instructingRole}
          >
            {roleOptions.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </FormField>

        <FormField
          id="lawFirmName"
          label="Law Firm / Practice Name"
          helpText="Leave blank if private individual"
        >
          <input
            type="text"
            id="lawFirmName"
            name="lawFirmName"
            placeholder="e.g. Sterling &amp; Partners LLP"
            value={formData.lawFirmName}
            onChange={handleChange}
            className="form-input"
          >
          </input>
        </FormField>
      </div>

      {/* Dispute Type & SJE Option */}
      <div className="grid-2">
        <FormField
          id="disputeType"
          label="Nature of Dispute"
          required
          error={errors.disputeType}
        >
          <select
            id="disputeType"
            name="disputeType"
            value={formData.disputeType}
            onChange={handleChange}
            className={`form-select ${errors.disputeType ? 'is-invalid' : ''}`}
            aria-invalid={!!errors.disputeType}
          >
            {disputeCategories.map(d => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </FormField>

        <FormField
          id="isSingleJointExpert"
          label="Single Joint Expert (SJE)?"
        >
          <select
            id="isSingleJointExpert"
            name="isSingleJointExpert"
            value={formData.isSingleJointExpert}
            onChange={handleChange}
            className="form-select"
          >
            <option value="no">Party-Appointed Expert (Claimant / Defendant)</option>
            <option value="yes">Single Joint Expert (Jointly Instructed)</option>
            <option value="pre-action">Pre-Action Advisory / Protocol Stage</option>
          </select>
        </FormField>
      </div>

      {/* Case Summary */}
      <FormField
        id="caseSummary"
        label="Summary of Dispute &amp; Surveyor Role"
        required
        error={errors.caseSummary}
        helpText="Briefly describe key allegations, property defect symptoms, or boundary controversy."
      >
        <textarea
          id="caseSummary"
          name="caseSummary"
          rows={3}
          placeholder="State the underlying facts, parties involved, and technical questions requiring independent expert determination..."
          value={formData.caseSummary}
          onChange={handleChange}
          className={`form-textarea ${errors.caseSummary ? 'is-invalid' : ''}`}
          aria-invalid={!!errors.caseSummary}
        />
      </FormField>

      {/* Court Deadlines & Location */}
      <div className="grid-2">
        <FormField
          id="courtDeadline"
          label="Court Directions / Target Report Date"
          required
          error={errors.courtDeadline}
          helpText="e.g. 15th December 2026 or Pre-action protocol"
        >
          <input
            type="text"
            id="courtDeadline"
            name="courtDeadline"
            placeholder="e.g. Directions deadline: 4 weeks"
            value={formData.courtDeadline}
            onChange={handleChange}
            className={`form-input ${errors.courtDeadline ? 'is-invalid' : ''}`}
            aria-invalid={!!errors.courtDeadline}
          />
        </FormField>

        <FormField
          id="propertyLocation"
          label="Subject Property Location / Postcode"
          helpText="County or borough of inspection"
        >
          <input
            type="text"
            id="propertyLocation"
            name="propertyLocation"
            placeholder="e.g. Oxford, Oxfordshire (OX2)"
            value={formData.propertyLocation}
            onChange={handleChange}
            className="form-input"
          />
        </FormField>
      </div>

      {/* Contact Details */}
      <div className="grid-3">
        <FormField
          id="contactName"
          label="Practitioner / Contact Name"
          required
          error={errors.contactName}
        >
          <input
            type="text"
            id="contactName"
            name="contactName"
            placeholder="e.g. Julian Wright"
            value={formData.contactName}
            onChange={handleChange}
            className={`form-input ${errors.contactName ? 'is-invalid' : ''}`}
            aria-invalid={!!errors.contactName}
          />
        </FormField>

        <FormField
          id="contactEmail"
          label="Professional Email"
          required
          error={errors.contactEmail}
        >
          <input
            type="email"
            id="contactEmail"
            name="contactEmail"
            placeholder="e.g. j.wright@solicitors.co.uk"
            value={formData.contactEmail}
            onChange={handleChange}
            className={`form-input ${errors.contactEmail ? 'is-invalid' : ''}`}
            aria-invalid={!!errors.contactEmail}
          />
        </FormField>

        <FormField
          id="contactPhone"
          label="Direct Phone Number"
          required
          error={errors.contactPhone}
        >
          <input
            type="tel"
            id="contactPhone"
            name="contactPhone"
            placeholder="e.g. 020 7946 0888"
            value={formData.contactPhone}
            onChange={handleChange}
            className={`form-input ${errors.contactPhone ? 'is-invalid' : ''}`}
            aria-invalid={!!errors.contactPhone}
          />
        </FormField>
      </div>

      <Button
        type="submit"
        variant="gold"
        size="lg"
        isBlock
        loading={isSubmitting}
        icon={Scale}
        iconPosition="left"
      >
        {isSubmitting ? 'Verifying Conflict Checks...' : 'Submit Expert Witness Instruction Request'}
      </Button>

      <div className="expert-form-reassurance" style={{ textAlign: 'center', marginTop: 'var(--space-3)', fontSize: 'var(--font-size-xs)', color: '#334155', fontWeight: 600 }}>
        Strict litigation confidentiality &bull; Independent CPR Part 35 duty to the Court &bull; Swift response
      </div>
    </form>
  );
}

