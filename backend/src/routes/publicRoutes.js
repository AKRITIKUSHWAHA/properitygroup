import { Router } from 'express';
import { submitPublicEnquiry } from '../controllers/publicEnquiryController.js';
import { publicEnquiryRateLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

// Public Website Quote & Contact Enquiry Endpoint (no authentication required)
router.post('/enquiries', publicEnquiryRateLimiter, submitPublicEnquiry);
router.post('/enquiry', publicEnquiryRateLimiter, submitPublicEnquiry);

export default router;

