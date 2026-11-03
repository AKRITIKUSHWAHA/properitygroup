import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import {
  createCheckoutSession,
  handleStripeWebhookEvent,
  verifyWebhookSignature,
} from '../services/stripeService.js';

/**
 * Controller for Online Card Payments & Checkout Sessions
 */

export const createPaymentSession = async (req, res, next) => {
  try {
    const {
      jobId,
      invoiceId,
      amount,
      currency = 'gbp',
      customerEmail = req.user?.email,
      jobReference,
      surveyType,
      successUrl,
      cancelUrl,
    } = req.body;

    if (!amount || isNaN(parseFloat(amount))) {
      throw ApiError.badRequest('Valid payment amount in GBP is required');
    }

    const session = await createCheckoutSession({
      jobId,
      invoiceId,
      amount: parseFloat(amount),
      currency,
      customerEmail,
      jobReference,
      surveyType,
      successUrl,
      cancelUrl,
    });

    return ApiResponse.created(res, session, 'Payment session created successfully');
  } catch (error) {
    next(error);
  }
};

export const handleWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['stripe-signature'];
    const event = verifyWebhookSignature(req.body, signature);

    const result = await handleStripeWebhookEvent(event);
    return res.json(result);
  } catch (error) {
    console.error('Webhook processing error:', error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
};
