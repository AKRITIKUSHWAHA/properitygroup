import bcrypt from 'bcryptjs';
import { prisma } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { sendWebsiteEnquiryNotificationEmail } from '../services/emailService.js';

/**
 * Public Website Enquiry & Quote Submission Controller
 * Captures quote / contact enquiries without requiring user login,
 * optionally saves as a CRM Lead if database is reachable, and dispatches
 * email notification to info@njspropertygroup.com.
 */
export const submitPublicEnquiry = async (req, res, next) => {
  try {
    const body = req.body || {};
    const enquiryCategory =
      body.enquiryCategory === 'EXPERT_WITNESS' ? 'EXPERT_WITNESS' : 'SURVEY_QUOTE';

    const customerName = String(body.customerName || body.contactName || '').trim();
    const customerEmail = String(body.customerEmail || body.contactEmail || '')
      .trim()
      .toLowerCase();
    const customerPhone = String(body.customerPhone || body.contactPhone || '').trim();
    const propertyPostcode = String(body.propertyPostcode || body.postcode || '')
      .trim()
      .toUpperCase();
    const propertyAddress = String(
      body.propertyAddress || body.propertyLocation || propertyPostcode || ''
    ).trim();
    const serviceName = String(
      body.serviceName || body.serviceId || body.disputeType || 'RICS Property Survey'
    ).trim();
    const propertyType = body.propertyType ? String(body.propertyType).trim() : null;
    const approxBedrooms = body.approxBedrooms ? String(body.approxBedrooms).trim() : null;
    const timescale = body.timescale ? String(body.timescale).trim() : null;
    const additionalNotes = String(body.additionalNotes || body.caseSummary || '').trim();

    if (!customerName || !customerEmail) {
      throw ApiError.badRequest('Customer name and email address are required.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      throw ApiError.badRequest('Please enter a valid email address.');
    }

    if (enquiryCategory === 'SURVEY_QUOTE' && !propertyPostcode && !propertyAddress) {
      throw ApiError.badRequest('Property address or UK postcode is required.');
    }

    const prefix = enquiryCategory === 'SURVEY_QUOTE' ? 'NJS' : 'ENQ';
    const referenceId = `${prefix}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Check if customer is already registered in users table
    let existingUser = null;
    try {
      existingUser = await prisma.user.findUnique({
        where: { email: customerEmail },
      });
    } catch (userErr) {
      console.warn('Customer account lookup note:', userErr.message);
    }
    const isExistingUser = Boolean(existingUser);

    // Persist Lead information strictly to MySQL CRM leads table
    let dbSaved = false;
    try {
      await prisma.lead.create({
        data: {
          reference: referenceId,
          clientName: customerName,
          clientEmail: customerEmail,
          clientPhone: customerPhone || null,
          propertyAddress: propertyAddress || propertyPostcode || 'UK Property Enquiry',
          postcode: propertyPostcode || 'N/A',
          serviceType: serviceName,
          propertyType: propertyType || body.instructingRole || null,
          source: 'WEBSITE',
          status: 'NEW',
        },
      });
      dbSaved = true;
    } catch (dbErr) {
      console.warn('Public enquiry DB persistence skipped/unavailable:', dbErr.message);
    }

    // Dispatch notification email to info@njspropertygroup.com
    const emailResult = await sendWebsiteEnquiryNotificationEmail({
      referenceId,
      enquiryCategory,
      customerName,
      customerEmail,
      customerPhone,
      serviceName,
      propertyType,
      propertyAddress,
      propertyPostcode,
      approxBedrooms,
      timescale,
      additionalNotes,
      lawFirmName: body.lawFirmName,
      disputeType: body.disputeType,
      courtDeadline: body.courtDeadline,
      isSingleJointExpert: body.isSingleJointExpert,
      sourcePage: body.sourcePage,
    });

    // In-App Notification for Client (if existing user) & Admin
    try {
      if (existingUser) {
        await prisma.notification.create({
          data: {
            userId: existingUser.id,
            role: 'CUSTOMER',
            title: 'Quote Request Received',
            desc: `Your quote request for ${serviceName} (${propertyAddress || propertyPostcode || 'Subject Property'}) has been logged. Ref: ${referenceId}`,
            type: 'ENQUIRY',
            link: '/customer/my-quotations',
          },
        });
      }

      await prisma.notification.create({
        data: {
          role: 'ADMIN',
          title: `New Enquiry - ${customerName}`,
          desc: `New enquiry for ${serviceName} at ${propertyAddress || propertyPostcode || 'UK'}. Ref: ${referenceId}`,
          type: 'ENQUIRY',
          link: '/admin/leads/enquiries',
        },
      });
    } catch (notifErr) {
      console.warn('Public enquiry notification create warning:', notifErr.message);
    }

    return ApiResponse.created(
      res,
      {
        referenceId,
        timestamp: new Date().toISOString(),
        dbSaved,
        isExistingUser,
        customerEmail,
        customerName,
        emailNotification: {
          recipient: emailResult.notifiedEmail,
          emailSent: Boolean(emailResult.emailSent),
          provider: emailResult.provider,
          messageId: emailResult.messageId || null,
        },
      },
      emailResult.emailSent
        ? `Enquiry received and notification sent to ${emailResult.notifiedEmail}`
        : `Enquiry logged with reference ${referenceId}`
    );
  } catch (error) {
    next(error);
  }
};

