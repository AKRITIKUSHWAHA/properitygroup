import Stripe from 'stripe';
import { prisma } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const isStripeConfigured = Boolean(stripeSecretKey && stripeSecretKey.startsWith('sk_'));

const stripe = isStripeConfigured ? new Stripe(stripeSecretKey) : null;

/**
 * Stripe Payment Gateway Service
 * Handles online card settlements for RICS Survey instructions
 */

export const createCheckoutSession = async ({
  jobId,
  invoiceId,
  amount,
  currency = 'gbp',
  customerEmail,
  jobReference = 'SURVEY',
  surveyType = 'RICS Home Survey',
  successUrl,
  cancelUrl,
}) => {
  const clientBaseUrl = (process.env.CLIENT_URL || 'http://localhost:5175').split(',')[0];
  const finalSuccessUrl = successUrl || `${clientBaseUrl}/customer/invoices-and-payments?payment=success&ref=${jobReference}`;
  const finalCancelUrl = cancelUrl || `${clientBaseUrl}/customer/invoices-and-payments?payment=cancelled&ref=${jobReference}`;

  // If live/test Stripe key is configured, create real Stripe Checkout Session
  if (stripe) {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `${surveyType} — Ref ${jobReference}`,
              description: 'NJS Property Group Chartered Surveyors Fee Settlement',
            },
            unit_amount: Math.round(amount * 100), // in pence (£650.00 -> 65000)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata: {
        jobId: String(jobId || ''),
        invoiceId: String(invoiceId || ''),
        jobReference,
        customerEmail: customerEmail || '',
      },
      success_url: finalSuccessUrl,
      cancel_url: finalCancelUrl,
    });

    return {
      success: true,
      sessionId: session.id,
      checkoutUrl: session.url,
      provider: 'stripe_live',
    };
  }

  if (process.env.NODE_ENV === 'production') {
    throw new ApiError(
      503,
      'Online card payment gateway is not configured. Please use bank transfer (BACS) or contact support.'
    );
  }

  // Graceful Sandbox / Dev Simulation when API key is not yet provided by client
  console.log(`[STRIPE SIMULATION] Checkout session created for ${jobReference} - £${amount} (${customerEmail})`);
  return {
    success: true,
    sessionId: `sim_cs_${Date.now()}`,
    checkoutUrl: `${finalSuccessUrl}&simulated=true`,
    provider: 'simulated_fallback',
    message: 'Stripe API key pending from client. Simulated checkout session generated.',
  };
};

/**
 * Webhook Event Handler (Dispatched when customer completes payment)
 */
