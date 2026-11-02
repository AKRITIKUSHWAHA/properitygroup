/**
 * Form Validation Utilities
 * Master Specification Part 8.1 & 8.2
 */

// UK Postcode Regex Pattern
const UK_POSTCODE_REGEX = /^([A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}|GIR ?0AA)$/i;

// Email Regex Pattern
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// UK Phone Number Regex Pattern (supports mobile, landline, national prefixes)
const UK_PHONE_REGEX = /^(?:(?:\+44\s?|0)(?:7\d{3}|[123]\d{3}|[1-9]\d{2})\s?\d{3}\s?\d{3,4})$/;

/**
 * Validates the Quote Request Form
 * @param {Object} formData
 * @returns {Object} { isValid: boolean, errors: Object }
 */
export function validateQuoteForm(formData) {
  const errors = {};

  // 1. Property Type
  if (!formData.propertyType || formData.propertyType.trim() === '') {
    errors.propertyType = "Please select the property type (e.g. Detached, Flat).";
  }

  // 2. Property Address
  if (!formData.propertyAddress || formData.propertyAddress.trim().length < 5) {
    errors.propertyAddress = "Please provide the property street address and town.";
  }

  // Postcode
  if (!formData.propertyPostcode || formData.propertyPostcode.trim() === '') {
    errors.propertyPostcode = "Please provide a valid property postcode.";
  } else {
    const cleanPostcode = formData.propertyPostcode.trim().toUpperCase();
    if (!UK_POSTCODE_REGEX.test(cleanPostcode)) {
      errors.propertyPostcode = "Please enter a valid UK postcode (e.g. SW1A 1AA or OX1 2JD).";
    }
  }

  // 3. Required Survey Service
  if (!formData.serviceId || formData.serviceId.trim() === '') {
    errors.serviceId = "Please select one of the five approved surveying services.";
  }

  // 4. Required Timescale
  if (!formData.timescale || formData.timescale.trim() === '') {
    errors.timescale = "Please indicate your required survey timescale.";
  }

  // 5. Customer Name
  if (!formData.customerName || formData.customerName.trim().length < 2) {
    errors.customerName = "Please enter your full name.";
  }

  // Customer Email
  if (!formData.customerEmail || formData.customerEmail.trim() === '') {
    errors.customerEmail = "Please enter your contact email address.";
  } else if (!EMAIL_REGEX.test(formData.customerEmail.trim())) {
    errors.customerEmail = "Please enter a valid email address (e.g. name@example.co.uk).";
  }

  // Customer Phone
  if (!formData.customerPhone || formData.customerPhone.trim() === '') {
    errors.customerPhone = "Please enter a daytime telephone number for surveyor contact.";
  } else {
    // Basic digit sanity check (at least 9 digits)
    const digitsOnly = formData.customerPhone.replace(/\D/g, '');
    if (digitsOnly.length < 10 || digitsOnly.length > 13) {
      errors.customerPhone = "Please enter a valid contact phone number (10 to 12 digits).";
    }
  }

  // Privacy Notice Consent
  if (!formData.privacyConsent) {
    errors.privacyConsent = "Please confirm that you agree to the processing of your enquiry details.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validates the Expert Witness Instruction Form
 * @param {Object} formData
 * @returns {Object} { isValid: boolean, errors: Object }
 */
export function validateExpertWitnessForm(formData) {
  const errors = {};

  if (!formData.instructingRole) {
    errors.instructingRole = "Please select whether you are a Solicitor, Barrister, Insurer, or Litigant.";
  }

  if (!formData.disputeType) {
    errors.disputeType = "Please select the primary dispute category.";
  }

  if (!formData.caseSummary || formData.caseSummary.trim().length < 15) {
    errors.caseSummary = "Please provide a brief summary of the matter (minimum 15 characters).";
  }

  if (!formData.courtDeadline) {
    errors.courtDeadline = "Please state any upcoming court directions date or trial window.";
  }

  if (!formData.contactName || formData.contactName.trim().length < 2) {
    errors.contactName = "Please enter the instructing practitioner or contact name.";
  }

  if (!formData.contactEmail || !EMAIL_REGEX.test(formData.contactEmail.trim())) {
    errors.contactEmail = "Please enter a valid professional email address.";
  }

  if (!formData.contactPhone || formData.contactPhone.replace(/\D/g, '').length < 10) {
    errors.contactPhone = "Please enter a valid telephone number.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

