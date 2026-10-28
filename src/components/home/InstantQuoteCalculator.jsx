import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Clock,
  Sparkles,
  Home,
  Check,
  ChevronRight,
  PhoneCall,
  Calendar,
  Building2,
  RefreshCw
} from 'lucide-react';
import { Button } from '../common/Button';
import { getStoredLeads, saveStoredLeads } from '../../mock/leads';

export function InstantQuoteCalculator({ onComplete }) {
  // Step 1: Input details, Step 2: Instant price options, Step 3: Success confirmation
  const [step, setStep] = useState(1);

  // Form State
  const [postcode, setPostcode] = useState('');
  const [propertyType, setPropertyType] = useState('semi-detached');
  const [approxValue, setApproxValue] = useState('350-500k');
  const [bedrooms, setBedrooms] = useState('3');
  const [selectedSurvey, setSelectedSurvey] = useState('level-2');

  // Lead contact info
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quoteReference, setQuoteReference] = useState('');
  const [postcodeError, setPostcodeError] = useState('');

  // UK Postcode Quick Selectors
  const samplePostcodes = [
    { label: 'London (SW1)', code: 'SW1A 1AA' },
    { label: 'Surrey (GU1)', code: 'GU1 2PF' },
    { label: 'Oxford (OX1)', code: 'OX1 2JD' },
    { label: 'Reading (RG1)', code: 'RG1 1EX' },
  ];

  // Dynamic pricing calculation based on property value & survey type
  const getPrices = () => {
    let multiplier = 1;
    if (approxValue === 'under-350k') multiplier = 0.9;
    if (approxValue === '350-500k') multiplier = 1.0;
    if (approxValue === '500-750k') multiplier = 1.15;
    if (approxValue === '750-1m') multiplier = 1.35;
    if (approxValue === 'over-1m') multiplier = 1.6;

    if (propertyType === 'detached') multiplier *= 1.1;
    if (propertyType === 'flat') multiplier *= 0.9;

    return {
      level2: Math.round(445 * multiplier),
      level3: Math.round(695 * multiplier),
      valuation: Math.round(340 * multiplier),
    };
  };

  const prices = getPrices();

  const handleStep1Submit = (e) => {
    e.preventDefault();
    const cleanPostcode = postcode.trim().toUpperCase();
    if (!cleanPostcode || cleanPostcode.length < 3) {
      setPostcodeError('Please enter a valid UK postcode (e.g. SW1A 1AA)');
      return;
    }
    setPostcodeError('');
    setPostcode(cleanPostcode);
    setStep(2);
  };

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
      alert('Please fill in your name, email and phone number to lock in your quote.');
      return;
    }

    setIsSubmitting(true);

    const ref = `QUO-${Math.floor(100000 + Math.random() * 900000)}`;
    const surveyTitle =
      selectedSurvey === 'level-2'
        ? 'RICS Level 2 Homebuyer Survey'
        : selectedSurvey === 'level-3'
        ? 'RICS Level 3 Building Survey'
        : 'Residential Property Valuation';

    const selectedPrice =
      selectedSurvey === 'level-2'
        ? prices.level2
        : selectedSurvey === 'level-3'
        ? prices.level3
        : prices.valuation;

    // Create new lead in CRM
    const newLead = {
      id: `LD-${Math.floor(1050 + Math.random() * 900)}`,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      customerPhone: customerPhone.trim(),
      enquiry: surveyTitle,
      property: `${bedrooms}-Bed ${propertyType.charAt(0).toUpperCase() + propertyType.slice(1)}`,
      location: postcode,
      source: 'Website',
      status: 'Quoted',
      created: new Date().toLocaleDateString('en-GB'),
      owner: 'Sarah Jenkins',
      estimatedValue: `£${selectedPrice}.00`,
      quotedAmount: `£${selectedPrice}.00`,
      quoteDate: new Date().toLocaleDateString('en-GB'),
      quoteReference: ref,
      notes: `Instant online quote generated for ${bedrooms} bed ${propertyType} in ${postcode}. Price bracket: ${approxValue}.`,
    };

    try {
      const existing = getStoredLeads();
      saveStoredLeads([newLead, ...existing]);
    } catch (err) {
      console.error('Error saving quote lead', err);
    }

    setTimeout(() => {
      setQuoteReference(ref);
      setIsSubmitting(false);
      setStep(3);
      if (onComplete) onComplete(newLead);
    }, 600);
  };

  const handleReset = () => {
    setStep(1);
    setPostcode('');
    setQuoteReference('');
  };

  return (
    <div className="instant-quote-widget">
      {/* Widget Header Strip */}
      <div className="widget-header">
        <div className="widget-badge-row">
          <span className="widget-pill">
            <Sparkles size={13} className="text-amber-400 mr-1" />
            Instant Fixed Price
          </span>
          <span className="widget-tag">RICS Regulated Practice</span>
        </div>
        <h3 className="widget-title">
          {step === 1 && 'Get an Instant UK Survey Quote'}
          {step === 2 && 'Select Your Survey Level'}
          {step === 3 && 'Fixed-Fee Quote Confirmed!'}
        </h3>
        <p className="widget-subtitle">
          {step === 1 && 'Compare RICS Level 2 & 3 survey prices for your property in 60 seconds.'}
          {step === 2 && `Fixed estimates for ${postcode} (${propertyType}, ${bedrooms} beds)`}
          {step === 3 && 'Your quote has been dispatched to your email with direct surveyor booking options.'}
        </p>
      </div>

      {/* STEP 1: Property Details Form */}
      {step === 1 && (
        <form onSubmit={handleStep1Submit} className="widget-form-body">
          {/* Postcode Input */}
          <div className="widget-field-group">
            <label htmlFor="quote-postcode" className="widget-label">
              Property UK Postcode <span className="text-red-500">*</span>
            </label>
            <div className="postcode-input-wrap">
              <input
                id="quote-postcode"
                type="text"
                placeholder="e.g. SW1A 1AA or GU1 2PF"
                value={postcode}
                onChange={(e) => {
                  setPostcode(e.target.value.toUpperCase());
                  setPostcodeError('');
                }}
                className={`widget-input postcode-input ${postcodeError ? 'input-error' : ''}`}
                maxLength={9}
              />
            </div>
            {postcodeError && <span className="field-error-msg">{postcodeError}</span>}

            {/* Quick Postcode Pills */}
            <div className="quick-postcodes">
              <span className="quick-label">Try sample:</span>
              {samplePostcodes.map((item) => (
                <button
                  type="button"
                  key={item.code}
                  className="quick-chip"
                  onClick={() => {
                    setPostcode(item.code);
                    setPostcodeError('');
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Property Type Grid */}
          <div className="widget-field-group">
            <label className="widget-label">Property Type</label>
            <div className="property-type-grid">
              {[
                { id: 'semi-detached', label: 'Semi-Detached' },
                { id: 'detached', label: 'Detached' },
                { id: 'terraced', label: 'Terraced' },
                { id: 'flat', label: 'Flat / Apt' },
                { id: 'bungalow', label: 'Bungalow' },
              ].map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setPropertyType(type.id)}
                  className={`type-chip ${propertyType === type.id ? 'is-selected' : ''}`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Value & Bedrooms Row */}
          <div className="widget-two-col">
            <div className="widget-field-group">
              <label htmlFor="quote-value" className="widget-label">Approx Value</label>
              <select
                id="quote-value"
                value={approxValue}
                onChange={(e) => setApproxValue(e.target.value)}
                className="widget-select"
              >
                <option value="under-350k">Up to £350,000</option>
                <option value="350-500k">£350,000 – £500,000</option>
                <option value="500-750k">£500,000 – £750,000</option>
                <option value="750-1m">£750,000 – £1,000,000</option>
                <option value="over-1m">Over £1,000,000</option>
              </select>
            </div>

            <div className="widget-field-group">
              <label htmlFor="quote-beds" className="widget-label">Bedrooms</label>
              <select
                id="quote-beds"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="widget-select"
              >
                <option value="1">1 Bed</option>
                <option value="2">2 Beds</option>
                <option value="3">3 Beds</option>
                <option value="4">4 Beds</option>
                <option value="5+">5+ Beds</option>
              </select>
            </div>
          </div>

          {/* Submit Step 1 Button */}
          <button type="submit" className="widget-submit-btn group">
            <span>Calculate Instant Survey Quotes</span>
            <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Micro Trust Indicators */}
          <div className="widget-trust-footer">
            <div className="trust-item">
              <CheckCircle2 size={13} className="text-emerald-500" />
              <span>No email required for estimate</span>
            </div>
            <div className="trust-item">
              <CheckCircle2 size={13} className="text-emerald-500" />
              <span>48h digital report delivery</span>
            </div>
          </div>
        </form>
      )}

      {/* STEP 2: Compare Pricing & Select Survey */}
      {step === 2 && (
        <form onSubmit={handleFinalSubmit} className="widget-form-body">
          <div className="survey-choice-cards">
            {/* Level 2 Card */}
            <div
              className={`choice-card ${selectedSurvey === 'level-2' ? 'is-active' : ''}`}
              onClick={() => setSelectedSurvey('level-2')}
            >
              <div className="choice-badge-row">
                <span className="choice-title">RICS Level 2 Homebuyer</span>
                <span className="choice-popular">Most Popular</span>
              </div>
              <p className="choice-desc">For conventional homes in reasonable order (post-1900).</p>
              <div className="choice-price">
                <span className="price-num">£{prices.level2}</span>
                <span className="price-vat">Fixed Fee Inc. VAT</span>
              </div>
              <div className="choice-features">
                <span>✓ Traffic-Light Condition Ratings</span>
                <span>✓ Visual Structural &amp; Roof Check</span>
                <span>✓ Direct Surveyor Telephone Debrief</span>
              </div>
            </div>

            {/* Level 3 Card */}
            <div
              className={`choice-card ${selectedSurvey === 'level-3' ? 'is-active' : ''}`}
              onClick={() => setSelectedSurvey('level-3')}
            >
              <div className="choice-badge-row">
                <span className="choice-title">RICS Level 3 Building Survey</span>
                <span className="choice-depth">Comprehensive</span>
              </div>
              <p className="choice-desc">For period, Victorian, altered, or large homes needing structural analysis.</p>
              <div className="choice-price">
                <span className="price-num">£{prices.level3}</span>
                <span className="price-vat">Fixed Fee Inc. VAT</span>
              </div>
              <div className="choice-features">
                <span>✓ In-Depth Structural &amp; Timber Audit</span>
                <span>✓ Prioritized Repair Schedule</span>
                <span>✓ Estimated Remediation Guidance</span>
              </div>
            </div>
          </div>

          {/* Quick Contact Form to Lock In Quote */}
          <div className="contact-capture-box">
            <h4 className="capture-title">Lock in this fixed price &amp; receive report sample:</h4>
            <div className="capture-grid">
              <input
                type="text"
                placeholder="Your Full Name *"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                className="widget-input"
              />
              <input
                type="email"
                placeholder="Email Address *"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                required
                className="widget-input"
              />
              <input
                type="tel"
                placeholder="UK Phone Number *"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                required
                className="widget-input"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="widget-step2-actions">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="widget-back-btn"
            >
              ← Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="widget-submit-btn flex-1"
            >
              {isSubmitting ? (
                <span>Generating Official Quote...</span>
              ) : (
                <>
                  <span>Dispatch Official Quote (£{selectedSurvey === 'level-2' ? prices.level2 : prices.level3})</span>
                  <ArrowRight size={16} className="ml-2" />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* STEP 3: Quote Confirmation Receipt */}
      {step === 3 && (
        <div className="widget-success-view">
          <div className="success-icon-badge">
            <CheckCircle2 size={36} className="text-emerald-500" />
          </div>

          <h4 className="success-title">Your Quote is Ready!</h4>
          <p className="success-desc">
            We have locked in your fixed quotation and dispatched a formal PDF breakdown to{' '}
            <strong>{customerEmail}</strong>.
          </p>

          <div className="success-reference-card">
            <div className="ref-row">
              <span className="ref-label">Quote Reference:</span>
              <span className="ref-val">{quoteReference}</span>
            </div>
            <div className="ref-row">
              <span className="ref-label">Survey Discipline:</span>
              <span className="ref-val">
                {selectedSurvey === 'level-2' ? 'RICS Level 2 Homebuyer' : 'RICS Level 3 Building Survey'}
              </span>
            </div>
            <div className="ref-row">
              <span className="ref-label">Property Location:</span>
              <span className="ref-val">{postcode}</span>
            </div>
            <div className="ref-row">
              <span className="ref-label">Fixed Fee (Inc. VAT):</span>
              <span className="ref-val highlight-green">
                £{selectedSurvey === 'level-2' ? prices.level2 : prices.level3}.00
              </span>
            </div>
            <div className="ref-row">
              <span className="ref-label">Estimated Turnaround:</span>
              <span className="ref-val">3 – 5 Working Days</span>
            </div>
          </div>

          <div className="success-action-buttons">
            <a
              href="tel:08001699661"
              className="success-phone-btn"
            >
              <PhoneCall size={15} />
              <span>Speak with a Surveyor: 0800 169 9661</span>
            </a>

            <button
              type="button"
              onClick={handleReset}
              className="success-reset-btn"
            >
              <RefreshCw size={14} className="mr-1" />
              Calculate Another Property
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

