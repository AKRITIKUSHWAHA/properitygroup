import Stripe from 'stripe';
import { prisma } from '../config/db.js';

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

    console.log(`[STRIPE WEBHOOK] Payment received for Job ${jobReference || jobId}`);

    // Update invoice status in database
    if (invoiceId) {
      const invId = parseInt(invoiceId);
      if (!isNaN(invId)) {
        await prisma.invoice.update({
          where: { id: invId },
          data: {
            status: 'PAID',
            paymentMethod: 'STRIPE_CARD',
            paidAt: new Date(),
          },
        }).catch((err) => console.warn('Could not update invoice on webhook:', err.message));
      }
    }

    // Update job stage in database
    if (jobId) {
      const jId = parseInt(jobId);
      if (!isNaN(jId)) {
        await prisma.job.update({
          where: { id: jId },
          data: { stage: 'CONFIRMED' },
        }).catch(() => {});
      }
    }
  }

  return { received: true };
};

export const verifyWebhookSignature = (rawBody, signature) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !webhookSecret) {
    return { type: 'simulation.event', data: { object: {} } };
  }
  return stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
};
