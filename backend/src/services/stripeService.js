import { logger } from '../utils/logger.js';

export const stripeService = {
  /**
   * Creates a Stripe Payment Intent for UK GBP payments
   */
  async createPaymentIntent({ amount, jobReference, clientEmail }) {
    logger.info(`[STRIPE INTENT] Ref: ${jobReference} | Amount: £${amount} | Currency: GBP`);

    // In production with Stripe SDK:
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    // const paymentIntent = await stripe.paymentIntents.create({...})

    return {
      clientSecret: `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substring(7)}`,
      amount,
      currency: 'gbp',
    };
  },
};