export const handleStripeWebhookEvent = async (event) => {
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { jobId, invoiceId, jobReference } = session.metadata || {};

    console.log(`[STRIPE WEBHOOK] Checkout session completed for Job ${jobReference || jobId}`);

    let invoice = null;
    if (invoiceId) {
      const invId = parseInt(invoiceId, 10);
      if (!isNaN(invId)) {
        invoice = await prisma.invoice.findUnique({ where: { id: invId } });
      }
    }
    if (!invoice && jobId) {
      const jId = parseInt(jobId, 10);
      if (!isNaN(jId)) {
        invoice = await prisma.invoice.findFirst({ where: { jobId: jId } });
      }
    }

    if (invoice) {
      if (invoice.status === 'PAID') {
        console.log(`[STRIPE WEBHOOK] Invoice ${invoice.id} is already marked PAID. Idempotent skip.`);
      } else {
        const stripeTxnId = typeof session.payment_intent === 'string' ? session.payment_intent : null;
        const transactionOps = [
          prisma.invoice.update({
            where: { id: invoice.id },
            data: {
              status: 'PAID',
              paymentMethod: 'STRIPE_CARD',
              stripePaymentIntentId: stripeTxnId || invoice.stripePaymentIntentId,
              paidAt: new Date(),
            },
          }),
        ];

        const targetJobId = invoice.jobId || (jobId ? parseInt(jobId, 10) : null);
        if (targetJobId && !isNaN(targetJobId)) {
          transactionOps.push(
            prisma.job.update({
              where: { id: targetJobId },
              data: { stage: 'PAID' },
            })
          );
        }

        await prisma.$transaction(transactionOps);
        console.log(`[STRIPE WEBHOOK] Invoice ${invoice.id} and Job ${targetJobId} atomically updated to PAID.`);
        await sendPaymentNotifications(invoice, targetJobId);
      }
    }
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const { jobId, invoiceId, jobReference } = paymentIntent.metadata || {};

    console.log(`[STRIPE WEBHOOK] PaymentIntent succeeded: ${paymentIntent.id} for Job ${jobReference || jobId || 'N/A'}`);

    let invoice = null;
    if (invoiceId) {
      const invId = parseInt(invoiceId, 10);
      if (!isNaN(invId)) {
        invoice = await prisma.invoice.findUnique({ where: { id: invId } });
      }
    }
    if (!invoice && jobId) {
      const jId = parseInt(jobId, 10);
      if (!isNaN(jId)) {
        invoice = await prisma.invoice.findFirst({ where: { jobId: jId } });
      }
    }
    if (!invoice && paymentIntent.id) {
      invoice = await prisma.invoice.findFirst({ where: { stripePaymentIntentId: paymentIntent.id } });
    }

    if (invoice) {
      if (invoice.status === 'PAID') {
        console.log(`[STRIPE WEBHOOK] Invoice ${invoice.id} is already marked PAID. Idempotent skip.`);
      } else {
        const transactionOps = [
          prisma.invoice.update({
            where: { id: invoice.id },
            data: {
              status: 'PAID',
              paymentMethod: 'STRIPE_CARD',
              stripePaymentIntentId: paymentIntent.id,
              paidAt: new Date(),
            },
          }),
        ];

        const targetJobId = invoice.jobId || (jobId ? parseInt(jobId, 10) : null);
        if (targetJobId && !isNaN(targetJobId)) {
          transactionOps.push(
            prisma.job.update({
              where: { id: targetJobId },
              data: { stage: 'PAID' },
            })
          );
        }

        await prisma.$transaction(transactionOps);
        console.log(`[STRIPE WEBHOOK] Invoice ${invoice.id} and Job ${targetJobId} atomically updated to PAID via payment_intent.succeeded.`);
        await sendPaymentNotifications(invoice, targetJobId);
      }
    }
  }

  return { received: true };
};

const sendPaymentNotifications = async (invoice, targetJobId) => {
  try {
    const job = targetJobId ? await prisma.job.findUnique({ where: { id: targetJobId } }) : null;
    const clientName = invoice.clientName || job?.clientName || 'Client';
    const property = job?.propertyAddress || 'Subject Property';
    const amount = parseFloat(invoice.total || 0).toFixed(2);

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
            title: `Payment Received - Ready to Book (£${amount})`,
            desc: `Payment received, ${clientName}, ${property}, £${amount}. Assign surveyor and book inspection.`,
            type: 'READY_TO_BOOK',
            amount: `£${amount}`,
            link: `/admin/jobs/${targetJobId}`,
          },
        });
      }
    }

    const recipientEmail = invoice.clientEmail || job?.clientEmail;
    let targetUser = null;
    if (recipientEmail) {
      targetUser = await prisma.user.findFirst({ where: { email: recipientEmail } });
    }
    const targetUserId = targetUser ? targetUser.id : job?.clientId;

    if (targetUserId) {
      await prisma.notification.create({
        data: {
          userId: targetUserId,
          role: 'CUSTOMER',
          title: 'Payment Received',
          desc: 'Payment received. Next: choose your inspection date',
          type: 'PAYMENT',
          amount: `£${amount}`,
          link: '/customer/my-bookings',
        },
      });
    }
  } catch (err) {
    console.error('[Stripe webhook notification error]:', err.message);
  }
};

export const verifyWebhookSignature = (rawBody, signature) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !webhookSecret) {
    return { type: 'simulation.event', data: { object: {} } };
  }
  return stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
};
