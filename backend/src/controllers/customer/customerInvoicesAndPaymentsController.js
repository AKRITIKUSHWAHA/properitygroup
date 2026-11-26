import Stripe from 'stripe';
import { prisma } from '../../config/db.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { sendInvoiceReceiptEmail } from '../../services/emailService.js';

/**
 * Customer Menu 8: Invoices & Payments (/customer/invoices-and-payments)
 */
export const getCustomerInvoices = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;

    const invoices = await prisma.invoice.findMany({
      where: {
        OR: [
          { job: { clientId: userId } },
          { job: { clientEmail: userEmail } },
          { clientEmail: userEmail },
        ],
      },
      include: {
        job: {
          select: {
            id: true,
            reference: true,
            propertyAddress: true,
            serviceType: true,
            stage: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const mappedInvoices = invoices.map((inv) => {
      const isJobPaid = ['PAID', 'BOOKED', 'PREPARING_REPORT', 'COMPLETE'].includes(inv.job?.stage);
      return {
        ...inv,
        status: isJobPaid ? 'PAID' : inv.status,
      };
    });

    return ApiResponse.success(res, { invoices: mappedInvoices, total: mappedInvoices.length });
  } catch (error) {
    next(error);
  }
};

export const payInvoiceWithCard = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { paymentMethod, stripePaymentIntentId, property, clientName: bodyClientName } = req.body;
    const invoiceId = parseInt(id, 10);
    const userId = req.user?.id;
    const userEmail = (req.user?.email || '').toLowerCase().trim();
    const isAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'SUPER_ADMIN';

    if (isNaN(invoiceId) || invoiceId <= 0) {
      throw ApiError.badRequest('Invalid invoice ID.');
    }

    // 1. Strict Invoice Lookup by integer ID with job and terms
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        job: {
          include: { terms: true },
        },
      },
    });

    if (!invoice) {
      throw ApiError.notFound('Invoice not found.');
    }

    // Ownership check: invoice.job.clientId or clientEmail == req.user or admin
    const isOwner =
      (invoice.job?.clientId && invoice.job.clientId === userId) ||
      (userEmail && invoice.clientEmail?.toLowerCase() === userEmail) ||
      (userEmail && invoice.job?.clientEmail?.toLowerCase() === userEmail);

    if (!isOwner && !isAdmin) {
      throw ApiError.forbidden('You do not have permission to pay or modify this invoice.');
    }

    // 2. Pre-conditions: Terms signed and Invoice status PENDING
    const termsSigned = Boolean(invoice.job?.terms?.some((t) => t.signed));
    if (!termsSigned) {
      throw ApiError.badRequest('Terms of Engagement must be digitally signed before settling payment.');
    }

    if (invoice.status === 'PAID') {
      throw ApiError.badRequest('Invoice has already been settled and paid.');
    }

    if (invoice.status !== 'PENDING') {
      throw ApiError.badRequest(`Invoice cannot be paid because its current status is ${invoice.status}.`);
    }

    const clientDisplayName = bodyClientName || req.user?.name || invoice.clientName || invoice.job?.clientName || 'Valued Client';
    const resolvedProperty = property || invoice.job?.propertyAddress || 'Subject Property';

    // 4. Bank transfer (BACS): customer submits "I have transferred" request
    const isBacs =
      (paymentMethod && (
        paymentMethod.toLowerCase().includes('bacs') ||
        paymentMethod.toLowerCase().includes('bank') ||
        paymentMethod.toLowerCase().includes('transfer')
      )) ||
      Boolean(req.body.transferReference) ||
      Boolean(req.body.bacsReference);

    if (isBacs) {
      const ref = (req.body.transferReference || req.body.bacsReference || `BACS-CLAIM-${Date.now()}`).trim();

      const updatedInvoice = await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          status: 'PENDING',
          paymentMethod: 'BACS_TRANSFER_CLAIMED',
          bacsReference: ref,
        },
        include: { job: true },
      });

      // Notify ADMIN to verify payment
      await prisma.notification.create({
        data: {
          role: 'ADMIN',
          title: `Verify BACS Payment - ${invoice.invoiceNumber}`,
          desc: `Customer ${clientDisplayName} submitted a bank transfer payment claim of £${invoice.total.toFixed(2)} for invoice ${invoice.invoiceNumber} (Ref: ${ref}). Please verify and reconcile in Finance.`,
          type: 'PAYMENT',
          amount: `£${invoice.total.toFixed(2)}`,
          link: '/admin/finance/invoices',
        },
      }).catch((err) => console.error('[Notification admin error]:', err.message));

      if (userId) {
        await prisma.notification.create({
          data: {
            userId,
            role: 'CUSTOMER',
            title: `Bank Transfer Claim Logged - £${invoice.total.toFixed(2)}`,
            desc: `Your transfer reference ${ref} for invoice ${invoice.invoiceNumber} has been logged. Our accounts team will verify and issue the receipt shortly.`,
            type: 'PAYMENT',
            amount: `£${invoice.total.toFixed(2)}`,
            link: '/customer/invoices-and-payments',
          },
        }).catch(async (err) => {
          console.error('[Customer BACS Claim Notification error]:', err.message);
          if (invoice.jobId) {
            await prisma.auditLog.create({
              data: {
                jobId: invoice.jobId,
                userId,
                action: 'NOTIFICATION_DISPATCH_FAILED',
                details: `Failed to dispatch customer BACS notification: ${err.message}`,
              },
            }).catch((ae) => console.error('[AuditLog fallback error]:', ae.message));
          }
        });
      }

      return ApiResponse.success(
        res,
        {
          invoice: updatedInvoice,
          paymentClaimed: true,
          status: 'PENDING',
        },
        'Bank transfer claim logged. Awaiting admin verification.'
      );
    }

    // 3. Card payment: Server-side Stripe PaymentIntent verification
    if (!stripePaymentIntentId) {
      throw ApiError.badRequest('Stripe Payment Intent ID is required for card payments.');
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey || !stripeSecretKey.startsWith('sk_')) {
      throw ApiError.badRequest('Stripe not configured. Online card payments are currently disabled.');
    }

    const stripe = new Stripe(stripeSecretKey);
    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.retrieve(stripePaymentIntentId);
    } catch (stripeErr) {
      throw ApiError.badRequest(`Stripe verification failed: ${stripeErr.message}`);
    }

    if (paymentIntent.status !== 'succeeded') {
      throw ApiError.badRequest(`Payment not completed. Stripe status: ${paymentIntent.status}`);
    }

    const expectedAmountInPence = Math.round(invoice.total * 100);
    if (paymentIntent.amount !== expectedAmountInPence) {
      throw ApiError.badRequest(
        `Payment amount mismatch. Expected £${invoice.total.toFixed(2)} (${expectedAmountInPence}p), received ${paymentIntent.amount}p.`
      );
    }

    if (paymentIntent.currency.toLowerCase() !== 'gbp') {
      throw ApiError.badRequest(
        `Payment currency mismatch. Expected GBP, received ${paymentIntent.currency.toUpperCase()}.`
      );
    }

    // 6. Transactional atomic update: Invoice PAID + Job stage PAID
    const transactionOperations = [
      prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          status: 'PAID',
          paymentMethod: 'STRIPE_CARD',
          stripePaymentIntentId: paymentIntent.id,
          paidAt: new Date(),
        },
        include: { job: true },
      }),
    ];

    if (invoice.jobId) {
      transactionOperations.push(
        prisma.job.update({
          where: { id: invoice.jobId },
          data: { stage: 'PAID' },
        })
      );
    }

    const [updatedInvoice] = await prisma.$transaction(transactionOperations);

    // Dispatch Official HMRC-compliant VAT Receipt Email to Customer & CC Admin
    let emailSent = false;
    let emailError = null;
    const recipientEmail = invoice.clientEmail || invoice.job?.clientEmail || userEmail;

    if (recipientEmail && recipientEmail.includes('@')) {
      try {
        const emailRes = await sendInvoiceReceiptEmail({
          to: recipientEmail,
          clientName: clientDisplayName,
          invoiceRef: updatedInvoice.invoiceNumber,
          amount: updatedInvoice.total.toFixed(2),
          paymentMethod: 'STRIPE_CARD',
          propertyAddress: resolvedProperty,
        });
        emailSent = Boolean(emailRes?.success);
        emailError = emailRes?.error || null;
      } catch (emailErr) {
        console.error('[sendInvoiceReceiptEmail] error:', emailErr.message);
        emailError = emailErr.message;
      }
    }

    // In-App Notifications for Customer & Admin
    const targetJobId = updatedInvoice.jobId || invoice.jobId;

    // Deduplicated Admin notification: single notification per job
    if (targetJobId) {
      const existingAdminNotif = await prisma.notification.findFirst({
        where: {
          role: 'ADMIN',
          type: 'READY_TO_BOOK',
          link: `/admin/jobs/${targetJobId}`,
        },
      });

      if (!existingAdminNotif) {
        await prisma.notification.create({
          data: {
            role: 'ADMIN',
            title: `Payment Received - Ready to Book (£${updatedInvoice.total.toFixed(2)})`,
            desc: `Payment received, ${clientDisplayName}, ${resolvedProperty}, £${updatedInvoice.total.toFixed(2)}. Assign surveyor and book inspection.`,
            type: 'READY_TO_BOOK',
            amount: `£${updatedInvoice.total.toFixed(2)}`,
            link: `/admin/jobs/${targetJobId}`,
          },
        }).catch(async (err) => {
          console.error('[Admin ReadyToBook Notification error]:', err.message);
          await prisma.auditLog.create({
            data: {
              jobId: targetJobId,
              userId: userId || null,
              action: 'NOTIFICATION_DISPATCH_FAILED',
              details: `Failed to dispatch admin ReadyToBook notification: ${err.message}`,
            },
          }).catch((ae) => console.error('[AuditLog fallback error]:', ae.message));
        });
      }
    }

    // Customer notification: "Payment received. Next: choose your inspection date" link /customer/my-bookings
    if (userId) {
      await prisma.notification.create({
        data: {
          userId,
          role: 'CUSTOMER',
          title: 'Payment Received',
          desc: 'Payment received. Next: choose your inspection date',
          type: 'PAYMENT',
          amount: `£${updatedInvoice.total.toFixed(2)}`,
          link: '/customer/my-bookings',
        },
      }).catch(async (err) => {
        console.error('[Customer Payment Notification error]:', err.message);
        if (targetJobId) {
          await prisma.auditLog.create({
            data: {
              jobId: targetJobId,
              userId,
              action: 'NOTIFICATION_DISPATCH_FAILED',
              details: `Failed to dispatch customer payment notification: ${err.message}`,
            },
          }).catch((ae) => console.error('[AuditLog fallback error]:', ae.message));
        }
      });
    }

    return ApiResponse.success(
      res,
      { invoice: updatedInvoice, emailSent, emailError },
      'Payment settled successfully. Your UK 20% VAT receipt has been issued.'
    );
  } catch (error) {
    next(error);
  }
};

