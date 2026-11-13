import { Router } from 'express';
import { submitPublicEnquiry } from '../controllers/publicEnquiryController.js';

const router = Router();

// Public Website Quote & Contact Enquiry Endpoint (no authentication required)
router.post('/enquiries', submitPublicEnquiry);

export default router;

