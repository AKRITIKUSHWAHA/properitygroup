import { Router } from 'express';
import { verifyJWT } from '../middlewares/authMiddleware.js';
import {
  createPaymentSession,
  handleWebhook,
} from '../controllers/paymentController.js';

const router = Router();

// Webhook endpoint (Raw body verification)
router.post('/webhook', handleWebhook);

// Protected Checkout Session endpoint (Client / Customer / Admin)
router.post('/create-checkout-session', verifyJWT, createPaymentSession);

export default router;

